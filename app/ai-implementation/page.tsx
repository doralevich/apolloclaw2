import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "AI Implementation Services | Custom Build & Deployment | Apollo Claw" },
  description:
    "Apollo Claw is an AI implementation partner that designs, builds, and deploys custom AI agents inside your existing business. Strategy through execution. No slide decks.",
  alternates: { canonical: "https://apolloclaw.ai/ai-implementation" },
  openGraph: {
    title: "AI Implementation Services | Custom Build & Deployment | Apollo Claw",
    description:
      "Apollo Claw designs, builds, and deploys custom AI agents inside your existing business. Strategy through execution.",
    url: "https://apolloclaw.ai/ai-implementation",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "Strategy Through Execution",
    title: "AI Implementation",
    titleAccent: "Services",
    description:
      "There is a difference between an AI consultant who hands you a roadmap and an AI implementation partner who builds the system. Apollo Claw does the second thing. We design, build, and deploy custom AI agents inside your existing business, then stay on to keep them working.",
    cta: { label: "Book a Free Discovery Call", href: "/contact" },
  },
  sections: [
    {
      type: "prose",
      kicker: "What Implementation Means",
      heading: "Advice Is Cheap. A",
      headingAccent: "Working System Is Not.",
      paragraphs: [
        "Most AI consulting stops at the recommendation: a strategy deck, a vendor shortlist, a workshop, and an invoice. You are left to build it yourself.",
        "AI implementation is the opposite. As your implementation partner, we build the actual AI infrastructure inside your operation, connect it to the tools you already use, train your team on it, and stay on to make sure it keeps performing as your business changes.",
        "We build, and we stay. That is the difference.",
      ],
    },
    {
      type: "steps",
      kicker: "Implementation Process",
      heading: "How We",
      headingAccent: "Deploy",
      steps: [
        { title: "Discovery & Audit", desc: "We map your workflows, tools, and bottlenecks to find where AI recovers the most time and money." },
        { title: "Design & Build", desc: "We architect and build a custom AI agent around your real processes, not a generic template." },
        { title: "Deploy & Train", desc: "We connect the agent to your stack, put it live, and train your team to work with it day to day." },
        { title: "Optimize & Scale", desc: "We monitor performance, tune the system, and expand it to new workflows as you grow." },
      ],
    },
    {
      type: "bullets",
      kicker: "What We Connect To",
      heading: "Plugs Into the Tools You",
      headingAccent: "Already Run",
      intro: "Your agent works inside your existing stack, with connections to more than 250 apps.",
      bullets: [
        "Gmail and Google Workspace",
        "Microsoft 365 and Outlook",
        "Slack and Microsoft Teams",
        "HubSpot, Salesforce, and Pipedrive",
        "Shopify and Stripe",
        "QuickBooks and Xero",
        "Notion, Asana, and ClickUp",
        "Zendesk and Intercom",
      ],
    },
    {
      type: "columns",
      kicker: "Business Sizes We Serve",
      heading: "One Approach, Every",
      headingAccent: "Scale",
      items: [
        { title: "Small Business", desc: "Solo operators and teams under 50 get a custom agent that automates the busywork, without an enterprise price tag." },
        { title: "Mid-Market", desc: "Growing teams get AI wired into sales, ops, and finance so headcount is not the only path to more output." },
        { title: "Enterprise", desc: "Leadership teams get department-level AI that moves from pilot to production, department by department." },
      ],
    },
    {
      type: "columns",
      kicker: "Why Apollo Claw",
      heading: "Why Teams Pick Us Over the",
      headingAccent: "Big Firms",
      items: [
        { title: "Boutique Speed", desc: "No layers, no handoffs. We move from discovery to a working system in weeks, not quarters." },
        { title: "Senior-Level Engagement", desc: "You work directly with the people building your system, not a rotating junior team." },
        { title: "You Get the Builder", desc: "The person who scopes your project is the person who ships it and stands behind it." },
      ],
    },
    {
      type: "cta",
      heading: "Ready to move from AI curiosity to AI",
      headingAccent: "operations?",
      sub: "Book a free 30-minute discovery call. You bring the bottlenecks, we bring the build.",
      button: { label: "Book a Free Discovery Call", href: "/contact" },
    },
  ],
};

export default function AiImplementationPage() {
  return <SeoLanding data={data} />;
}
