import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI for Insurance Agencies | Apollo Claw - Quotes, Renewals & Claims Automation",
  description: "Apollo Claw builds AI agents for insurance agencies and brokers. Automate quote requests, policy renewals, and claims status, so your team focuses on closing, not chasing.",
  alternates: {
    canonical: "https://apolloclaw.ai/industries/insurance",
  },
  openGraph: {
    title: "AI for Insurance Agencies | Apollo Claw - Quotes, Renewals & Claims Automation",
    description: "Apollo Claw builds AI agents for insurance agencies and brokers. Automate quote requests, policy renewals, and claims status, so your team focuses on closing, not chasing.",
    url: "https://apolloclaw.ai/industries/insurance",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/industries/insurance#service",
      name: "The Insurance Agent: AI for Insurance Agencies",
      description: "AI assistant for insurance agencies that automates renewal outreach, quote follow-up, and client communication.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/industries/insurance",
      serviceType: "AI Automation for Insurance Agencies",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/industries/insurance#faq",
      mainEntity: [
        { "@type": "Question", name: "What agency management systems does the Insurance Agent connect to?", acceptedAnswer: { "@type": "Answer", text: "We connect to Applied Epic, Hawksoft, AMS360, EZLynx, and most major AMS platforms. We also work with AgencyZoom and other sales CRMs." } },
        { "@type": "Question", name: "How does it handle renewal outreach?", acceptedAnswer: { "@type": "Answer", text: "The agent identifies policies approaching renewal, initiates outreach at your configured lead time, and runs a follow-up sequence until the client responds or the renewal closes." } },
        { "@type": "Question", name: "Will it replace my service team?", acceptedAnswer: { "@type": "Answer", text: "No. It handles the first-touch communication, follow-up sequences, and status updates. Your team handles conversations that require judgment." } },
        { "@type": "Question", name: "Is client data secure?", acceptedAnswer: { "@type": "Answer", text: "Yes. We connect using least-privilege API credentials and your data does not pass through servers we do not control." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most agencies are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training." } },
      ],
    },
  ],
};

const features = [
  { title: "Quote Follow-Up", desc: "AI follows up with prospects after quotes are sent, answers common questions, and keeps your pipeline moving without chasing every lead manually." },
  { title: "Renewal Automation", desc: "Automated renewal outreach sequences start 90 days out, ensure every client is contacted on time, and escalate non-responders to your team." },
  { title: "Claims Communication", desc: "Automated status update outreach to clients in open claims, reducing inbound calls and keeping clients informed throughout the process." },
  { title: "New Business Qualification", desc: "Prospects qualified, applications started, and follow-up sequenced automatically so your producers spend time with buyers, not chasers." },
  { title: "Certificate Management", desc: "Certificate of insurance requests logged, processed, and delivered without backing up your service team." },
  { title: "Cross-Sell Outreach", desc: "Identifies policy gaps in existing accounts and initiates cross-sell conversations at the right time, automatically." },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We map your book of business, connect your AMS and communication tools, and configure the agent for your agency's workflow. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Quote follow-ups go out automatically. Renewal sequences start running. Claims clients get status updates without your team making calls. You review, approve, move.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your carrier mix, your client communication style, and your retention patterns. Most agencies see measurable improvement in renewal retention within the first month.",
  },
];

const testimonials = [
  {
    industry: "P&C",
    quote: "We were losing renewals not because of price but because nobody followed up in time. The Insurance Agent now flags every policy 90 days out, drafts the outreach, and makes sure my producers actually send it. Retention is up and I stopped micromanaging the process.",
    role: "Principal, Independent Insurance Agency",
    detail: "Regional P&C agency, 12 producers, Southeast",
  },
  {
    industry: "Commercial Lines",
    quote: "Commercial renewals have 30-page submissions and six-week timelines. The agent tracks every renewal 120 days out, initiates the data gathering, and follows up with clients when we need information. Nothing slips anymore.",
    role: "Commercial Lines Manager",
    detail: "Mid-market commercial agency, Northeast",
  },
  {
    industry: "Health & Benefits",
    quote: "Open enrollment is a 90-day sprint and we have 200 employer groups. The agent manages the entire communication calendar: reminders, enrollment confirmations, deadline alerts. My team handled twice the volume without adding staff.",
    role: "Benefits Agency Principal",
    detail: "Group health and benefits, 200 employer groups",
  },
  {
    industry: "Life",
    quote: "Life insurance sales run on follow-up. Most agents follow up twice and give up. The agent follows up twelve times over six weeks without anyone having to track it. My close rate on term applications went up 30%.",
    role: "Life Insurance Agent",
    detail: "Independent producer, Long Island",
  },
  {
    industry: "Claims",
    quote: "During CAT season, clients would call us 10 times asking about their claim status. The agent now sends proactive updates at every milestone. Inbound calls dropped by half and client satisfaction went up.",
    role: "Claims Manager",
    detail: "Regional carrier, Southeast",
  },
  {
    industry: "Agency Owner",
    quote: "I have 8 producers and nobody was consistent on follow-up. The agent runs a follow-up sequence on every quote, every prospect, every renewal. My whole agency is consistent now. Revenue is up 22% year over year.",
    role: "Agency Owner",
    detail: "Multi-line independent agency, 8 producers",
  },
];

const faqs = [
  {
    q: "What agency management systems does the Insurance Agent connect to?",
    a: "We connect to Applied Epic, Hawksoft, AMS360, EZLynx, and most major AMS platforms. We also work with spreadsheet-based systems. Every engagement is scoped individually.",
  },
  {
    q: "How does it handle renewal outreach?",
    a: "The agent identifies policies approaching renewal, initiates outreach at your configured lead time (typically 90 days), follows up on non-responses, and escalates to your producers when a decision is needed.",
  },
  {
    q: "Will it replace my service team?",
    a: "No. It handles the first-touch communication, follow-up sequences, and status updates. Your team handles coverage decisions, complex questions, and relationship conversations.",
  },
  {
    q: "Is client data secure?",
    a: "Yes. We connect using least-privilege API credentials and your data does not pass through servers we do not control. All connections are encrypted.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most agencies are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your book of business, AMS, and workflow. Pricing is discussed during your consultation.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function InsurancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Write More Business.<br />Lose Fewer Renewals.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The Insurance Agent handles quote follow-up, renewal outreach, claims communication, and client management so your producers stay focused on selling.
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
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Insurance Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best Agencies Win on Follow-Up. Not Just Price.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Renewals slip through because outreach starts too late. Quotes go cold because follow-up falls off after two attempts. Claims clients call constantly because nobody updated them.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The Insurance Agent handles all of it automatically: renewal sequences, quote follow-up, claims updates, certificate requests, so your producers stay in front of buyers instead of behind on admin.
          </p>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Insurance Agencies</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Custom-configured for your book of business. Connected to your AMS. Running from day one.</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What Insurance Professionals Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Agencies across the country are retaining more clients and writing more new business.</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Agencies That Are Done Losing Renewals to Slow Outreach</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every Insurance Agent deployment is custom-scoped to your agency. Pricing is discussed during your consultation based on your book size, AMS, and producer workflow.
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Meet Your AI Insurance Agent?</h2>
          <p className="font-body text-base mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            Schedule a 30-minute consultation. We will show you exactly how The Insurance Agent would be configured for your agency.
          </p>
          <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: "#ffffff", color: RED, fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>
    </>
  );
}
