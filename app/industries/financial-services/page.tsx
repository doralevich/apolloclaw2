import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Financial Services",
  description: "Apollo[Claw] AI agents for financial advisors, planners, and wealth management firms. Automate client communication, reporting, and compliance documentation.",
};

const uc = {
  label: "Financial Services",
  title: "AI for",
  subtitle: "Financial Services",
  description: "Apollo[Claw] helps financial services firms automate the time-consuming client communication and administrative work that pulls advisors away from advisory work.",
  challenges: [
    "Client portfolio review preparation taking hours",
    "Compliance documentation burden growing every quarter",
    "Client onboarding paperwork slow and error-prone",
    "Market event communication needing rapid response",
    "Meeting prep across dozens of client relationships",
    "Follow-up after client meetings inconsistent",
  ],
  solutions: [
    { title: "Client Communication", desc: "Automated market event updates, portfolio summary preparation, and post-meeting follow-ups so every client feels attended to." },
    { title: "Onboarding Automation", desc: "AI guides new clients through document collection, compliance forms, and account setup so advisors spend time advising, not processing." },
    { title: "Meeting Prep", desc: "Pre-meeting briefing documents prepared automatically from your CRM and portfolio data, ready the morning of every client call." },
  ],
  results: [
    "More advisory capacity without hiring more staff",
    "Faster client onboarding and document collection",
    "Consistent client communication at scale",
    "Meeting prep time cut significantly",
  ],
};

export default function FinancePage() {
  return <UseCaseTemplate uc={uc} />;
}
