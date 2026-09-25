import type { Metadata } from "next";
import {
  Briefcase,
  Home,
  Megaphone,
  Scale,
  Stethoscope,
  TrendingUp,
  UserSearch,
  Wallet,
} from "lucide-react";
import { FleetGrid } from "@/components/agents/FleetGrid";
import type { NavItem } from "@/config/navigation";
import { INVITE_TYPES } from "@/lib/agentInvite";
import { NAVY, NAVY_ELEVATED, PAPER, PAPER_MUTED, RED, Section, TextureBackground } from "@/components/home/ui";

// The picker in front of the 8 role-agent invite links: /agent-invite/cfo, /agent-invite/legal,
// and so on. David: "the /agent-invite/ page should look like /ai-agents, and based on the
// selection the user then goes into that agent's walkthrough." So this is FleetGrid's card,
// reused rather than redrawn (see the `items` prop added there for exactly this) - but with its
// own small roster, not AGENTS: INVITE_TYPES includes "marketing", which has no public
// /ai-agents page (the row was deliberately deleted there, config/navigation.ts), and excludes
// "insurance", "personal", "college" and "propertymanagement", which AGENTS carries but which
// no invite link exists for (lib/agentInvite.ts).
//
// noindex, same reasoning as app/agent-invite/[type]/layout.tsx: an invite link is handed to one
// person and must never surface in search or the sitemap. This picker is the same kind of page,
// one level up.
//
// NOT PASSCODE-GATED ITSELF. Picking a card costs nothing - it is a link to /agent-invite/<type>,
// which still asks for the shared passcode before it will provision anything. Gating the picker
// too would mean typing the passcode twice for no security gained, since the real gate is the one
// the request actually needs to get past.
export const metadata: Metadata = {
  title: "Agent Invites | ApolloClaw",
  robots: { index: false, follow: false },
};

// Labels, descriptions and icons match config/navigation.ts's AGENTS where that agent has a
// public page, so the same role reads the same way everywhere. Marketing has no AGENTS row (its
// public page was deleted, David's call - see the note there), so its copy is written fresh here,
// in the same voice, from config/agent-types.ts's fuller description.
const INVITE_CARDS: NavItem[] = INVITE_TYPES.map((id): NavItem => {
  switch (id) {
    case "ceo":
      return { label: "The CEO Agent", agentTypeId: "ceo", Icon: Briefcase, to: "/agent-invite/ceo", description: "Pull reports, track KPIs, and prep board decks, brief you before every meeting.", cta: "Start →" };
    case "cfo":
      return { label: "The CFO Agent", agentTypeId: "cfo", Icon: Wallet, to: "/agent-invite/cfo", description: "Categorize expenses, reconcile payouts, and chase invoices, prep reports for close.", cta: "Start →" };
    case "sales":
      return { label: "The Sales Agent", agentTypeId: "sales", Icon: TrendingUp, to: "/agent-invite/sales", description: "Qualify leads, draft follow-ups, and book meetings, keep the pipeline moving.", cta: "Start →" };
    case "marketing":
      return { label: "The Marketing Agent", agentTypeId: "marketing", Icon: Megaphone, to: "/agent-invite/marketing", description: "On-brand copy for email, social, and ads, a content calendar that keeps moving, and recaps with what to try next.", cta: "Start →" };
    case "recruiting":
      return { label: "The Recruiting Agent", agentTypeId: "recruiting", Icon: UserSearch, to: "/agent-invite/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding.", cta: "Start →" };
    case "legal":
      return { label: "The Law Agent", agentTypeId: "legal", Icon: Scale, to: "/agent-invite/legal", description: "Draft from your templates, redline what comes in, and never let a renewal date slip.", cta: "Start →" };
    case "medical":
      return { label: "The Medical Agent", agentTypeId: "medical", Icon: Stethoscope, to: "/agent-invite/medical", description: "Keep the schedule full, chase referrals and authorizations, and answer what a front desk answers all day.", cta: "Start →" };
    case "realestate":
      return { label: "The Real Estate Agent", agentTypeId: "realestate", Icon: Home, to: "/agent-invite/realestate", description: "Lead follow-up in minutes, showings scheduled, and listings drafted for you.", cta: "Start →" };
  }
});

export default function AgentInvitePicker() {
  return (
    <>
      <section style={{ background: NAVY }} className="relative overflow-hidden">
        <TextureBackground />
        <div className="container relative z-20 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <span
              className="font-mono mb-5 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{ color: RED }}
            >
              Agent Invites
            </span>
            <h1
              className="font-heading text-[clamp(1.875rem,3.4vw,3rem)] font-extrabold leading-[1.12] tracking-tight"
              style={{ color: PAPER, textWrap: "balance" }}
            >
              Which Agent Are We Setting Up?
            </h1>
            <p className="font-body mt-6 text-[1.125rem] leading-[1.65]" style={{ color: PAPER_MUTED, maxWidth: 620 }}>
              Pick the role. The person you send this to goes straight into that agent&apos;s own
              walkthrough - the shared passcode still gates the next page, this is just picking
              which one.
            </p>
          </div>
        </div>
      </section>

      <Section bg={NAVY_ELEVATED}>
        <FleetGrid items={INVITE_CARDS} />
      </Section>
    </>
  );
}
