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

  // PROVISIONAL COLOURS - these four have no wordmark SVG yet, so the values below are
  // sampled from the mascot artwork rather than read off a flat brand asset.
  //
  // That is measurably imprecise, and the three entries above are the proof: running the
  // same sampler over their mascots returns #2B7A2C for real estate (true #0F8743, off by
  // 64), #092A5D for CFO (true #1E305F, off by 29) and #A70403 for CEO (true #E12E30, off
  // by 145). The mascots are shaded 3D renders, so the accent spans dark to lit and the
  // flat brand hex is not recoverable from them at any single point.
  //
  // Each value below is the midpoint of that shadow-to-lit range, which brackets the answer
  // without pretending to hit it. Replace them by sampling the wordmark SVG the moment one
  // exists, exactly as was done for the real estate green after it shipped eyeballed.
  legal: {
    color: "#AF2830",
    colorRgb: "175, 40, 48",
    mascot: "/agents/mascots/legal.png",
  },
  sales: {
    color: "#6C25A3",
    colorRgb: "108, 37, 163",
    mascot: "/agents/mascots/sales.png",
  },
  recruiting: {
    color: "#B71C26",
    colorRgb: "183, 28, 38",
    mascot: "/agents/mascots/recruiting.png",
  },
  medical: {
    color: "#037384",
    colorRgb: "3, 115, 132",
    mascot: "/agents/mascots/medical.png",
  },
};

/** The brand for an agent type, falling back to ApolloClaw's own. */
export function agentBrand(agentTypeId?: string): AgentBrand {
  const found = agentTypeId ? BRANDS[agentTypeId] : undefined;
  return found ?? { color: APOLLO_RED, colorRgb: APOLLO_RED_RGB };
}
