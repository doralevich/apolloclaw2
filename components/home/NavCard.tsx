import Link from "next/link";
import { externalLinkProps, type NavItem } from "@/config/navigation";
import { onDarkCard } from "@/lib/agentBrand";
import { PAPER, PAPER_MUTED, RED } from "@/components/home/ui";

// The card both homepage axes render. IndustryCards owned this markup and AgentCards needed the
// identical thing, so it lives here rather than in two places that would drift.
//
// `accent` is the only difference between the two grids: Industries keeps ApolloClaw red for
// every tile, because an industry is not one agent and has no colour of its own, while each
// agent card takes its own brand. Default is red, which is what the Industries grid always used.
export function NavCard({
  item,
  accent = RED,
  accentRgb = "225, 46, 48",
  mascot,
  className = "",
}: {
  item: NavItem;
  accent?: string;
  accentRgb?: string;
  /** The agent's own mascot art (lib/agentBrand.ts), inline to the left of the label and
   *  description instead of the generic icon chip below. Only AgentCards passes this -
   *  Industries has no mascot of its own, so it keeps the icon-chip layout. */
  mascot?: string;
  /** Grid placement from the caller, e.g. centering a trailing card. */
  className?: string;
}) {
  const { label, description, to, Icon, external } = item;
  // The accent as INK, which is not the same job as the accent as a tint. `accent` still fills
  // the chip and its border below, where 12% and 25% of it over navy is exactly right. As the
  // glyph and the Explore label it was unreadable: measured in the browser, all 19 cards failed
  // AA on the label (Industries 2.65, CFO 1.21, Personal 1.40) and 8 of 19 failed even the 3:1
  // a graphical object needs on the icon (CFO 1.14, which is invisible, not dim).
  //
  // Same helper the fleet page uses, so the two grids cannot drift: it lifts toward white only
  // as far as the threshold needs and keeps the hue, and passes a bright accent straight
  // through untouched. See lib/agentBrand.ts for why the brand value itself is left alone.
  const ink = onDarkCard(accent);
  const footer = (
    <span
      // The 0.75 resting opacity is gone, with the hover transition that restored it. Dimming
      // the only coloured text on the card took the contrast back off after paying for it, and
      // it was the difference between CFO's label at 1.21 and 1.61 - both unreadable, so the
      // hover was not revealing anything either.
      className="font-mono block text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{ color: ink }}
    >
      {/* The College Agent's card opens thecollegeagent.ai in a new tab, and said "Explore"
          exactly like the nine that keep you on this site. The fleet page's card already
          told the truth; this one did not. */}
      {external ? "Visit the site" : "Explore"} &rarr;
    </span>
  );
  return (
    <Link
      href={to}
      {...(external ? externalLinkProps : {})}
      className={`group rounded-xl p-6 transition-colors ${className}`}
      style={{
        background: "rgba(245,246,248,0.04)",
        border: "1px solid rgba(245,246,248,0.1)",
        textDecoration: "none",
      }}
    >
      {mascot ? (
        // The agent's own art, inline to the left of the text rather than a generic glyph
        // stacked above it - David's call. No chip behind it: the mascots are already
        // finished character art on a transparent ground, the way the fleet page renders them.
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mascot} alt="" aria-hidden className="h-16 w-16 shrink-0 object-contain" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-heading text-[16px] font-bold leading-[1.3]" style={{ color: PAPER }}>
              {label}
            </span>
            <span className="mt-2 flex-1 text-[13.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
              {description}
            </span>
            <span className="mt-5">{footer}</span>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <span
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg"
            style={{
              background: `rgba(${accentRgb},0.12)`,
              border: `1px solid rgba(${accentRgb},0.25)`,
            }}
          >
            <Icon size={19} style={{ color: ink }} />
          </span>
          <span className="font-heading text-[16px] font-bold leading-[1.3]" style={{ color: PAPER }}>
            {label}
          </span>
          <span className="mt-2 flex-1 text-[13.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
            {description}
          </span>
          <span className="mt-5">{footer}</span>
        </div>
      )}
    </Link>
  );
}
