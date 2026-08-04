import type { Metadata } from "next";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Assistant for CEOs | Apollo[Claw]" },
  description: "The CEO Bot handles your briefings, communications, research, and follow-up automatically. Stop being the bottleneck; let your bot run the details.",
  openGraph: {
    images: OG_IMAGES,
    title: "AI Assistant for CEOs | Automate Executive Workflows",
    description: "The CEO Bot handles briefings, communications, research, and follow-up so you can focus on what only you can do.",
    url: "https://apolloclaw.ai/ai-agents/ceo",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/ai-agents/ceo#service",
      name: "The CEO Bot: AI Executive Assistant",
      description: "AI executive assistant for CEOs that handles briefings, communications, research, and follow-up automatically.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/ai-agents/ceo",
      serviceType: "AI Automation for Executives",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/ai-agents/ceo#faq",
      mainEntity: [
        { "@type": "Question", name: "What exactly is an AI bot?", acceptedAnswer: { "@type": "Answer", text: "An AI bot is a software system connected to your actual business tools that takes autonomous action on your behalf. It reads, prioritizes, drafts, tracks, and follows up, without being asked." } },
        { "@type": "Question", name: "How is this different from using ChatGPT or a generic AI tool?", acceptedAnswer: { "@type": "Answer", text: "ChatGPT is a conversation tool. The CEO Bot is connected to your systems and configured for your workflows. It knows your voice, your priorities, your team. The difference is a calculator versus a chief of staff." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training." } },
        { "@type": "Question", name: "Is my data secure?", acceptedAnswer: { "@type": "Answer", text: "Yes. We build on your infrastructure wherever possible. All connections use least-privilege access and your data does not pass through servers we do not control." } },
        { "@type": "Question", name: "Do I need a technical team to run this?", acceptedAnswer: { "@type": "Answer", text: "No. We handle all technical setup. You interact with your bot through Telegram or email, the same way you would communicate with a team member." } },
      ],
    },
  ],
};

const features = [
  {
    title: "Morning Briefings",
    desc: "Delivers a prioritized daily brief: calendar, open tasks, key emails, and strategic context before your first meeting.",
  },
  {
    title: "Executive Communications",
    desc: "Drafts responses, follow-ups, and outbound messages in your voice. You review and approve. Nothing goes out without you.",
  },
  {
    title: "Research on Demand",
    desc: "Pulls competitive intelligence, market data, and background on anyone you are meeting with. Delivered in clean, scannable briefs.",
  },
  {
    title: "Meeting Preparation",
    desc: "Agendas, talking points, pre-read summaries, and post-meeting action items handled automatically.",
  },
  {
    title: "CRM and Pipeline Oversight",
    desc: "Monitors deal activity, flags stalled opportunities, and ensures your team updates are current before any review.",
  },
  {
    title: "Strategic Follow-Through",
    desc: "Tracks commitments made in meetings and follows up with your team so nothing falls through the cracks.",
  },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Bot",
    desc: "We map your workflows, connect your tools, and train the bot on your communication style. No IT team required. You show up to a 90-minute onboarding session.",
  },
  {
    phase: "Week 1",
    title: "Your Bot Goes to Work",
    desc: "Morning briefings start arriving before 8am. Meeting prep appears in your inbox before every call. Emails are drafted. Follow-ups are tracked. You review, approve, move.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "It learns your priorities, your preferences, and your blind spots. Most clients report getting back 8-12 hours per week within the first month.",
  },
];

const testimonials = [
  {
    industry: "Insurance",
    quote: "We were losing renewals not because of price but because nobody followed up in time. The CEO Bot now flags every policy 90 days out, drafts the outreach, and makes sure my producers actually send it. Retention is up and I stopped micromanaging the process.",
    role: "CEO, Independent Insurance Agency",
    detail: "Regional firm, 12 producers, Southeast",
  },
  {
    industry: "Real Estate",
    quote: "I used to spend Sunday nights prepping for Monday. Now my brief is waiting for me at 7am, who closed, what's pending, which agents need attention. I walk into the week already knowing what matters. My team thinks I got sharper. I just got better information.",
    role: "Principal Broker & CEO",
    detail: "Boutique residential brokerage, 30 agents, Northeast",
  },
  {
    industry: "Legal",
    quote: "Partners bill by the hour. Every minute I spent on admin was money we weren't capturing. The CEO Bot handles my inbox triage, meeting prep, and follow-ups. I got back about ten hours a week. That's ten hours of billable work I was leaving on the table.",
    role: "Managing Partner",
    detail: "Litigation firm, 18 attorneys, Mid-Atlantic",
  },
  {
    industry: "Executive",
    quote: "I have a great team but I was still the bottleneck on everything. Decisions sat with me, follow-ups sat with me, research sat with me. The CEO Bot cleared the queue. Things move now without me touching them, and I only get involved when I actually need to.",
    role: "Founder & CEO",
    detail: "B2B services company, 45 employees",
  },
  {
    industry: "Finance",
    quote: "Client communication is everything in this business. The bot drafts quarterly updates, flags clients who haven't heard from us in 60 days, and preps me before every review meeting. My clients think I have a larger team. In a way, I do.",
    role: "CEO, Wealth Management Firm",
    detail: "RIA, $400M AUM, New York",
  },
  {
    industry: "Construction",
    quote: "Running a construction company means you're putting out fires all day. The CEO Bot started giving me a morning brief every day, what's on the schedule, what's at risk, what needs a call. I stopped reacting and started running the business.",
    role: "President & CEO",
    detail: "General contractor, $25M revenue, Long Island",
  },
];

