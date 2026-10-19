import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import PageDates from "@/components/PageDates";
import { OG_IMAGES, ORG_REF } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The category pillar: the one page that says what an AI agent for a business is, who it is
// for, where it runs, what it does, and which page to read next. Rebuilt around the home
// page's positioning (David, Oct 19 2026): an agent is built for one person or one department,
// and runs on a Mac Mini on your network or a private virtual server. Every agent, industry
// and comparison page hangs off it. Copy approved by David before merge.

const URL = "https://apolloclaw.ai/ai-agent-for-business";
const UPDATED = "2026-10-19";

export const metadata: Metadata = {
  title: { absolute: "AI Agents for Business: A Plain-English Guide | Apollo Claw" },
  description:
    "What an AI agent for a business is, who it is for, where it runs and what it does on day one. The category guide, with the agents and comparisons behind it.",
  alternates: { canonical: URL },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agents for Business: A Plain-English Guide | Apollo Claw",
    description: "What an AI agent for a business is, who it is for, where it runs and what it does on day one.",
    url: URL,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${URL}#service`,
  name: "AI Agents for Business",
  description:
    "Apollo Claw designs, builds and runs private AI agents for individuals and departments at businesses and law firms, on a Mac Mini on your network or a private virtual server.",
  provider: ORG_REF,
  url: URL,
  serviceType: "AI Agent Design, Deployment and Support",
  areaServed: "United States",
};

