import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Proof } from "@/components/home/Proof";
import { TwoFoldModel } from "@/components/home/TwoFoldModel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { IndustryCards } from "@/components/home/IndustryCards";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { LogoStrip } from "@/components/home/LogoStrip";
import { OG_IMAGES } from "@/lib/seo";

// The blog section reads from Sanity, so the homepage is now ISR rather than fully static.
// Hourly, matching /blog's own revalidate.
export const revalidate = 3600;

// "ai agents for business" used to canonical to the /ai-agents hub, so the homepage only
// targeted it softly to avoid competing with itself. That hub is gone (David's call), which
// leaves the homepage as the only page carrying the term — the title and description below
// are now the primary target for it, not a hedge. H1 stays the brand hero line.
export const metadata: Metadata = {
  title: { absolute: "AI Agents for Business | AI Consulting Firm | Apollo[Claw]" },
  description:
    "Apollo[Claw] is an AI consulting firm serving businesses across New York, Long Island, NYC, and nationwide. We build AI agents that connect to your tools and ship real work with your approval.",
  alternates: {
    canonical: "https://apolloclaw.ai",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agents for Business | AI Consulting Firm | Apollo[Claw]",
    description:
      "Apollo[Claw] is an AI consulting firm in Long Island, NY serving businesses nationwide. AI agents that connect to your tools, work in Slack and WhatsApp, and ship real work with your approval.",
    url: "https://apolloclaw.ai",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Order per David's call: positioning first ("What Is an AI Implementation Partner?"),
          then the client results, then the product explainer with the John demo. */}
      <TrustStrip />
      <Proof />
      <WhatWeDo />
      <IndustryCards />
      {/* "Self hosted and cloud hosted" sits below the blog, per David's call. It also breaks
          up two adjacent navy bands: industry cards (navy) -> blog (tan) -> deploy options
          (navy) alternates, where the previous order stacked the two navy sections. */}
      <LatestFromBlog />
      <TwoFoldModel />
      {/* Homepage only, per David's call. Was sitewide via RootShell. */}
      <LogoStrip />
    </>
  );
}
