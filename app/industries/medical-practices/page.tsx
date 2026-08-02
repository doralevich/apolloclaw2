import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "AI for Medical Practices | Apollo[Claw]" },
  description:
    "The Medical Agent automates appointment reminders, patient intake, and follow-up. HIPAA-aware. Most practices see no-shows drop within 30 days.",
  openGraph: {
    title: "AI for Medical Practices | Reduce No-Shows & Automate Patient Follow-Up",
    description: "The Medical Agent handles scheduling, patient follow-up, documentation prep, and intake so your providers stay focused on care.",
    url: "https://apolloclaw.ai/industries/medical-practices",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/industries/medical-practices#service",
      name: "The Medical Agent: AI for Healthcare Practices",
      description: "HIPAA-compliant AI assistant for medical practices that automates scheduling, patient follow-up, intake, and documentation prep.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/industries/medical-practices",
      serviceType: "AI Automation for Medical Practices",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/industries/medical-practices#faq",
      mainEntity: [
        { "@type": "Question", name: "What EHR and practice management systems does the Medical Agent connect to?", acceptedAnswer: { "@type": "Answer", text: "We connect to athenahealth, Epic, DrChrono, Kareo, Jane App, and most major EHR and practice management platforms." } },
        { "@type": "Question", name: "Is this HIPAA compliant?", acceptedAnswer: { "@type": "Answer", text: "Yes. We execute a Business Associate Agreement with every healthcare client. All data handling follows HIPAA requirements throughout." } },
        { "@type": "Question", name: "Will it replace my front desk staff?", acceptedAnswer: { "@type": "Answer", text: "No. It removes the high-volume repetitive work, reminders, intake collection, follow-up sequences, so your staff can focus on patients in the room." } },
        { "@type": "Question", name: "How does the scheduling integration work?", acceptedAnswer: { "@type": "Answer", text: "We connect to your existing scheduling system. The agent reads availability and books, confirms, and reschedules appointments automatically." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most practices are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training." } },
      ],
    },
  ],
};

const features = [
  { title: "Scheduling Automation", desc: "AI handles appointment bookings, confirmations, reminders, and cancellations so your front desk focuses on patients in the room." },
  { title: "Patient Follow-Up", desc: "Post-visit follow-up messages, lab result notifications, and care plan reminders sent automatically at the right time." },
  { title: "Intake & Documentation Prep", desc: "Structured intake summaries and pre-visit documentation so providers walk in already briefed, not typing to catch up." },
  { title: "Insurance & Prior Auth", desc: "Eligibility checks initiated, prior authorization requests tracked, and status updates sent without your team chasing payers." },
  { title: "No-Show Recovery", desc: "Automated re-engagement sequences reach patients who miss appointments and get them rescheduled before the slot is gone." },
  { title: "Recall & Preventive Outreach", desc: "Annual exams, preventive screenings, and chronic care follow-ups scheduled proactively based on your patient recall criteria." },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We map your scheduling workflow, connect your EHR and communication tools, and configure the agent for your practice type. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "Appointment reminders go out automatically. Intake forms arrive before visits. Follow-up sequences run after every encounter. Your team handles care, not coordination.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Smarter Over Time",
    desc: "The agent learns your scheduling patterns, your patient communication preferences, and your recall criteria. Most practices see measurable reduction in no-shows within the first month.",
  },
];

