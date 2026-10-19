import Link from "next/link";
import AgentHero from "@/components/AgentHero";
import PageDates from "@/components/PageDates";
import { faqEntities, type Faq } from "@/config/faqs";
import { ORG_REF } from "@/lib/seo";

// The legal cluster's page template (Oct 19 2026): one practice area under /industries/law-firms,
// on the same hero and section rhythm as the law firms hub and the personal injury page, so the
// five read as one family. Driven by a data object so each page file is copy, the way
// SeoLanding works for the landing pages.
//
// What every practice page carries: the Law Agent hero, the practice's pains, what the agent
// does about them, the FAQs it renders (and marks up, the only place FAQPage is allowed), links
// across the cluster, and a consultation CTA. No price: prices live on /pricing and nowhere
// else (DECISIONS.md, Oct 19 2026).

export type PracticeAreaData = {
  slug: string;
  name: string;
  /** The hero. */
  badge: string;
  title: React.ReactNode;
  punch: string;
  sub: string;
  /** The practice's pains, in its own vocabulary. */
  painsKicker: string;
  painsHeading: string;
  painsIntro: string;
  pains: { title: string; desc: string }[];
  /** What the agent does about them. */
  featuresHeading: string;
  featuresIntro: string;
  features: { title: string; desc: string }[];
  faqs: Faq[];
  ctaHeading: string;
  ctaSub: string;
  /** ISO day the page's words last changed. */
  updated: string;
};

export const LAW_CLUSTER: { slug: string; label: string; href: string; desc: string }[] = [
  { slug: "law-firms", label: "AI for Law Firms", href: "/industries/law-firms", desc: "The hub: intake, deadlines, documents and billing for a firm of any size." },
  { slug: "personal-injury-law", label: "Personal Injury", href: "/industries/personal-injury-law", desc: "Intake answered within minutes, records chased, every client kept informed." },
  { slug: "family-law", label: "Family Law", href: "/industries/law-firms/family-law", desc: "Sensitive intake, financial disclosures, hearing dates and steady client updates." },
  { slug: "estate-planning", label: "Estate Planning", href: "/industries/law-firms/estate-planning", desc: "Intake questionnaires, first drafts from your templates, signings and review reminders." },
  { slug: "immigration", label: "Immigration", href: "/industries/law-firms/immigration", desc: "Filing windows, RFE deadlines, document checklists and status updates clients understand." },
  { slug: "commercial-litigation", label: "Commercial Litigation", href: "/industries/law-firms/commercial-litigation", desc: "Docket tracking, discovery organization, matter summaries and billing narratives." },
];

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";
const SITE = "https://apolloclaw.ai";

export default function PracticeAreaPage({ data }: { data: PracticeAreaData }) {
  const url = `${SITE}/industries/law-firms/${data.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `AI Agent for ${data.name} Firms`,
        serviceType: `AI Client Intake and Matter Support for ${data.name}`,
        description: data.sub,
        provider: ORG_REF,
        url,
        areaServed: "United States",
      },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: faqEntities(data.faqs) },
    ],
  };
  const siblings = LAW_CLUSTER.filter((c) => c.slug !== data.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageDates url={url} name={`AI Agent for ${data.name} Firms`} dateModified={data.updated} />
      <AgentHero agentTypeId="legal" badge={data.badge} title={data.title} punch={data.punch} sub={data.sub} />

      {/* The practice's pains */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>{data.painsKicker}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>{data.painsHeading}</h2>
            <p className="font-body text-lg leading-relaxed max-w-7xl mx-auto" style={{ color: "rgba(11,23,41,0.65)" }}>{data.painsIntro}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pains.map((p) => (
              <div key={p.title} className="rounded-xl p-7" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.07)" }}>
                <div className="w-8 h-[2px] mb-4 rounded-full" style={{ background: RED }} />
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{p.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What the agent does */}
      <section style={{ background: NAVY }} className="py-20 relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-7xl px-5 md:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>What It Does</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{data.featuresHeading}</h2>
            <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.55)" }}>{data.featuresIntro}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.features.map((f) => (
              <div key={f.title} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-[2px] mb-4 rounded-full" style={{ background: RED }} />
                <h3 className="font-display text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The line every Law Agent keeps */}
      <section style={{ background: CREAM }} className="py-16">
        <div className="container mx-auto max-w-4xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>The Standard</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4" style={{ color: NAVY }}>Attorneys Decide. The Agent Prepares.</h2>
          <p className="font-body text-base leading-relaxed" style={{ color: "rgba(11,23,41,0.65)" }}>
            Anything filed with a court, any advice given to a client, any view on the merits, and anything that needs a signature goes
            through a licensed attorney. The agent screens, drafts, tracks and reminds, and it drafts for approval until you widen its
            leash. Privilege is protected on every build; your firm&apos;s own confidentiality rules sit on top.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: CREAM2 }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>Questions {data.name} Firms Ask</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {data.faqs.map((f) => (
              <div key={f.q} className="rounded-xl p-7" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.07)" }}>
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{f.q}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The rest of the cluster */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>AI for Law Firms</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: NAVY }}>Every Practice Area We Build For</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {siblings.map((s) => (
              <Link key={s.href} href={s.href} className="block rounded-xl p-6 transition-transform hover:-translate-y-0.5" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.07)", textDecoration: "none" }}>
                <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>{s.label}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.6)" }}>{s.desc}</p>
                <span className="font-body text-sm font-bold mt-3 inline-block" style={{ color: RED }}>Read more →</span>
              </Link>
            ))}
          </div>
          <p className="font-body text-center text-sm mt-10" style={{ color: "rgba(11,23,41,0.6)" }}>
            The agent behind every one of these is <Link href="/ai-agents/legal" style={{ color: RED, fontWeight: 700 }}>the Law Agent</Link>, set up for your practice from a short questionnaire.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: NAVY }} className="py-20">
        <div className="container mx-auto max-w-7xl px-5 md:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>Get Started</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-white">{data.ctaHeading}</h2>
          <p className="font-body text-lg leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>{data.ctaSub}</p>
          <a href="https://cal.com/therealdaveo/dbdo-consultation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110" style={{ background: RED, color: "#ffffff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.35)" }}>
            Book a Discovery Call
          </a>
        </div>
      </section>
    </>
  );
}
