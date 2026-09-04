import { json, readJson, route } from "@/lib/http";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { checkPasscode, passcodeConfigured, mintCookieValue, INVITE_COOKIE } from "@/lib/realEstateInvite";

// POST /api/real-estate-invite/unlock { passcode }
//
// The gate for the Real Estate invite link. On the right passcode it sets an HttpOnly cookie that
// both the /real-estate-invite page and the claim endpoint check. Fails closed when no passcode is
// configured (REALESTATE_ONBOARDING_PASSCODE unset), so a half-configured deploy grants no one.
export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "re_invite_unlock", LIMITS.form);
  if (limited) return limited;

  if (!passcodeConfigured()) {
    return json({ error: "This link is not active yet." }, 403);
  }

  const { passcode } = await readJson<{ passcode?: string }>(request);
  if (typeof passcode !== "string" || !checkPasscode(passcode)) {
    return json({ error: "Incorrect password." }, 401);
  }

  const value = mintCookieValue();
  if (!value) return json({ error: "This link is not configured." }, 500);

  const res = json({ ok: true });
  res.cookies.set(INVITE_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // Long enough to finish the questionnaire, short enough not to linger on a shared machine.
    maxAge: 60 * 60 * 6,
  });
  return res;
});
