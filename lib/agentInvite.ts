import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getAgentType, type AgentType } from "@/config/agent-types";

// The password gate shared by every role-agent invite link (/agent-invite/[type]).
//
// An invite link provisions a LIVE agent with no login and no payment, so the passcode is the only
// thing between the open internet and a real VPS instance being provisioned. Everything here fails
// CLOSED: an unset passcode denies everyone rather than waving everyone through.
//
// The passcode lives in an environment variable (AGENT_INVITE_PASSCODE), set in Vercel, never in
// the repo, and is shared across all the invite links. The browser never sees it: it is compared
// server-side, and on a match the server sets an HttpOnly cookie whose value is an HMAC only the
// server can produce. Both the page and the claim endpoint verify that cookie.

export const INVITE_COOKIE = "agent_invite";

// The role agents an invite link may provision: internal, no-payment personas with a setup
// questionnaire (ROLE_INTAKES in OnboardingForm). Ordered as they appear in the create modal.
export const INVITE_TYPES = [
  "cfo",
  "legal",
  "realestate",
  "ceo",
  "marketing",
  "sales",
  "recruiting",
  "medical",
] as const;

export type InviteType = (typeof INVITE_TYPES)[number];

// Resolve a URL segment to an invitable agent type, or null. Guards against a type that exists but
// should never be provisioned this way (external, or a no-questionnaire Blank build).
export function invitableType(type: string | undefined | null): AgentType | null {
  if (!type || !(INVITE_TYPES as readonly string[]).includes(type)) return null;
  const t = getAgentType(type);
  if (!t || t.noSetup || t.externalUrl) return null;
  return t;
}

// Keyed on the service-role secret (server-only), so the unlock cookie cannot be forged without it.
function hmacKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function passcodeConfigured(): boolean {
  return !!(process.env.AGENT_INVITE_PASSCODE || "").trim();
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
  const expected = (process.env.AGENT_INVITE_PASSCODE || "").trim();
  if (!expected) return false;
  return safeEqual(input.trim(), expected);
}

// The cookie value the server sets after a correct passcode. Stable, and only reproducible with the
// service-role key, so it doubles as the "you passed the gate" proof. Shared across invite types:
// the passcode is one shared secret, so one unlock covers every link.
export function mintCookieValue(): string | null {
  const key = hmacKey();
  if (!key) return null;
  return createHmac("sha256", key).update("agent-invite:v1").digest("hex");
}

export function verifyCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const expected = mintCookieValue();
  if (!expected) return false;
  return safeEqual(value, expected);
}
