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

/** One-time licensing fee. Charged once, at the /onboard paywall. */
export const LICENSE_PLAN = {
  catalogKey: "apollo_license",
  name: "ApolloClaw Agent License",
  amountCents: 250000,
} as const;

/** Shared recurring hosting price — every license subscribes to this. */
export const HOSTING_PLAN = {
  catalogKey: "apollo_hosting",
  name: "ApolloClaw Agent Hosting",
  amountCents: 18900,
  interval: "month",
} as const;

/** Human display of the bundle, used at the paywall. */
export const BUNDLE_PRICE_LABEL = "$2,500 license + $189/mo hosting";

/** What the $189 covers. Stated plainly because it is the first thing people ask. */
export const HOSTING_INCLUDED_TOKENS_LABEL = "includes $25/mo of token usage";

// ─── API credit packs ─────────────────────────────────────────────────────────
//
// Hosting includes $25/mo of usage; a customer who works their agent harder than that buys
// credit here rather than being cut off. One-time purchases, delivered to the instance's
// runtime balance and recorded in wallet_transactions.
//
// `creditUsd` is what the customer receives, `amountCents` is what they pay. Two fields, not
// one, so the margin is written down rather than implied: we charge cost + 7% (David's call).
// The arithmetic is done here at authoring time rather than computed at runtime, because a
// price is a fact Stripe also has to agree with — a formula that drifts from the seeded price
// is worse than a number you can read.
export const CREDIT_MARKUP = 0.07;

export interface CreditPack {
  /** Stripe product metadata.catalog_key + price lookup_key. */
  catalogKey: string;
  /** Stripe product display name (what the customer sees at checkout). */
  name: string;
  /** What the customer pays, in cents. Equals creditUsd * (1 + CREDIT_MARKUP). */
  amountCents: number;
  /** Runtime credit delivered, in whole USD. */
  creditUsd: number;
  /** Rough guidance shown on the card. Rewrite once real usage data says otherwise. */
  blurb: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    catalogKey: "apollo_credits_25",
    name: "ApolloClaw API Credits - $25",
    amountCents: 2675,
    creditUsd: 25,
    blurb: "Doubles the usage hosting already covers.",
  },
  {
    catalogKey: "apollo_credits_50",
    name: "ApolloClaw API Credits - $50",
    amountCents: 5350,
    creditUsd: 50,
    blurb: "A heavier month than usual.",
  },
  {
    catalogKey: "apollo_credits_100",
    name: "ApolloClaw API Credits - $100",
    amountCents: 10700,
    creditUsd: 100,
    blurb: "Daily use across a whole team.",
  },
  {
    catalogKey: "apollo_credits_250",
    name: "ApolloClaw API Credits - $250",
    amountCents: 26750,
    creditUsd: 250,
    blurb: "Long research runs and document work.",
  },
  {
    catalogKey: "apollo_credits_500",
    name: "ApolloClaw API Credits - $500",
    amountCents: 53500,
    creditUsd: 500,
    blurb: "Several agents working flat out.",
  },
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
