import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Insurance Agencies",
  description: "Apollo[Claw] AI agents for insurance agents and agencies. Automate quote follow-up, renewal outreach, claims status updates, and client communication.",
};

const uc = {
  label: "Insurance",
  title: "AI for",
  subtitle: "Insurance",
  description: "Apollo[Claw] helps insurance agents and agencies automate the follow-up, outreach, and documentation that eats hours every week.",
  challenges: [
    "Quote follow-up not happening fast enough",
    "Renewal outreach sent too late or inconsistently",
    "Claims status updates requiring manual calls",
    "Policy change requests handled by email chains",
    "New prospect qualification slow and labor-intensive",
    "Certificate of insurance requests backing up",
  ],
  solutions: [
    { title: "Quote Follow-Up", desc: "AI follows up with prospects after quotes are sent, answers common questions, and keeps your pipeline moving without chasing every lead manually." },
    { title: "Renewal Automation", desc: "Automated renewal outreach sequences start 90 days out, ensure every client is contacted on time, and escalate non-responders to your team." },
    { title: "Claims Communication", desc: "Automated status update outreach to clients in open claims — reducing inbound calls and keeping clients informed throughout the process." },
  ],
  results: [
    "Higher quote conversion with faster follow-up",
    "Renewals that don't fall through the cracks",
    "Reduced inbound call volume during claims season",
    "More client touches without more headcount",
  ],
};

export default function InsurancePage() {
  return <UseCaseTemplate uc={uc} />;
}
