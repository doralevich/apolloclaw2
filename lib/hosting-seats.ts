import "server-only";
import type Stripe from "stripe";
import { HOSTING_PLAN } from "@/lib/pricing/catalog";
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

export type { Stripe };
