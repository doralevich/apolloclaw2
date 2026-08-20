import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import { OG_IMAGES } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting in New York City | Apollo Claw" },
  description:
    "Apollo Claw brings enterprise-grade AI to NYC businesses. Custom AI agents, hands-on implementation, no fluff. Serving Manhattan, Brooklyn, Queens, and the tri-state area.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-nyc" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Consulting in New York City | Apollo Claw",
    description:
      "Enterprise-grade AI for NYC businesses. Custom AI agents and hands-on implementation across Manhattan, Brooklyn, Queens, and the tri-state area.",
    url: "https://apolloclaw.ai/ai-consulting-nyc",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://apolloclaw.ai/ai-consulting-nyc#business",
  name: "Apollo[Claw] AI Consulting",
  description:
    "AI consulting for New York City businesses. Custom AI agents and hands-on implementation across Manhattan, Brooklyn, Queens, and the tri-state area.",
  url: "https://apolloclaw.ai/ai-consulting-nyc",
  telephone: "+1-917-363-5487",
  address: {
    "@type": "PostalAddress",
    streetAddress: "69 Roslyn Road",
    addressLocality: "Roslyn Heights",
    addressRegion: "NY",
    postalCode: "11577",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Place", name: "New York City" },
    { "@type": "Place", name: "Manhattan" },
    { "@type": "Place", name: "Brooklyn" },
    { "@type": "Place", name: "Queens" },
    { "@type": "Place", name: "Tri-State Area" },
  ],
  provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
};

const data: SeoLandingData = {
  hero: {
    label: "Manhattan · Brooklyn · Queens",
    title: "AI Consulting for New York City",
    titleAccent: "Businesses",
    description:
      "Apollo Claw brings enterprise-grade AI to NYC businesses. Custom AI agents, hands-on implementation, no fluff. Serving Manhattan, Brooklyn, Queens, and the tri-state area.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Pace",
      heading: "NYC Moves Fast. Your AI Should",
      headingAccent: "Too.",
      intro:
        "In New York, the advantage goes to whoever executes first. We deploy agents that carry real weight from day one, not pilots that sit in a slide deck.",
      items: [
        { title: "Speed to Value", desc: "Most clients are live in weeks, not quarters. We handle the build, the integration, and the training so you see results fast." },
        { title: "Enterprise-Grade, No Bloat", desc: "The security and rigor a serious business needs, without the enterprise price tag or the year-long rollout." },
        { title: "Hands-On, Not Hands-Off", desc: "We implement with you, in your tools and your workflows. You get a working agent, not a strategy document." },
      ],
    },
    {
      type: "steps",
      kicker: "What We Deliver",
      heading: "What Apollo Claw",
      headingAccent: "Delivers",
      steps: [
        { title: "Discovery & Audit", desc: "We map your workflows and pinpoint where an agent has the clearest impact on your business." },
        { title: "Build & Integrate", desc: "We configure the agent and connect it to the software you already run across your team." },
        { title: "Deploy & Train", desc: "Your people work alongside the agent from day one, with guardrails set to how you operate." },
        { title: "Support & Expand", desc: "We tune it as it proves out and extend it to new teams and tasks as you grow." },
      ],
    },
    {
      type: "bullets",
      kicker: "Industries",
      heading: "Industries We Work With in",
      headingAccent: "NYC",
      bullets: [
        "Financial and professional services",
        "Legal and accounting firms",
        "Real estate and property management",
        "Media, marketing, and creative agencies",
        "Healthcare and medical practices",
        "E-commerce and retail",
        "Hospitality and food service",
        "Nonprofits and associations",
      ],
    },
    {
      type: "cta",
      heading: "Ready to Put AI to Work in Your",
      headingAccent: "Business?",
      sub: "Book a discovery call. We will show you exactly where AI helps first, across Manhattan, Brooklyn, Queens, and the tri-state area.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiConsultingNycPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLanding data={data} />
    </>
  );
}
