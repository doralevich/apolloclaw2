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
}

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
    resources: { cpu: 2, memory: 4, disk: 12 },
    monthlyCapUsd: 5,
    available: false,
    comingSoon: true,
    icon: "Briefcase",
  },
];

export function getAgentType(id: string): AgentType | undefined {
  return AGENT_TYPES.find((t) => t.id === id);
}
