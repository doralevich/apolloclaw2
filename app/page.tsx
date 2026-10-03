import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HeroSteps } from "@/components/home/HeroSteps";
import { BuiltForYou } from "@/components/home/BuiltForYou";
import { Proof } from "@/components/home/Proof";
import { AgentCards } from "@/components/home/AgentCards";
import { HomeFaq } from "@/components/home/HomeFaq";
import { LatestPosts } from "@/components/home/LatestPosts";
import { HOME_FAQS } from "@/config/faqs";
import { FinalCta } from "@/components/home/FinalCta";
import { OG_IMAGES } from "@/lib/seo";

// Title and description match the hero (David, Sept 27 2026): Apollo Claw as your AI Chief of Staff.
const TITLE = "Apollo Claw | Your AI Chief of Staff";
const DESCRIPTION =
  "A custom AI agent built around how you work. It keeps everything moving and gives you back your time. Book a discovery call.";

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

// The Latest Insights section reads the three newest posts from Sanity; refresh hourly like /blog.
export const revalidate = 3600;

// Section order per David's spec (Sept 27 2026), with his later calls: Hero, Three Steps, Built
// for You, Specialist Agents (moved up one), Proven Results, Latest Insights (Oct 3 2026), FAQ,
// Final CTA. The Founder Note came off. Backgrounds alternate: navy, cream, white, cream, navy,
// cream, white, cream. The sitewide PreFooter is skipped here (RootShell) because FinalCta
// closes the page.
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Hero />
      <HeroSteps />
      <BuiltForYou />
      <AgentCards />
      <Proof />
      <LatestPosts />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
