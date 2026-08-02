import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI for Real Estate Agents | Automate Lead Follow-Up & Listing Management | Apollo[Claw]",
  description: "The Real Estate Agent follows up with leads in under 2 minutes, manages your CRM, and coordinates showings automatically so you can focus on closing.",
  openGraph: {
    title: "AI for Real Estate Agents | Automate Lead Follow-Up & Listing Management",
    description: "The Real Estate Agent handles lead follow-up, listing management, showing coordination, and CRM updates so you can focus on closing deals.",
    url: "https://apolloclaw.ai/industries/real-estate",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/industries/real-estate#service",
      name: "The Real Estate Agent: AI for Real Estate Professionals",
      description: "AI assistant for real estate agents that automates lead follow-up, listing management, showing coordination, and CRM updates.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/industries/real-estate",
      serviceType: "AI Automation for Real Estate Agents",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/industries/real-estate#faq",
      mainEntity: [
        { "@type": "Question", name: "What CRM systems does the Real Estate Agent connect to?", acceptedAnswer: { "@type": "Answer", text: "We connect to Follow Up Boss, kvCORE, BoomTown, HubSpot, Salesforce, and most major real estate CRMs." } },
        { "@type": "Question", name: "How fast does it follow up with new leads?", acceptedAnswer: { "@type": "Answer", text: "Within two minutes of a lead coming in, regardless of time of day. Speed to lead is one of the highest-leverage improvements most agents see immediately." } },
        { "@type": "Question", name: "Will it sound like me or like a robot?", acceptedAnswer: { "@type": "Answer", text: "We train the agent on your communication style during onboarding. Most clients tell us their prospects can not tell the difference." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training." } },
        { "@type": "Question", name: "Do I need a technical team to run this?", acceptedAnswer: { "@type": "Answer", text: "No. We handle all technical setup. You interact with your agent through the same tools you already use every day." } },
      ],
    },
  ],
};

const features = [
  { title: "Lead Follow-Up", desc: "AI follows up with new leads within minutes, qualifies their timeline and needs, and schedules showings, before they call someone else." },
  { title: "Listing Management", desc: "Listing descriptions written, status changes communicated, and syndication updates handled automatically across every platform." },
  { title: "Showing Coordination", desc: "Schedules confirmed, reminders sent, and feedback collected after every showing without you touching your calendar." },
  { title: "Transaction Coordination", desc: "Deadline tracking, document requests, and status updates keep transactions moving without constant manual oversight." },
  { title: "CRM Automation", desc: "Contact records updated, interactions logged, and high-priority leads flagged so your CRM is always current." },
  { title: "Client Communication", desc: "Check-ins, status updates, and milestone notifications sent automatically so every client feels informed throughout the process." },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We map your lead sources, connect your CRM and calendar, and configure the agent for your market and workflow. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Leads get followed up within minutes. Showings get confirmed automatically. CRM updates happen without you touching them. You focus on the deals.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your preferred follow-up cadence, your client communication style, and your transaction workflow. Most agents report converting more leads within the first month.",
  },
];

const testimonials = [
  {
    industry: "Residential",
    quote: "I was losing leads because I couldn't follow up fast enough. The Real Estate Agent follows up within two minutes of an inquiry, qualifies the buyer, and schedules the showing. I went from converting 12% of leads to over 20% in the first month.",
    role: "Licensed Real Estate Agent",
    detail: "Boutique residential brokerage, Northeast",
  },
  {
    industry: "Brokerage",
    quote: "Managing 30 agents meant 30 different ways of handling leads. Now everyone's follow-up is consistent, fast, and professional. The agent runs it all. My job became managing outcomes instead of managing process.",
    role: "Principal Broker & Owner",
    detail: "Independent brokerage, 30 agents",
  },
  {
    industry: "Commercial",
    quote: "Commercial deals have long timelines and a lot of touchpoints. The agent keeps every prospect warm, follows up on every LOI, and makes sure nothing goes quiet. I stopped losing deals to inattention.",
    role: "Commercial Real Estate Broker",
    detail: "Office and industrial, Mid-Atlantic",
  },
  {
    industry: "Luxury",
    quote: "In the luxury market, speed and professionalism are everything. The agent sends personalized follow-up within minutes of every inquiry. My prospects think I have a concierge team. In a way, I do.",
    role: "Luxury Residential Agent",
    detail: "Top 1% producer, Long Island",
  },
  {
    industry: "Property Management",
    quote: "Tenant inquiries, maintenance requests, lease renewals, the agent handles the first response on all of it. My team only steps in when a decision is needed. Our response times are down to under five minutes.",
    role: "Owner, Property Management Company",
    detail: "350-unit portfolio, New York",
  },
  {
    industry: "New Development",
    quote: "Pre-selling a new development means managing hundreds of prospects at different stages. The agent keeps every conversation going, sends updates as construction milestones hit, and books appointments for my sales team. The pipeline runs itself.",
    role: "VP of Sales, Real Estate Developer",
    detail: "Mixed-use development, Queens",
  },
];

const faqs = [
  {
    q: "What CRM systems does the Real Estate Agent connect to?",
    a: "We connect to Follow Up Boss, kvCORE, BoomTown, HubSpot, Salesforce, and most major real estate CRMs. We also work with spreadsheet-based systems. Every engagement is scoped individually.",
  },
  {
    q: "How fast does it follow up with new leads?",
    a: "Within two minutes of a lead coming in, regardless of time of day. Speed to lead is one of the highest-leverage improvements most agents see immediately.",
  },
  {
    q: "Will it sound like me or like a robot?",
    a: "We train the agent on your communication style during onboarding. Most clients tell us their prospects cannot tell the difference, and some prefer it because it is always prompt and professional.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your lead volume, CRM, and workflow. Pricing is discussed during your consultation.",
  },
  {
    q: "Do I need a technical team to run this?",
    a: "No. We handle all technical setup. You interact with your agent through the same tools you already use: email, text, or your CRM.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function RealEstatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/the-real-estate-agent-white.png" alt="The Real Estate Agent" style={{ height: 52, width: "auto", margin: "0 auto 32px" }} />
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            List More. Close More.<br />Follow Up on Everything.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The Real Estate Agent handles lead follow-up, listing management, showing coordination, and client communication so you can focus on closing deals.
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
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Real Estate Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best Agents Focus on Relationships. Not Repetition.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Leads go cold because follow-up is slow. Deals stall because coordination takes too long. CRM updates fall behind because there are never enough hours in the day.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The Real Estate Agent handles the repetitive work, follow-up, scheduling, status updates, CRM maintenance, so you can stay focused on what actually closes deals.
          </p>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Real Estate Professionals</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Custom-configured for your market. Connected to your CRM. Running from day one.</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What Real Estate Professionals Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Agents and brokers across the country are converting more leads and closing more deals.</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Agents Who Are Done Losing Leads to Slow Follow-Up</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every Real Estate Agent deployment is custom-scoped to your business. Pricing is discussed during your consultation based on your lead volume, CRM, and workflow.
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Meet Your AI Real Estate Agent?</h2>
          <p className="font-body text-base mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            Schedule a 30-minute consultation. We will show you exactly how The Real Estate Agent would be configured for your business.
          </p>
          <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: "#ffffff", color: RED, fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>
    </>
  );
}
