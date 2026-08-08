import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { creditPackForCatalogKey } from "@/lib/pricing/catalog";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";

// POST /api/credits/checkout { agent_id, pack }
//
// Starts the purchase of an API credit pack for one agent. Price resolves by lookup_key
// (never a hardcoded price id), and the session carries the workspace, the instance, and the
// pack in its metadata — everything the webhook needs to record and deliver the credit.
//
// Nothing is granted here. Credit is only ever written down once Stripe confirms payment, in
// the webhook, so a customer who abandons checkout can't leave a balance behind.
export const POST = route(async (request: Request) => {
  const body = await readJson<{ agent_id?: string; pack?: string }>(request);
  if (!body.agent_id) throw new ApiError(400, "invalid_request", "agent_id is required");
  if (!body.pack) throw new ApiError(400, "invalid_request", "pack is required");

  // Same ownership gate as every other per-agent route. Credit is spent by this instance, so
  // the right to buy it is the right to use it.
  const { user, row: agent } = await requireAgentAccess(body.agent_id, "admin");

  const pack = creditPackForCatalogKey(body.pack);
  if (!pack) throw new ApiError(404, "not_found", "Unknown credit pack");

  const stripe = getStripe();
  const { data: prices } = await stripe.prices.list({ lookup_keys: [pack.catalogKey], active: true });
  const price = prices.find((p) => p.lookup_key === pack.catalogKey);
  if (!price) {
    throw new ApiError(
      500,
      "config_error",
      "Credit packs aren't set up in Stripe yet - run the catalog sync and try again."
    );
  }

  const origin = publicSiteOrigin(new URL(request.url).origin);
  const metadata = {
    flow: "credit_topup",
    user_id: user.id,
    workspace_id: agent.workspace_id,
    agent37_id: agent.agent37_id,
    catalog_key: pack.catalogKey,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: price.id, quantity: 1 }],
    metadata,
    payment_intent_data: {
      metadata,
      // Save the card against the customer for later off-session use. This is the ONLY thing
      // that makes auto-recharge possible: without a stored payment method there is nothing to
      // charge when the balance runs low, and we'd have to email someone and hope. Buying a
      // pack manually is therefore also the act of enabling the safety net — which is why the
      // Credits page says so next to the buttons rather than doing it quietly.
      setup_future_usage: "off_session",
    },
    // A Customer has to exist for the payment method to attach to. In payment mode Stripe only
    // creates one if asked.
    customer_creation: "always",
    ...(user.email ? { customer_email: user.email } : {}),
    success_url: `${origin}/dashboard/settings/billing?purchased=1`,
    cancel_url: `${origin}/dashboard/settings/billing?canceled=1`,
  });

  if (!session.url) throw new ApiError(502, "stripe_error", "Stripe did not return a checkout URL");
  return json({ url: session.url });
});
