import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HeroSteps } from "@/components/home/HeroSteps";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Proof } from "@/components/home/Proof";
import { TwoFoldModel } from "@/components/home/TwoFoldModel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { IndustryCards } from "@/components/home/IndustryCards";
import { AgentCards } from "@/components/home/AgentCards";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { LogoStrip } from "@/components/home/LogoStrip";
import { OG_IMAGES } from "@/lib/seo";

// The blog section reads from Sanity, so the homepage is now ISR rather than fully static.
// Hourly, matching /blog's own revalidate.
export const revalidate = 3600;

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

export default function HomePage() {
  return (
    <>
      <Hero />
      <HeroSteps />
      {/* Order per David's call: positioning first (the Built for You section),
          then the client results, then the product explainer with the John demo. */}
      <TrustStrip />
      <Proof />
      <WhatWeDo />
      <IndustryCards />
      {/* The nav's two axes, in the same order the menu lists them. Agents sits on the elevated
          navy so the pair reads as one idea rather than as the stacked-navy accident the comment
          below warns about. */}
      <AgentCards />
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
