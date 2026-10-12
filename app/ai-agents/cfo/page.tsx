import type { Metadata } from "next";
import { STARTING_PRICE } from "@/config/agent-plans";
import { agentOgImages } from "@/lib/seo";
import AgentHero from "@/components/AgentHero";
import { CFO_AGENT_FAQS, faqEntities } from "@/config/faqs";

export const metadata: Metadata = {
  // The SEO brief's copy (Donna, Oct 9 2026).
  title: { absolute: "AI Agent for CFOs: Cash and Invoices by 8 AM | Apollo Claw" },
  description: "An AI agent for the CFO's desk: a daily cash view, invoice follow-up and flagged exceptions by 8 AM, with your approval before anything is sent.",
  alternates: {
    // Self-referencing on purpose. This used to point at thecfoagent.ai, which told Google to
    // index that page instead of this one. Both properties are meant to rank on their own; the
    // standalone site is a second front door, not a replacement for this page.
    canonical: "https://apolloclaw.ai/ai-agents/cfo",
  },
  openGraph: {
    images: agentOgImages("cfo"),
    title: "AI Agent for CFOs: Cash and Invoices by 8 AM | Apollo Claw",
    description: "An AI agent for the CFO's desk: a daily cash view, invoice follow-up and flagged exceptions by 8 AM, with your approval before anything is sent.",
    url: "https://apolloclaw.ai/ai-agents/cfo",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/ai-agents/cfo#service",
      name: "The CFO Agent: AI Financial Intelligence",
      description: "AI assistant for CFOs that automates financial reporting, cash forecasting, board prep, and month-end close.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/ai-agents/cfo",
      serviceType: "AI Automation for Finance Leaders",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/ai-agents/cfo#faq",
      mainEntity: faqEntities(CFO_AGENT_FAQS),
    },
  ],
};

const features = [
  { title: "Automated Reporting", desc: "Monthly close support, variance summaries, and board-ready financial narratives drafted before you have to ask for them." },
  { title: "Cash Flow Intelligence", desc: "Rolling forecasts updated continuously based on actuals, with alerts when projections shift outside acceptable ranges." },
  { title: "Board Prep", desc: "Decks, narratives, and supporting schedules assembled automatically from your data. Ready before the meeting, not the night before." },
  { title: "Audit & Compliance Prep", desc: "Documentation organized, reconciliations flagged early, and audit trails maintained automatically throughout the year." },
  { title: "Variance Analysis", desc: "Budget vs. actual comparisons surfaced automatically with plain-language explanations your leadership team can actually read." },
  { title: "Finance Team Leverage", desc: "Routine low-value tasks handled by the agent so your team spends time on analysis, not production." },
];

const process = [
  {
    phase: "First 15 Minutes",
    title: "Your Agent Is Built",
    desc: "Answer a short questionnaire and your custom agent is built online in about 15 minutes, on its own private server. Connect your accounting and reporting tools and it is set for your close cycle and reporting cadence. Every technical step is handled for you.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Reports start generating automatically. Cash flow updates arrive on schedule. Board prep begins assembling itself. You review, approve, move.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your variance thresholds, your preferred narrative style, and your board's questions, and each close runs smoother than the last.",
  },
];

const testimonials = [
  {
    industry: "Insurance",
    quote: "Our month-end close used to take eleven days. We're at six now. The CFO Agent pulls the data, flags the variances, and drafts the narrative. My team reviews instead of produces. That's the difference.",
    role: "CFO, Regional Insurance Group",
    detail: "Multi-line carrier, $180M in premiums",
  },
  {
    industry: "Real Estate",
    quote: "Board prep used to be a two-week scramble. Now it's a two-hour review. The agent assembles the deck, the schedules, and the commentary. I just make sure it says what I want to say.",
    role: "CFO, Commercial Real Estate Firm",
    detail: "Portfolio of 14 properties, Northeast",
  },
  {
    industry: "Legal",
    quote: "We have 22 partners and none of them want to wait for financials. The CFO Agent runs the numbers every week and sends partner summaries automatically. Nobody calls my team asking where the report is anymore.",
    role: "CFO, Regional Law Firm",
    detail: "22-partner firm, Mid-Atlantic",
  },
  {
    industry: "Construction",
    quote: "Job costing across 30 active projects used to require two full-time people just to keep current. The agent tracks actuals against budget on every job and flags anything drifting before it becomes a problem.",
    role: "CFO, General Contracting Firm",
    detail: "$40M revenue, Long Island",
  },
  {
    industry: "Finance",
    quote: "Audit prep used to be a fire drill every year. Now the documentation is maintained continuously. When our auditors show up, everything is organized and nothing is missing. Our audit fees went down.",
    role: "CFO, Wealth Management Firm",
    detail: "RIA, $600M AUM",
  },
  {
    industry: "Healthcare",
    quote: "Revenue cycle reporting was always a week behind. The CFO Agent runs it nightly. I walk in every morning knowing exactly where we are on collections, denials, and AR aging. No surprises.",
    role: "CFO, Multi-Site Medical Group",
    detail: "8 locations, Northeast",
  },
];

