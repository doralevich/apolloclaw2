import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "Enterprise AI Solutions & Implementation | Apollo Claw" },
  description:
    "Apollo Claw helps leadership teams design and deploy AI across the organization, department by department, from strategy through execution.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-enterprise" },
  openGraph: {
    title: "Enterprise AI Solutions & Implementation | Apollo Claw",
    description:
      "We partner with enterprise leadership teams to move AI from proof-of-concept to production, department by department.",
    url: "https://apolloclaw.ai/ai-consulting-enterprise",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "Department-Level AI, Organization-Wide Results",
    title: "Enterprise",
    titleAccent: "Solutions",
    description:
      "Apollo Claw partners with leadership teams to move AI from proof-of-concept to production, department by department.",
    cta: { label: "Schedule an Enterprise Consultation", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Apollo Claw Difference",
      heading: "Enterprise AI, Done",
      headingAccent: "Right",
      items: [
        { title: "Built to Scale From Day One", desc: "We architect every deployment for organization-wide rollout from the start, not a demo built to impress a committee." },
        { title: "Senior Team, Start to Finish", desc: "The senior team that scopes your engagement is the same team that builds and ships it. No rotating juniors learning on your budget." },
        { title: "Ongoing Ownership", desc: "We stay accountable for uptime and outcomes long after the deck ships, monitoring and tuning the program as it runs." },
      ],
    },
    {
      type: "prose",
      kicker: "The Apollo Claw Approach",
      heading: "Give Every Team Its Own",
      headingAccent: "AI",
      paragraphs: [
        "Our Department Bot approach gives each team an AI agent trained on their specific workflows, not a single generic assistant bolted onto the org.",
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
      ],
    },
    {
      type: "bullets",
      kicker: "What We Offer",
      heading: "Security",
      headingAccent: "Options",
      intro: "See the full breakdown, including infrastructure and access controls, on our security page.",
      bullets: [
        "SOC 2 Type I compliant, with SOC 2 Type II on track for completion by end of September 2026",
        "GDPR compliant, with consent-based analytics and deletion on request",
        "Payment data handled by Stripe under PCI DSS, never touching our systems",
        "Encrypted in transit (TLS 1.3 with HSTS) and at rest (AES-256), with credentials and API keys stored in encrypted vaults",
        "Least-privilege access controls, with multi-factor authentication enforced on every administrative and infrastructure account",
        "Written security policies, an incident-response plan, and a vendor security packet available to your IT and procurement teams",
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