const testimonials = [
  {
    industry: "Primary Care",
    quote: "We were losing 18% of our appointments to no-shows. The Medical Agent sends a reminder 72 hours out, 24 hours out, and the morning of. No-shows dropped to under 6%. That's revenue we were leaving on the table every single day.",
    role: "Practice Manager",
    detail: "Multi-provider primary care practice, Long Island",
  },
  {
    industry: "Specialty",
    quote: "Prior auth was eating 12 hours a week of my staff's time. The agent initiates the request, tracks the status, and alerts us when action is needed. My team went from chasing payers to managing exceptions. The time savings paid for the whole thing.",
    role: "Office Manager",
    detail: "Orthopedic specialty group, Northeast",
  },
  {
    industry: "Dental",
    quote: "Recall outreach used to be a manual project we ran twice a year. The agent runs it continuously; every patient due for a cleaning gets a sequence automatically. Our hygiene schedule is 95% full for the first time in years.",
    role: "Practice Owner",
    detail: "Multi-location dental practice, New York",
  },
  {
    industry: "Mental Health",
    quote: "Intake paperwork was a bottleneck before every first appointment. Now the agent sends the forms 48 hours ahead, follows up if they're not completed, and gives me a summary before the session starts. My first appointments are completely different.",
    role: "Licensed Psychologist",
    detail: "Private practice, Manhattan",
  },
  {
    industry: "Urgent Care",
    quote: "We see 120 patients a day and our follow-up was nonexistent. The agent sends a post-visit summary and satisfaction check to every patient within 2 hours of discharge. Our online reviews went from 3.6 to 4.4 stars in 60 days.",
    role: "Medical Director",
    detail: "Urgent care network, 4 locations",
  },
  {
    industry: "Chiropractic",
    quote: "Patient retention was our biggest challenge. People come in for an acute issue and disappear after three visits. The agent sends check-ins, progress questions, and reactivation messages at 30, 60, and 90 days. Retention is up 35%.",
    role: "Clinic Owner",
    detail: "Chiropractic practice, Long Island",
  },
];

const faqs = [
  {
    q: "What EHR and practice management systems does the Medical Agent connect to?",
    a: "We connect to athenahealth, Epic, DrChrono, Kareo, Jane App, and most major EHR and practice management platforms. Every engagement is scoped individually.",
  },
  {
    q: "Is this HIPAA compliant?",
    a: "Yes. We execute a Business Associate Agreement with every healthcare client. All data handling follows HIPAA requirements and we do not store protected health information on systems outside your approved infrastructure.",
  },
  {
    q: "Will it replace my front desk staff?",
    a: "No. It removes the high-volume repetitive work, reminders, intake collection, follow-up sequences, so your staff can focus on the patients in front of them.",
  },
  {
    q: "How does the scheduling integration work?",
    a: "We connect to your existing scheduling system. The agent reads availability and books, confirms, and reschedules appointments based on rules you define. No double-booking, no overrides.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most practices are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your practice size, patient volume, and systems. Pricing is discussed during your consultation.",
  },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function HealthcarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "3.75em", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            See More Patients.<br />Lose Fewer to No-Shows.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The Medical Agent handles scheduling, patient follow-up, documentation prep, and intake so your providers stay focused on care.
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
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Healthcare Intelligence</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            The Best Practices Focus on Patients. Not Paperwork.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Your staff is spending hours every day on reminders, intake collection, follow-up calls, and scheduling coordination. Every minute on admin is a minute away from the patient in front of them.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The Medical Agent handles the operational layer, scheduling, reminders, follow-up, intake, recall, so your team spends time on care, not coordination.
          </p>
        </div>
      </section>

      {/* What It Does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-5xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Medical Practices</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Custom-configured for your practice type. Connected to your EHR. Running from day one.</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What Medical Practices Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Practices across specialties are seeing fewer no-shows, fuller schedules, and staff that actually has time to breathe.</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Practices Ready to Deliver Better Care at Scale</h2>
          <p className="font-body text-lg leading-relaxed mb-6" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every Medical Agent deployment is custom-scoped to your practice. Pricing is discussed during your consultation based on your patient volume, specialty, and systems.
          </p>
          <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full" style={{ background: "rgba(11,23,41,0.06)", border: "1px solid rgba(11,23,41,0.1)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill={NAVY} opacity="0.6"/>
            </svg>
            <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: NAVY, opacity: 0.7 }}>HIPAA Compliant</span>
          </div>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Meet Your AI Medical Agent?</h2>
          <p className="font-body text-base mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            Schedule a 30-minute consultation. We will show you exactly how The Medical Agent would be configured for your practice.
          </p>
          <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: "#ffffff", color: RED, fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none" }}>
            Schedule Your Consultation
          </a>
        </div>
      </section>
    </>
  );
}
