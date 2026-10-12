import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import { OG_IMAGES, ORG_REF } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting in New York City | Apollo Claw" },
  description:
    "Apollo Claw brings enterprise-grade AI to NYC businesses: custom AI agents and hands-on implementation across Manhattan, Brooklyn, Queens and tri-state area.",
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

// A Service offered in NYC, provided by the one Organization in app/layout.tsx. This was a second
// ProfessionalService with its own name and address, so the site described two businesses.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://apolloclaw.ai/ai-consulting-nyc#service",
  name: "AI Consulting for New York City Businesses",
  serviceType: "AI Consulting and Implementation",
  description:
    "AI consulting for New York City businesses. Custom AI agents and hands-on implementation across Manhattan, Brooklyn, Queens, and the tri-state area.",
  url: "https://apolloclaw.ai/ai-consulting-nyc",
  areaServed: [
    { "@type": "City", name: "New York City" },
    { "@type": "Place", name: "Manhattan" },
    { "@type": "Place", name: "Brooklyn" },
    { "@type": "Place", name: "Queens" },
    { "@type": "Place", name: "Tri-State Area" },
  ],
  provider: ORG_REF,
};

const data: SeoLandingData = {
  hero: {
    label: "Manhattan · Brooklyn · Queens",
    title: "AI Consulting for New York City",
    titleAccent: "Businesses",
    description:
      "Apollo Claw brings enterprise-grade AI to NYC businesses: custom AI agents and hands-on implementation across Manhattan, Brooklyn, Queens and tri-state area.",
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
        { title: "Support & Expand", desc: "We tune it as it proves out and extend it to other teams and tasks as you grow." },
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
