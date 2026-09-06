import { getAgentType, type AgentType } from "@/config/agent-types";

// The self-serve build funnels: /build/<slug>.
//
// Every role agent can have one. The checkout, provisioning and questionnaire are all
// type-generic (see /api/onboard/checkout -> agent_type on the Stripe session, read back by
// /api/onboard/complete), so standing up a new funnel is a slug in this map and nothing else.
//
// The slug is the CUSTOMER-FACING url and is deliberately readable ("real-estate"), separate from
// the internal agent type id ("realestate"). Each agent's own marketing site links its "Build your
// agent" CTA straight here, which is how those sites stay separate while payment and the
// questionnaire run on ApolloClaw.
export const BUILD_SLUGS: Record<string, string> = {
  "real-estate": "realestate",
  cfo: "cfo",
  law: "legal",
  ceo: "ceo",
  marketing: "marketing",
  sales: "sales",
  recruiting: "recruiting",
  medical: "medical",
  insurance: "insurance",
};

/** Resolve a funnel slug to its agent type, or null if it is not a sellable role agent. */
export function buildFunnelType(slug: string | undefined): AgentType | null {
  const id = slug ? BUILD_SLUGS[slug] : undefined;
  if (!id) return null;
  const type = getAgentType(id);
  // Never a type sold on another site (College Agent) or one with no questionnaire (Blank).
  if (!type || type.externalUrl || type.noSetup) return null;
  return type;
}

/** "The CFO Agent" -> "CFO Agent", for possessive copy ("Build your CFO Agent"). */
export function inlineAgentLabel(label: string): string {
  return label.replace(/^The\s+/i, "");
}
