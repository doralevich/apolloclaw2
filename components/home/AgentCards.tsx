import Link from "next/link";
import { AGENTS } from "@/config/navigation";
import { agentBrand, onLightCard } from "@/lib/agentBrand";
import { BodyLarge, BracketLabel, H2, Section, SoftLink, TAN, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// Section 5 of the home page, Specialist Agents (David's spec, Sept 27 2026): nine agents, every
// one in AGENTS except The College Agent, each with a home-page line of its own and its own
// mascot (lib/agentBrand.ts), David's call to keep the agent bots. Destinations come from AGENTS
// in config/navigation.ts, so a card always goes where the menu row goes.
const HOME_AGENTS: { label: string; line: string }[] = [
  { label: "The CEO Agent", line: "Reports, KPIs, and meeting briefs ready before you walk in the room." },
  { label: "The CFO Agent", line: "Expenses categorized, payouts reconciled, and reports ready for close." },
  { label: "The Sales Agent", line: "Qualified leads, timely follow-ups, and a calendar full of booked meetings." },
  { label: "The Recruiting Agent", line: "Candidates screened, interviews scheduled, and onboarding underway." },
  { label: "The Law Agent", line: "Drafts from your own templates, redlines on incoming documents, and every renewal date on track." },
  { label: "The Insurance Agent", line: "Renewals tracked, quotes gathered, and policies compared side by side, ready for your licensed team." },
  { label: "The Medical Agent", line: "A full schedule, referrals and authorizations tracked, and front-desk questions answered." },
  { label: "The Real Estate Agent", line: "Leads followed up in minutes, showings scheduled, and listings drafted." },
  { label: "The Personal Agent", line: "Inbox, calendar, research, and follow-ups handled, so your focus stays on your best work." },
];

const CARDS = HOME_AGENTS.map((h) => {
  const agent = AGENTS.find((a) => a.label === h.label);
  if (!agent) throw new Error(`AgentCards: no AGENTS entry named "${h.label}"`);
  const brand = agentBrand(agent.agentTypeId);
  return { ...h, to: agent.to, mascot: brand.mascot, ink: onLightCard(brand.color) };
});

// Cream with white cards (David, Sept 27 2026: "two blue sections back to back"). It sits between
// the white Built for You section and the navy Proven Results band (see app/page.tsx).
export function AgentCards() {
  return (
    <Section bg={TAN}>
      <div className="mx-auto max-w-7xl text-center">
        <BracketLabel light>Specialist Agents</BracketLabel>
        <H2 light>Start With a Specialist. We Tailor It to You.</H2>
        <div className="mt-6">
          <BodyLarge light>Each agent is a proven starting point, shaped around your business from day one.</BodyLarge>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ label, line, to, mascot, ink }) => (
          <Link
            key={label}
            href={to}
            className="group flex items-start gap-4 rounded-xl bg-white p-6 transition-shadow hover:shadow-[0_10px_30px_rgba(11,23,41,0.08)]"
            style={{ border: "1px solid rgba(11,23,41,0.1)", textDecoration: "none" }}
          >
            {mascot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mascot} alt="" aria-hidden className="h-16 w-16 shrink-0 object-contain" />
            )}
            <span className="flex min-w-0 flex-1 flex-col self-stretch">
              <span className="font-heading text-[17px] font-bold leading-[1.3]" style={{ color: TAN_INK }}>
                {label}
              </span>
              <span className="mt-2 flex-1 text-[14px] leading-[1.65]" style={{ color: TAN_INK_MUTED }}>
                {line}
              </span>
              <span
                className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-80"
                style={{ color: ink }}
              >
                Explore &rarr;
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <SoftLink light href="/ai-agents">See All Agents →</SoftLink>
      </div>
    </Section>
  );
}
