import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The Personal Agent | Apollo Claw AI Personal Assistant",
  description: "Apollo[Claw] AI personal assistant agents for executives and business owners. Manage your inbox, calendar, contacts, and tasks so you focus on what matters.",
};

const uc = {
  label: "Personal Productivity",
  title: "AI for",
  subtitle: "Your Personal Assistant",
  description: "The Personal Agent runs the daily administrative layer of your professional life: inbox, calendar, research, notes, and follow-up, so your attention stays on the work only you can do.",
  challenges: [
    "Inbox volume that never gets under control",
    "Calendar management eating into productive time",
    "Research and prep work taking hours before every meeting",
    "Personal follow-ups and commitments falling through",
    "Context-switching between tasks killing deep work",
    "No time to think, only time to react",
  ],
  solutions: [
    { title: "Inbox & Calendar Management", desc: "Your AI reads, sorts, and drafts responses to your emails and keeps your calendar organized without back-and-forth." },
    { title: "Research on Demand", desc: "Need a briefing on a company, a person, or a topic before a meeting? It arrives before you have to ask." },
    { title: "Task & Commitment Tracking", desc: "Open loops, pending replies, and personal commitments tracked and surfaced so nothing falls through the cracks." },
  ],
  results: [
    "10+ hours per week returned from inbox and calendar management",
    "Every meeting started with full context and prep done",
    "Zero missed personal or professional commitments",
    "Uninterrupted time for the work that actually moves the needle",
  ],
};

export default function PersonalPage() {
  return <UseCaseTemplate uc={uc} />;
}
