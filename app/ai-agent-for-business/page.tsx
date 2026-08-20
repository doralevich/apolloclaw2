import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import { OG_IMAGES } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Business | Apollo Claw" },
  description:
    "Apollo Claw installs a dedicated AI agent into your business that thinks, acts, and communicates like your best employee. Built for business owners who want results, not hype.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agent-for-business" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agent for Business | Apollo Claw",
    description:
      "A dedicated AI agent installed into your business that thinks, acts, and communicates like your best employee.",
    url: "https://apolloclaw.ai/ai-agent-for-business",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://apolloclaw.ai/ai-agent-for-business#service",
  name: "AI Agent for Business",
  description:
    "Apollo Claw builds and deploys a dedicated AI agent for your business, connected to your tools and trained on how you work.",
  provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
  url: "https://apolloclaw.ai/ai-agent-for-business",
  serviceType: "AI Agent Deployment for Business",
  areaServed: "United States",
};

const data: SeoLandingData = {
  hero: {
    label: "AI Agent for Business",
    title: "Your Business Deserves a Dedicated",
    titleAccent: "AI Agent",
    description:
      "Apollo Claw installs a dedicated AI agent into your business that thinks, acts, and communicates like your best employee. Built for owners who want results, not hype.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "columns",
      kicker: "What It Does",
      heading: "What an AI Agent Actually Does for Your",
      headingAccent: "Business",
      intro:
        "Not a chatbot bolted onto your website. A dedicated agent that does real work inside the business, every day.",
      items: [
        { title: "Runs the Repetitive Work", desc: "The follow-ups, the data entry, the status updates, the chasing. The tasks that eat your team's day and never end." },
        { title: "Answers and Follows Up", desc: "Fields inbound questions, drafts replies in your voice, and keeps every thread moving so nothing slips through the cracks." },
        { title: "Works Inside Your Tools", desc: "Connected to the software you already run, so it acts where the work actually happens instead of asking you to switch tabs." },
        { title: "Knows Your Business", desc: "Trained on how you operate, who you serve, and what matters, so it reads like someone who already works for you." },
      ],
    },
    {
      type: "steps",
      kicker: "How We Deploy",
      heading: "How Apollo Claw Builds and Deploys Your",
      headingAccent: "Agent",
      steps: [
        { title: "Discovery & Audit", desc: "We map your workflows and find where an agent has the clearest, fastest impact on your day." },
        { title: "Build & Integrate", desc: "We configure the agent for your business and connect it to the tools you already use. No technical background required." },
        { title: "Deploy & Train", desc: "Your team works alongside the agent from day one, with a persona and boundaries set to how you run." },
        { title: "Support & Expand", desc: "We tune it as it proves out and extend it to new tasks and teams once it is earning its keep." },
      ],
    },
    {
      type: "bullets",
      kicker: "Industries We Serve",
      heading: "Built for the Way You",
      headingAccent: "Work",
      bullets: [
        "Medical and dental practices",
        "Law firms and legal services",
        "Real estate and property management",
        "Insurance agencies",
        "Accounting and financial services",
        "E-commerce and retail",
        "Professional and consulting services",
        "Nonprofits and associations",
      ],
    },
    {
      type: "bullets",
      kicker: "What's Included",
      heading: "What's",
      headingAccent: "Included",
      bullets: [
        "A dedicated AI agent, hosted and managed, not a shared tool",
        "A custom persona trained on your business, voice, and priorities",
        "Connection to the software you already run",
        "Communication where you work, in the platform or through Slack and Telegram",
        "Hard guardrails: a spend ceiling and access it cannot step outside of",
        "Ongoing tuning and support as your needs change",
      ],
    },
    {
      type: "cta",
      heading: "Ready to Install Your",
      headingAccent: "AI Agent?",
      sub: "Book a discovery call. We will show you exactly where an agent helps first in your business.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiAgentForBusinessPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLanding data={data} />
    </>
  );
}
