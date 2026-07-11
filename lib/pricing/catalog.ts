// The ApolloClaw Stripe catalog — the single source of truth for what the storefront
// sells. Every purchasable agent bundles its one-time build fee with the shared monthly
// hosting subscription at checkout.
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

/** One-time build fee per agent — $4,500 each. */
export const AGENT_PLANS: CatalogPlan[] = [
  { catalogKey: "ceo_plan", name: "The CEO Agent", amountCents: 450000, agentTypeId: "ceo" },
  { catalogKey: "cfo_plan", name: "The CFO Agent", amountCents: 450000, agentTypeId: "cfo" },
  { catalogKey: "legal_plan", name: "The Legal Agent", amountCents: 450000, agentTypeId: "legal" },
  { catalogKey: "medical_plan", name: "The Medical Agent", amountCents: 450000, agentTypeId: "medical" },
  { catalogKey: "insurance_plan", name: "The Insurance Agent", amountCents: 450000, agentTypeId: "insurance" },
  { catalogKey: "realestate_plan", name: "The Real Estate Agent", amountCents: 450000, agentTypeId: "realestate" },
  { catalogKey: "sales_plan", name: "The Sales Agent", amountCents: 450000, agentTypeId: "sales" },
];

/** Shared recurring hosting price — every agent purchase subscribes to this. */
export const HOSTING_PLAN = {
  catalogKey: "apollo_hosting",
  name: "ApolloClaw Agent Hosting",
  amountCents: 18900,
  interval: "month",
} as const;

export function planForAgentType(agentTypeId: string): CatalogPlan | undefined {
  return AGENT_PLANS.find((p) => p.agentTypeId === agentTypeId);
}

export function planForCatalogKey(catalogKey: string): CatalogPlan | undefined {
  return AGENT_PLANS.find((p) => p.catalogKey === catalogKey);
}

/** Human display of the bundle, used on the storefront cards. */
export const BUNDLE_PRICE_LABEL = "$4,500 build + $189/mo hosting";
