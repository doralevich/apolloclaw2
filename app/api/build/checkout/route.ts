import { getAgentType } from "@/config/agent-types";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { HOSTING_PLAN, planForAgentType } from "@/lib/pricing/catalog";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/build/checkout { workspace_id, type, name? }
//
// Starts the purchase of a paid agent: a Stripe Checkout Session bundling the agent's
// one-time build fee with the shared monthly hosting subscription. Prices resolve by
// lookup_key (never hardcoded price ids), and the session carries user_id + workspace +
// chosen agent in its metadata — that's everything the webhook needs to provision after
// checkout.session.completed. Nothing is provisioned here.
export const POST = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const body = await readJson<{ workspace_id?: string; type?: string; name?: string }>(request);

  if (!body.workspace_id) throw new ApiError(400, "invalid_request", "workspace_id is required");
  if (!body.type) throw new ApiError(400, "invalid_request", "type is required");
  await requireMember(supabase, body.workspace_id, user.id);

  const type = getAgentType(body.type);
  if (!type) throw new ApiError(404, "not_found", "Unknown agent type");
  if (!type.available) {
    throw new ApiError(400, "invalid_request", `${type.label} isn't available yet — coming soon.`);
  }
  const plan = planForAgentType(type.id);
  if (!plan || !type.planKey) {
    throw new ApiError(400, "invalid_request", `${type.label} isn't sold through checkout.`);
  }

  // Same one-per-type cap the webhook enforces, checked BEFORE we take anyone's money.
  const db = createAdminClient();
  const { data: existing, error: capError } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", body.workspace_id)
    .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
    .limit(1);
  if (capError) throw new ApiError(500, "db_error", capError.message);
  if (existing && existing.length > 0) {
    throw new ApiError(
      409,
      "conflict",
      `This workspace already has a ${type.label}. Each workspace can have one agent per type.`
    );
  }

  const stripe = getStripe();
  const { data: prices } = await stripe.prices.list({
    lookup_keys: [plan.catalogKey, HOSTING_PLAN.catalogKey],
    active: true,
  });
  const planPrice = prices.find((p) => p.lookup_key === plan.catalogKey);
  const hostingPrice = prices.find((p) => p.lookup_key === HOSTING_PLAN.catalogKey);
  if (!planPrice || !hostingPrice) {
    throw new ApiError(
      500,
      "config_error",
      "Pricing isn't set up yet — run the Stripe catalog sync and try again."
    );
  }

  // Everything the webhook needs to provision, on both the session and the subscription
  // (so later subscription lifecycle events can also be traced back to the purchase).
  const metadata = {
    user_id: user.id,
    workspace_id: body.workspace_id,
    agent_type: type.id,
    agent_name: body.name?.trim().slice(0, 80) || "",
  };

  const origin = publicSiteOrigin(new URL(request.url).origin);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: planPrice.id, quantity: 1 },
      { price: hostingPrice.id, quantity: 1 },
    ],
    customer_email: user.email || undefined,
    client_reference_id: user.id,
    metadata,
    subscription_data: { metadata },
    // Success lands on the setup questionnaire — the thing to do while the webhook
    // provisions the agent. (?ws pins the workspace the purchase was made for.)
    success_url: `${origin}/onboard/${encodeURIComponent(type.id)}?ws=${encodeURIComponent(body.workspace_id)}&paid=1`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) throw new ApiError(502, "stripe_error", "Stripe did not return a checkout URL");
  return json({ url: session.url });
});
