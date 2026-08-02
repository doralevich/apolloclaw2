import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Calculator,
  CheckCircle,
  GraduationCap,
  Home,
  Scale,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserSearch,
  type LucideIcon,
} from "lucide-react";
import { AGENT_TYPES } from "@/config/agent-types";

export const metadata: Metadata = {
  title: { absolute: "ApolloClaw Agents | Hire an AI Agent for Your Business" },
  description:
    "Eight specialized AI agents, CEO, CFO, Legal, Medical, Insurance, Real Estate, Sales, and Recruiting, built for your business, hosted and managed by ApolloClaw.",
};

const NAVY = "#0B1729";
const RED = "#D72B2B";

// Marketing copy per paid agent type — richer than the registry's one-liner. Keyed by
// the agent-type id; the card grid below renders only ids present here AND purchasable
// in config/agent-types.ts, so the two stay in lockstep.
const SHOWCASE: Record<
  string,
  { icon: LucideIcon; tagline: string; bullets: string[] }
> = {
  ceo: {
    icon: Briefcase,
    tagline: "Your AI chief of staff",
    bullets: [
      "Runs your inbox: triage, drafts, and follow-ups",
      "Manages your calendar and defends focus time",
      "Tracks commitments so nothing slips",
      "Preps briefings and meeting agendas",
    ],
  },
  cfo: {
    icon: Calculator,
    tagline: "Your AI finance lead",
    bullets: [
      "Budgets, cash-flow forecasts, and financial models",
      "KPI dashboards and board-ready financials",
      "Fundraising prep and expense analysis",
      "Explains the numbers in plain English",
    ],
  },
  legal: {
    icon: Scale,
    tagline: "Your AI contracts assistant",
    bullets: [
      "Drafts and reviews NDAs, MSAs, and vendor agreements",
      "Explains clauses in plain English",
      "Tracks obligations and renewal dates",
      "Generates privacy policies and terms",
    ],
  },
  medical: {
    icon: Stethoscope,
    tagline: "Your practice's AI admin",
    bullets: [
      "Summarizes medical literature for clinicians",
      "Drafts patient communications",
      "Insurance and billing prep",
      "Scheduling and records organization",
    ],
  },
  insurance: {
    icon: ShieldCheck,
    tagline: "Your AI insurance assistant",
    bullets: [
      "Compares policies and explains coverage",
      "Preps quotes and proposal materials",
      "Tracks renewals and claims",
      "Drafts client communications",
    ],
  },
  realestate: {
    icon: Home,
    tagline: "Your AI deal assistant",
    bullets: [
      "Listing descriptions and comps research",
      "Transaction checklists from offer to close",
      "Investment math: cap rate, cash flow, ROI",
      "Client follow-up and scheduling",
    ],
  },
  sales: {
    icon: TrendingUp,
    tagline: "Your AI pipeline engine",
    bullets: [
      "Prospect research and personalized outreach",
      "Call prep and objection handling",
      "Follow-up cadences that never stall",
      "Proposal drafts and CRM notes",
    ],
  },
  college: {
    icon: GraduationCap,
    tagline: "Your whole college life, handled",
    bullets: [
      "Classes, deadlines, and assignments on track",
      "Studying, notes, and exam prep",
      "Professor emails that get answered",
      "Internships and career prep",
    ],
  },
  recruiting: {
    icon: UserSearch,
    tagline: "Your AI recruiting coordinator",
    bullets: [
      "Screens resumes against role requirements",
      "Coordinates interview scheduling end to end",
      "Keeps every candidate warm with consistent follow-up",
      "Drafts client and hiring-manager status updates",
    ],
  },
};

export default function AgentsPage() {
  // Purchasable through ApolloClaw checkout (planKey) or sold on a partner site
  // (externalUrl — The College Agent, bought at thecollegeagent.ai).
  const agents = AGENT_TYPES.filter(
    (t) => (t.planKey || t.externalUrl) && t.available && SHOWCASE[t.id]
  );

  return (
    <>
      {/* HERO */}
      <section style={{ background: NAVY, color: "#fff" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20%",
            left: "10%",
            width: "60%",
            height: "120%",
            background: "radial-gradient(ellipse at center, rgba(215,43,43,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <span
            className="mb-7 inline-block rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest"
            style={{ background: "rgba(215,43,43,0.15)", color: "#ff9c9c" }}
          >
            The ApolloClaw Agent Line
          </span>
          <h1 className="font-display max-w-3xl text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Hire an AI agent that works your business like a pro.
          </h1>
          <p className="font-body mt-7 max-w-2xl text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Eight specialized agents, each built around a role, trained on how that job is
            actually done, connected to your tools, hosted and managed by ApolloClaw.
          </p>
        </div>
      </section>

      {/* AGENT GRID */}
      <section className="container mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((t) => {
            const showcase = SHOWCASE[t.id];
            const Icon = showcase.icon;
            return (
              <div
                key={t.id}
                className="flex flex-col rounded-xl border p-6 transition-shadow hover:shadow-lg"
                style={{ borderColor: "rgba(11,23,41,0.12)" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "rgba(215,43,43,0.08)" }}
                >
                  <Icon className="h-6 w-6" style={{ color: RED }} />
                </div>
                <h2 className="font-display mt-4 text-xl" style={{ color: NAVY }}>
                  {t.label}
                </h2>
                <p className="mt-1 text-sm font-medium" style={{ color: RED }}>
                  {showcase.tagline}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {showcase.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ color: "#3d4a5c" }}>
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t pt-4" style={{ borderColor: "rgba(11,23,41,0.08)" }}>
                  {t.externalUrl ? (
                    <a
                      href={t.externalUrl}
                      className="mt-3 inline-block w-full rounded-md px-4 py-2.5 text-center text-sm font-bold text-white"
                      style={{ background: RED }}
                    >
                      Get {t.label}
                    </a>
                  ) : (
                    <Link
                      href={`/dashboard?buy=${t.id}`}
                      className="mt-3 inline-block w-full rounded-md px-4 py-2.5 text-center text-sm font-bold text-white"
                      style={{ background: RED }}
                    >
                      Get the {t.label}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs" style={{ color: "#6b7686" }}>
          Every ApolloClaw agent is a support and drafting tool, not a licensed professional.
          For legal, financial, medical, or other binding decisions, bring in a qualified human;
          your agent will tell you the same thing.
        </p>
      </section>
    </>
  );
}
