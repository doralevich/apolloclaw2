import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | Apollo[Claw]",
  description: "Real businesses. Real results. See how Apollo[Claw] AI agents are transforming operations across industries.",
};

const cases = [
  // CEO
  {
    agent: "The CEO Agent",
    industry: "Insurance",
    result: "Renewal retention up. Zero micromanaging.",
    quote: "We were losing renewals not because of price but because nobody followed up in time. The CEO Agent now flags every policy 90 days out, drafts the outreach, and makes sure my producers actually send it. Retention is up and I stopped micromanaging the process.",
    role: "CEO, Independent Insurance Agency",
    detail: "Regional firm, 12 producers, Southeast",
    href: "/use-cases/ceo",
  },
  {
    agent: "The CEO Agent",
    industry: "Executive",
    result: "Cleared the bottleneck. Things move now.",
    quote: "I have a great team but I was still the bottleneck on everything. Decisions sat with me, follow-ups sat with me, research sat with me. The CEO Agent cleared the queue. Things move now without me touching them, and I only get involved when I actually need to.",
    role: "Founder & CEO",
    detail: "B2B services company, 45 employees",
    href: "/use-cases/ceo",
  },
  // CFO
  {
    agent: "The CFO Agent",
    industry: "Finance",
    result: "Close cycle cut from 11 days to 6.",
    quote: "Our month-end close used to take eleven days. We're at six now. The CFO Agent pulls the data, flags the variances, and drafts the narrative. My team reviews instead of produces. That's the difference.",
    role: "CFO, Regional Insurance Group",
    detail: "Multi-line carrier, $180M in premiums",
    href: "/use-cases/cfo",
  },
  {
    agent: "The CFO Agent",
    industry: "Healthcare",
    result: "Revenue cycle reporting, every morning.",
    quote: "Revenue cycle reporting was always a week behind. The CFO Agent runs it nightly. I walk in every morning knowing exactly where we are on collections, denials, and AR aging. No surprises.",
    role: "CFO, Multi-Site Medical Group",
    detail: "8 locations, Northeast",
    href: "/use-cases/cfo",
  },
  // Medical
  {
    agent: "The Medical Agent",
    industry: "Primary Care",
    result: "No-shows dropped from 18% to under 6%.",
    quote: "We were losing 18% of our appointments to no-shows. The Medical Agent sends a reminder 72 hours out, 24 hours out, and the morning of. No-shows dropped to under 6%. That's revenue we were leaving on the table every single day.",
    role: "Practice Manager",
    detail: "Multi-provider primary care practice, Long Island",
    href: "/use-cases/health",
  },
  {
    agent: "The Medical Agent",
    industry: "Urgent Care",
    result: "Online reviews from 3.6 to 4.4 stars in 60 days.",
    quote: "We see 120 patients a day and our follow-up was nonexistent. The agent sends a post-visit summary and satisfaction check to every patient within 2 hours of discharge. Our online reviews went from 3.6 to 4.4 stars in 60 days.",
    role: "Medical Director",
    detail: "Urgent care network, 4 locations",
    href: "/use-cases/health",
  },
  // Insurance
  {
    agent: "The Insurance Agent",
    industry: "Agency",
    result: "Revenue up 22% year over year.",
    quote: "I have 8 producers and nobody was consistent on follow-up. The agent runs a follow-up sequence on every quote, every prospect, every renewal. My whole agency is consistent now. Revenue is up 22% year over year.",
    role: "Agency Owner",
    detail: "Multi-line independent agency, 8 producers",
    href: "/use-cases/insurance",
  },
  {
    agent: "The Insurance Agent",
    industry: "Health & Benefits",
    result: "Twice the volume. No additional staff.",
    quote: "Open enrollment is a 90-day sprint and we have 200 employer groups. The agent manages the entire communication calendar: reminders, enrollment confirmations, deadline alerts. My team handled twice the volume without adding staff.",
    role: "Benefits Agency Principal",
    detail: "Group health and benefits, 200 employer groups",
    href: "/use-cases/insurance",
  },
  // Real Estate
  {
    agent: "The Real Estate Agent",
    industry: "Residential",
    result: "Lead conversion from 12% to over 20%.",
    quote: "I was losing leads because I couldn't follow up fast enough. The Real Estate Agent follows up within two minutes of an inquiry, qualifies the buyer, and schedules the showing. I went from converting 12% of leads to over 20% in the first month.",
    role: "Licensed Real Estate Agent",
    detail: "Boutique residential brokerage, Northeast",
    href: "/use-cases/real-estate",
  },
  {
    agent: "The Real Estate Agent",
    industry: "Brokerage",
    result: "30 agents. One consistent follow-up standard.",
    quote: "Managing 30 agents meant 30 different ways of handling leads. Now everyone's follow-up is consistent, fast, and professional. The agent runs it all. My job became managing outcomes instead of managing process.",
    role: "Principal Broker & Owner",
    detail: "Independent brokerage, 30 agents",
    href: "/use-cases/real-estate",
  },
  // Legal
  {
    agent: "The Law Agent",
    industry: "Personal Injury",
    result: "Retained cases up 40%.",
    quote: "We get 200 intake inquiries a month. Before, half of them fell through because we couldn't follow up fast enough. The agent screens every inquiry within minutes, collects the basic facts, and schedules a consultation with the right attorney. Our retained cases went up 40%.",
    role: "Founding Partner",
    detail: "Personal injury practice, Long Island",
    href: "/use-cases/legal",
  },
  {
    agent: "The Law Agent",
    industry: "Litigation",
    result: "10 billable hours recovered per week.",
    quote: "Partners bill by the hour. Every minute I spent on admin was money we weren't capturing. The Law Agent handles my inbox triage, meeting prep, and follow-ups. I got back about ten hours a week. That's ten hours of billable work I was leaving on the table.",
    role: "Managing Partner",
    detail: "Litigation firm, 18 attorneys, Mid-Atlantic",
    href: "/use-cases/legal",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

const agentColor: Record<string, string> = {
  "The CEO Agent": "#D72B2B",
  "The CFO Agent": "#D72B2B",
  "The Medical Agent": "#D72B2B",
  "The Insurance Agent": "#D72B2B",
  "The Real Estate Agent": "#D72B2B",
  "The Law Agent": "#D72B2B",
};

export default function CaseStudiesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-4xl relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Client Results</p>
          <h1 className="font-display leading-[1.05] tracking-tight text-white mb-6" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800 }}>
            Real Businesses.<br />Real Results.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: "0 auto" }}>
            These are outcomes from actual Apollo[Claw] deployments across six industries. Identifying details are withheld at client request.
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-5xl px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((c, i) => (
              <div
                key={i}
                className="rounded-xl p-8 flex flex-col"
                style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.08)", boxShadow: "0 2px 12px rgba(11,23,41,0.04)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: RED }}>{c.agent}</span>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "rgba(11,23,41,0.4)" }}>{c.industry}</span>
                </div>
                <p className="font-display text-base font-bold mb-4" style={{ color: NAVY }}>{c.result}</p>
                <p className="font-body text-sm leading-relaxed flex-1 mb-6" style={{ color: "rgba(11,23,41,0.65)" }}>&ldquo;{c.quote}&rdquo;</p>
                <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(11,23,41,0.07)" }}>
                  <p className="font-mono text-xs font-bold" style={{ color: NAVY }}>{c.role}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(11,23,41,0.4)" }}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-xs mt-10" style={{ color: "rgba(11,23,41,0.3)" }}>
            Representative client experiences. Identifying details withheld at client request.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Your Industry</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Want to See Results From Your Industry?</h2>
          <p className="font-body text-base mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            Book a discovery call and we will walk you through relevant examples specific to your business, workflow, and goals.
          </p>
          <a
            href="https://calendly.com/therealdaveo/apolloai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
            style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}
          >
            Schedule a Discovery Call
          </a>
        </div>
      </section>
    </>
  );
}
