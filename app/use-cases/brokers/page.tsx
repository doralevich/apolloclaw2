import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The Brokers Agent | Apollo Claw AI for Brokerages",
  description: "Apollo[Claw] AI agents for brokers and brokerage firms. Automate client requests, deal pipelines, KYC documentation, and compliance workflows.",
};

const uc = {
  label: "Brokerage",
  title: "AI for",
  subtitle: "Brokers",
  description: "The Brokers Agent keeps your client relationships, deal pipelines, and compliance workflows moving without the manual chase — so you spend your time advising, not administering.",
  challenges: [
    "Client requests and inquiries going unanswered for too long",
    "Deal pipeline updates requiring constant manual follow-up",
    "KYC and onboarding documentation creating bottlenecks",
    "Compliance reporting consuming analyst time",
    "Relationship management falling behind during active deal flow",
    "Back-office workload growing faster than headcount",
  ],
  solutions: [
    { title: "Client Communication Management", desc: "Routine client requests, status updates, and inquiries handled promptly so relationships stay warm without consuming advisor time." },
    { title: "Pipeline & Deal Tracking", desc: "Deal stages, pending items, and counterparty follow-up tracked automatically so nothing stalls waiting for a nudge." },
    { title: "KYC & Compliance Support", desc: "Onboarding document collection, compliance checklist tracking, and audit-ready record keeping handled in the background." },
  ],
  results: [
    "Faster client response times without adding staff",
    "No deals stalled by missing documents or missed follow-up",
    "Compliance prep done continuously, not at deadline",
    "Advisors focused on relationships and new business",
  ],
};

export default function BrokersPage() {
  return <UseCaseTemplate uc={uc} />;
}
