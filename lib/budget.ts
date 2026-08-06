/**
 * Available to spend, right now: what's left of this month's allowance plus any purchased
 * credit.
 *
 * This lives in its own module, rather than beside the sweep that first needed it, because
 * two places now say this number out loud — the low-balance warning in lib/credit-watch.ts
 * and the chat header — and they must never disagree. A warning email quoting a balance the
 * customer cannot find on screen is how a safety net loses trust.
 *
 * Deliberately free of `server-only`: the header reads it in the browser.
 *
 * `credit_remaining_micros` and `topup_remaining_micros` are the same figure under two names.
 * The runtime renamed it; the Budget type still carries the old one, and instances in the
 * wild answer with either, so both are read and the newer wins.
 */
export function availableMicros(budget: {
  monthly_remaining_micros?: number;
  credit_remaining_micros?: number;
  topup_remaining_micros?: number;
}): number {
  const monthly = budget.monthly_remaining_micros ?? 0;
  const credit = budget.credit_remaining_micros ?? budget.topup_remaining_micros ?? 0;
  return monthly + credit;
}
