import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Law Firms & Legal Practices",
  description: "Apollo[Claw] AI agents for attorneys and law firms. Automate client intake, document review prep, deadline tracking, and billing.",
};

const uc = {
  label: "Legal",
  title: "AI for",
  subtitle: "Law Firms",
  description: "Apollo[Claw] helps attorneys and legal practices eliminate the administrative burden that pulls you away from billable work.",
  challenges: [
    "Client intake forms and initial screening taking too long",
    "Deadline and court date tracking across multiple matters",
    "Document organization and retrieval",
    "Time tracking and billing gaps",
    "Client follow-up and status update requests",
    "Research compilation taking hours per matter",
  ],
  solutions: [
    { title: "Client Intake Automation", desc: "AI pre-screens inquiries, collects intake information, and routes qualified leads to the right attorney — before you touch it." },
    { title: "Deadline Management", desc: "Your AI monitors matter deadlines, sends internal alerts, and can draft reminders to clients for time-sensitive documents." },
    { title: "Research & Summary", desc: "Automated research summaries delivered to your inbox. Your AI pulls relevant cases, statutes, and background on new matters." },
  ],
  results: [
    "More billable hours by eliminating admin overhead",
    "Zero missed deadlines with automated tracking",
    "Faster client intake and qualification",
    "Research summaries in minutes, not hours",
  ],
};

export default function LegalPage() {
  return <UseCaseTemplate uc={uc} />;
}
