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

/** Shared recurring hosting price — every license, on either tier, subscribes to this. */
export const HOSTING_PLAN = {
  catalogKey: "apollo_hosting",
  name: "ApolloClaw Agent Hosting",
  amountCents: 18900,
  interval: "month",
} as const;

// ─── The two license tiers ────────────────────────────────────────────────────
//
// David's call. One product, two ways to buy the setup of it.
//
// THE TIERS DIFFER ON DAVID'S TIME, NOT ON THE SOFTWARE. Both provision the same agent on the
// same infrastructure with the same integrations and the same model access. Advanced buys the
// onboarding done with you; Basic is the same thing self-served through the dashboard
// checklist. That distinction is the whole design: a Basic that were a deliberately weaker
// product would make Advanced read as a tax rather than as a service.
//
// HOSTING IS THE SAME $189 ON BOTH, deliberately. Hosting is the line with real recurring cost
// behind it — the VPS, the included tokens, keeping it patched — and discounting that would
// discount the wrong thing. The license is what discounts, because the license is time.
//
// A NOTE ON THE HEADLINE. $449 against $2,500 looks like an 82% discount and is not: with
// hosting on both, year one is $2,717 against $4,768, so Basic is 57% of Advanced. That is
// good for margin and bad for trust if the monthly is buried, which is why every surface that
// prints a tier price prints `priceLabel` — both numbers, always — rather than the license
// alone.

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
    name: "ApolloClaw Agent License - Basic",
    amountCents: 44900,
    label: "Basic",
    tagline: "You set it up, in your own time.",
    priceLabel: "$449 once + $189/mo",
    includes: [
      "The same agent, built from your questionnaire answers",
      "Managed hosting, including $25/mo of token usage",
      "Connect your own apps and chat channels from the dashboard",
      "A setup checklist that walks you through it",
      "Email support",
    ],
  },
  {
    id: "advanced",
    catalogKey: "apollo_license",
    name: "ApolloClaw Agent License",
    amountCents: 250000,
    label: "Advanced",
    tagline: "We set it up with you, on a call.",
    priceLabel: "$2,500 once + $189/mo",
    recommended: true,
    includes: [
      "Everything in Basic",
      "Setup calls - we connect your apps and channels with you",
      "Your agent configured around how your business actually runs",
      "We stay on it until it is doing real work, not just answering",
      "Direct access to David after launch",
    ],
  },
];

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
export const BUNDLE_PRICE_LABEL = "From $449 license + $189/mo hosting";

/** What the $189 covers. Stated plainly because it is the first thing people ask. */
export const HOSTING_INCLUDED_TOKENS_LABEL = "includes $25/mo of token usage";

// ─── API credit packs ─────────────────────────────────────────────────────────
//
// Hosting includes $25/mo of usage; a customer who works their agent harder than that buys
// credit here rather than being cut off. One-time purchases, delivered to the instance's
// runtime balance and recorded in wallet_transactions.
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
    blurb: "Doubles the usage hosting already covers.",
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
