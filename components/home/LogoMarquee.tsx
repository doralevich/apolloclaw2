import { SiDropbox, SiGmail, SiGoogle, SiWhatsapp } from "react-icons/si";
import type { IconType } from "react-icons";
import { HAIRLINE, NAVY_ELEVATED, PAPER, PAPER_MUTED } from "@/components/home/ui";

// Only the integrations named in the approved copy (Hero: "Slack, WhatsApp, and email", Proof:
// "Google Workspace, Microsoft 365, Dropbox"). Icon is omitted (not null) for Slack and
// Microsoft 365, their marks were pulled from the open-source Simple Icons set some years back
// over trademark policy, so there's no accurate SVG to source without David sending the
// official brand asset. Everything else here is the real mark via react-icons/si.
const TOOLS: { label: string; Icon?: IconType }[] = [
  { label: "Slack" },
  { label: "WhatsApp", Icon: SiWhatsapp },
  { label: "Gmail", Icon: SiGmail },
  { label: "Google Workspace", Icon: SiGoogle },
  { label: "Microsoft 365" },
  { label: "Dropbox", Icon: SiDropbox },
];

function Pill({ label, Icon }: { label: string; Icon?: IconType }) {
  return (
    <div
      className="mx-2.5 inline-flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-2.5"
      style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.03)" }}
    >
      {Icon && <Icon size={16} style={{ color: PAPER_MUTED }} />}
      <span className="whitespace-nowrap text-[13px] font-semibold" style={{ color: PAPER }}>
        {label}
      </span>
    </div>
  );
}

export function LogoMarquee() {
  const items = [...TOOLS, ...TOOLS];
  return (
    <div className="relative overflow-hidden border-y py-6" style={{ borderColor: HAIRLINE, background: NAVY_ELEVATED }}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {items.map((tool, i) => (
          <Pill key={`${tool.label}-${i}`} {...tool} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-20 md:w-32"
        style={{ background: `linear-gradient(to right, ${NAVY_ELEVATED}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20 md:w-32"
        style={{ background: `linear-gradient(to left, ${NAVY_ELEVATED}, transparent)` }}
      />
    </div>
  );
}
