import type { Metadata } from "next";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Law AI Agent | Contract Drafting & Review for Businesses | Apollo[Claw]" },
  description: "The Law Agent drafts and reviews contracts, summarizes documents in plain English, and tracks obligations and renewals. AI built for businesses that live in contracts.",
  alternates: {
    canonical: "https://thelawagent.ai",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "The Law Agent: AI Contract Drafting and Review for Business",
    description: "The Law Agent is your AI legal drafting assistant: it drafts from your templates, redlines against your positions, and never lets a renewal date slip.",
    url: "https://apolloclaw.ai/ai-agents/legal",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/ai-agents/legal#service",
      name: "The Law Agent: AI Legal Drafting and Review",
      description: "AI assistant for legal work that drafts contracts from your templates, reviews and redlines incoming agreements, summarizes documents in plain English, and tracks obligations and renewals. A drafting and review tool, not a substitute for a licensed attorney.",
      provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
      url: "https://apolloclaw.ai/ai-agents/legal",
      serviceType: "AI Automation for Legal and Contract Work",
      areaServed: "United States",
    },
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/ai-agents/legal#faq",
      mainEntity: [
        { "@type": "Question", name: "Is the Law Agent a substitute for a lawyer?", acceptedAnswer: { "@type": "Answer", text: "No. It is a drafting and review tool, not a licensed attorney, and it does not provide legal advice. It removes the production work of drafting and reviewing so your team or your counsel can focus on judgment. A qualified attorney should review anything binding before you sign or file." } },
        { "@type": "Question", name: "What tools does the Law Agent work with?", acceptedAnswer: { "@type": "Answer", text: "It works where your documents already live: Microsoft Word, Google Docs, DocuSign, common CLM platforms, and your file storage in SharePoint, OneDrive, Google Drive, or Box. Every engagement is scoped individually." } },
        { "@type": "Question", name: "How long does it take to get up and running?", acceptedAnswer: { "@type": "Answer", text: "Most clients are live within two weeks. We onboard the agent on your templates and standard positions, connect your tools, and configure how it drafts and reviews." } },
        { "@type": "Question", name: "Is our data confidential?", acceptedAnswer: { "@type": "Answer", text: "Yes. We use least-privilege access throughout and honor the confidentiality rules you set, including keeping privileged material off shared systems. Your data does not pass through servers we do not control." } },
        { "@type": "Question", name: "Can it draft from our own templates and playbook?", acceptedAnswer: { "@type": "Answer", text: "Yes. That is the point. The agent works from your template library and standard positions, so first drafts and redlines start from your language, not a generic form." } },
      ],
    },
  ],
};

const features = [
  { title: "Contract Drafting", desc: "First versions drafted from your own templates and standard positions, so a new NDA or MSA starts from your language, not a blank page." },
  { title: "Review & Redlining", desc: "Incoming agreements read against your playbook, with the off-market terms flagged and a redline drafted before it reaches your desk." },
  { title: "Plain-English Summaries", desc: "Any document summarized in language a business owner can follow, including what each party is agreeing to and what they are risking." },
  { title: "Obligation & Renewal Tracking", desc: "Deadlines, auto-renewals, and notice windows tracked across every agreement, so nothing lapses or renews by surprise." },
  { title: "Policy Generation", desc: "Standard policies drafted to order, including privacy policies, terms of service, and internal handbooks, ready for counsel to review." },
  { title: "A Clause Library That Stays Current", desc: "Your approved clauses and templates kept in one place and reused, so the whole team drafts from the same, latest language." },
];

const process = [
  {
    phase: "Day 1",
    title: "We Configure Your Agent",
    desc: "We load your templates and standard positions, connect the tools your documents live in, and set the rules for what the agent drafts, reviews, and escalates. No IT team required.",
  },
  {
    phase: "Week 1",
    title: "Your Agent Goes to Work",
    desc: "First drafts come back from your templates. Incoming contracts get summarized and redlined against your playbook. Renewal dates start showing up before they matter, not after.",
  },
  {
    phase: "Month 1+",
    title: "It Gets Sharper Over Time",
    desc: "The agent learns your positions, your preferred language, and the terms you always push back on. Routine agreements move in hours instead of sitting in an inbox for a week.",
  },
];

