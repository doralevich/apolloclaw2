import type { Metadata } from "next";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Law Agent | AI for Law Firms & Attorneys | Apollo[Claw]" },
  description:
    "The Law Agent automates client intake, case follow-ups, and legal communications. Built for attorneys and law firms.",
  alternates: {
    canonical: "https://apolloclaw.ai/industries/law-firms",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI for Law Firms | Client Intake & Case Follow-Up Automation | Apollo[Claw]",
    description:
      "The Law Agent automates client intake, deadline tracking, document summaries, and billing follow-up so your attorneys focus on billable work, not admin.",
    url: "https://apolloclaw.ai/industries/law-firms",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/industries/law-firms#service",
      name: "The Law Agent: AI for Law Firms",
      description: "AI assistant for law firms that automates client intake, deadline tracking, document summaries, and billing follow-up.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/industries/law-firms",
      serviceType: "AI Automation for Law Firms",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/industries/law-firms#faq",
      mainEntity: [
        { "@type": "Question", name: "What case management systems does the Law Agent connect to?", acceptedAnswer: { "@type": "Answer", text: "We connect to Clio, MyCase, PracticePanther, Filevine, and most major legal practice management platforms." } },
        { "@type": "Question", name: "How does client intake work?", acceptedAnswer: { "@type": "Answer", text: "The agent receives inquiries through your intake form, website, or email. It pre-screens for your practice areas, collects the relevant facts, and schedules consultations with the right attorney." } },
        { "@type": "Question", name: "Is client data secure and ethically compliant?", acceptedAnswer: { "@type": "Answer", text: "Yes. We build on your infrastructure and use least-privilege access throughout. All data handling is configured to meet your firm's ethical obligations and bar requirements." } },
        { "@type": "Question", name: "Will it replace my paralegals?", acceptedAnswer: { "@type": "Answer", text: "No. It removes the first-touch admin work: intake, scheduling, status updates, document routing, so your paralegals focus on substantive case support." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most firms are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training." } },
      ],
    },
  ],
};

const features = [
  { title: "Client Intake Automation", desc: "AI pre-screens inquiries, collects intake information, and routes qualified leads to the right attorney, before you touch it." },
  { title: "Deadline & Matter Tracking", desc: "Court dates, filing deadlines, and statute of limitations tracked automatically. Alerts go out before anything becomes urgent." },
  { title: "Research & Summary", desc: "Background on new matters, relevant case law, and document summaries delivered to your inbox. Research in minutes, not hours." },
  { title: "Document Organization", desc: "Incoming documents categorized, named, and filed automatically. Your team finds what they need without hunting through inboxes." },
  { title: "Client Communication", desc: "Status updates, document requests, and follow-up sequences handled automatically so clients stay informed without your team making calls." },
  { title: "Billing & Time Capture", desc: "Activity logging prompts sent at the end of every day to capture unbilled time before it disappears. Billing gaps close." },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We map your practice areas, connect your case management system, and configure the agent for your intake and matter workflow. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Intake inquiries get screened and routed automatically. Deadline alerts start running. Document summaries arrive before your first meeting on every new matter.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your preferred communication style, your matter types, and your billing patterns. Most firms report meaningful improvement in billable hour capture within the first month.",
  },
];

