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

  // Wordmark SVG fill sampled directly, same as the rest. Added Sept 8, 2026 alongside
  // thepersonalagent.ai and the /build/personal funnel.
  personal: {
    color: "#61169D",
    colorRgb: "97, 22, 157",
    mascot: "/agents/mascots/personal.png",
  },

  // SAMPLED FROM THE MASCOT, NOT A WORDMARK - the one entry here that is, so treat the colour
  // as provisional. Mascot supplied by David Sept 21, 2026; thecollegeagent.ai is unreachable
  // from this environment, so there was no wordmark SVG to read the fill off and no way to
  // check the `brand` token in that repo's tailwind.config.ts, which is what the rule at the
  // top of this file asks for. #1A621D is the flat lit green on the robot's panels and cap
  // (the p75 of its saturated-green pixels; the mode agreed within two units). If it disagrees
  // with the real token, the token wins and this line changes.
  //
  // It is also the darkest brand here, dark enough that it fails as label text on a dark card.
  // That is handled where it is rendered (components/agents/FleetGrid.tsx), not by recording a
  // brighter colour than the brand actually is.
  college: {
    color: "#1A621D",
    colorRgb: "26, 98, 29",
    mascot: "/agents/mascots/college.png",
  },
};

// ─── Using a brand colour as text on a dark card ────────────────────────────
//
// These colours are sampled off wordmarks that sit on white. Several are very dark - CFO's
// navy, Personal's purple, Law's maroon, and now College's forest green - and on the dark
// navy cards the homepage and /ai-agents render, every single one of them fails WCAG AA as
// small text. Measured against the card ground (#101F38 under a 3% paper wash):
//
//   ceo 3.38  cfo 1.20  legal 1.69  sales 2.57  recruiting 3.11
//   medical 3.78  insurance 2.39  personal 1.54  realestate 3.33  college 2.05
//
// Ten out of ten, before the 0.8 opacity the label also carries. CFO's "EXPLORE" is very
// nearly invisible. The fix belongs here rather than in a brighter `color` above, because
// `color` is the brand and is also used where it is correct as-is: the /build funnel hero
// and the button on it, both on light grounds.

const CARD_GROUND: [number, number, number] = [23, 37, 62];

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function parseHex(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * The brand colour, lightened toward white just far enough to read as small text on a dark
 * agent card. Hue is preserved - it blends toward white rather than desaturating - so the
 * card still reads as that agent's colour, only legibly.
 *
 * Returns the colour unchanged when it already clears AA, so a future brand that is bright
 * enough passes straight through.
 */
export function onDarkCard(color: string): string {
  const rgb = parseHex(color);
  if (contrast(rgb, CARD_GROUND) >= 4.5) return color;
  for (let mix = 0.05; mix <= 1; mix += 0.05) {
    const lifted = rgb.map((c) => Math.round(c + (255 - c) * mix)) as [number, number, number];
    if (contrast(lifted, CARD_GROUND) >= 4.5) {
      return `#${lifted.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    }
  }
  return "#FFFFFF";
}

/** The brand for an agent type, falling back to ApolloClaw's own. */
export function agentBrand(agentTypeId?: string): AgentBrand {
  const found = agentTypeId ? BRANDS[agentTypeId] : undefined;
  return found ?? { color: APOLLO_RED, colorRgb: APOLLO_RED_RGB };
}
