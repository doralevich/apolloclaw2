import { AGENT_TYPES, getAgentType, LICENSE_AGENT_TYPE_ID, type AgentType } from "@/config/agent-types";

// Which agent a door is building: the `?agent=` parameter on /onboard and /white-glove-onboarding.
//
// Every role agent can be built self-serve. The checkout, provisioning and questionnaire are all
// type-generic (see /api/onboard/checkout -> agent_type on the Stripe session, read back by
// /api/onboard/complete), so selling another role is a slug in this map and nothing else.
//
// The slug is the CUSTOMER-FACING spelling and is deliberately readable ("real-estate"), separate
// from the internal agent type id ("realestate"). Each agent's own marketing site links its "Build
// your agent" CTA to /onboard?agent=<slug>, which is how those sites stay separate while payment
// and the questionnaire run on ApolloClaw. The older /build/<slug> addresses redirect here
// (next.config.ts), so a link printed before Nov 5 2026 still lands.
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
  personal: "personal",
  college: "college",
};

// Slugs that work as a link but never appear on the picker. The College Agent is sold to
// students from thecollegeagent.ai, whose "Build" button links here with the slug; a business
// buyer opening plain /onboard is choosing between agents for a business, and a college agent on
// that grid is a card for the wrong customer (David, Nov 5 2026).
const UNLISTED_SLUGS: ReadonlySet<string> = new Set(["college"]);

/** The slug for the generic Apollo Agent, so a picker card and a redirect can name it. */
export const APOLLO_SLUG = "apollo";

/** Resolve a funnel slug to its agent type, or null if it is not a sellable role agent. */
export function buildFunnelType(slug: string | undefined): AgentType | null {
  const id = slug ? BUILD_SLUGS[slug] : undefined;
  if (!id) return null;
  const type = getAgentType(id);
  // Never a type sold on another site, or one with no questionnaire (Blank).
  if (!type || type.externalUrl || type.noSetup) return null;
  return type;
}

/** The `?agent=` value as it arrives: a slug ("law"), a type id ("legal") or "apollo". A slug is
 *  what the marketing sites and the pickers send; a type id is what Stripe's return trip and the
 *  retired invite links carry. Anything else is null, and the page falls back to the picker. */
export function agentFromParam(param: string | undefined | null): AgentType | null {
  const key = (param ?? "").trim().toLowerCase();
  if (!key) return null;
  if (key === APOLLO_SLUG || key === LICENSE_AGENT_TYPE_ID) return getAgentType(LICENSE_AGENT_TYPE_ID) ?? null;
  const bySlug = buildFunnelType(key);
  if (bySlug) return bySlug;
  // A type id: honour it only when it is one of the sellable roles above.
  const slug = Object.keys(BUILD_SLUGS).find((s) => BUILD_SLUGS[s] === key);
  return slug ? buildFunnelType(slug) : null;
}

/** The cards a door shows when no agent was named: the Apollo Agent first, then every sellable
 *  role in registry order. Each entry carries the slug its link uses. */
export function pickerAgents(): Array<{ slug: string; type: AgentType }> {
  const apollo = getAgentType(LICENSE_AGENT_TYPE_ID);
  const roles = AGENT_TYPES.flatMap((type) => {
    const slug = Object.keys(BUILD_SLUGS).find((s) => BUILD_SLUGS[s] === type.id);
    return slug && !UNLISTED_SLUGS.has(slug) && buildFunnelType(slug) ? [{ slug, type }] : [];
  });
  return apollo ? [{ slug: APOLLO_SLUG, type: apollo }, ...roles] : roles;
}

/** "The CFO Agent" -> "CFO Agent", for possessive copy ("Build your CFO Agent"). */
export function inlineAgentLabel(label: string): string {
  return label.replace(/^The\s+/i, "");
}
