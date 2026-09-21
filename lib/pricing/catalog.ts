// The ApolloClaw Stripe catalog — the single source of truth for what the site sells.
//
// Keys are stable identifiers, never display names:
//   - `catalogKey`  -> stamped on the Stripe PRODUCT as metadata.catalog_key (how the seed
//                      finds a product it already created, so renames don't duplicate it).
//   - `lookupKey`   -> the Stripe PRICE lookup_key (how checkout resolves the live price id
//                      without hardcoding price_... ids per environment).
// A reprice mints a NEW price and moves the lookup_key over (transfer_lookup_key), so the
// lookup key always points at the current price while historical prices stay archived.
//
// NOTE: this catalog is intentionally separate from The College Agent's own $599 catalog,
// which lives on its own site (studentagent.ai) in the same Stripe account. The seed only
// touches products/prices carrying THESE keys.

export interface CatalogPlan {
  /** Stripe product metadata.catalog_key + price lookup_key. */
  catalogKey: string;
  /** Stripe product display name (what the customer sees at checkout). */
  name: string;
  /** One-time build fee, in cents. */
  amountCents: number;
  /** Agent-type registry id (config/agent-types.ts) this plan provisions. */
  agentTypeId: string;
}

export const CURRENCY = "usd";

// ─── The single product ───────────────────────────────────────────────────────
//
// David's call: we no longer sell named agents (CEO Agent, CFO Agent, and so on). We sell
// the customization. One licensing fee, one hosting subscription, and what gets built is
// decided by the onboarding answers rather than by which SKU someone clicked.

/** Shared recurring price — every license, on either tier, subscribes to this. */
export const HOSTING_PLAN = {
  catalogKey: "apollo_hosting",
  name: "ApolloClaw Agent Subscription",
  // $249, all in. Was $189 plus $25 of included token usage plus credit packs on top, which
  // is three numbers to explain before anybody knows what they are paying. One number now,
  // with an allowance inside it (MONTHLY_API_ALLOWANCE_LABEL below) rather than beside it.
  //
  // Repricing is safe here because nobody is on the old price: David's call, Sept 21 2026,
  // "I have no one paying now so move everything to the 249/month". The seed mints the new
  // price and moves the lookup_key to it; had there been live subscriptions they would have
  // stayed on the archived $189 until migrated in Stripe, which is a different job.
  amountCents: 24900,
  interval: "month",
} as const;

// ─── The two tiers ────────────────────────────────────────────────────────────
//
// David's call. One product, two ways to buy the setup of it.
//
// THE TIERS DIFFER ON SCOPE AND DAVID'S TIME, NOT ON THE INFRASTRUCTURE. Both provision the
// same agent on the same private server with the same standard integrations. Custom Build buys
// a scoped build and 30 days of onboarding done with you; Set It and Forget It is the
// questionnaire build, self-served through the dashboard checklist, with no custom work.
//
// THE MONTHLY IS THE SAME $249 ON BOTH, deliberately. It is the line with real recurring cost
// behind it: the server, the API allowance, keeping it patched. Discounting that would discount
// the wrong thing. The setup fee is what moves, because the setup fee is scope and time.
//
// THE IDS STAY `basic` AND `advanced`. They are stamped on the live Stripe products through
// `catalogKey`, they are what `resolveLicenseTier` reads off a checkout request, and they are
// persisted against sold licenses. The customer-facing names moved; the keys must not, or the
// seed mints a second product and orphans the history. Read `label` for what a tier is called.
//
// A NOTE ON THE HEADLINE. Every surface that prints a tier price prints `priceLabel`, which
// carries both numbers. Setup alone reads as the whole cost and is not, and burying the
// monthly is the kind of thing a customer only notices on their second invoice.

export type LicenseTierId = "basic" | "advanced";

export interface LicenseTier {
  id: LicenseTierId;
  /** Stripe product metadata.catalog_key + price lookup_key. */
  catalogKey: string;
  /** Stripe product display name (what the customer sees at checkout). */
  name: string;
  /** One-time licensing fee, in cents. Charged once, at the /onboard paywall. */
  amountCents: number;
  /** Short name on the picker. */
  label: string;
  /** One line under the name: who this tier is for. */
  tagline: string;
  /** Never the license fee alone — see the note above. */
  priceLabel: string;
  /** What this tier includes that the customer can check off. */
  includes: string[];
  /** The one we steer people to. Exactly one tier should carry it. */
  recommended?: boolean;
}

