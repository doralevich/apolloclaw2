import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { HeroSteps } from "@/components/home/HeroSteps";
import { BuiltForYou } from "@/components/home/BuiltForYou";
import { Proof } from "@/components/home/Proof";
import { AgentCards } from "@/components/home/AgentCards";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HOME_FAQS } from "@/config/faqs";
import { FinalCta } from "@/components/home/FinalCta";
import { OG_IMAGES } from "@/lib/seo";

// The title and description match the hero (components/home/Hero.tsx), David's final call on
// Oct 19 2026 closing the SEO brief: the H1 in the title. Oct 25: the description is the "Who We
// Are" body text David picked, the same words as the hero subline, with the company named so it
// stands alone in a search snippet. Root layout's default title and description say the same
// thing.
const TITLE = "Custom AI Agents Built for Your Business | Apollo Claw";
const DESCRIPTION =
  "Apollo Claw handles the infrastructure, workflows, training, deployment and ongoing support, so your team can focus on the work that needs human judgment.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://apolloclaw.ai",
  },
  openGraph: {
    images: OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    url: "https://apolloclaw.ai",
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

// The FAQ section's questions as structured data, from the same list the accordion renders.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// Section order per David's spec (Sept 27 2026), with his later calls: Hero, What We Do, Three Steps, Built
// for You, Specialist Agents (moved up one), Proven Results, FAQ, Final CTA.
// The Founder Note came off, and Latest Insights (added Oct 3 2026) came off again Oct 4.
// Backgrounds: navy, cream, white, cream, navy, white, cream. The sitewide PreFooter is skipped here (RootShell) because FinalCta
// closes the page.
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Hero />
      <WhatWeDo />
      <HeroSteps />
      <BuiltForYou />
      <AgentCards />
      <Proof />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
