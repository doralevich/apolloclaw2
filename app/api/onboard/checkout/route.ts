import { getAgentType } from "@/config/agent-types";
import { ApiError, json, readJson, route } from "@/lib/http";
import { PLAN_SKUS } from "@/lib/pricing/catalog";
import { PLANS_ON_SALE, type AgentTier } from "@/config/agent-plans";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";

// POST /api/onboard/checkout — the paywall in the /onboard journey.
//
// Sells a plan (Team or Executive; config/agent-plans.ts): one monthly subscription line, no
// setup fee. Extra agents are added later, as a quantity on this same subscription. The license
// tiers and the $249 hosting line this used to sell stay in Stripe for the customers already on
// them, and are no longer sold here.
//
// Deliberately UNAUTHENTICATED, which is the whole point of the pivot: the buyer has no
// account yet. They fill in the "Start Here" lead fields, pay, and the account is created
// from the completed checkout by the Stripe webhook. That inverts the old
// /api/build/checkout flow, which required a logged-in user and an existing workspace
// because it was provisioning into one.
//
// Nothing is created here — not a user, not a workspace, not an agent. This route only
// mints a Stripe Checkout Session and stamps the lead details onto its metadata. Those
// details are the entire contract between this route and the webhook, which is what makes
// it safe for this to be open: a caller can burn a Stripe session, and nothing else.
//
// Rate limited by IP on the shared `checkout` bucket. Fails open if the limiter is
// unavailable, matching every other public endpoint here (see lib/rate-limit.ts).

interface CheckoutBody {
  first?: string;
  last?: string;
  email?: string;
  personalEmail?: string;
  phone?: string;
  /** The plan picked on /pricing ("team", "executive"). Anything missing, unknown or not on sale
   *  resolves to the featured plan; the paywall shows which before anyone pays. */
  plan?: string;
  /** Which role agent this purchase builds (e.g. "realestate" from the branded /build/[type]
   *  funnel). Absent (or not a valid, self-serve role type) provisions the generic license agent -
   *  so the plain /onboard flow is unchanged. Carried on the session metadata and read back by
   *  /api/onboard/complete + /status; the webhook ignores it (it only creates the account). */
  agentType?: string;
  /** Internal path to return to after Stripe (the branded funnel page, so the post-payment
   *  questionnaire is the right one). Validated to an internal path; defaults to /onboard. */
  returnPath?: string;
}

// Stripe metadata values are capped at 500 characters and the whole object at 50 keys. None
// of these are close to that, but a caller controls every one of them, so they are trimmed
// to sane lengths rather than trusted.
function clean(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "onboard_checkout", LIMITS.checkout);
  if (limited) return limited;

  const body = await readJson<CheckoutBody>(request);
  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 80);
  const last = clean(body.last, 80);

  if (!first || !last) throw new ApiError(400, "invalid_request", "First and last name are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "invalid_request", "A valid business email is required.");
  }

  // The plan is resolved from the catalog, never taken as a price id from the body. A caller who
  // could name the price could name a $0 one, and this route is deliberately open.
  const plan: AgentTier =
    PLANS_ON_SALE.find((p) => p.id === body.plan) ?? PLANS_ON_SALE.find((p) => p.featured) ?? PLANS_ON_SALE[0];
  const planKey = PLAN_SKUS[plan.sku!].catalogKey;

  // A role agent to build, if the branded funnel asked for one. Only a real, self-serve role type
  // is honoured (never external like the College Agent, never the no-questionnaire Blank build);
  // anything else falls through to the generic license agent, keeping plain /onboard unchanged.
  const requestedType = clean(body.agentType, 40);
  const rt = requestedType ? getAgentType(requestedType) : undefined;
  const agentType = rt && !rt.externalUrl && !rt.noSetup ? rt.id : "";

  // Where Stripe returns to. Must be an internal path (no open redirect), and only the pathname is
  // used - the ?paid / ?session_id / ?checkout params are appended here.
  const rawReturn = clean(body.returnPath, 200).split(/[?#]/)[0];
  const returnPath = rawReturn.startsWith("/") && !rawReturn.startsWith("//") ? rawReturn : "/onboard";

  const stripe = getStripe();
  const { data: prices } = await stripe.prices.list({ lookup_keys: [planKey], active: true });
  const planPrice = prices.find((p) => p.lookup_key === planKey);
  if (!planPrice) {
    // Reads as a config problem to us and as "try again shortly" to the buyer, which is
    // accurate: the fix is running the catalog sync, not anything they can do.
    throw new ApiError(
      500,
      "config_error",
      "Pricing isn't set up yet - run the Stripe catalog sync and try again."
    );
  }

  // Everything the webhook needs to create the account. `flow` is what tells the webhook
  // this is a license purchase rather than the older per-agent purchase (which carries
  // user_id/workspace_id/agent_type instead) or a College Agent sale on this shared Stripe
  // account. Both the session and the subscription carry it, so later subscription
  // lifecycle events can also be traced back to this purchase.
  //
  // `flow` stays "onboard_license": the webhook keys on it to decide that this session creates an
  // account. `plan` is what the webhook records against the new workspace (its agents and pooled
  // usage credit come from it), and it lets David read who bought what from Stripe alone.
  const metadata = {
    flow: "onboard_license",
    plan: plan.id,
    lead_email: email,
    first_name: first,
    last_name: last,
    personal_email: clean(body.personalEmail, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    // Only present for a role-agent purchase. /api/onboard/complete + /status read it to build the
    // right agent; the license webhook never looks at it.
    ...(agentType ? { agent_type: agentType } : {}),
  };

  const origin = publicSiteOrigin(new URL(request.url).origin);
  const session = await stripe.checkout.sessions.create({
    // One monthly line, the plan. No setup fee on the standard plans.
    mode: "subscription",
    line_items: [{ price: planPrice.id, quantity: 1 }],
    customer_email: email,
    metadata,
    subscription_data: { metadata },
    // Back to /onboard, which shows the confirmation screen and then continues into the
    // questionnaire. The session id lets that screen read back what was actually charged
    // (promotion codes and proration mean the catalog price is not always the total) and
    // confirm the payment with Stripe rather than trusting ?paid=1.
    success_url: `${origin}${returnPath}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${returnPath}?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) throw new ApiError(502, "stripe_error", "Stripe did not return a checkout URL");
  return json({ url: session.url });
});
