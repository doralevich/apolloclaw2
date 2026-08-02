import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import { BUNDLE_PRICE_LABEL } from "@/lib/pricing/catalog";

export const metadata: Metadata = {
  title: { absolute: "Create an AI Agent for Your Business | Apollo Claw" },
  description:
    "Pick the role, tell us the job, and we build and host an AI agent that does the work inside the tools your team already uses. Live in about two weeks.",
  alternates: { canonical: "https://apolloclaw.ai/create-an-agent" },
  openGraph: {
    title: "Create an AI Agent for Your Business | Apollo Claw",
    description:
      "Pick the role, tell us the job, and we build and host an AI agent that does the work. Live in about two weeks.",
    url: "https://apolloclaw.ai/create-an-agent",
    type: "website",
  },
};

// Top-of-funnel landing page for the self-serve build flow. It explains the flow in plain
// language and hands off to /agents, which is the storefront where a type gets picked and
// Stripe checkout runs; onboarding then continues at /onboard/[agent]. Everything here is
// drawn from what the product actually does today (config/agent-types.ts, the real checkout
// and onboarding routes) so nothing on the page overstates the offer.
const data: SeoLandingData = {
  hero: {
    label: "Create an Agent",
    title: "Tell us the job.",
    titleAccent: "We build the employee.",
    description:
      "An Apollo[Claw] agent is not a chatbot. It is a role you fill. Pick the seat you need covered, tell us how the work gets done today, and we build, host, and maintain an agent that does it inside the tools your team already uses.",
    cta: { label: "Browse Agents", href: "/agents" },
  },
  sections: [
    {
      type: "steps",
      kicker: "How It Works",
      heading: "Four Steps to a Working",
      headingAccent: "Agent",
      steps: [
        {
          title: "Pick the Role",
          desc: "Start from a built agent: CEO, CFO, Legal, Medical, Insurance, Real Estate, Sales, or Recruiting. Each one already knows the shape of the job.",
        },
        {
          title: "Tell Us the Work",
          desc: "A short questionnaire covers your tools, your process, and the calls the agent is allowed to make on its own. No technical background needed.",
        },
        {
          title: "We Build and Connect It",
          desc: "We configure the agent, connect it to your email, calendar, CRM, and the rest of your stack, and test it against real work before it touches anything live.",
        },
        {
          title: "It Goes to Work",
          desc: "The agent runs day to day and checks with you before anything that matters. We tune it as your process changes.",
        },
      ],
    },
    {
      type: "columns",
      kicker: "What You Get",
      heading: "Built, Hosted, and",
      headingAccent: "Maintained",
      items: [
        {
          title: "A Configured Agent, Not a Template",
          desc: "Built around your actual workflow, your approval thresholds, and your tools, rather than a generic assistant you have to teach from scratch.",
        },
        {
          title: "Hosting and Upkeep Included",
          desc: "We run the infrastructure, keep the integrations working, and handle updates. Nothing for your team to deploy or babysit.",
        },
        {
          title: "Approval Before Action",
          desc: "You decide what the agent does on its own and what it brings to you first. It asks before anything consequential.",
        },
        {
          title: "Works Where You Work",
          desc: "Email, Slack, WhatsApp, Google Workspace, Microsoft 365, and the CRM you already run. No new place for your team to check.",
        },
      ],
    },
    {
      type: "bullets",
      kicker: "What It Handles",
      heading: "The Work That Never Makes It to the Top of the",
      headingAccent: "List",
      bullets: [
        "Intake, screening, and routing new inquiries",
        "Follow-up sequences that actually run every time",
        "Scheduling, confirmations, and reminders",
        "Research, summaries, and meeting prep",
        "Reporting pulled and drafted before you ask",
        "Status updates and internal chasing",
      ],
    },
    {
      type: "prose",
      kicker: "Pricing",
      heading: "One Build Fee, One Hosting",
      headingAccent: "Line",
      paragraphs: [
        `Apollo[Claw] agents are ${BUNDLE_PRICE_LABEL}. The build fee covers configuration, integration, and testing against your real workflow. Hosting covers the infrastructure, the integrations, and ongoing upkeep.`,
        "Most agents are live in about two weeks. If you would rather talk it through before starting, book a consultation and we will map where an agent helps first, with no obligation to buy.",
      ],
    },
    {
      type: "cta",
      heading: "Ready to create your",
      headingAccent: "agent?",
      sub: "Browse the built agents and start the setup, or book a call and we will help you pick the right seat to fill first.",
      button: { label: "Browse Agents", href: "/agents" },
    },
  ],
};

export default function CreateAnAgentPage() {
  return <SeoLanding data={data} />;
}
