import "server-only";
import type Stripe from "stripe";
import { HOSTING_PLAN, LICENSE_TIERS } from "@/lib/pricing/catalog";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// Hosting is a QUANTITY, not a pile of subscriptions.
//
// A company that adds an agent for someone in the office needs a second $189/mo. The obvious
// implementation - a second subscription - is the wrong one for three reasons:
//
//   THE CUSTOMER'S BILL. One line that reads "ApolloClaw Agent Hosting x3" is a bill somebody
//   can check. Three separate $189 charges landing on separate renewal dates is a support
//   email every month.
//
//   PRORATION. Stripe prorates a quantity change to the day, for free. Hand-rolling "you added
//   someone on the 14th" across separate subscriptions is arithmetic we would get wrong.
//
//   AND THE BUG IT AVOIDS. handleSubscriptionDeleted cancels entitlements by EMAIL. With
//   separate subscriptions, cancelling one seat would flip the whole company's entitlement off
//   and lock everybody out - including the founder still paying for their own agent. With a
//   quantity, customer.subscription.deleted only fires when they drop to zero, which is exactly
//   when cancelling the entitlement is correct.
//
// There is no subscription id in our database, so it is resolved from Stripe each time: the
// workspace owner's email -> their customer records -> the active subscription carrying
// flow=onboard_license -> the line item priced at the hosting lookup key. Seat changes are rare
// enough that a couple of API calls cost nothing, and this cannot drift from a stored id that
// nobody updated.

export interface HostingSeat {
  subscriptionId: string;
  itemId: string;
  quantity: number;
}

/** The email Stripe knows this workspace by: its owner's. */
async function workspaceOwnerEmail(workspaceId: string): Promise<string | null> {
  const db = createAdminClient();
  const { data: ws } = await db
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .maybeSingle();
  const ownerId = ws?.owner_id as string | undefined;
  if (!ownerId) return null;
  const { data } = await db.auth.admin.getUserById(ownerId);
  return data.user?.email?.trim().toLowerCase() ?? null;
}

/**
 * Find the workspace's hosting line, or null if there isn't one.
 *
 * Null is a real answer rather than an error: a white-glove customer David set up by hand, or
 * anyone whose licence predates Stripe, has agents and no subscription. Their seats are a
 * conversation with him, not a proration.
 */
export async function findHostingSeat(workspaceId: string): Promise<HostingSeat | null> {
  const email = await workspaceOwnerEmail(workspaceId);
  if (!email) return null;

  const stripe = getStripe();
  const { data: customers } = await stripe.customers.list({ email, limit: 10 });
  if (!customers.length) return null;

  // The hosting price id, resolved by lookup key like every other price in this codebase, so a
  // reprice (which mints a new price and moves the key) does not orphan this.
  const { data: prices } = await stripe.prices.list({
    lookup_keys: [HOSTING_PLAN.catalogKey],
    active: true,
  });
  const hostingPriceId = prices.find((p) => p.lookup_key === HOSTING_PLAN.catalogKey)?.id;
  if (!hostingPriceId) return null;

  for (const customer of customers) {
    const { data: subs } = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 20,
    });
    for (const sub of subs) {
      // Ours, and this Stripe account also serves The College Agent — so the marker is checked
      // rather than assumed from "they have a subscription".
      if (sub.metadata?.flow !== "onboard_license" && !sub.metadata?.agent_type) continue;
      const item = sub.items.data.find((i) => i.price?.id === hostingPriceId);
      if (item) {
        return { subscriptionId: sub.id, itemId: item.id, quantity: item.quantity ?? 1 };
      }
    }
  }
  return null;
}

/**
 * Move the hosting quantity by `delta`, returning the new quantity.
 *
 * `proration_behavior: "always_invoice"` on an increase: adding a seat mid-cycle charges the
 * pro-rated remainder straight away rather than silently at the next renewal. A customer who
 * has just pressed "add an agent" is the most willing they will ever be to see that charge, and
 * a surprise on the 1st is how disputes start.
 *
 * A decrease credits the account instead. Never below 1 — a workspace with a licence always has
 * at least one agent, and quantity 0 would delete the line and take the entitlement with it.
 */
