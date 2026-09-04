import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// The password gate for the Real Estate invite link (/real-estate-invite).
//
// This link stands David up a LIVE agent with no login and no payment, so the passcode is the
// only thing between the open internet and a real VPS instance being provisioned. Everything here
// therefore fails CLOSED: an unset passcode denies everyone rather than waving everyone through.
//
// The passcode itself lives in an environment variable (REALESTATE_ONBOARDING_PASSCODE), set in
// Vercel, never in the repo. The browser never sees it: it is compared server-side, and on a match
// the server sets an HttpOnly cookie whose value is an HMAC only the server can produce. Both the
// page and the claim endpoint verify that cookie.

export const INVITE_COOKIE = "re_invite";

// Keyed on the service-role secret (server-only), so the unlock cookie cannot be forged without it.
function hmacKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function passcodeConfigured(): boolean {
  return !!(process.env.REALESTATE_ONBOARDING_PASSCODE || "").trim();
}

// Length-safe constant-time compare. timingSafeEqual throws on unequal lengths, so guard first
// (the length is not the secret).
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Fails closed: no configured passcode means no one gets in.
export function checkPasscode(input: string): boolean {
  const expected = (process.env.REALESTATE_ONBOARDING_PASSCODE || "").trim();
  if (!expected) return false;
  return safeEqual(input.trim(), expected);
}

// The cookie value the server sets after a correct passcode. Stable, and only reproducible with
// the service-role key, so it doubles as the "you passed the gate" proof.
export function mintCookieValue(): string | null {
  const key = hmacKey();
  if (!key) return null;
  return createHmac("sha256", key).update("re-invite:v1").digest("hex");
}

export function verifyCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const expected = mintCookieValue();
  if (!expected) return false;
  return safeEqual(value, expected);
}
