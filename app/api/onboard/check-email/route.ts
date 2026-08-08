import { ApiError, json, readJson, route } from "@/lib/http";
import { findAuthUserIdByEmail } from "@/lib/license-session";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/onboard/check-email { email } -> { available }
//
// Asked on the first screen of /onboard, before anyone pays.
//
// WHAT IT PREVENTS. An address that already has an account used to get all the way through:
// gate, checkout, questionnaire — and then died on the closing screen, because
// /api/onboard/set-password refuses an account that has ever been signed into and there is no
// way forward from there. So the failure arrived AFTER the card was charged, at the last step,
// with no way to fix it except email David. Asking here costs one request and moves that
// discovery to the one moment it is still free to act on.
//
// DELIBERATELY UNAUTHENTICATED, like the rest of this flow — there is no account yet, which is
// the entire question being asked.
//
// ON ENUMERATION. This does tell an anonymous caller whether an address has an ApolloClaw
// account, and that is a real disclosure, not a nitpick. It is accepted for the same reason
// every signup form on the internet accepts it: the alternative is letting people pay for
// something that cannot work, and the same fact leaks from any honest signup anyway. It is
// narrowed rather than waved through - rate limited per IP on the `form` bucket (5/min), and it
// returns one boolean, never a name, a status, or when they joined.
//
// Fails OPEN. If the lookup itself breaks, this answers "available" rather than blocking a real
// buyer over an infrastructure problem: the flow behind it already handles a collision, badly
// but not dangerously, and a false "that email is taken" on the first screen would turn a
// Supabase hiccup into lost sales.

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "onboard_check_email", LIMITS.form);
  if (limited) return limited;

  const body = await readJson<{ email?: string }>(request);
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "invalid_request", "A valid email address is required.");
  }

  try {
    const userId = await findAuthUserIdByEmail(createAdminClient(), email);
    return json({ available: !userId });
  } catch (err) {
    console.error("[onboard/check-email] lookup failed", err);
    return json({ available: true });
  }
});
