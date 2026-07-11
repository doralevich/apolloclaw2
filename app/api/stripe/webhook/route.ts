import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { ApiError } from "@/lib/http";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe webhook — the provisioning side of the storefront.
//
// checkout.session.completed (paid) -> provision the purchased agent into the buyer's
// workspace and activate their entitlement. The session metadata written by
// /api/build/checkout (user_id, workspace_id, agent_type, agent_name) is the entire
// contract between checkout and here.
//
// This Stripe account also serves The College Agent's own site, so events that don't
// carry our metadata are acknowledged and ignored — never errored (Stripe would retry
// them forever).
//
// Idempotency: Stripe retries deliveries, so provisioning must tolerate duplicates. The
// one-agent-per-type-per-workspace cap inside provisionTypedAgent turns a duplicate into
// a 409, which we treat as "already provisioned" and acknowledge.

export const POST = async (request: Request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // Raw body, untouched — signature verification hashes the exact bytes Stripe sent.
    const payload = await request.text();
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    // Non-2xx makes Stripe redeliver — exactly what we want for transient Agent37 or DB
    // failures. The idempotent cap makes redelivery safe.
    console.error(`[stripe-webhook] ${event.type} failed:`, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const meta = session.metadata ?? {};
  const { user_id: userId, workspace_id: workspaceId, agent_type: agentTypeId } = meta;

  // Not an Apollo agent purchase (e.g. a College Agent checkout on this shared account).
  if (!userId || !workspaceId || !agentTypeId) return;

  // Delayed payment methods complete the session before the money clears; the
  // async_payment_succeeded event re-enters here once payment_status flips to paid.
  if (session.payment_status !== "paid") {
    console.log("[stripe-webhook] session completed but unpaid, waiting:", session.id);
    return;
  }

  const type = getAgentType(agentTypeId);
  if (!type || !type.planKey) {
    console.error("[stripe-webhook] paid session for unknown agent type:", agentTypeId, session.id);
    return;
  }

  // Paid customers are entitled customers — activate (or create) their entitlement row so
  // the rest of the dashboard's spend gates open up. Keyed by email like the allowlist.
  const email = session.customer_details?.email?.trim().toLowerCase();
  if (email) {
    const db = createAdminClient();
    const { error } = await db
      .from("entitlements")
      .upsert(
        { email, status: "active", source: "stripe", user_id: userId },
        { onConflict: "email" }
      );
    if (error) console.error("[stripe-webhook] entitlement upsert failed:", email, error.message);
  }

  try {
    const agent = await provisionTypedAgent({
      type,
      workspaceId,
      userId,
      name: meta.agent_name || undefined,
      // The customer already paid — a missing dedicated template must not fail the order.
      allowTemplateFallback: true,
    });
    console.log("[stripe-webhook] provisioned", type.id, agent.id, "for session", session.id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      // Duplicate delivery (or a second purchase attempt for a type the workspace already
      // has): the agent exists, which is the state this event wanted. Acknowledge.
      console.log("[stripe-webhook] already provisioned, skipping:", session.id);
      return;
    }
    throw err;
  }
}

// Hosting subscription cancelled -> flip the Stripe-managed entitlement off. Only rows
// this webhook owns (source = 'stripe') are touched; admin allowlist entries survive.
// The agent instance itself is left running — suspension policy is a human decision.
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  if (!subscription.metadata?.agent_type) return; // not an Apollo hosting subscription

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await getStripe().customers.retrieve(customerId);
  const email = !customer.deleted ? customer.email?.trim().toLowerCase() : null;
  if (!email) return;

  const db = createAdminClient();
  const { error } = await db
    .from("entitlements")
    .update({ status: "canceled" })
    .eq("email", email)
    .eq("source", "stripe");
  if (error) console.error("[stripe-webhook] entitlement cancel failed:", email, error.message);
}
