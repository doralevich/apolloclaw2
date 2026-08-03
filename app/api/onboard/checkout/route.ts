import { ApiError, json, readJson, route } from "@/lib/http";
import { HOSTING_PLAN, LICENSE_PLAN } from "@/lib/pricing/catalog";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";

// POST /api/onboard/checkout — the paywall in the /onboard journey.
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

  const stripe = getStripe();
  const { data: prices } = await stripe.prices.list({
    lookup_keys: [LICENSE_PLAN.catalogKey, HOSTING_PLAN.catalogKey],
    active: true,
  });
  const licensePrice = prices.find((p) => p.lookup_key === LICENSE_PLAN.catalogKey);
  const hostingPrice = prices.find((p) => p.lookup_key === HOSTING_PLAN.catalogKey);
  if (!licensePrice || !hostingPrice) {
    // Reads as a config problem to us and as "try again shortly" to the buyer, which is
    // accurate: the fix is running the catalog sync, not anything they can do.
    throw new ApiError(
      500,
      "config_error",
      "Pricing isn't set up yet — run the Stripe catalog sync and try again."
    );
  }

  // Everything the webhook needs to create the account. `flow` is what tells the webhook
  // this is a license purchase rather than the older per-agent purchase (which carries
  // user_id/workspace_id/agent_type instead) or a College Agent sale on this shared Stripe
  // account. Both the session and the subscription carry it, so later subscription
  // lifecycle events can also be traced back to this purchase.
  const metadata = {
    flow: "onboard_license",
    lead_email: email,
    first_name: first,
    last_name: last,
    personal_email: clean(body.personalEmail, 200).toLowerCase(),
    phone: clean(body.phone, 40),
  };

  const origin = publicSiteOrigin(new URL(request.url).origin);
  const session = await stripe.checkout.sessions.create({
    // Subscription mode, with the one-time license added alongside the recurring hosting
    // line. Stripe allows a one-off price in a subscription session; the reverse (a
    // recurring price in a payment-mode session) it does not.
    mode: "subscription",
    line_items: [
      { price: licensePrice.id, quantity: 1 },
      { price: hostingPrice.id, quantity: 1 },
    ],
    customer_email: email,
    metadata,
    subscription_data: { metadata },
    // Back to /onboard, which shows the confirmation screen and then continues into the
    // questionnaire. The session id lets that screen read back what was actually charged
    // (promotion codes and proration mean the catalog price is not always the total) and
    // confirm the payment with Stripe rather than trusting ?paid=1.
    success_url: `${origin}/onboard?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/onboard?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) throw new ApiError(502, "stripe_error", "Stripe did not return a checkout URL");
  return json({ url: session.url });
});
