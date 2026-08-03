// The agent-type registry — the single source of truth for what kinds of agents this
// whitelabel can provision. The create modal renders one card per entry; the create route
// validates the requested type against this list (template, resources, and budget cap all
// come from here, never from the client).

export interface AgentTypeResources {
  cpu: number;
  memory: number;
  disk: number;
}

export interface AgentType {
  id: string;
  label: string;
  description: string;
  // Agent37 template name passed to POST /v1/instances.
  template: string;
  // Former names for the SAME template, tried in order when `template` isn't in the Agent37
  // registry. Renaming a template is two systems moving at different times — this repo and
  // the Agent37 account — and a customer who pays during that gap must still get an agent.
  // Once every environment is on the new name, deleting the alias is a one-line cleanup.
  templateAliases?: string[];
  resources: AgentTypeResources;
  // Monthly managed-spend cap in USD (converted to micros at create time).
  monthlyCapUsd: number;
  // Only available types can be provisioned; the rest render as disabled cards.
  available: boolean;
  comingSoon?: boolean;
  // Lucide icon name (resolved by the UI); omit for a generic fallback.
  icon?: string;
  // Stripe catalog key (lib/pricing/catalog.ts). Present -> the type is PAID: creating it
  // goes through Checkout ($4,500 build + $189/mo hosting) and is provisioned by the
  // Stripe webhook. Absent -> the original entitlement-gated direct create (College Agent).
  planKey?: string;
  // Sold on ANOTHER site: every CTA links here instead of ApolloClaw checkout/create.
  // Payment, intake, and provisioning all happen there (The College Agent).
  externalUrl?: string;
  // Price line shown on storefront cards for external types (paid types use the shared
  // BUNDLE_PRICE_LABEL from lib/pricing/catalog.ts).
  priceLabel?: string;
  // Provisioned by the platform, never chosen from a card. The create-agent modal filters
  // these out entirely rather than showing them disabled, because "you cannot pick this"
  // and "this is not a thing you pick" are different messages.
  internal?: boolean;
}

// Shared shape for the paid Apollo agents — one machine size and spend cap across the line.
const PAID_AGENT = { resources: { cpu: 2, memory: 4, disk: 12 }, monthlyCapUsd: 5 };

export const AGENT_TYPES: AgentType[] = [
  {
    // Sold and provisioned on thecollegeagent.ai; the card here is a hand-off, so nothing in
    // this app ever creates one. The template name still matters, though: that site
    // provisions from `college-agent` on the SAME Agent37 account we use, so the name has to
    // keep existing there. It does — as its own template alongside `apollo-agent`, both
    // pointing at the same image, after renaming ours broke theirs for exactly as long as it
    // took to notice.
    id: "college",
    label: "The College Agent",
    description:
      "An AI agent that guides a student from sophomore year of high school through college graduation — classes, deadlines, applications, financial aid, and internships.",
    template: "college-agent",
    resources: { cpu: 2, memory: 4, disk: 12 },
    monthlyCapUsd: 5,
    available: true,
    icon: "GraduationCap",
    externalUrl: "https://thecollegeagent.ai/build",
    priceLabel: "$599 one-time + hosting",
  },
  // ─── Retired: the eight per-role types ──────────────────────────────────────
  //
  // CEO, CFO, Legal, Medical, Insurance, Real Estate, Sales and Recruiting used to live
  // here, sold at $4,500 each through /agents and the create-agent modal. Both entry points
  // are gone and AGENT_PLANS is empty, so nothing could buy them - but they stayed listed,
  // which meant the modal rendered eight cards that dead-ended at "isn't sold through
  // checkout", and /api/admin/templates reported eight types whose templates don't exist.
  //
  // None of ceo-agent, cfo-agent, legal-agent, medical-agent, insurance-agent,
  // realestate-agent, sales-agent or recruiting-agent was ever registered in Agent37.
  // Restoring one means an entry here, a template there, and a plan in the catalog - three
  // deliberate steps, which is the right number for putting a product back on sale.
  //
  // The license build. Every /onboard purchase provisions this one type; the customization
  // comes from the buyer's onboarding answers (written in as USER.md), not from the SKU.
  //
  // The template is the Apollo Claw build — David's call, so every agent starts from the
  // content and behaviour already proven in production rather than from one of the per-role
  // templates that were never exercised at this volume.
  //
  // It was called `college-agent` (the image it grew out of, still the GHCR path), which the
  // dashboard printed at customers: someone who had bought an Apollo Agent read that they
  // owned a college agent. Renamed to `apollo-agent`; the old name stays as an alias so
  // provisioning works whichever name the Agent37 registry currently carries.
  //
  // No `planKey`: it is not sold per-type through /api/build/checkout. /api/onboard/complete
  // provisions it once the license checkout is confirmed paid. `internal` keeps it out of
  // the create-agent modal, which is for picking a product, and this is not one.
  {
    id: "apollo",
    label: "Apollo Agent",
    description:
      "A private AI agent built around one business — its people, its stack, its bottlenecks — from the answers given at onboarding.",
    template: "apollo-agent",
    templateAliases: ["college-agent"],
    ...PAID_AGENT,
    available: true,
    internal: true,
    icon: "Bot",
  },
];

export function getAgentType(id: string): AgentType | undefined {
  return AGENT_TYPES.find((t) => t.id === id);
}

// ─── The license build ────────────────────────────────────────────────────────
//
// We sell one thing now: the customization. Every license purchase provisions THIS type,
// and what makes one customer's agent different from another's is their onboarding answers
// (written into the instance as USER.md), not a different SKU.
export const LICENSE_AGENT_TYPE_ID = "apollo";

export function licenseAgentType(): AgentType {
  const type = getAgentType(LICENSE_AGENT_TYPE_ID);
  // Unreachable unless the entry is removed from AGENT_TYPES. Throwing beats provisioning
  // something arbitrary for a customer who has already paid.
  if (!type) throw new Error(`agent type "${LICENSE_AGENT_TYPE_ID}" is missing from AGENT_TYPES`);
  return type;
}
