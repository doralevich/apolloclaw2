import "server-only";
import { agent37 } from "@/lib/agent37";
import { usdToMicros } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { creditPackForCatalogKey, type CreditPack } from "@/lib/pricing/catalog";

// Purchased API credits: the money half lives here, the balance itself lives on the Agent37
// instance. Those are two different systems that can disagree, so this module never treats
// "Stripe says paid" and "the runtime has the credit" as one event.
//
// The order is fixed and matters:
//   1. record the purchase as PENDING (the moment payment is confirmed)
//   2. try to deliver it to the runtime
//   3. flip to DELIVERED only if the runtime accepted it
//
// A failure at step 2 leaves a pending row — money we owe, visible in the ledger, retryable
// without re-charging anyone. The opposite order would lose purchases on any runtime hiccup.

export interface RecordPurchaseInput {
  workspaceId: string;
  agent37Id: string;
  pack: CreditPack;
  stripeSessionId: string;
  purchasedBy?: string;
}

/**
 * Write the purchase down. Idempotent on stripe_session_id, so a webhook retry can't grant
 * the same pack twice. Returns the row id, or null when this session was already recorded.
 */
export async function recordCreditPurchase(input: RecordPurchaseInput): Promise<number | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("wallet_transactions")
    .insert({
      workspace_id: input.workspaceId,
      agent37_id: input.agent37Id,
      kind: "topup",
      amount_micros: usdToMicros(input.pack.creditUsd),
      amount_cents: input.pack.amountCents,
      catalog_key: input.pack.catalogKey,
      stripe_session_id: input.stripeSessionId,
      status: "pending",
      purchased_by: input.purchasedBy ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique violation on stripe_session_id: Stripe delivered this event twice.
    if (error.code === "23505") return null;
    throw error;
  }
  return data.id as number;
}

/**
 * Hand a recorded purchase to the runtime and mark the outcome. Never throws: a delivery
 * failure is a state we store (pending + last_error), not an exception the webhook should
 * fail on — Stripe would retry the whole event and we'd be re-deciding a settled payment.
 */
export async function deliverCredit(rowId: number): Promise<boolean> {
  const db = createAdminClient();
  const { data: row, error } = await db
    .from("wallet_transactions")
    .select("id, agent37_id, amount_micros, status")
    .eq("id", rowId)
    .single();
  if (error || !row) {
    console.error("[credits] delivery: row not found", rowId, error?.message);
    return false;
  }
  if (row.status === "delivered") return true;

  try {
    await agent37.addCredit(row.agent37_id as string, Number(row.amount_micros));
    await db
      .from("wallet_transactions")
      .update({ status: "delivered", delivered_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() })
      .eq("id", rowId);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[credits] delivery failed, left pending:", rowId, message);
    await db
      .from("wallet_transactions")
      .update({ last_error: message.slice(0, 500), updated_at: new Date().toISOString() })
      .eq("id", rowId);
    return false;
  }
}

/**
 * Retry everything still owed. Safe to call repeatedly (an already-delivered row short-
 * circuits), so it suits a cron, an admin button, or a nudge on the next dashboard load.
 */
export async function deliverPendingCredits(workspaceId?: string): Promise<{ attempted: number; delivered: number }> {
  const db = createAdminClient();
  let q = db.from("wallet_transactions").select("id").neq("status", "delivered").limit(100);
  if (workspaceId) q = q.eq("workspace_id", workspaceId);

  const { data: rows, error } = await q;
  if (error || !rows?.length) return { attempted: 0, delivered: 0 };

  let delivered = 0;
  for (const r of rows) {
    if (await deliverCredit(r.id as number)) delivered++;
  }
  return { attempted: rows.length, delivered };
}

/** Purchase history for a workspace, newest first. Powers the Credits tab's ledger. */
export async function listCreditPurchases(workspaceId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("wallet_transactions")
    .select("id, amount_cents, amount_micros, catalog_key, status, created_at, delivered_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id as number,
    amountCents: r.amount_cents as number,
    amountMicros: Number(r.amount_micros),
    packName: creditPackForCatalogKey(r.catalog_key as string)?.name ?? "API Credits",
    status: r.status as "pending" | "delivered" | "failed",
    createdAt: r.created_at as string,
    deliveredAt: (r.delivered_at as string | null) ?? null,
  }));
}
