import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The HR Agent | AI for PTO, Onboarding & Policy Questions | Apollo[Claw]",
  description:
    "The HR Agent handles PTO requests, onboarding steps, and policy questions, and keeps employee records straight so a small HR team can support a growing headcount.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agents/hr" },
  openGraph: {
    title: "The HR Agent | AI for PTO, Onboarding & Policy Questions",
    description:
      "Handles PTO requests, onboarding, and policy questions, and keeps employee records straight.",
    url: "https://apolloclaw.ai/ai-agents/hr",
    type: "website",
  },
};

const uc = {
  label: "HR",
  title: "AI for",
  subtitle: "People Operations",
  description:
    "The HR Agent takes the repetitive half of people ops off your plate. It answers the policy questions, moves PTO requests along, runs new hires through onboarding, and keeps the records current, so your HR team spends its time on people instead of paperwork.",
  challenges: [
    "The same policy questions answered over and over in Slack and email",
    "PTO requests sitting unapproved because nobody chased them",
    "Onboarding checklists that get half-finished and then forgotten",
    "Employee records drifting out of date between systems",
    "Offboarding steps missed when someone leaves quickly",
    "One or two HR people supporting a headcount that keeps growing",
  ],
  solutions: [
    {
      title: "Policy Questions Answered",
      desc: "Employees get accurate answers on PTO, benefits, expenses, and policy pulled from your actual handbook, not a guess, and not a wait for someone to reply.",
    },
    {
      title: "PTO and Time-Off Requests",
      desc: "Requests captured, checked against balances and coverage, routed to the right approver, and followed up on until they are actually resolved.",
    },
    {
      title: "Onboarding That Finishes",
      desc: "New hires walked through every step, with accounts, paperwork, and intro meetings tracked to completion instead of stalling halfway.",
    },
    {
      title: "Offboarding Checklists",
      desc: "Departures run through the full list, access removal, equipment return, final paperwork, so nothing is discovered missing weeks later.",
    },
    {
      title: "Records Kept Current",
      desc: "Employee data stays consistent across your HR system and the tools that read from it, with changes applied where they need to land.",
    },
    {
      title: "Escalation to a Human",
      desc: "Anything sensitive, a complaint, a performance matter, an accommodation request, goes straight to a person. The agent does not handle those alone.",
    },
  ],
  results: [
    "Policy questions answered without an HR person in the loop",
    "Time-off requests resolved instead of sitting in a queue",
    "Onboarding completed the same way for every hire",
    "A small HR team supporting a larger headcount",
  ],
};

export default function HrAgentPage() {
  return <UseCaseTemplate uc={uc} />;
}
