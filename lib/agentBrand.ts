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

  // Colours below read directly off each agent's wordmark SVG fill (law, sales, medical,
  // marketing) or, for recruiting, sampled off the flat wordmark PNG bracket glyph — no
  // wordmark SVG was supplied for that one. These replace the earlier provisional
  // mascot-sampled values once the real wordmark assets arrived Sept 6, 2026.
  legal: {
    color: "#8E192A",
    colorRgb: "142, 25, 42",
    mascot: "/agents/mascots/legal.png",
  },
  sales: {
    color: "#6459A6",
    colorRgb: "100, 89, 166",
    mascot: "/agents/mascots/sales.png",
  },
  recruiting: {
    color: "#D82929",
    colorRgb: "216, 41, 41",
    mascot: "/agents/mascots/recruiting.png",
  },
  medical: {
    color: "#158C90",
    colorRgb: "21, 140, 144",
    mascot: "/agents/mascots/medical.png",
  },
  marketing: {
    color: "#CE0247",
    colorRgb: "206, 2, 71",
    mascot: "/agents/mascots/marketing.png",
  },

  // Wordmark SVG fill sampled directly. Mascot added Sept 6, 2026 (previously fell back
  // to ApolloClaw red with no mascot, which is why /build/insurance was the last funnel
  // still red and centered).
  insurance: {
    color: "#3C5BAA",
    colorRgb: "60, 91, 170",
    mascot: "/agents/mascots/insurance.png",
  },
};

/** The brand for an agent type, falling back to ApolloClaw's own. */
export function agentBrand(agentTypeId?: string): AgentBrand {
  const found = agentTypeId ? BRANDS[agentTypeId] : undefined;
  return found ?? { color: APOLLO_RED, colorRgb: APOLLO_RED_RGB };
}
