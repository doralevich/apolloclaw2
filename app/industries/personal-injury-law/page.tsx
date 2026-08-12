import type { Metadata } from "next";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Personal Injury Law Firms | AI Intake Specialist | Apollo Claw" },
  description:
    "Apollo Claw deploys AI agents that handle intake triage, client communication, and document follow-up for personal injury law firms. Based on Long Island. Deployed nationwide.",
  alternates: {
    canonical: "https://apolloclaw.ai/industries/personal-injury-law",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agent for Personal Injury Law Firms | AI Intake Specialist | Apollo Claw",
    description:
      "AI intake specialist for injury law: 24/7 intake capture, automated follow-up, document reminders, and client status updates for personal injury practices.",
    url: "https://apolloclaw.ai/industries/personal-injury-law",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/industries/personal-injury-law#service",
      name: "AI Intake Specialist for Personal Injury Law Firms",
      description:
        "AI agent for personal injury law firms that captures intake 24/7, triages new injury inquiries, runs follow-up sequences, chases documents, and keeps clients updated through long case timelines.",
      provider: { "@type": "Organization", name: "Apollo Claw", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/industries/personal-injury-law",
      serviceType: "AI Client Intake and Case Communication for Personal Injury Law Firms",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/industries/personal-injury-law#faq",
      mainEntity: [
        { "@type": "Question", name: "What case management systems does the agent connect to?", acceptedAnswer: { "@type": "Answer", text: "We connect to Filevine, CASEpeer, Litify, Clio, MyCase, and most major personal injury practice platforms. Firms running on Outlook and shared drives work too - every engagement is scoped individually." } },
        { "@type": "Question", name: "Does the AI give legal advice to potential clients?", acceptedAnswer: { "@type": "Answer", text: "No. The agent is an intake specialist and case companion, not a lawyer. It collects the facts of the injury, screens against your case criteria, schedules the consultation, and keeps clients informed - attorneys make every legal judgment." } },
        { "@type": "Question", name: "How fast does it respond to a new injury inquiry?", acceptedAnswer: { "@type": "Answer", text: "Within minutes, at any hour. Injured people call whoever answers first - the agent responds immediately, collects the incident details, and gets a consultation on the calendar before a competing firm picks up the phone." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most firms are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing." } },
      ],
    },
  ],
};

const pains = [
  {
    title: "Intake Calls After Hours Go to Voicemail",
    desc: "Accidents don't happen on a schedule. An injured person calling at 9pm calls the next firm on the list when yours doesn't answer - and signs with whoever responds first.",
  },
  {
    title: "Slow Follow-Up Loses Signed Cases",
    desc: "A qualified inquiry that waits two days for a callback is a case retained by a competitor. Speed to contact decides who gets the retainer, and manual follow-up can't keep pace.",
  },
  {
    title: "Document Chaos Stalls Every Case",
    desc: "Medical records, police reports, insurance letters, employment records - chased by hand, tracked in inboxes, missing when the demand package needs to go out.",
  },
  {
    title: "Clients Go Quiet Cases Go Dark",
    desc: "PI timelines run months or years. Clients who hear nothing call constantly, leave bad reviews, or fire the firm mid-case. Nobody has the hours to update everyone every week.",
  },
];

const features = [
  {
    title: "24/7 Intake Capture",
    desc: "Every call, form fill, and message answered the moment it arrives - nights, weekends, trial days. The agent collects the incident facts, screens against your case criteria, and books the consultation.",
  },
  {
    title: "Automated Follow-Up Sequences",
    desc: "Unsigned prospects get a persistent, professional follow-up sequence until they sign or say no. No qualified injury case slips away because a callback fell off somebody's list.",
  },
  {
    title: "Document Request Reminders",
    desc: "Medical records, police reports, and insurance correspondence requested, tracked, and chased automatically. Your paralegals see what's outstanding on every case instead of hunting through inboxes.",
  },
  {
    title: "Status Update Responses",
    desc: "A case companion for every personal injury client: proactive updates at each milestone and instant answers to \"what's happening with my case\" - so clients stay informed through the longest timelines.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function PersonalInjuryLawPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Never Miss an<br />Injured Client Again.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            Apollo Claw&apos;s AI intake specialist for injury law answers every inquiry the moment it
            arrives, triages the case, follows up until the retainer is signed, and keeps every
            client informed from sign-up to settlement.
          </p>
          <div style={{ marginTop: 36 }}>
            <a href="https://cal.com/therealdaveo/apollo-claw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 30px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
              Schedule Your Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-5xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>The PI Problem</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
              Personal Injury Is Won at Intake and Lost in the Follow-Up
            </h2>
            <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
              PI firms don&apos;t lose cases in court. They lose them to the voicemail box, the slow
              callback, the records request nobody chased, and the client who stopped hearing from you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pains.map((p, i) => (
              <div key={i} className="rounded-xl p-7" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.07)" }}>
                <div className="w-8 h-[2px] mb-4 rounded-full" style={{ background: RED }} />
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{p.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">An AI Intake Specialist Built for Injury Law</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
              AI client intake for your law firm plus a case companion for every client you sign -
              configured for your case criteria and connected to your case management system.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* CTA */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Get Started</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            Built for PI Firms That Are Done Losing Cases to a Faster Phone
          </h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Based on Long Island. Deployed nationwide. Every deployment is custom-scoped to your
            firm&apos;s case criteria, intake volume, and systems - pricing is discussed during your
            consultation.
          </p>
          <a href="https://cal.com/therealdaveo/apollo-claw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>
    </>
  );
}
