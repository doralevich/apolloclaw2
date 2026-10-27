import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import PageDates from "@/components/PageDates";
import { OG_IMAGES, ORG_REF, breadcrumbJsonLd } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";
import { LONG_ISLAND_FAQS, faqEntities } from "@/config/faqs";

// The day this page's words last changed. Drives the WebPage dateModified and the visible
// "Last updated" line at once (components/PageDates.tsx); app/sitemap.ts carries the same day.
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  // The SEO brief's copy (Donna, Oct 9 2026). This page is the canonical target for the
  // Long Island query; the blog post that competed with it gets a different intent in Sanity.
  title: { absolute: "AI Consulting for Long Island Businesses | Apollo Claw" },
  description:
    "Long Island AI consulting for owner-led businesses. We set up a private AI agent on your own hardware, train your team and support you after launch.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-long-island" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Consulting for Long Island Businesses | Apollo Claw",
    description:
      "Long Island AI consulting for owner-led businesses. We set up a private AI agent on your own hardware, train your team and support you after launch.",
    url: "https://apolloclaw.ai/ai-consulting-long-island",
    type: "website",
  },
};

// A Service offered on Long Island, provided by the one Organization in app/layout.tsx. This was
// a second ProfessionalService with its own name and address, so the site described two businesses.
// Beside it (Oct 27 2026): the crumb trail, which components/seo/Breadcrumbs.tsx leaves to
// one-level pages, and the FAQ section's questions from the same list the page renders. The
// WebPage node with dateModified comes from <PageDates> under the hero.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://apolloclaw.ai/ai-consulting-long-island#service",
      name: "AI Consulting for Long Island Businesses",
      serviceType: "AI Consulting and Implementation",
      description:
        "AI consulting for Long Island businesses. We install custom AI agents into local companies across Nassau and Suffolk counties.",
      url: "https://apolloclaw.ai/ai-consulting-long-island",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Nassau County, NY" },
        { "@type": "AdministrativeArea", name: "Suffolk County, NY" },
        { "@type": "Place", name: "Long Island, NY" },
      ],
      provider: ORG_REF,
    },
    breadcrumbJsonLd([
      { name: "Home", url: "https://apolloclaw.ai/" },
      { name: "AI Consulting for Long Island", url: "https://apolloclaw.ai/ai-consulting-long-island" },
    ]),
    {
      "@type": "FAQPage",
      "@id": "https://apolloclaw.ai/ai-consulting-long-island#faq",
      mainEntity: faqEntities(LONG_ISLAND_FAQS),
    },
  ],
};

const data: SeoLandingData = {
  hero: {
    label: "Nassau & Suffolk Counties",
    title: "AI Consulting for Long Island",
    titleAccent: "Businesses",
    description:
      "Apollo Claw is Long Island's AI consulting firm. We install custom AI agents into local businesses, no tech background required. Based in Roslyn Heights, NY.",
    cta: { label: "Book a Free Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  afterHero: (
    <PageDates
      url="https://apolloclaw.ai/ai-consulting-long-island"
      name="AI Consulting for Long Island Businesses"
      description="Long Island AI consulting for owner-led businesses: a private AI agent set up, your team trained and supported after launch."
      dateModified={UPDATED}
      show
      byline
    />
  ),
  sections: [
    {
      type: "columns",
      kicker: "Why Now",
      heading: "Why Long Island Businesses Are Adopting AI",
      headingAccent: "Now",
      intro:
        "The businesses that move first are pulling ahead. The tools are finally good enough to do real work, and the gap between the owners who adopt and the ones who wait is widening every quarter.",
      items: [
        { title: "Labor Is Tight and Expensive", desc: "Hiring on Long Island is hard and getting harder. An agent takes the repetitive load off the team you already have." },
        { title: "The Tools Finally Work", desc: "AI has crossed from novelty to genuinely useful. The question is no longer if, but who sets it up right." },
        { title: "Your Competitors Are Moving", desc: "The local business next door is already testing this. First movers set the pace, and the pace is quickening." },
      ],
    },
    {
      type: "bullets",
      kicker: "Scope",
      heading: "What We Do (and What We",
      headingAccent: "Don't)",
      intro:
        "We are deliberate about the line. It is what keeps delivery fast and the quality consistent.",
      bullets: [
        "We do: install a dedicated AI agent trained on how your business runs",
        "We do: connect it to the software you already use",
        "We do: handle setup, integration, and training, so you don't need a tech background",
        "We do: tune and support it as your needs change",
        "We don't: sell you a generic chatbot and disappear",
        "We don't: require you to become a prompt engineer to get value",
      ],
    },
    {
      type: "columns",
      kicker: "The Difference",
      heading: "Local. Accountable.",
      headingAccent: "Results-Driven.",
      items: [
        { title: "Local", desc: "We are based in Roslyn Heights and serve businesses across Nassau and Suffolk. We can meet you in person, not just over a screen." },
        { title: "Accountable", desc: "One firm, one point of contact, standing behind the build. If something needs fixing, you know exactly who to call." },
        { title: "Results-Driven", desc: "We install agents to remove real work and give you real time back, not to check an innovation box." },
      ],
    },
    {
      type: "faq",
      kicker: "Questions Buyers Ask",
      heading: "Before You",
      headingAccent: "Call",
      items: LONG_ISLAND_FAQS,
    },
    {
      type: "cta",
      heading: "Book a Free Discovery Call. We Come to",
      headingAccent: "You.",
      sub: "Serving Long Island from our office at 69 Roslyn Road, Roslyn Heights, NY. We will show you exactly where AI helps first in your business.",
      button: { label: "Book a Free Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiConsultingLongIslandPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLanding data={data} />
    </>
  );
}
