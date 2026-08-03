import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Proof } from "@/components/home/Proof";
import { TwoFoldModel } from "@/components/home/TwoFoldModel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { LogoStrip } from "@/components/home/LogoStrip";

// The blog section reads from Sanity, so the homepage is now ISR rather than fully static.
// Hourly, matching /blog's own revalidate.
export const revalidate = 3600;

// "ai agents for business" used to canonical to the /ai-agents hub, so the homepage only
// targeted it softly to avoid competing with itself. That hub is gone (David's call), which
// leaves the homepage as the only page carrying the term — the title and description below
// are now the primary target for it, not a hedge. H1 stays the brand hero line.
export const metadata: Metadata = {
  title: { absolute: "AI Agents for Business | Apollo[Claw]" },
  description:
    "Apollo[Claw] builds AI agents for business that connect to your tools, work in Slack and WhatsApp, and ship real work with your approval. Get started today.",
  alternates: {
    canonical: "https://apolloclaw.ai",
  },
  openGraph: {
    title: "AI Agents for Business | Apollo[Claw]",
    description:
      "Apollo[Claw] builds AI agents for business that connect to your tools, work in Slack and WhatsApp, and ship real work with your approval. Get started today.",
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
      <TwoFoldModel />
      <LatestFromBlog />
      {/* Homepage only, per David's call. Was sitewide via RootShell. */}
      <LogoStrip />
    </>
  );
}