const faqs = [
  {
    q: "What exactly is an AI bot?",
    a: "An AI bot is a software system connected to your actual business tools that takes autonomous action on your behalf. It reads, prioritizes, drafts, tracks, and follows up, without being asked.",
  },
  {
    q: "How is this different from using ChatGPT or a generic AI tool?",
    a: "ChatGPT is a conversation tool. The CEO Bot is connected to your systems and configured for your workflows. It knows your voice, your priorities, your team. The difference is a calculator versus a chief of staff.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We build on your infrastructure wherever possible. All connections use least-privilege access and your data does not pass through servers we do not control.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped. Pricing is discussed during your consultation. Book a call and we will give you a precise number.",
  },
  {
    q: "Do I need a technical team to run this?",
    a: "No. We handle all technical setup. You interact with your bot through Telegram or email, the same way you would communicate with a team member.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function CeoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/the-ceo-agent-white.png"
            alt="The CEO Agent"
            style={{ height: 52, width: "auto", margin: "0 auto 32px" }}
          />
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Run Your Company.<br />Let Your Bot Run Everything Else.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The CEO Bot handles briefings, communications, research, and follow-up so you can focus on what only you can do.
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
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Executive Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best CEOs Focus on What Only They Can Do
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Imagine walking into every day already briefed, every meeting already prepped, every follow-up already handled. Your team moves. Decisions get made. Nothing falls through.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            That is what a great executive assistant makes possible. The CEO Bot delivers that at a level no human EA can match, running 24 hours a day, across every system you use, without ever needing to be asked twice.
          </p>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              A Dedicated AI Bot for C-Suite Executives
            </h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
              Custom-configured for your workflows. Trained in your voice. Running from day one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-8 h-[2px] mb-4 rounded-full" style={{ background: RED }} />
                <h3 className="font-display text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-4xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>The Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>
              From Consultation to Running in 2 Weeks
            </h2>
          </div>
          <div className="flex flex-col gap-0">
            {process.map((p, i) => (
              <div key={i} className="flex gap-8 relative">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                    style={{ background: NAVY, color: "#fff", zIndex: 1 }}
                  >
                    {i + 1}
                  </div>
                  {i < process.length - 1 && (
                    <div className="w-[1px] flex-1 my-1" style={{ background: "rgba(11,23,41,0.12)" }} />
                  )}
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              What Executives Say After 30 Days
            </h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
              CEOs across industries are getting back their most valuable resource. Time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-7"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: RED }}>{t.industry}</p>
                <p className="font-body text-sm leading-relaxed text-white mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-mono text-xs font-bold" style={{ color: RED }}>{t.role}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-xs mt-8" style={{ color: "rgba(255,255,255,0.25)" }}>
            Outcomes from real client engagements. Names and identifying details changed or withheld at client request.
          </p>
        </div>
      </section>

      {/* Investment */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Investment</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            Built for Executives Who Value Their Time
          </h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every CEO Bot deployment is custom-scoped to your organization. Pricing is discussed during your consultation based on your workflows, integrations, and team size.
          </p>
          <a
            href="https://calendly.com/therealdaveo/apolloai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
            style={{
              background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em",
              padding: "14px 32px", borderRadius: 4, textDecoration: "none",
              boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
            }}
          >
            Schedule Your Consultation
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-7"
                style={{ background: CREAM2, border: "1px solid rgba(11,23,41,0.07)" }}
              >
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{f.q}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto max-w-4xl px-5 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12 items-start">
            <div className="flex flex-col items-center md:items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/david-oralevich.png"
                alt="David Oralevich"
                className="rounded-xl"
                style={{ width: "100%", maxWidth: 180, objectFit: "cover", filter: "grayscale(100%)" }}
              />
              <div>
                <p className="font-display text-sm font-bold text-white">David Oralevich</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Founder, Apollo Claw</p>
                <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Long Island, NY</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: RED }}>The Story</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">
                One Founder. Eighteen Years. One Unavoidable Conclusion.
              </h2>
              <div className="flex flex-col gap-4 font-body text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                <p>David Oralevich has spent his career at the edge of what is next. He rode the first wave of the internet in the late 90s, built Designs By Dave O. in 2007, and spent nearly two decades helping businesses compete and grow in a digital world.</p>
                <p>Then came AI. While the world was still debating ChatGPT, David was already working alongside senior engineers at leading AI startups, watching the technology develop before it hit the headlines.</p>
                <p>What he saw was a gap. Executives were the last to benefit from the AI revolution. The intelligence was there. But nobody had built it for the person running the organization.</p>
                <p>So he built it. Apollo Claw and a portfolio of industry-specific AI agents, each one purpose-built for a role. The CEO Bot is built on the same foundation.</p>
                <p>Every engagement is handled in-house, on Long Island, New York. No offshore teams. No outsourced builds. When you work with us, you work with us.</p>
              </div>
              <blockquote
                className="mt-8 pl-5 font-display text-lg text-white italic"
                style={{ borderLeft: `3px solid ${RED}` }}
              >
                &ldquo;Every revolution has an early chapter. The executives who read it first write the rest of the story.&rdquo;
                <footer className="font-mono text-xs mt-2 not-italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                  David Oralevich, Founder &amp; Chief Visionary Officer, Apollo Claw
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