const data: SeoLandingData = {
  hero: {
    label: "AI Agents for Business",
    title: "An AI Agent for Your Business:",
    titleAccent: "The Plain-English Guide",
    description:
      "An AI agent is a private assistant built for one person or one department. It knows your business, works across the tools you already use, and runs on a Mac Mini on your network or a private virtual server. This page explains what that means, what it does, and where to go next.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "prose",
      kicker: "What It Is",
      heading: "A Member of Staff, Built From",
      headingAccent: "Your Answers",
      paragraphs: [
        "A chatbot answers questions on a website. An AI agent does work. It reads your inbox and drafts the replies in your voice. It keeps your calendar and prepares a one-pager before each meeting. It chases the invoice, the records request and the candidate who went quiet. It files the document where you keep documents and sends you a brief each morning. It drafts for your approval until you tell it otherwise.",
        "Every Apollo Claw agent starts from a short questionnaire: your business, your people, your tools, how you write, what you want handed over first. The answers become the files that define the agent, written in your words, and those files are yours to read and change.",
        "One agent, one owner. It is built for one person or one department, which is why it sounds like someone who already works for you rather than a product with your logo on it.",
      ],
    },
    {
      type: "columns",
      kicker: "Who It Is For",
      heading: "Built for One Person or One",
      headingAccent: "Department",
      items: [
        { title: "The Owner or Partner", desc: "A chief of staff for the person whose inbox, calendar and follow-ups are the bottleneck. The CEO Agent is this one." },
        { title: "The Finance Desk", desc: "A daily cash view, invoice follow-up and flagged exceptions before the first coffee. The CFO Agent." },
        { title: "The Front Desk", desc: "Calls answered, questions handled, appointments booked and messages routed, at the busiest hour and after it. The Receptionist Agent." },
        { title: "The Practice or Firm", desc: "Intake screened within minutes, deadlines tracked, records chased, status updates drafted for approval. The Law Agent and the industry agents." },
        { title: "Sales and Recruiting", desc: "Every lead and every candidate answered quickly, qualified and kept warm, with the pipeline current. The Sales and Recruiting Agents." },
        { title: "People Operations", desc: "PTO requests, onboarding steps and policy questions from your handbook, with records kept straight. The HR Agent." },
      ],
    },
    {
      type: "compare",
      kicker: "Where It Runs",
      heading: "A Mac Mini on Your Network or a",
      headingAccent: "Private Virtual Server",
      intro: "Same agent either way. The choice is where the data sits and who holds the keys.",
      columns: ["Mac Mini on your network", "Private virtual server"],
      rows: [
        { label: "Where the data lives", a: "In your building, on a machine you own.", b: "On a dedicated server reserved for your agent alone." },
        { label: "Time to launch", a: "A custom build, first session within two business days.", b: "About 15 minutes online from the questionnaire." },
        { label: "Access", a: "Yours after hand-over. No inbound connections.", b: "Key-based only, patched and monitored by us." },
        { label: "Best fit", a: "Data that must stay on premises.", b: "Data that already lives in cloud tools, and a launch this week." },
      ],
    },
    {
      type: "steps",
      kicker: "How It Happens",
      heading: "From a Conversation to an Agent at",
      headingAccent: "Work",
      steps: [
        { title: "A Discovery Call", desc: "Forty-five minutes on how your week runs and where the time goes. Free, and the scope comes out of it." },
        { title: "The Questionnaire", desc: "Your business, people, tools, voice and the job the agent should own first. About 15 minutes." },
        { title: "The Build", desc: "Online on a private virtual server in about 15 minutes, or a custom build on a Mac Mini. Tools connected through their own permissions." },
        { title: "Rehearsal and Training", desc: "Real scenarios from your business before go-live, then hands-on onboarding with every custom build, with support a message away." },
      ],
    },
    {
      type: "bullets",
      kicker: "What Is Included",
      heading: "What Every Agent Comes",
      headingAccent: "With",
      bullets: [
        "A persona, memory and rules written from your answers, in files you can read",
        "Connections to email, calendar, documents, CRM and the systems your industry runs on",
        "A choice of model underneath: Claude, GPT, Gemini or Grok, switchable from a menu",
        "Approval before anything goes out on your behalf, for as long as you want it",
        "Hosting, monitoring and updates, on a Mac Mini on your network or a private virtual server",
        "Support a Telegram message away, and hands-on training with every custom build",
      ],
    },
    {
      type: "links",
      kicker: "Compare",
      heading: "The Three Decisions Buyers",
      headingAccent: "Weigh",
      intro: "Each one gets its own page, with the honest cases for the other side.",
      links: [
        { label: "Mac Mini vs Private Virtual Server", desc: "Where should the agent run? Setup, security, access and who should pick which.", href: "/compare/mac-mini-vs-private-virtual-server" },
        { label: "AI Agent vs Chatbot", desc: "One answers questions. The other does the work. When a chatbot is enough.", href: "/compare/ai-agent-vs-chatbot" },
        { label: "AI Consultant vs In House", desc: "Time to value, what you keep, and when building it yourself is the right call.", href: "/compare/ai-consultant-vs-in-house" },
      ],
    },
    {
      type: "links",
      kicker: "Go Deeper",
      heading: "The Agents and the",
      headingAccent: "Industries",
      links: [
        { label: "Every Agent We Build", desc: "CEO, CFO, Sales, Recruiting, Law, Insurance, Medical, Real Estate, HR, Receptionist and Personal.", href: "/ai-agents" },
        { label: "AI for Law Firms", desc: "Intake, deadlines, records and billing for a firm of any size.", href: "/industries/law-firms" },
        { label: "AI for Medical Practices", desc: "Patient intake, reminders and follow-ups for medical and dental practices.", href: "/industries/medical-practices" },
        { label: "AI for Insurance Agencies", desc: "Renewals, quotes and claims status for agencies and brokers.", href: "/industries/insurance" },
        { label: "Use Cases by Job", desc: "One page per job an agent does, from inbox triage to month-end close.", href: "/use-cases" },
        { label: "How It Runs, Securely", desc: "The controls on both hosting options, in plain language.", href: "/security" },
      ],
    },
    {
      type: "cta",
      heading: "Ready to Give an Agent Its",
      headingAccent: "First Job?",
      sub: "Bring the three things that eat your week to a discovery call. We will tell you which one an agent should take first.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiAgentForBusinessPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageDates url={URL} name="AI Agents for Business" dateModified={UPDATED} />
      <SeoLanding data={data} />
    </>
  );
}
