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
// PLACEHOLDER AMOUNTS — every `amountCents` and `creditUsd` below is a stand-in awaiting
// David's numbers. Nothing is seeded into Stripe until they are real: `amountCents` is what
// the customer pays and `creditUsd` is the runtime credit they receive, so the gap between
// them is the margin. They are separate fields precisely so the two can differ.
export interface CreditPack {
  /** Stripe product metadata.catalog_key + price lookup_key. */
  catalogKey: string;
  /** Stripe product display name (what the customer sees at checkout). */
  name: string;
  /** What the customer pays, in cents. PLACEHOLDER. */
  amountCents: number;
  /** Runtime credit delivered, in whole USD. PLACEHOLDER. */
  creditUsd: number;
  /** Rough guidance shown on the card. Rewrite once real usage data says otherwise. */
  blurb: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    catalogKey: "apollo_credits_small",
    name: "ApolloClaw API Credits - Small",
    amountCents: 2500,
    creditUsd: 25,
    blurb: "A busy month on top of what hosting already covers.",
  },
  {
    catalogKey: "apollo_credits_medium",
    name: "ApolloClaw API Credits - Medium",
    amountCents: 10000,
    creditUsd: 100,
    blurb: "Heavy daily use, or a few agents sharing the load.",
  },
  {
    catalogKey: "apollo_credits_large",
    name: "ApolloClaw API Credits - Large",
    amountCents: 25000,
    creditUsd: 250,
    blurb: "Long-running research and document work.",
  },
];

/** True while the packs still carry placeholder pricing. Flip by setting real amounts. */
export const CREDIT_PACKS_ARE_PLACEHOLDER = true;

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
