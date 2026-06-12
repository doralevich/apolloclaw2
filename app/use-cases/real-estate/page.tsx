import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Real Estate Agents & Brokerages",
  description: "Apollo[Claw] AI agents for real estate professionals. Automate lead follow-up, listing management, showing coordination, and CRM updates.",
};

const uc = {
  label: "Real Estate",
  title: "AI for",
  subtitle: "Real Estate",
  description: "Apollo[Claw] helps real estate agents and brokerages turn more leads into clients by automating the follow-up, scheduling, and communication that falls through the cracks.",
  challenges: [
    "Leads going cold because follow-up is delayed",
    "Showing coordination eating hours every day",
    "CRM updates always behind or incomplete",
    "Listing status changes requiring manual communication",
    "Offer and contract deadlines across multiple transactions",
    "Client check-ins and status updates taking too long",
  ],
  solutions: [
    { title: "Lead Follow-Up", desc: "AI follows up with new leads within minutes, qualifies their timeline and needs, and schedules showings — before they call someone else." },
    { title: "Transaction Coordination", desc: "Automated deadline tracking, document requests, and status updates keep transactions moving without constant manual oversight." },
    { title: "CRM Automation", desc: "Your AI updates contact records, logs interactions, and flags high-priority leads so your CRM is always current." },
  ],
  results: [
    "More leads converted with faster response times",
    "Hours per week saved on coordination and follow-up",
    "CRM that's actually up to date",
    "Clients who feel informed without you checking in manually",
  ],
};

export default function RealEstatePage() {
  return <UseCaseTemplate uc={uc} />;
}
