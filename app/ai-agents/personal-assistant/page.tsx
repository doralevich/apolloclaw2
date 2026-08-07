import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Personal Assistant for Executives | Inbox, Calendar & Task Automation | Apollo[Claw]" },
  description:
    "AI personal assistant for executives and business owners. Manages your inbox, calendar, research, and tasks so you stay focused on the work only you can do.",
  alternates: {
    canonical: "https://apolloclaw.ai/ai-agents/personal-assistant",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Personal Assistant for Executives | Inbox, Calendar & Task Automation",
    description:
      "Apollo[Claw] AI personal assistant for executives and business owners. Inbox, calendar, research, and task management so you focus on what matters.",
    url: "https://apolloclaw.ai/ai-agents/personal-assistant",
    type: "website",
  },
};

const uc = {
  label: "Personal Productivity",
  title: "Your Personal",
  subtitle: "AI Assistant",
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
