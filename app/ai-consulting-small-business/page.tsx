import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting for Small Business | Apollo Claw" },
  description:
    "Apollo Claw helps small businesses implement AI that actually works. Custom AI agents, workflow automation, and hands-on support, without the enterprise price tag. Free 30-min call.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-small-business" },
  openGraph: {
    title: "AI Consulting for Small Business | Apollo Claw",
    description:
      "Custom AI agents, workflow automation, and hands-on support for small businesses, without the enterprise price tag.",
    url: "https://apolloclaw.ai/ai-consulting-small-business",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "AI Consulting for Small Business",
    title: "AI Consulting for",
    titleAccent: "Small Business",
    description:
      "Most small businesses can automate 10 to 20 hours of weekly work within the first 30 days. Apollo Claw finds where, builds the system, and keeps it running.",
    cta: { label: "Book a Free 30-Minute Call", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Problem",
      heading: "Why Small Businesses Stay",
      headingAccent: "Stuck",
      items: [
        { title: "Too Much Manual Work", desc: "Email, scheduling, follow-ups, and data entry eat the hours you should spend growing the business." },
        { title: "No Internal AI Expertise", desc: "You know AI could help, but nobody on the team has time to figure out what to build or how." },
        { title: "Off-the-Shelf Tools Hit a Ceiling", desc: "Generic apps do one thing. They do not connect your workflow end to end or adapt to how you actually work." },
      ],
    },
    {
      type: "steps",
      kicker: "What We Do",
      heading: "From Audit to",
      headingAccent: "Autopilot",
      steps: [
        { title: "Audit Your Workflows", desc: "We look at where your team loses the most time and where AI pays off fastest." },
        { title: "Build a Custom Agent", desc: "We design and deploy an AI agent around your real processes and the tools you already use." },
        { title: "Train Your Team", desc: "Your team learns to work with the agent the same way they would text a coworker." },
        { title: "Provide Ongoing Support", desc: "We keep the system tuned and expand it as your business grows." },
      ],
    },
    {
      type: "bullets",
      kicker: "What You Get",
      heading: "The Work Your Agent",
      headingAccent: "Takes Off Your Plate",
      bullets: [
        "Email triage and drafted replies",
        "Calendar and appointment management",
        "CRM updates and data entry",
        "Daily briefings and reminders",
        "Lead follow-up and nurture",
        "Document processing and summaries",
        "Proposal and quote preparation",
        "Invoicing and billing reminders",
      ],
    },
    {
      type: "columns",
      kicker: "Who This Is For",
      heading: "Built for Operators, Not",
      headingAccent: "Enterprises",
      items: [
        { title: "Solo Operators & Owners", desc: "If you are the bottleneck on everything, an agent clears the queue so you can focus on the work only you can do." },
        { title: "Teams Under 50", desc: "Small teams get more output without more headcount, and without a six-figure software budget." },
        { title: "Service & Professional Practices", desc: "Agencies, firms, clinics, and practices automate the client admin that keeps them buried." },
      ],
    },
    {
      type: "steps",
      kicker: "How It Works",
      heading: "Three Steps to",
      headingAccent: "Go Live",
      steps: [
        { title: "Discovery Call", desc: "A free 30-minute conversation to find the highest-value automation for your business." },
        { title: "Custom Build", desc: "We build and connect your agent to your existing tools, then test it against real work." },
        { title: "Go Live", desc: "Your agent goes into production and starts saving hours in the first weeks, not months." },
      ],
    },
    {
      type: "cta",
      heading: "See what AI can do for your",
      headingAccent: "small business.",
      sub: "Book a free 30-minute discovery call. No pitch, no pressure, just a clear look at where AI helps.",
      button: { label: "Book a Free 30-Minute Call", href: "/contact" },
    },
  ],
};

export default function AiConsultingSmallBusinessPage() {
  return <SeoLanding data={data} />;
}
