import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getAgentType, licenseAgentType } from "@/config/agent-types";
import { ApiError } from "@/lib/http";
import { findBuyerAccount, verifyPaidLicenseSession } from "@/lib/license-session";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/onboard/post-checkout?session_id=cs_...
//
// Where Stripe sends a licence buyer the moment they have paid. This signs them in and hands
// them to their questionnaire, already inside their account: the shape of the college agent's
// post-checkout (David, Nov 5 2026: "do both"), in place of a flow that asked ten pages of
// questions on a public page and only then, on the build screen, let them choose a password.
//
// What happens here, in order:
//   1. The checkout session is retrieved from Stripe and must be ours and paid.
//   2. The account the webhook created is looked up. Stripe fires the webhook in parallel with
//      this redirect, so a fast buyer can arrive first; we wait a few seconds for it.
//   3. A magic link is minted for the buyer's email and verified server-side, which sets the
//      session cookies on the redirect we are about to return (the same construction as
//      app/auth/callback/route.ts, and for the same reason: the cookies land on THIS response).
//   4. Off to /reset-password?welcome=1, a skippable "set your password" stop, and from there to
//      /onboard/<type>?ws=<workspace>&paid=1, the questionnaire in customer mode, which
//      provisions the agent on submit and runs the build screen without a password form.
//
// AUTHORIZATION. A checkout session id is a narrow token (lib/license-session.ts): it was
// deliberately never allowed to open the dashboard. This route crosses that line once, under the
// same two constraints /api/onboard/set-password uses: an account that has ever signed in is
// never signed into this way (it goes to /login instead), and the session id is spent on first
// use through the license_password_claims row, so a leaked or replayed id does nothing.
//
// Every failure falls back rather than erroring: the pre-Nov-5 path at /onboard?paid=1 still
// works end to end (questionnaire on the session token, password on the build screen), so a
// buyer the webhook was slow for, or whose cookies could not be set, simply gets that.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const WEBHOOK_WAIT_MS = 1500;
const WEBHOOK_TRIES = 8;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = (url.searchParams.get("session_id") || "").trim();
  const to = (path: string) => NextResponse.redirect(new URL(path, url.origin));
  if (!sessionId) return to("/onboard");

  let email: string;
  let typeId: string;
  try {
    const { session, email: e } = await verifyPaidLicenseSession(sessionId);
    email = e;
    typeId = (getAgentType(session.metadata?.agent_type ?? "") ?? licenseAgentType()).id;
  } catch (err) {
    console.error("[post-checkout] session rejected:", sessionId, (err as Error).message);
    return to("/onboard");
  }

  // The old path, for every case below that cannot finish here.
  const fallback = `/onboard?agent=${encodeURIComponent(typeId)}&paid=1&session_id=${encodeURIComponent(sessionId)}`;

  let account: { userId: string; workspaceId: string } | null = null;
  for (let attempt = 0; attempt < WEBHOOK_TRIES; attempt++) {
    try {
      account = await findBuyerAccount(email);
      break;
    } catch (err) {
      if (err instanceof ApiError && err.code === "account_pending") {
        await new Promise((r) => setTimeout(r, WEBHOOK_WAIT_MS));
        continue;
      }
      console.error("[post-checkout] account lookup failed:", email, (err as Error).message);
      return to(fallback);
    }
  }
  if (!account) {
    console.warn("[post-checkout] webhook still pending after wait, using the session path:", sessionId);
    return to(fallback);
  }

  const setup = `/onboard/${encodeURIComponent(typeId)}?ws=${encodeURIComponent(account.workspaceId)}&paid=1`;
  const db = createAdminClient();

  // Constraint 1: an account somebody has signed into is theirs to sign into. A repeat buyer,
  // or a white-glove client David set up by hand, logs in with what they have.
  const { data: existing, error: lookupError } = await db.auth.admin.getUserById(account.userId);
  if (lookupError) {
    console.error("[post-checkout] user lookup failed:", account.userId, lookupError.message);
    return to(fallback);
  }
  if (existing.user?.last_sign_in_at) return to(`/login?next=${encodeURIComponent(setup)}`);

  // Constraint 2: the session id is spent here. The insert is the lock; a second holder of the
  // same id loses on the primary key and gets the login page instead of a session.
  const { error: claimError } = await db
    .from("license_password_claims")
    .insert({ stripe_session_id: sessionId, user_id: account.userId });
  if (claimError) {
    if (claimError.code !== "23505") console.error("[post-checkout] claim failed:", claimError.message);
    return to(`/login?next=${encodeURIComponent(setup)}`);
  }

  const { data: link, error: linkError } = await db.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error("[post-checkout] generateLink failed:", email, linkError?.message ?? "no hashed_token");
    return to(fallback);
  }

  // Built before the verify so the auth cookies have somewhere to land.
  const response = to(`/reset-password?welcome=1&next=${encodeURIComponent(setup)}`);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie"));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { error: otpError } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (otpError) {
    console.error("[post-checkout] verifyOtp failed:", email, otpError.message);
    return to(fallback);
  }
  return response;
}

/** The request's cookies, in the shape @supabase/ssr wants. */
function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  return header
    .split(";")
    .map((pair) => {
      const eq = pair.indexOf("=");
      if (eq < 1) return null;
      return { name: pair.slice(0, eq).trim(), value: decodeURIComponent(pair.slice(eq + 1).trim()) };
    })
    .filter((c): c is { name: string; value: string } => c !== null);
}
