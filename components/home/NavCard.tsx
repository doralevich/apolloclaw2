import Link from "next/link";
import type { NavItem } from "@/config/navigation";
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
  className = "",
}: {
  item: NavItem;
  accent?: string;
  accentRgb?: string;
  /** Grid placement from the caller, e.g. centering a trailing card. */
  className?: string;
}) {
  const { label, description, to, Icon } = item;
  return (
    <Link
      href={to}
      className={`group flex flex-col rounded-xl p-6 transition-colors ${className}`}
      style={{
        background: "rgba(245,246,248,0.04)",
        border: "1px solid rgba(245,246,248,0.1)",
        textDecoration: "none",
      }}
    >
      <span
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg"
        style={{
          background: `rgba(${accentRgb},0.12)`,
          border: `1px solid rgba(${accentRgb},0.25)`,
        }}
      >
        <Icon size={19} style={{ color: accent }} />
      </span>
      <span className="font-heading text-[16px] font-bold leading-[1.3]" style={{ color: PAPER }}>
        {label}
      </span>
      <span className="mt-2 flex-1 text-[13.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
        {description}
      </span>
      <span
        className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-100"
        style={{ color: accent, opacity: 0.75 }}
      >
        Explore &rarr;
      </span>
    </Link>
  );
}
