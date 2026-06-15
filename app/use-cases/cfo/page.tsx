import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The CFO Agent | AI Finance Intelligence for Finance Leaders | Apollo[Claw]",
  description: "The CFO Agent handles reporting, cash forecasting, board prep, and month-end close so your finance team focuses on strategy.",
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
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We map your financial workflows, connect your tools, and configure the agent for your close cycle and reporting cadence. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Reports start generating automatically. Cash flow updates arrive on schedule. Board prep begins assembling itself. You review, approve, move.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your variance thresholds, your preferred narrative style, and your board's questions. Most clients shorten their close cycle within the first month.",
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

const faqs = [
  {
    q: "What financial systems does the CFO Agent connect to?",
    a: "We connect to QuickBooks, NetSuite, Sage, Xero, and most major ERP platforms. We also work with Excel and Google Sheets-based workflows. Every engagement is scoped individually.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "Will it replace my finance team?",
    a: "No. It removes the production work — report generation, data pulls, reconciliation tracking — so your team can focus on analysis, interpretation, and strategic advice.",
  },
  {
    q: "Is our financial data secure?",
    a: "Yes. We connect using read-only API credentials wherever possible and use least-privilege access throughout. Your data does not pass through servers we do not control.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your systems, reporting cadence, and team size. Pricing is discussed during your consultation.",
  },
  {
    q: "Can it handle multi-entity reporting?",
    a: "Yes. Multi-entity consolidation is one of the most common use cases. We configure the agent to handle intercompany eliminations and consolidated reporting.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function CfoPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/the-cfo-agent-white.png" alt="The CFO Agent" style={{ height: 52, width: "auto", margin: "0 auto 32px" }} />
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Close Faster.<br />Report Smarter.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The CFO Agent handles the recurring, time-intensive financial operations that consume your team — so your finance function spends less time producing reports and more time driving decisions.
          </p>
          <div style={{ marginTop: 36 }}>
            <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 30px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
              Schedule Your Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-4xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Finance Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best CFOs Drive Strategy. Not Spreadsheets.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Your finance team is spending too much time producing information and not enough time acting on it. Monthly close drags. Board prep is a scramble. Cash visibility lags by days.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The CFO Agent handles the production work — reports, forecasts, reconciliations, deck assembly — automatically and on schedule. Your team shows up to review, not to build.
          </p>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
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
        <div className="container mx-auto max-w-4xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>The Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>From Consultation to Running in 2 Weeks</h2>
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
        <div className="container mx-auto max-w-5xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Client Results</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What CFOs Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Finance leaders across industries are getting their time back — and their close cycles back on track.</p>
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
          <p className="text-center font-mono text-xs mt-8" style={{ color: "rgba(255,255,255,0.25)" }}>Representative client experiences. Identifying details withheld at client request.</p>
        </div>
      </section>

      {/* Investment */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Investment</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Finance Leaders Who Are Done With Manual Reporting</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every CFO Agent deployment is custom-scoped to your organization. Pricing is discussed during your consultation based on your systems, close cycle, and reporting requirements.
          </p>
          <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl p-7" style={{ background: CREAM2, border: "1px solid rgba(11,23,41,0.07)" }}>
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{f.q}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: RED }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Meet Your AI CFO Agent?</h2>
          <p className="font-body text-base mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            Schedule a 30-minute consultation. We will show you exactly how The CFO Agent would be configured for your finance function.
          </p>
          <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: "#ffffff", color: RED, fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>
    </>
  );
}