const testimonials = [
  {
    industry: "Litigation",
    quote: "Partners bill by the hour. Every minute I spent on admin was money we weren't capturing. The Law Agent handles my inbox triage, meeting prep, and follow-ups. I got back about ten hours a week. That's ten hours of billable work I was leaving on the table.",
    role: "Managing Partner",
    detail: "Litigation firm, 18 attorneys, Mid-Atlantic",
  },
  {
    industry: "Personal Injury",
    quote: "We get 200 intake inquiries a month. Before, half of them fell through because we couldn't follow up fast enough. The agent screens every inquiry within minutes, collects the basic facts, and schedules a consultation with the right attorney. Our retained cases went up 40%.",
    role: "Founding Partner",
    detail: "Personal injury practice, Long Island",
  },
  {
    industry: "Real Estate Law",
    quote: "Closing coordination is a constant back-and-forth between clients, lenders, and title. The agent manages the document collection, sends reminders, and tracks what's outstanding on every deal. Nothing falls through anymore.",
    role: "Real Estate Attorney",
    detail: "Boutique real estate law firm, Queens",
  },
  {
    industry: "Family Law",
    quote: "Family law clients need constant communication. They call constantly because they're anxious and don't know what's happening. The agent sends proactive updates at every milestone. My paralegal was spending 3 hours a day on status calls. Now it's under 30 minutes.",
    role: "Partner, Family Law Practice",
    detail: "12-attorney firm, Northeast",
  },
  {
    industry: "Corporate",
    quote: "We do M&A work and due diligence requires reviewing hundreds of documents. The agent pre-processes everything: categorizes it, flags the key issues, and gives my associates a starting point instead of a blank page. Deal timelines got shorter.",
    role: "Corporate Partner",
    detail: "Mid-market M&A practice, New York",
  },
  {
    industry: "Immigration",
    quote: "Immigration matters have long timelines and clients who need frequent updates. The agent tracks every case, sends status updates automatically, and alerts my team when government processing times change. Client satisfaction scores went up. Referrals followed.",
    role: "Managing Attorney",
    detail: "Immigration law firm, 6 attorneys",
  },
];

const faqs = [
  {
    q: "What case management systems does the Law Agent connect to?",
    a: "We connect to Clio, MyCase, PracticePanther, Filevine, and most major legal practice management platforms. We also work with firms using Outlook and shared drives. Every engagement is scoped individually.",
  },
  {
    q: "How does client intake work?",
    a: "The agent receives inquiries through your intake form, website, or email. It pre-screens for your practice areas, collects key facts, and routes qualified prospects to the right attorney with a summary already written.",
  },
  {
    q: "Is client data secure and ethically compliant?",
    a: "Yes. We build on your infrastructure and use least-privilege access throughout. All data handling is reviewed against applicable bar rules in your jurisdiction. We do not store client communications on third-party servers without explicit authorization.",
  },
  {
    q: "Will it replace my paralegals?",
    a: "No. It removes the first-touch admin work: intake, scheduling, status updates, document routing, so your paralegals focus on substantive legal support instead of coordination.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most firms are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your practice size, case types, and systems. Pricing is discussed during your consultation.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function LegalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Bill More Hours.<br />Miss Zero Deadlines.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The Law Agent handles client intake, deadline tracking, document summaries, and client communication so your attorneys stay focused on billable work.
          </p>
          <div style={{ marginTop: 36 }}>
            <a href="https://cal.com/therealdaveo/apollo-claw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 30px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
              Schedule Your Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-4xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Legal Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best Attorneys Focus on Law. Not Admin.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Client intake takes too long. Deadlines pile up across dozens of matters. Clients call for status updates nobody has time to give. Billing gaps eat into revenue that was already earned.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The Law Agent handles the administrative layer: intake, communication, deadline tracking, document routing, so your team spends time on legal work, not operational overhead.
          </p>
          <div className="mx-auto mt-10 max-w-2xl rounded-xl p-6 text-left" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.09)" }}>
            <p className="font-body text-base leading-relaxed" style={{ color: "rgba(11,23,41,0.75)" }}>
              Personal injury firm?{" "}
              <a href="/industries/personal-injury-law" className="font-bold underline underline-offset-4" style={{ color: RED }}>
                See how Apollo Claw handles intake and case management for PI practices specifically.
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Law Firms</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Custom-configured for your practice area. Connected to your case management system. Running from day one.</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What Law Firms Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Attorneys across practice areas are capturing more billable hours and losing fewer clients to slow follow-up.</p>
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
        <div className="container mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Investment</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Firms That Are Done Leaving Billable Hours on the Table</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every Law Agent deployment is custom-scoped to your firm. Pricing is discussed during your consultation based on your practice areas, matter volume, and systems.
          </p>
          <a href="https://cal.com/therealdaveo/apollo-claw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
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

    </>
  );
}