export const LICENSE_TIERS: readonly LicenseTier[] = [
  {
    id: "basic",
    catalogKey: "apollo_license_basic",
    name: "ApolloClaw Agent - Set It and Forget It",
    amountCents: 44900,
    label: "Set It and Forget It",
    tagline: "Answer the questionnaire and let it run.",
    priceLabel: "$449 setup + $249/mo",
    includes: [
      "An agent built from your questionnaire answers",
      "Standard integrations",
      "Private server hosting, monitoring and updates",
      "Up to $150 in API usage each month",
      "Cancel anytime, no minimum commitment",
    ],
  },
  {
    id: "advanced",
    catalogKey: "apollo_license",
    name: "ApolloClaw Agent - Custom Build",
    amountCents: 350000,
    label: "Custom Build",
    tagline: "Scoped to your business, built with you.",
    priceLabel: "$3,500 setup + $249/mo",
    recommended: true,
    includes: [
      "Everything in Set It and Forget It",
      "A custom-scoped build",
      "30 days of hands-on onboarding and co-training",
    ],
  },
];

/** No custom work on Tier 1. Stated on the tier, because it is the line between the two. */
export const BASIC_TIER_LIMIT = "No custom work on this tier.";

// `apollo_license` deliberately keeps its original key on the Advanced tier. That key is
// stamped on the live Stripe product and on every license already sold through it; renaming it
// would mint a second product and orphan the history.
// Self-serve checkout now sells BASIC only. The Advanced/$2,500 tier became a "call for setup"
// White-Label / Custom path — booked as a consultation from the paywall, not charged through a
// bare checkout. The tier definition stays above (its Stripe product and sales history are real
// and still referenced by the catalog seed), it is simply no longer offered as a self-serve buy.
export const DEFAULT_LICENSE_TIER: LicenseTierId = "basic";

export function licenseTierFor(id: string | undefined | null): LicenseTier | undefined {
  return LICENSE_TIERS.find((t) => t.id === id);
}

/**
 * The tier a bare checkout means.
 *
 * Resolves to Basic for anything unrecognised or missing. That is now the SAFE direction: the
 * paywall only ever posts "basic", and the $2,500 tier is a call-for-setup path rather than a
 * self-serve purchase, so an odd request body can no longer land someone in a $2,500 charge.
 */
export function resolveLicenseTier(id: string | undefined | null): LicenseTier {
  return licenseTierFor(id) ?? licenseTierFor(DEFAULT_LICENSE_TIER)!;
}

/** Human display of the bundle where no tier has been chosen yet. */
export const BUNDLE_PRICE_LABEL = "From $449 setup + $249/mo";

/**
 * What the $249 covers, in David's exact words. Do not paraphrase this on a surface: he wrote
 * it to be the same sentence everywhere, and the whole point of the change it describes is that
 * a customer stops meeting a different account of their bill on every page.
 *
 * Replaces HOSTING_INCLUDED_TOKENS_LABEL ("includes $25/mo of token usage"), which is gone
 * along with the $189 it went with.
 */
export const MONTHLY_API_ALLOWANCE_LABEL =
  "Your $249/month includes hosting, monitoring, updates, and up to $150 in API usage each month. Sustained usage above that is reviewed with you and billed at cost.";

// ─── Support plans ────────────────────────────────────────────────────────────
//
// An add-on to either tier, sold separately and starting after the 30-day onboarding period.
// NOT IN STRIPE: there is no catalogKey here and the seed does not see these, because they are
// sold by conversation off a discovery call rather than through self-serve checkout. If one
// ever becomes a button, it needs a catalogKey and an entry in the seed, not just a price here.

export interface SupportPlan {
  id: string;
  name: string;
  amountCents: number;
  /** Hours of David's time included each month. */
  hours: number;
  includes: string[];
  /** The one we steer people to. Exactly one plan should carry it. */
  recommended?: boolean;
}

export const SUPPORT_PLANS: readonly SupportPlan[] = [
  {
    id: "monitor",
    name: "Monitor",
    amountCents: 49500,
    hours: 3,
    includes: [
      "Token optimization and drift correction",
      "Async Q&A via Telegram",
      "System health monitoring",
    ],
  },
  {
    id: "build",
    name: "Build",
    amountCents: 79500,
    hours: 5,
    recommended: true,
    includes: [
      "Everything in Monitor",
      "Priority Telegram response",
      "Hands-on workflow optimization",
      "Agent updates and retraining",
      "Monthly performance review",
      "30-minute strategy session",
    ],
  },
  {
    id: "command",
    name: "Command",
    amountCents: 119500,
    hours: 8,
    includes: [
      "Everything in Build",
      "Active implementation support",
      "Phase 2+ module build and integration",
      "60-minute strategy session",
    ],
  },
];

