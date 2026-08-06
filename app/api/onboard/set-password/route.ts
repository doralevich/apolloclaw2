import { ApiError, json, readJson, route } from "@/lib/http";
import { findBuyerAccount, verifyPaidLicenseSession } from "@/lib/license-session";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/onboard/set-password { session_id, password }
//
// The last step of the license journey. The buyer has paid, answered the questionnaire, and
// watched their agent come up — and at that moment they still cannot get into the dashboard
// they just bought, because the webhook created their account without a password. The old
// ending sent them to /login, which they could not pass, or to an email they had to go and
// find. This lets them choose a password on the screen they are already looking at.
//
// AUTHORIZATION, and why this one is different. Every other route in this flow takes the paid
// checkout session as a deliberately narrow token — see lib/license-session.ts, which spells
// out that it does NOT let the holder into the dashboard or act as the buyer. Setting a
// password does exactly that, so this route is the one place that boundary is crossed, and it
// is crossed under two constraints that make the grant single-use and non-destructive:
//
//   1. An account that has ever been signed into is refused. A password already in use is
//      never overwritten by this route, no matter who presents the id.
//   2. The claim row is inserted BEFORE the password is written, and its primary key is the
//      session id. A replay, a double-click, or a second holder of a leaked id loses on the
//      unique violation — after which the id is spent and this route will never honour it
//      again. Losing the race costs nothing, because the password was not touched.
//
// Anyone who gets past both did so in the window between purchase and first login, holding an
// id Stripe handed only to the payer. Beyond that window the correct path is the ordinary one:
// "Forgot password?" on /login, which proves control of the mailbox.

// Supabase enforces its own project minimum; this is the floor we state in the UI, kept here
// too so the API is not relying on the form to hold the line.
const MIN_PASSWORD = 8;
// bcrypt silently truncates past 72 bytes, which would make the tail of a long passphrase
// decorative. Refuse rather than accept something that does not mean what it looks like.
const MAX_PASSWORD = 72;

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "onboard_set_password", LIMITS.form);
  if (limited) return limited;

  const body = await readJson<{ session_id?: string; password?: string }>(request);
  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!sessionId) throw new ApiError(400, "invalid_request", "session_id is required");
  if (password.length < MIN_PASSWORD) {
    throw new ApiError(400, "invalid_request", `Please choose a password of at least ${MIN_PASSWORD} characters.`);
  }
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD) {
    throw new ApiError(400, "invalid_request", "That password is too long. Please choose a shorter one.");
  }

  const { email } = await verifyPaidLicenseSession(sessionId);
  // 409 account_pending if the webhook has not landed yet. By this point in the flow it
  // always has — the questionnaire went through the same lookup — but the client handles it.
  const { userId } = await findBuyerAccount(email);

  const db = createAdminClient();

  // Constraint 1: never overwrite a password someone is already using. last_sign_in_at is the
  // honest signal — an account created by the webhook and never touched has none, and one
  // stamp means they got in somehow (this route, the emailed link, or a reset).
  const { data: existing, error: lookupError } = await db.auth.admin.getUserById(userId);
  if (lookupError) throw new ApiError(500, "db_error", lookupError.message);
  if (existing.user?.last_sign_in_at) {
    throw new ApiError(
      409,
      "already_set",
      "This account already has a password. Please log in, or use “Forgot password?” to reset it."
    );
  }

  // Constraint 2: claim first. The insert is the lock, so whoever loses the race never reaches
  // the write below.
  const { error: claimError } = await db
    .from("license_password_claims")
    .insert({ stripe_session_id: sessionId, user_id: userId });
  if (claimError) {
    // 23505 unique_violation — this checkout has already been spent on a password.
    if (claimError.code === "23505") {
      throw new ApiError(
        409,
        "already_set",
        "This account already has a password. Please log in, or use “Forgot password?” to reset it."
      );
    }
    throw new ApiError(500, "db_error", claimError.message);
  }

  const { error: updateError } = await db.auth.admin.updateUserById(userId, { password });
  if (updateError) throw new ApiError(500, "db_error", updateError.message);

  // The client signs in with this pair immediately. It needs the address back because the
  // buyer never typed one here — they paid with it, and Stripe is where it came from.
  return json({ ok: true, email });
});
