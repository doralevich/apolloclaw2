// Per-agent branding for the build funnel.
//
// A customer arriving from therealestateagent.ai has just spent a page or two in that
// site's green, with that robot in the hero. Landing on generic ApolloClaw red reads as
// having been handed off to a different company mid-purchase. This carries the agent's
// own colour and mascot onto the first screen of /build/<slug> so the handoff feels
// continuous.
//
// Only the agents that actually have a site have artwork. The rest fall back to
// ApolloClaw red and no mascot, which is the pre-existing look - so adding a funnel for
// an agent without a brand still works.
//
// Colours are sampled from each site's wordmark SVG and must match the `brand` token in
// that repo's tailwind.config.ts. See DECISIONS.md.

/** ApolloClaw's own red - the fallback for agents with no site of their own. */
const APOLLO_RED = "#D72B2B";
const APOLLO_RED_RGB = "215, 43, 43";

export type AgentBrand = {
  /** Accent colour for the heading, the hairline and the primary button. */
  color: string;
  /** Same colour as an "r, g, b" triplet, for the soft glow behind the masthead. */
  colorRgb: string;
  /** Transparent PNG, or undefined for agents with no mascot yet. */
  mascot?: string;
};

const BRANDS: Record<string, AgentBrand> = {
  realestate: {
    color: "#0F8743",
    colorRgb: "15, 135, 67",
    mascot: "/agents/mascots/real-estate.png",
  },
  cfo: {
    color: "#1E305F",
    colorRgb: "30, 48, 95",
    mascot: "/agents/mascots/cfo.png",
  },
  ceo: {
    color: "#E12E30",
    colorRgb: "225, 46, 48",
    mascot: "/agents/mascots/ceo.png",
  },
};

/** The brand for an agent type, falling back to ApolloClaw's own. */
export function agentBrand(agentTypeId?: string): AgentBrand {
  const found = agentTypeId ? BRANDS[agentTypeId] : undefined;
  return found ?? { color: APOLLO_RED, colorRgb: APOLLO_RED_RGB };
}