const testimonials = [
  {
    industry: "Professional Services",
    quote: "Every NDA used to start from scratch and sit in my inbox for days. Now the agent drafts it from our template the moment we need one, and I review instead of retype. Turnaround went from a week to the same afternoon.",
    role: "Operations Lead, Consulting Firm",
    detail: "40-person firm, Northeast",
  },
  {
    industry: "Technology",
    quote: "We sign a lot of vendor and customer agreements and I could never keep the renewals straight. The Law Agent tracks every obligation and notice window and tells me before anything auto-renews. That alone paid for it.",
    role: "COO, SaaS Company",
    detail: "Series B, remote",
  },
  {
    industry: "Real Estate",
    quote: "It reads an incoming lease and hands me a plain-English summary plus a redline against our standard positions. I still make the calls, but I am starting from something instead of a fifty-page PDF.",
    role: "Principal, Commercial Real Estate",
    detail: "Portfolio of 14 properties",
  },
  {
    industry: "Law Firm",
    quote: "For routine, low-risk documents it drafts the first pass and flags anything unusual for an attorney to look at. Our associates spend their time on the judgment calls, not on producing boilerplate.",
    role: "Managing Partner, Boutique Firm",
    detail: "Small firm, Mid-Atlantic",
  },
];

const faqs = [
  {
    q: "Is the Law Agent a substitute for a lawyer?",
    a: "No. It is a drafting and review tool, not a licensed attorney, and it does not provide legal advice. It removes the production work so your team or your counsel can focus on judgment. A qualified attorney should review anything binding before you sign or file, and the agent recommends exactly that.",
  },
  {
    q: "What tools does the Law Agent work with?",
    a: "It works where your documents already live: Microsoft Word, Google Docs, DocuSign, common contract-management platforms, and your storage in SharePoint, OneDrive, Google Drive, or Box. Every engagement is scoped to your setup.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. We onboard the agent on your templates and standard positions, connect your tools, and configure how it drafts, reviews, and escalates.",
  },
  {
    q: "Can it draft from our own templates and playbook?",
    a: "Yes, and it should. The agent works from your template library and standard positions, so first drafts and redlines start from your language rather than a generic form.",
  },
  {
    q: "Is our data confidential?",
    a: "Yes. We use least-privilege access throughout and honor the confidentiality rules you set, including keeping privileged material off shared systems. Your data does not pass through servers we do not control.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is custom-scoped based on your document volume, your systems, and how much you want the agent to own. Pricing is discussed during your consultation.",
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
            Draft Faster.<br />Review Smarter.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 820, margin: "24px auto 0" }}>
            The Law Agent handles the recurring, time-intensive legal production that clogs your week; drafting from your templates, redlining incoming contracts, and tracking every obligation, so the people who make the judgment calls stop producing paperwork.
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
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Legal Leverage</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            Good Lawyers Make Judgment Calls. Not First Drafts.
          </h2>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>
            Contracts sit in an inbox for a week. Every NDA starts from scratch. Nobody is quite sure what renews when. The routine drafting and review that fills the day is exactly the work that does not need a legal mind, only a legal template.
          </p>
          <p className="font-body text-lg leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "rgba(11,23,41,0.65)" }}>
            The Law Agent handles that production, drafting from your templates, redlining against your positions, and tracking every deadline, on schedule. Your team, or your counsel, shows up to review and decide, not to retype.
          </p>
        </div>
      </section>

      {/* What is an AI Law Agent? - SEO Section */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>About</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
            What is an AI Law Agent?
          </h2>
          <div className="flex flex-col gap-4 font-body text-base leading-relaxed" style={{ color: "rgba(11,23,41,0.7)" }}>
            <p>
              An <strong>AI law agent</strong> is a purpose-built AI system that takes over the recurring legal work a business and its counsel spend the most time on: drafting contracts from templates, reviewing and redlining incoming agreements, summarizing documents in plain English, and tracking obligations, deadlines, and renewals. Unlike a generic AI chatbot, it works from your own templates and standard positions and connects to where your documents actually live.
            </p>
            <p>
              Think of it as an <strong>AI contract assistant</strong> that never loses track of a renewal. It drafts the first version, flags the clauses that fall outside your positions, explains what a party is agreeing to, and keeps the calendar of every notice window and expiry. Small and mid-size businesses gain the most: the drafting and review muscle of a larger legal team without the headcount.
            </p>
            <p>
              A word on what it is not. The Law Agent from Apollo Claw is a <strong>drafting and review tool, not a licensed attorney, and it does not give legal advice.</strong> Nothing it produces creates an attorney-client relationship, and it recommends review by qualified counsel before you sign, file, or rely on anything binding. What it removes is the production work, so the people who do give advice spend their time on judgment instead of paperwork.
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">A Dedicated AI Agent for Contract Work</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>Configured on your templates. Connected to your systems. Drafting from day one.</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">What Teams Say After 30 Days</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Businesses across industries are moving contracts in hours, not weeks, and never missing a renewal.</p>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>Built for Teams Who Are Done Retyping Contracts</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(11,23,41,0.65)" }}>
            Every Law Agent deployment is custom-scoped to your organization. Pricing is discussed during your consultation based on your document volume, your systems, and how much you want the agent to own.
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
