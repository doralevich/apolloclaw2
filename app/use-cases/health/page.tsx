import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Healthcare & Medical Practices",
  description: "Apollo[Claw] AI agents for healthcare providers, medical practices, and health & wellness businesses. Automate scheduling, documentation, and patient follow-up.",
};

const uc = {
  label: "Healthcare & Medical",
  title: "AI for",
  subtitle: "Healthcare",
  description: "Apollo[Claw] helps healthcare providers, medical practices, and wellness businesses reclaim the hours lost to administrative work — without adding staff.",
  challenges: [
    "Hours lost to documentation and charting",
    "Appointment scheduling and reminder follow-up",
    "Insurance verification and prior authorization delays",
    "Patient follow-up falling through the cracks",
    "Staff overwhelmed by phone and email volume",
    "Compliance documentation burden",
  ],
  solutions: [
    { title: "Scheduling Automation", desc: "AI handles appointment bookings, reminders, and cancellations so your front desk focuses on patients in the room." },
    { title: "Follow-Up Workflows", desc: "Automated post-visit follow-up messages, lab result notifications, and care plan reminders sent at the right time." },
    { title: "Documentation Assist", desc: "Structured intake summaries and documentation prep so providers spend less time typing and more time caring." },
  ],
  results: [
    "20+ hours per week reclaimed from administrative tasks",
    "Fewer no-shows with automated reminder sequences",
    "Faster patient response times without adding headcount",
    "Staff focused on care, not paperwork",
  ],
};

export default function HealthcarePage() {
  return <UseCaseTemplate uc={uc} />;
}
