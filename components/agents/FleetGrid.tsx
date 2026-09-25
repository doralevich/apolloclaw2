import Link from "next/link";
import { AGENTS, externalLinkProps, type NavItem } from "@/config/navigation";
import { agentBrand, onDarkCard } from "@/lib/agentBrand";
import { HAIRLINE, PAPER, PAPER_MUTED } from "@/components/home/ui";

// The fleet, one card per agent, for /ai-agents.
//
// NOT a second copy of components/home/AgentCards.tsx, which renders the same list as flat
// icon tiles inside the homepage's rhythm. This is the page whose whole subject is the fleet,
// so the mascots carry it: each agent has a character and a colour of its own, and a directory
// that shows neither is a list of links pretending to be a product line.
//
// Derived from AGENTS, like the footer and the homepage grid. Adding an agent to
// config/navigation.ts puts it here with no edit to this file - which is the point, and is
// the thing that had gone wrong everywhere these lists were retyped by hand.
//
// `items` defaults to AGENTS but takes any NavItem list - /agent-invite reuses this same card
// for its own, smaller roster (the 8 invitable role agents, not the public fleet) rather than a
// second copy of this markup.
export function FleetGrid({ items = AGENTS }: { items?: NavItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const brand = agentBrand(item.agentTypeId);
        const { Icon } = item;
        // Ten agents in a three-up grid leaves the tenth alone against the left edge, reading
        // as an unfinished row. Centering it is one class. Same trick, same condition as
        // components/home/AgentCards.tsx, so an eleventh agent needs no thought here either.
        const orphan = i === items.length - 1 && items.length % 3 === 1;
        return (
          <Link
            key={item.to}
            href={item.to}
            {...(item.external ? externalLinkProps : {})}
            className={`group flex flex-col overflow-hidden rounded-2xl border transition-colors ${
              orphan ? "lg:col-start-2" : ""
            }`}
            style={{
              borderColor: HAIRLINE,
              background: "rgba(245,246,248,0.03)",
              textDecoration: "none",
            }}
          >
            {/* Brand wash behind the mascot. The colour is the agent's own, read off its
                wordmark, so the card matches the site the customer may have arrived from. */}
            <div
              className={`relative flex h-[168px] justify-center ${brand.mascot ? "items-end" : "items-center"}`}
              style={{
                background: `linear-gradient(180deg, rgba(${brand.colorRgb},0.22) 0%, rgba(${brand.colorRgb},0.05) 100%)`,
                borderBottom: `1px solid rgba(${brand.colorRgb},0.25)`,
              }}
            >
              {brand.mascot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.mascot}
                  alt=""
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ height: 150, width: "auto", display: "block" }}
                />
              ) : (
                // The documented fallback for an agent with no artwork yet (lib/agentBrand.ts):
                // ApolloClaw red and no mascot. The nav icon stands in so the card still reads
                // as a card rather than as a hole in the grid.
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ background: `rgba(${brand.colorRgb},0.15)`, border: `1px solid rgba(${brand.colorRgb},0.3)` }}
                >
                  <Icon size={34} style={{ color: brand.color }} />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <span className="font-heading text-[17px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                {item.label}
              </span>
              <span className="mt-2 flex-1 text-[13.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
                {item.description}
              </span>
              <span
                // onDarkCard, not brand.color: as a wordmark colour on white every one of
                // these reads; as 11px text on this navy, not one of the ten clears AA. Full
                // opacity for the same reason - dimming the only coloured text on the card to
                // 0.8 was taking contrast back off after paying for it.
                className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ color: onDarkCard(brand.color) }}
              >
                {item.cta ?? (item.external ? "Visit the site →" : "Explore →")}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
