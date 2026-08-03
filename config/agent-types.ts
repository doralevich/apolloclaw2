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
  {
    id: "ceo",
    label: "CEO Agent",
    description: "An AI chief of staff that runs your inbox, calendar, and follow-ups.",
    template: "ceo-agent",
    ...PAID_AGENT,
    available: true,
    icon: "Briefcase",
    planKey: "ceo_plan",
  },
  {
    id: "cfo",
    label: "CFO Agent",
    description: "An AI finance lead for budgets, cash-flow forecasts, models, and board-ready numbers.",
    template: "cfo-agent",
    ...PAID_AGENT,
    available: true,
    icon: "Calculator",
    planKey: "cfo_plan",
  },
  {
    id: "legal",
    label: "Legal Agent",
    description: "Drafts and reviews common contracts, explains clauses in plain English, tracks obligations.",
    template: "legal-agent",
    ...PAID_AGENT,
    available: true,
    icon: "Scale",
    planKey: "legal_plan",
  },
  {
    id: "medical",
    label: "Medical Agent",
    description: "Administrative support for clinicians — literature summaries, patient comms, billing prep.",
    template: "medical-agent",
    ...PAID_AGENT,
    available: true,
    icon: "Stethoscope",
    planKey: "medical_plan",
  },
  {
    id: "insurance",
    label: "Insurance Agent",
    description: "Compares policies, explains coverage, preps quotes, and tracks renewals and claims.",
    template: "insurance-agent",
    ...PAID_AGENT,
    available: true,
    icon: "ShieldCheck",
    planKey: "insurance_plan",
  },
  {
    id: "realestate",
    label: "Real Estate Agent",
    description: "Listings, comps research, transaction checklists, follow-ups, and investment math.",
    template: "realestate-agent",
    ...PAID_AGENT,
    available: true,
    icon: "Home",
    planKey: "realestate_plan",
  },
  {
    id: "sales",
    label: "Sales Agent",
    description: "Prospect research, personalized outreach, call prep, follow-up cadences, and pipeline notes.",
    template: "sales-agent",
    ...PAID_AGENT,
    available: true,
    icon: "TrendingUp",
    planKey: "sales_plan",
  },
  {
    id: "recruiting",
    label: "Recruiting Agent",
    description: "Resume screening, interview scheduling, candidate follow-up, and ATS hygiene.",
    template: "recruiting-agent",
    ...PAID_AGENT,
    available: true,
    icon: "UserSearch",
    planKey: "recruiting_plan",
  },
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
