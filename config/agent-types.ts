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
}

// Shared shape for the paid Apollo agents — one machine size and spend cap across the line.
const PAID_AGENT = { resources: { cpu: 2, memory: 4, disk: 12 }, monthlyCapUsd: 5 };

export const AGENT_TYPES: AgentType[] = [
  {
    id: "college",
    label: "College Agent",
    description: "An AI agent that keeps a student's classes, email, and deadlines on track.",
    template: "college-agent",
    resources: { cpu: 2, memory: 4, disk: 12 },
    monthlyCapUsd: 5,
    available: true,
    icon: "GraduationCap",
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
];

export function getAgentType(id: string): AgentType | undefined {
  return AGENT_TYPES.find((t) => t.id === id);
}