/** The terms that apply to every support plan. One array so no surface prints two of three. */
export const SUPPORT_PLAN_TERMS = [
  "Two-month minimum.",
  "Unused hours do not roll over.",
  "Plans begin after the 30-day onboarding period.",
];

// ─── API credit packs ─────────────────────────────────────────────────────────
//
// The subscription includes $150 of API usage a month; a customer who works their agent harder
// than that buys credit here rather than being cut off. One-time purchases, delivered to the
// instance's runtime balance and recorded in wallet_transactions.
//
// THESE SIT AWKWARDLY WITH THE PRICING ABOVE AND ARE LEFT IN DELIBERATELY. David's wording for
// the allowance says sustained overage is "reviewed with you and billed at cost", and these
// packs are self-serve and carry CREDIT_MARKUP, 7% over cost. Two different answers to the same
// question. Removing a working purchase path is a product decision rather than a copy one, so
// the packs stay and the contradiction is named here and raised with him. If the handled
// conversation is the only route, delete this section and the dashboard surface that sells it;
// if the packs stay, the markup is what needs revisiting.
//
// The price is the round number: $25, $50, $100, $250. That is what the customer picks,
// what the button says, and what Stripe charges.
//
// `creditMicros` is what actually reaches the runtime — the price with our 7% taken out
// (price / 1.07, rounded DOWN to the cent so no pack slips under the margin). Two fields
// rather than one derived from the other, because the price is a fact Stripe holds its own
// copy of: a formula that drifts from the seeded price would have us charging one number and
// granting another, which nobody notices until month end.
export const CREDIT_MARKUP = 0.07;

export interface CreditPack {
  /** Stripe product metadata.catalog_key + price lookup_key. */
  catalogKey: string;
  /** Stripe product display name (what the customer sees at checkout). */
  name: string;
  /** What the customer pays, in cents. The round headline number. */
  amountCents: number;
  /** Runtime credit delivered, in micros. Equals amountCents / (1 + CREDIT_MARKUP). */
  creditMicros: number;
  /** Rough guidance shown on the card. Rewrite once real usage data says otherwise. */
  blurb: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    catalogKey: "apollo_credits_25",
    name: "ApolloClaw API Credits - $25",
    amountCents: 2500,
    creditMicros: 23_360_000,
    blurb: "A light month over the allowance.",
  },
  {
    catalogKey: "apollo_credits_50",
    name: "ApolloClaw API Credits - $50",
    amountCents: 5000,
    creditMicros: 46_720_000,
    blurb: "A heavier month than usual.",
  },
  {
    catalogKey: "apollo_credits_100",
    name: "ApolloClaw API Credits - $100",
    amountCents: 10000,
    creditMicros: 93_450_000,
    blurb: "Daily use across a whole team.",
  },
  {
    catalogKey: "apollo_credits_250",
    name: "ApolloClaw API Credits - $250",
    amountCents: 25000,
    creditMicros: 233_640_000,
    blurb: "Long research runs and document work.",
  },
  // $500 removed at David's call. The Stripe product and price still exist - the seed creates
  // and updates, it never deletes - so nothing bought at that price is disturbed and putting
  // it back is one entry here. Archive it in the Stripe dashboard to hide it there too.
];

export function creditPackForCatalogKey(catalogKey: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.catalogKey === catalogKey);
}

// ─── Retired: the per-agent plans ─────────────────────────────────────────────
//
// Eight plans at $4,500 each used to live here, one per agent type, sold through the
// /agents storefront and the dashboard's create-agent modal. Both entry points are gone.
//
// This is deliberately an empty list rather than a deleted export. `planForAgentType` still
// resolves, it just finds nothing, so /api/build/checkout answers "isn't sold through
// checkout" rather than failing to compile, and the provisioning machinery behind it (which
// still works and which the license flow will grow into) stays intact. Restoring a
// per-agent SKU is one line here, not an archaeology exercise.
//
// The Stripe products themselves are untouched: the seed creates and updates, it never
// deletes. Archive them in the Stripe dashboard if you want them out of the product list.
export const AGENT_PLANS: CatalogPlan[] = [];

export function planForAgentType(agentTypeId: string): CatalogPlan | undefined {
  return AGENT_PLANS.find((p) => p.agentTypeId === agentTypeId);
}

export function planForCatalogKey(catalogKey: string): CatalogPlan | undefined {
  return AGENT_PLANS.find((p) => p.catalogKey === catalogKey);
}
