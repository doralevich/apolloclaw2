import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "Enterprise AI Consulting & Implementation | Apollo Claw" },
  description:
    "Apollo Claw partners with enterprise leadership teams to design and deploy AI across the entire organization, department by department, from strategy to execution.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-enterprise" },
  openGraph: {
    title: "Enterprise AI Consulting & Implementation | Apollo Claw",
    description:
      "We partner with enterprise leadership teams to move AI from proof-of-concept to production, department by department.",
    url: "https://apolloclaw.ai/ai-consulting-enterprise",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "Department-Level AI, Organization-Wide Results",
    title: "Enterprise AI",
    titleAccent: "Consulting",
    description:
      "Most enterprise AI projects stall as pilots. Apollo Claw partners with leadership teams to move AI from proof-of-concept to production, department by department.",
    cta: { label: "Schedule an Enterprise Consultation", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Enterprise Problem",
      heading: "Why Enterprise AI",
      headingAccent: "Stalls",
      items: [
        { title: "Pilots That Never Scale", desc: "A promising proof-of-concept dies in committee and never reaches the teams who would benefit." },
        { title: "Junior Consultant Delivery", desc: "Big firms sell you senior partners and staff the work with rotating juniors who learn on your budget." },
        { title: "No Operational Continuity", desc: "The engagement ends, the deck ships, and nobody owns whether the AI actually keeps running." },
      ],
    },
    {
      type: "prose",
      kicker: "The Apollo Claw Approach",
      heading: "Give Every Team Its Own",
      headingAccent: "AI",
      paragraphs: [
        "Our Department Bot approach, ACROPOLIS, gives each team an AI agent trained on their specific workflows, not a single generic assistant bolted onto the org.",
        "We start where the return is clearest, prove it in production, and expand across departments from there. Leadership gets a program that compounds, not a pilot that stalls.",
      ],
    },
    {
      type: "bullets",
      kicker: "Departments We Automate",
      heading: "AI Wired Into Every",
      headingAccent: "Function",
      bullets: [
        "Marketing: content, campaigns, and reporting",
        "Sales: lead routing, follow-up, and CRM hygiene",
        "Finance: forecasting, close, and board prep",
        "Operations: workflow automation and vendor management",
        "HR: onboarding, internal support, and documentation",
      ],
    },
    {
      type: "prose",
      kicker: "Security & Data Governance",
      heading: "Enterprise-Grade by",
      headingAccent: "Default",
      paragraphs: [
        "Your business data stays in your environment. No vendor lock-in, no data leaving your control. Our approach to AI data security is built for organizations with real compliance obligations.",
        "See how we protect your operation on our security page.",
      ],
    },
    {
      type: "steps",
      kicker: "Engagement Model",
      heading: "How We",
      headingAccent: "Partner",
      steps: [
        { title: "Strategy", desc: "We align on the highest-value opportunities with your leadership team and set the roadmap." },
        { title: "Build", desc: "We architect and build department-level agents around your real workflows and systems." },
        { title: "Deploy", desc: "We move each agent from pilot to production and train the teams who use it." },
        { title: "Ongoing Optimization", desc: "We monitor, tune, and expand the program as the organization scales." },
      ],
    },
    {
      type: "cta",
      heading: "Move enterprise AI from pilot to",
      headingAccent: "production.",
      sub: "Schedule an enterprise consultation with Apollo Claw. Strategy through execution, department by department.",
      button: { label: "Schedule an Enterprise Consultation", href: "/contact" },
    },
  ],
};

export default function AiConsultingEnterprisePage() {
  return <SeoLanding data={data} />;
}
