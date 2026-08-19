// The one place the "is this account allowed in, and for how much longer" rules live.
//
// Access policy (David): a customer starts live and, when billing lapses, gets a fixed grace
// window before the dashboard locks. The gate, the Stripe webhook, the cron sweep, and the
// admin Accounts view all read these helpers so the rule can never drift between them.
//
// Pure functions only — no DB, no server imports — so this is safe to import from a Server
// Component (the dashboard gate) without pulling the admin client into any bundle.

export const GRACE_PERIOD_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The row shape the rules need. `status` and `grace_until` are what the gate selects. */
export type EntitlementView = { status?: string | null; grace_until?: string | null };

/** True while a lapsed account is still inside its grace window (grace_until in the future). */
export function inGrace(graceUntil: string | null | undefined, now: number = Date.now()): boolean {
  if (!graceUntil) return false;
  const t = Date.parse(graceUntil);
  return Number.isFinite(t) && t > now;
}

/** The dashboard access decision: live, or lapsed-but-still-in-grace. Everything else is out. */
export function hasDashboardAccess(ent: EntitlementView | null | undefined, now: number = Date.now()): boolean {
  if (!ent) return false;
  if (ent.status === "active") return true;
  return inGrace(ent.grace_until, now);
}

/** Whole days left in the grace window (0 once it has passed or was never set). For display. */
export function graceDaysLeft(graceUntil: string | null | undefined, now: number = Date.now()): number {
  if (!graceUntil) return 0;
  const t = Date.parse(graceUntil);
  if (!Number.isFinite(t) || t <= now) return 0;
  return Math.ceil((t - now) / DAY_MS);
}

/** The grace_until timestamp for a window starting now: now + GRACE_PERIOD_DAYS. */
export function graceUntilIso(now: number = Date.now()): string {
  return new Date(now + GRACE_PERIOD_DAYS * DAY_MS).toISOString();
}
