import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LogoStrip } from "@/components/home/LogoStrip";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Proof } from "@/components/home/Proof";
import { ThreeWaysIn } from "@/components/home/ThreeWaysIn";
import { TwoFoldModel } from "@/components/home/TwoFoldModel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Close } from "@/components/home/Close";

// Per the SEO/metadata spec (master brief section 5.5): "ai agents for business" canonicals to
// the /ai-agents hub, so the homepage only targets it SOFTLY (title, description, one early body
// line) rather than competing for the term outright. H1 stays the brand hero line.
export const metadata: Metadata = {
  title: "AI Agents for Business | Apollo[Claw]",
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
      <WhatWeDo />
      <Proof />
      <ThreeWaysIn />
      <TwoFoldModel />
      <TrustStrip />
      <Close />
      {/* Sits directly above the Footer's "Weekly Claw" newsletter box (David's call). */}
      <LogoStrip />
    </>
  );
}
