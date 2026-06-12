import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Construction & Trades Businesses",
  description: "Apollo[Claw] AI agents for contractors and construction companies. Automate estimates, scheduling, vendor communication, and project status updates.",
};

const uc = {
  label: "Construction & Trades",
  title: "AI for",
  subtitle: "Construction",
  description: "Apollo[Claw] helps contractors and construction businesses run the office side of operations without hiring more office staff.",
  challenges: [
    "Estimate requests piling up unanswered",
    "Scheduling crews and subcontractors by phone and text",
    "Vendor follow-up and material order tracking",
    "Project status updates to clients taking constant time",
    "Invoicing delayed because field work is the priority",
    "Permit and inspection scheduling falling through the cracks",
  ],
  solutions: [
    { title: "Estimate Workflow", desc: "AI pre-qualifies estimate requests, gathers project details from prospects, and prepares the briefing so you show up ready." },
    { title: "Scheduling Automation", desc: "Coordinate crews, subs, and inspections without a dedicated coordinator. AI manages the calendar and sends confirmations." },
    { title: "Client Communication", desc: "Automated project status updates keep clients informed between site visits — fewer calls, fewer surprises." },
  ],
  results: [
    "Faster response time on new estimate requests",
    "Less time on the phone coordinating logistics",
    "Clients kept informed without manual check-ins",
    "Fewer invoicing delays and billing gaps",
  ],
};

export default function ConstructionPage() {
  return <UseCaseTemplate uc={uc} />;
}
