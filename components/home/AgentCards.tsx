import Link from "next/link";
import { AGENTS } from "@/config/navigation";
import { BodyLarge, BracketLabel, H2, HAIRLINE, NAVY_ELEVATED, PAPER, PAPER_MUTED, RED, Section, SoftLink } from "@/components/home/ui";

// Section 5 of the home page, Specialist Agents (David's spec, Sept 27 2026): six agents, each
// with a home-page line of its own, and one consistent red line icon in place of the mascot
// art. Destinations and icons come from AGENTS in config/navigation.ts, so a card always goes
// where the menu row goes.
const HOME_AGENTS: { label: string; line: string }[] = [
  { label: "The CEO Agent", line: "Reports, KPIs, and meeting briefs ready before you walk in the room." },
  { label: "The CFO Agent", line: "Expenses categorized, payouts reconciled, and reports ready for close." },
  { label: "The Sales Agent", line: "Qualified leads, timely follow-ups, and a calendar full of booked meetings." },
  { label: "The Recruiting Agent", line: "Candidates screened, interviews scheduled, and onboarding underway." },
  { label: "The Law Agent", line: "Drafts from your own templates, redlines on incoming documents, and every renewal date on track." },
  { label: "The Insurance Agent", line: "Renewals tracked, quotes gathered, and policies compared side by side, ready for your licensed team." },
];

const CARDS = HOME_AGENTS.map((h) => {
  const agent = AGENTS.find((a) => a.label === h.label);
  if (!agent) throw new Error(`AgentCards: no AGENTS entry named "${h.label}"`);
  return { ...h, to: agent.to, Icon: agent.Icon };
});

// Sits on NAVY_ELEVATED, a step up from the Proven Results navy above it, so the two read as a
// deliberate pair.
export function AgentCards() {
  return (
    <div style={{ background: NAVY_ELEVATED }} className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10">
        <Section bg="transparent">
          <div className="mx-auto max-w-3xl text-center">
            <BracketLabel>Specialist Agents</BracketLabel>
            <H2>Start With a Specialist. We Tailor It to You.</H2>
            <div className="mt-6">
              <BodyLarge>Each agent is a proven starting point, shaped around your business from day one.</BodyLarge>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map(({ label, line, to, Icon }) => (
              <Link
                key={label}
                href={to}
                className="group flex flex-col rounded-xl p-7 transition-colors hover:bg-white/[0.06]"
                style={{ background: "rgba(245,246,248,0.04)", border: `1px solid ${HAIRLINE}`, textDecoration: "none" }}
              >
                <Icon size={28} strokeWidth={1.5} aria-hidden style={{ color: RED }} />
                <span className="font-heading mt-6 text-[18px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                  {label}
                </span>
                <span className="mt-2 flex-1 text-[14.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
                  {line}
                </span>
                <span
                  className="font-mono mt-6 text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-80"
                  style={{ color: PAPER }}
                >
                  Explore &rarr;
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <SoftLink href="/ai-agents">See All Agents →</SoftLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
