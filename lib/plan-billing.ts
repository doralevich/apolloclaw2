import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { setBaseCap } from "@/lib/instance-credit";
import { PLAN_SKUS } from "@/lib/pricing/catalog";
import { agentTier, isPlanId, PLANS, type AgentTier, type PlanId } from "@/config/agent-plans";

// The money side of the plans: recording what someone bought, the pooled usage credit it carries,
// and extra agents billed as a quantity on the plan's own subscription.
//
// The record lives in workspace_agent_plans (migrations 0033, 0035). Stripe is the source of
// truth for what is being paid; this row is the app's copy of it, written at checkout and kept in
// step by the webhook on every subscription change, so a page never waits on a Stripe call.
//
// Legacy customers never pass through here. They have no plan row (or one without a
// subscription), keep the price they pay today, and add agents through the seat flow
// (lib/hosting-seats.ts) exactly as before.

interface PlanRow {
  plan: string;
  addon_agents: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

async function loadRow(workspaceId: string): Promise<PlanRow | null> {
  const { data, error } = await createAdminClient()
    .from("workspace_agent_plans")
    .select("plan, addon_agents, stripe_subscription_id, stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) console.error("[plan-billing:read]", workspaceId, error.message);
  return (data as PlanRow | null) ?? null;
}

/** Checkout paid for a plan: record it against the workspace. Safe to repeat (Stripe re-delivers). */
export async function recordPlanPurchase(
  workspaceId: string,
  plan: PlanId,
  subscriptionId: string | null,
  customerId: string | null
): Promise<void> {
  const { error } = await createAdminClient().from("workspace_agent_plans").upsert(
    {
      workspace_id: workspaceId,
      plan,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
      updated_by: "checkout",
    },
    { onConflict: "workspace_id" }
  );
  if (error) throw new Error(`recording the plan failed: ${error.message}`);
}

/** The usage credit a plan workspace gets each month, in micros: the plan's, plus each extra
 *  agent's share. Null for a legacy workspace, whose agents keep the allowance they have. */
export async function planCapMicros(workspaceId: string): Promise<number | null> {
  const row = await loadRow(workspaceId);
  const tier = agentTier(row?.plan);
  if (tier.id === "legacy") return null;
  const cents = tier.includedCreditCents + (row?.addon_agents ?? 0) * (tier.addOn?.creditCents ?? 0);
  return cents * 10_000;
}

/** Put the plan's pooled credit on the workspace's instance. A plan's agents share one instance
 *  (extra agents are added onto it), so the pool lands there; were there ever more than one, the
 *  oldest carries it rather than every instance getting the whole pool. Best effort. */
export async function syncPlanCap(workspaceId: string): Promise<void> {
  const cap = await planCapMicros(workspaceId);
  if (cap === null) return;
  const { data } = await createAdminClient()
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  const instance = (data?.[0] as { agent37_id: string } | undefined)?.agent37_id;
  if (!instance) return;
  await setBaseCap(instance, cap).catch((e) =>
    console.error("[plan-billing:cap]", workspaceId, e instanceof Error ? e.message : e)
  );
}

async function addOnPrice(stripe: Stripe, tier: AgentTier): Promise<Stripe.Price> {
  if (!tier.addOn) throw new Error(`${tier.label} has no add-on agents`);
  const key = PLAN_SKUS[tier.addOn.sku].catalogKey;
  const { data } = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  if (!data[0]) throw new Error(`Add-on price ${key} is not in Stripe yet. Run the catalog sync.`);
  return data[0];
}

/**
 * Bill one more agent on the plan: +1 on the add-on line of the subscription, charged now and
 * prorated to the day, then the count and the pooled credit go up. Returns an undo for when the
 * agent itself then fails to build, so nobody pays for an agent they did not get.
 */
export async function addAddOnAgent(workspaceId: string): Promise<() => Promise<void>> {
  const row = await loadRow(workspaceId);
  const tier = agentTier(row?.plan);
  if (!row?.stripe_subscription_id || tier.id === "legacy") throw new Error("This workspace is not on a plan.");
  const stripe = getStripe();
  const price = await addOnPrice(stripe, tier);
  const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
  const item = sub.items.data.find((i) => i.price.lookup_key === price.lookup_key);

  let undo: () => Promise<void>;
  if (item) {
    await stripe.subscriptionItems.update(item.id, { quantity: (item.quantity ?? 0) + 1, proration_behavior: "always_invoice" });
    undo = async () => {
      await stripe.subscriptionItems.update(item.id, { quantity: item.quantity ?? 0, proration_behavior: "create_prorations" });
    };
  } else {
    const created = await stripe.subscriptionItems.create({
      subscription: sub.id,
      price: price.id,
      quantity: 1,
      proration_behavior: "always_invoice",
    });
    undo = async () => {
      await stripe.subscriptionItems.del(created.id, { proration_behavior: "create_prorations" });
    };
  }

  await setAddOns(workspaceId, row.addon_agents + 1);
  return async () => {
    await undo().catch((e) => console.error("[plan-billing:undo-addon]", workspaceId, (e as Error).message));
    await setAddOns(workspaceId, row.addon_agents);
  };
}

/** One fewer extra agent: -1 on the add-on line (credited on the next invoice), when there is one
 *  to take off. Removing an agent the plan already included costs nothing and refunds nothing. */
export async function removeAddOnAgent(workspaceId: string): Promise<void> {
  const row = await loadRow(workspaceId);
  const tier = agentTier(row?.plan);
  if (!row?.stripe_subscription_id || !tier.addOn || row.addon_agents <= 0) return;
  const stripe = getStripe();
  const price = await addOnPrice(stripe, tier);
  const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
  const item = sub.items.data.find((i) => i.price.lookup_key === price.lookup_key);
  if (item) {
    const next = (item.quantity ?? 1) - 1;
    if (next > 0) await stripe.subscriptionItems.update(item.id, { quantity: next, proration_behavior: "create_prorations" });
    else await stripe.subscriptionItems.del(item.id, { proration_behavior: "create_prorations" });
  }
  await setAddOns(workspaceId, row.addon_agents - 1);
}

async function setAddOns(workspaceId: string, count: number): Promise<void> {
  const { error } = await createAdminClient()
    .from("workspace_agent_plans")
    .update({ addon_agents: Math.max(0, count), updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId);
  if (error) console.error("[plan-billing:addons]", workspaceId, error.message);
  await syncPlanCap(workspaceId);
}

/**
 * A plan subscription changed in Stripe (a switch from Team to Executive in the billing portal, a
 * quantity change, a renewal): read the plan and the add-on count back off its items and bring the
 * workspace's row and pooled credit in line. A subscription this app never recorded is ignored.
 */
export async function syncPlanFromSubscription(sub: Stripe.Subscription): Promise<void> {
  const db = createAdminClient();
  const { data } = await db
    .from("workspace_agent_plans")
    .select("workspace_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  const workspaceId = (data as { workspace_id: string } | null)?.workspace_id;
  if (!workspaceId) return;

  const keys = new Map(sub.items.data.map((i) => [i.price.lookup_key ?? "", i.quantity ?? 0]));
  const plan = PLANS.find((p) => p.sku && keys.has(PLAN_SKUS[p.sku].catalogKey));
  if (!plan || !isPlanId(plan.id)) {
    console.error("[plan-billing:sync] no plan line on subscription", sub.id);
    return;
  }
  const addons = plan.addOn ? keys.get(PLAN_SKUS[plan.addOn.sku].catalogKey) ?? 0 : 0;
  const { error } = await db
    .from("workspace_agent_plans")
    .update({ plan: plan.id, addon_agents: addons, updated_at: new Date().toISOString(), updated_by: "stripe" })
    .eq("workspace_id", workspaceId);
  if (error) throw new Error(`plan sync failed: ${error.message}`);
  await syncPlanCap(workspaceId);
}

/** The Stripe customer a plan workspace is billed as, for the billing portal. Null for legacy
 *  workspaces, which are found through their hosting seat instead (lib/hosting-seats.ts). */
export async function planCustomerId(workspaceId: string): Promise<string | null> {
  return (await loadRow(workspaceId))?.stripe_customer_id ?? null;
}
