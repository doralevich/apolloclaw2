import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The CEO Agent | Apollo Claw AI for Executives",
  description: "Apollo[Claw] AI agents for CEOs and executive leadership. Automate communications, briefings, and strategic follow-up so you focus on decisions, not admin.",
};

const uc = {
  label: "Executive",
  title: "AI for",
  subtitle: "The CEO",
  description: "The CEO Agent works inside your existing workflow — handling the volume of communications, coordination, and follow-up that keeps leaders buried in the operational weeds instead of running the business.",
  challenges: [
    "Too much time in email, not enough time in strategy",
    "Status updates and follow-ups falling through the cracks",
    "Meeting prep taking hours of manual research",
    "Board reporting and deck prep consuming leadership bandwidth",
    "Reactive days instead of proactive leadership",
    "Key decisions delayed by information overload",
  ],
  solutions: [
    { title: "Executive Inbox Management", desc: "Your AI reads, prioritizes, drafts responses, and flags only what needs your direct attention — so your inbox stops running your day." },
    { title: "Meeting & Briefing Prep", desc: "Automated pre-meeting summaries, agenda prep, and post-meeting action item tracking so every conversation moves something forward." },
    { title: "Strategic Follow-Up", desc: "The agent tracks open items, pending decisions, and stakeholder commitments so nothing important slips between meetings." },
  ],
  results: [
    "12-15 hours per week recovered from administrative overhead",
    "Faster decision-making with on-demand briefings and summaries",
    "Zero missed follow-ups on critical commitments",
    "More time on revenue, growth, and leadership — less on operations",
  ],
};

export default function CeoPage() {
  return <UseCaseTemplate uc={uc} />;
}
