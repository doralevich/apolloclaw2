import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { OG_IMAGES } from "@/lib/seo";
import {
  CEO_AGENT_FAQS,
  CFO_AGENT_FAQS,
  GENERAL_FAQS,
  HOME_FAQS,
  INSURANCE_FAQS,
  LAW_AGENT_FAQS,
  LAW_FIRMS_FAQS,
  MEDICAL_FAQS,
  PERSONAL_INJURY_FAQS,
  REAL_ESTATE_FAQS,
  type Faq,
} from "@/config/faqs";

export const metadata: Metadata = {
  title: { absolute: "FAQ | AI Consulting Questions Answered | Apollo[Claw]" },
  description:
    "Every question we answer across the site, in one place: what agents do, how they connect to your tools, setup timelines, security, and each specialist agent.",
  alternates: {
    canonical: "https://apolloclaw.ai/faq",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "FAQ | AI Consulting Questions Answered",
    description:
      "Every question we answer across the site, in one place: what agents do, how they connect to your tools, setup timelines, security, and each specialist agent.",
    url: "https://apolloclaw.ai/faq",
  },
};

// Every FAQ on the site, grouped by where it comes from (David, Sept 27 2026). The lists live in
// config/faqs.ts, which the home page, the agent pages and the industry pages read too, so this
// page always carries every question the rest of the site asks.
const GROUPS: { id: string; title: string; href?: string; faqs: Faq[] }[] = [
  { id: "getting-started", title: "Getting Started", faqs: HOME_FAQS },
  { id: "general", title: "General Questions", faqs: GENERAL_FAQS },
  { id: "ceo-agent", title: "The CEO Agent", href: "/ai-agents/ceo", faqs: CEO_AGENT_FAQS },
  { id: "cfo-agent", title: "The CFO Agent", href: "/ai-agents/cfo", faqs: CFO_AGENT_FAQS },
  { id: "law-agent", title: "The Law Agent", href: "/ai-agents/legal", faqs: LAW_AGENT_FAQS },
  { id: "insurance", title: "Insurance", href: "/industries/insurance", faqs: INSURANCE_FAQS },
  { id: "law-firms", title: "Law Firms", href: "/industries/law-firms", faqs: LAW_FIRMS_FAQS },
  { id: "personal-injury", title: "Personal Injury Law", href: "/industries/personal-injury-law", faqs: PERSONAL_INJURY_FAQS },
  { id: "medical", title: "Medical Practices", href: "/industries/medical-practices", faqs: MEDICAL_FAQS },
  { id: "real-estate", title: "Real Estate", href: "/industries/real-estate", faqs: REAL_ESTATE_FAQS },
];

// Structured data lists each question once; several pages ask the same one ("How long does it
// take to get up and running?"), and the first answer wins.
const seen = new Set<string>();
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GROUPS.flatMap((g) => g.faqs)
    .filter((f) => (seen.has(f.q) ? false : (seen.add(f.q), true)))
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

const RED = "#D72B2B";

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHero
        label="FAQ"
        title="Frequently"
        titleAccent="Asked Questions"
        description="Everything you want to know before your first call, from getting started to each specialist agent."
      />
      <div className="bg-background py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Jump links, one per group */}
          <nav aria-label="FAQ topics" className="mb-14 flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="font-body rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors hover:border-[#D72B2B] hover:text-[#D72B2B]"
                style={{ borderColor: "rgba(11,23,41,0.15)", color: "#0B1729" }}
              >
                {g.title}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-16">
            {GROUPS.map((g) => (
              <section key={g.id} id={g.id} className="scroll-mt-36">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{g.title}</h2>
                  {g.href && (
                    <Link href={g.href} className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
                      Visit the page &rarr;
                    </Link>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {g.faqs.map((faq) => (
                    <div key={faq.q} className="bauhaus-card p-8">
                      <h3 className="font-display text-lg md:text-xl text-foreground mb-3">{faq.q}</h3>
                      <p className="font-body text-base text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
