import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI for Accounting Firms & CPAs | Document Collection & Deadline Automation | Apollo[Claw]" },
  description:
    "AI agents for accounting firms and CPA practices. Automate client document collection, deadline reminders, status updates, and engagement letter tracking.",
  alternates: {
    canonical: "https://apolloclaw.ai/industries/accounting-firms",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI for Accounting Firms & CPAs | Document Collection & Deadline Automation",
    description:
      "Apollo[Claw] AI agents for accounting firms. Automate client communication, document collection, deadline reminders, and reporting so your team handles the work, not the chase.",
    url: "https://apolloclaw.ai/industries/accounting-firms",
    type: "website",
  },
};

const uc = {
  label: "Accounting Firms",
  title: "AI for",
  subtitle: "Accounting Firms",
  description: "Apollo[Claw] helps CPA firms and financial services businesses automate the repetitive work that spikes during tax season and never fully goes away.",
  challenges: [
    "Document collection from clients taking weeks",
    "Deadline reminders sent manually for every client",
    "Repetitive client questions about status and timing",
    "Organizing and routing documents from multiple channels",
    "Year-end workflows buried in email",
    "Billing and engagement letter tracking",
  ],
  solutions: [
    { title: "Document Collection", desc: "AI sends automated document request sequences, follows up on missing items, and confirms receipt, without your team chasing every client." },
    { title: "Deadline Automation", desc: "Automatic deadline alerts for filing deadlines, extension requests, and client deliverables. No more manual calendar management." },
    { title: "Client Communication", desc: "AI drafts status updates, answers common questions, and keeps clients informed, so your team handles only what requires professional judgment." },
  ],
  results: [
    "Faster document turnaround from clients",
    "Fewer missed deadlines across your client base",
    "Staff time freed for higher-value advisory work",
    "Consistent client experience without more headcount",
  ],
};

export default function AccountingPage() {
  return <UseCaseTemplate uc={uc} />;
}
