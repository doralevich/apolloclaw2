import "server-only";
import { agent37 } from "@/lib/agent37";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Budget } from "@/lib/types";

// Purchased credit, delivered as a monthly-cap raise and kept honest by our own ledger.
//
// Agent37 has no per-instance credit bucket we can fill (see the 0025 migration and lib/agent37
// writeBudget). The one writable knob is monthly_cap_micros, so a top-up RAISES the cap, and this
// module is the accounting that makes a cap raise behave like a one-time, depleting credit:
//
//   base_cap                     the plan allowance, captured the first time credit is added
//   purchased = Σ delivered      from wallet_transactions - the money the customer actually paid
//   drawn                        purchased credit already consumed, accrued at each month rollover
//   credit_remaining = purchased - drawn
//   instance cap = base_cap + credit_remaining
//
// Credit remaining is COMPUTED from the delivered-purchase ledger, never a mutable counter, so a
// retried delivery can't double-grant. The cap is re-asserted on every budget read, so it self-
// heals if a set ever failed. Within a month the cap holds the whole balance and Agent37 meters
// against it; at rollover the month's over-base usage becomes permanent `drawn`, so the credit
// depletes instead of returning free every month.

interface CreditRow {
  base_cap_micros: number | null;
  drawn_micros: number;
  period: string | null;
  consumed_snapshot_micros: number;
}

type Db = ReturnType<typeof createAdminClient>;

async function loadRow(db: Db, agentId: string): Promise<CreditRow | null> {
  const { data } = await db
    .from("agent_credit")
    .select("base_cap_micros, drawn_micros, period, consumed_snapshot_micros")
    .eq("agent37_id", agentId)
    .maybeSingle();
  return (data as CreditRow) ?? null;
}

async function sumDeliveredTopups(db: Db, agentId: string): Promise<number> {
  const { data } = await db
    .from("wallet_transactions")
    .select("amount_micros")
    .eq("agent37_id", agentId)
    .eq("status", "delivered");
  return (data ?? []).reduce((sum, t) => sum + Number((t as { amount_micros: number }).amount_micros), 0);
}

/**
 * Create the ledger row the FIRST time credit is added, capturing the instance's current cap as
 * the base allowance — before any credit is layered on top. A no-op once the row exists.
 *
 * Called by deliverCredit BEFORE it marks a purchase delivered, so the base is the true plan
 * allowance rather than a cap we've already raised. Throws if the budget can't be read, which
 * leaves the purchase pending for a later retry rather than recording a wrong base.
 */
export async function captureBaseIfFirstCredit(agentId: string): Promise<void> {
  const db = createAdminClient();
  if (await loadRow(db, agentId)) return;
  const budget = await agent37.getBudget(agentId);
  await db.from("agent_credit").insert({
    agent37_id: agentId,
    base_cap_micros: budget.monthly_cap_micros,
    drawn_micros: 0,
    period: budget.monthly_period,
    consumed_snapshot_micros: budget.monthly_consumed_micros,
  });
}

export interface EffectiveCredit {
  baseCapMicros: number;
  creditRemainingMicros: number;
  consumedMicros: number;
  monthlyPeriod: string;
  updatedAt: number | null;
}

/**
 * Reconcile the ledger against the live budget and re-assert the instance cap. Returns null when
 * this instance has never been credited (nothing to manage). Safe to call on every read.
 */
export async function syncInstanceCredit(agentId: string): Promise<EffectiveCredit | null> {
  const db = createAdminClient();
  const row = await loadRow(db, agentId);
  if (!row) return null;

  const budget = await agent37.getBudget(agentId);
  const base = row.base_cap_micros ?? budget.monthly_cap_micros;
  const purchased = await sumDeliveredTopups(db, agentId);

  let drawn = Number(row.drawn_micros);
  let period = row.period;

  if (period && period !== budget.monthly_period) {
    // Month rolled over: the prior period's spend above the base is now permanent. Bank it as
    // drawn (never more than what was purchased), then start the new month fresh.
    drawn = Math.min(purchased, drawn + Math.max(0, Number(row.consumed_snapshot_micros) - base));
    period = budget.monthly_period;
  } else if (!period) {
    period = budget.monthly_period;
  }

  const creditRemaining = Math.max(0, purchased - drawn);
  const desiredCap = base + creditRemaining;

  await db
    .from("agent_credit")
    .update({
      drawn_micros: drawn,
      period,
      // Freshest consumed, so a later rollover banks the right amount.
      consumed_snapshot_micros: budget.monthly_consumed_micros,
      updated_at: new Date().toISOString(),
    })
    .eq("agent37_id", agentId);

  if (budget.monthly_cap_micros !== desiredCap) {
    await agent37.setMonthlyCap(agentId, desiredCap).catch((e) => {
      // Self-heals on the next read; don't fail the caller over a cap write.
      console.error("[instance-credit] setMonthlyCap failed:", agentId, e instanceof Error ? e.message : e);
    });
  }

  return {
    baseCapMicros: base,
    creditRemainingMicros: creditRemaining,
    consumedMicros: budget.monthly_consumed_micros,
    monthlyPeriod: budget.monthly_period,
    updatedAt: budget.updated_at,
  };
}

/**
 * The budget every dashboard surface reads, with purchased credit folded in. For an instance with
 * no purchased credit this is the raw Agent37 budget; otherwise the monthly cap is presented as
 * the BASE allowance and the purchased credit as a separate, depleting balance, so "Available =
 * monthly allowance remaining + credits" adds up the same way the runtime enforces it.
 */
export async function effectiveBudget(agentId: string): Promise<Budget> {
  const eff = await syncInstanceCredit(agentId);
  if (!eff) return agent37.getBudget(agentId);

  const { baseCapMicros: base, consumedMicros: consumed, creditRemainingMicros } = eff;
  const freeRemaining = Math.max(0, base - consumed);
  // Credit still spendable = purchased-minus-drawn, less anything this month already spent over
  // the base (that overage is running against credit right now, banked as drawn at rollover).
  const creditNow = Math.max(0, creditRemainingMicros - Math.max(0, consumed - base));

  return {
    monthly_cap_micros: base,
    monthly_consumed_micros: Math.min(consumed, base),
    monthly_remaining_micros: freeRemaining,
    monthly_period: eff.monthlyPeriod,
    topup_remaining_micros: creditNow,
    credit_remaining_micros: creditNow,
    updated_at: eff.updatedAt,
  } as Budget & { credit_remaining_micros: number };
}