export async function changeHostingSeats(workspaceId: string, delta: number): Promise<number | null> {
  const seat = await findHostingSeat(workspaceId);
  if (!seat) return null;

  const next = Math.max(1, seat.quantity + delta);
  if (next === seat.quantity) return seat.quantity;

  const stripe = getStripe();
  await stripe.subscriptionItems.update(seat.itemId, {
    quantity: next,
    proration_behavior: delta > 0 ? "always_invoice" : "create_prorations",
  });
  return next;
}

/** What the workspace is paying for right now, for the UI to state before anyone commits. */
export async function hostingSeatCount(workspaceId: string): Promise<number | null> {
  const seat = await findHostingSeat(workspaceId);
  return seat?.quantity ?? null;
}

// ── The one-time additional-agent fee ────────────────────────────────────────
//
// David's call: every agent added after the first carries the Basic license price ($449) as a
// one-time charge, on top of its monthly hosting seat. The fee is staged as a PENDING invoice
// item bound to the hosting subscription BEFORE the seat quantity changes, because the seat
// change bills with always_invoice - and the invoice Stripe generates for that proration sweeps
// in pending items on the same subscription. One button press, one invoice, both lines on it.

const AGENT_FEE_TIER = LICENSE_TIERS.find((t) => t.id === "basic")!;
export const AGENT_FEE_CENTS = AGENT_FEE_TIER.amountCents;

export interface PendingAgentFee {
  invoiceItemId: string;
  amountCents: number;
}

/**
 * Stage the fee on the workspace's hosting subscription. Null when there is no subscription -
 * the same white-glove case where seat changes are a conversation, not a proration.
 *
 * Amount + description rather than the license price id: the tier's Stripe price is a checkout
 * price for the product, and pinning invoice items to it would couple this to how the seed
 * script models one-time prices. The catalog is still the single source of the number.
 */
export async function stageAgentFee(workspaceId: string): Promise<PendingAgentFee | null> {
  const seat = await findHostingSeat(workspaceId);
  if (!seat) return null;

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(seat.subscriptionId);
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const item = await stripe.invoiceItems.create({
    customer,
    subscription: seat.subscriptionId,
    amount: AGENT_FEE_CENTS,
    currency: "usd",
    description: `${AGENT_FEE_TIER.name} — additional agent (one-time)`,
  });
  return { invoiceItemId: item.id, amountCents: AGENT_FEE_CENTS };
}

/** Remove a staged fee that has NOT been invoiced yet - the pre-charge failure path. */
export async function discardStagedAgentFee(fee: PendingAgentFee): Promise<void> {
  await getStripe().invoiceItems.del(fee.invoiceItemId);
}

/**
 * Reverse a fee that already landed on a paid invoice: a negative invoice item for the same
 * amount, which offsets the customer's next invoice. The same shape as the seat rollback
 * (create_prorations credits the account rather than refunding cash), used when provisioning
 * fails after the charge went through.
 */
export async function reverseAgentFee(workspaceId: string): Promise<void> {
  const seat = await findHostingSeat(workspaceId);
  if (!seat) return;

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(seat.subscriptionId);
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  await stripe.invoiceItems.create({
    customer,
    subscription: seat.subscriptionId,
    amount: -AGENT_FEE_CENTS,
    currency: "usd",
    description: `${AGENT_FEE_TIER.name} — additional agent fee reversal (agent build failed)`,
  });
}

/**
 * The Stripe customer this workspace bills to, for the billing-portal handoff. Resolved the
 * same way findHostingSeat resolves everything - owner email, then the customer holding our
 * subscription - so the portal can never open on a different customer than the one the seat
 * changes bill. Null for white-glove workspaces with no subscription.
 */
export async function findStripeCustomerId(workspaceId: string): Promise<string | null> {
  const seat = await findHostingSeat(workspaceId);
  if (!seat) return null;
  const sub = await getStripe().subscriptions.retrieve(seat.subscriptionId);
  return typeof sub.customer === "string" ? sub.customer : sub.customer.id;
}

export type { Stripe };
