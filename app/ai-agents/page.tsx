import type { Metadata } from "next";
import CategoryIndex, { type CategoryIndexData } from "@/components/CategoryIndex";

export const metadata: Metadata = {
  title: { absolute: "AI Agents by Role | Apollo Claw" },
  description:
    "Hire an AI agent for a specific seat: receptionist, CEO, CFO, sales, recruiting, HR, or a personal assistant. Each one is built, hosted, and maintained by Apollo Claw.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agents" },
  openGraph: {
    title: "AI Agents by Role | Apollo Claw",
    description: "Hire an AI agent for a specific seat, built and hosted by Apollo Claw.",
    url: "https://apolloclaw.ai/ai-agents",
    type: "website",
  },
};

const data: CategoryIndexData = {
  label: "By Role",
  title: "An agent for the",
  titleAccent: "job to be done",
  description:
    "Every agent fills a seat rather than answering questions. Pick the role you need covered and see exactly what it takes off your team's plate.",
  items: [
    { label: "Receptionist Agent", to: "/ai-agents/receptionist", description: "Answers calls, routes messages, and books appointments, so a missed call stops meaning a missed customer." },
    { label: "CEO Agent", to: "/ai-agents/ceo", description: "Pulls reports, tracks KPIs, and preps board decks, and briefs you before every meeting." },
    { label: "CFO Agent", to: "/ai-agents/cfo", description: "Categorizes expenses, reconciles payouts, chases invoices, and drafts reports for close." },
    { label: "Sales Agent", to: "/ai-agents/sales", description: "Qualifies leads, drafts follow-ups, and books meetings, so the pipeline keeps moving." },
    { label: "Recruiting Agent", to: "/ai-agents/recruiting", description: "Screens candidates, schedules interviews, sends offers, and runs onboarding." },
    { label: "Human Resources Agent", to: "/ai-agents/hr", description: "Handles PTO requests, onboarding, and policy questions, and keeps employee records straight." },
    { label: "Personal Agent", to: "/ai-agents/personal", description: "Runs your inbox, calendar, research, and follow-ups, so your attention stays on the work only you can do." },
    { label: "Brokers Agent", to: "/ai-agents/brokers", description: "Handles inquiries, documentation, and follow-up through the length of a deal." },
    { label: "College Agent", to: "/ai-agents/college", description: "Guides a student from high school through graduation: classes, deadlines, applications, and aid." },
  ],
  closing: {
    heading: "Ready to fill the",
    headingAccent: "seat?",
    sub: "Browse the storefront to start the setup, or book a call and we will help you pick the right role to cover first.",
    button: { label: "Browse Agents", href: "/agents" },
  },
};

export default function AiAgentsIndexPage() {
  return <CategoryIndex data={data} />;
}