const faqs = CFO_AGENT_FAQS;

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function CfoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AgentHero
        agentTypeId="cfo"
        buildSlug="cfo"
        badge="Apollo[Claw] CFO Edition"
        title={<>Close Faster.<br />Report Smarter.</>}
        punch="The CFO Agent. More Than AI. Your Finance Operating System."
        sub="The CFO Agent handles the recurring, time-intensive financial operations that consume your team; so your finance function spends less time producing reports and more time driving decisions."
      />
      {/* Value Prop */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Finance Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best CFOs Drive Strategy. Not Spreadsheets.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-7xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Your finance team is spending too much time producing information and not enough time acting on it. Monthly close drags. Board prep is a scramble. Cash visibility lags by days.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-7xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The CFO Agent handles the production work, reports, forecasts, reconciliations, deck assembly, automatically and on schedule. Your team shows up to review, not to build.
          </p>
        </div>
      </section>

      {/* What is an AI CFO Agent? - SEO Section */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>About</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            What is an AI CFO Agent?
          </h2>
          <div className="flex flex-col gap-4 font-body text-base leading-relaxed" style={{ color: "rgba(11,23,41,0.7)" }}>
            <p>
              An <strong>AI CFO agent</strong> is a purpose-built AI system that takes over the recurring financial operations a CFO and finance team spend the most time on, monthly close support, variance reporting, cash flow forecasting, board pack assembly, and audit preparation. Unlike a generic AI chatbot, an AI CFO agent is connected to your actual systems: your ERP, your accounting platform, your reporting workflows. It runs on schedule, without being asked.
            </p>
            <p>
              Think of it as an <strong>AI financial advisor for small business</strong> that never sleeps. It monitors actuals against budget, flags the variances that matter, drafts the narratives your leadership needs to make decisions, and prepares the materials before the meeting, not the night before. Small and mid-size businesses in particular gain the most: the analytical horsepower of a full finance team at a fraction of the cost.
            </p>
            <p>
              The CFO Agent from Apollo Claw is our <strong>automated financial reporting AI</strong>, onboarded on your specific close cycle, trained on your reporting style, and configured for the systems you already use. It doesn&apos;t replace your finance team. It removes the production work so your team can focus on the analysis and decisions that actually move the business.
            </p>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-7xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Finance Leaders</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Custom-configured for your close cycle. Connected to your systems. Running from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-[2px] mb-4 rounded-full" style={{ background: RED }} />
                <h3 className="font-display text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>The Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>From Questionnaire to Running in About 15 Minutes</h2>
          </div>
          <div className="flex flex-col gap-0">
            {process.map((p, i) => (
              <div key={i} className="flex gap-8 relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold" style={{ background: NAVY, color: "#fff", zIndex: 1 }}>{i + 1}</div>
                  {i < process.length - 1 && <div className="w-[1px] flex-1 my-1" style={{ background: "rgba(11,23,41,0.12)" }} />}
                </div>
                <div className="pb-10">
                  <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: RED }}>{p.phase}</p>
                  <h3 className="font-display text-xl font-bold mb-2" style={{ color: NAVY }}>{p.title}</h3>
                  <p className="font-body text-base leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: NAVY }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Client Results</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What CFOs Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Finance leaders across industries are getting their time back, and their close cycles back on track.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl p-7" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: RED }}>{t.industry}</p>
                <p className="font-body text-sm leading-relaxed text-white mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-mono text-xs font-bold" style={{ color: RED }}>{t.role}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-xs mt-8" style={{ color: "rgba(255,255,255,0.25)" }}>Outcomes from real client engagements. Names and identifying details changed or withheld at client request.</p>
        </div>
      </section>

      {/* Investment */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Investment</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Finance Leaders Who Are Done With Manual Reporting</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every CFO Agent deployment is set up around your organization. Plans start at {STARTING_PRICE} a month with no setup fee.{" "}
            <a href="/pricing" style={{ color: RED, fontWeight: 700 }}>See every plan</a>, or book a consultation for a custom build.
          </p>
          <a href="https://cal.com/therealdaveo/dbdo-consultation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl p-7" style={{ background: CREAM2, border: "1px solid rgba(11,23,41,0.07)" }}>
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{f.q}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
