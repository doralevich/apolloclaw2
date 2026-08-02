import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: { absolute: "AI for Professional Services Firms | Apollo[Claw]" },
  description:
    "Consultancies, agencies, and advisory firms use Apollo[Claw] agents for intake, project admin, and client follow-up, so billable people stay billable.",
  alternates: { canonical: "https://apolloclaw.ai/industries/professional-services" },
  openGraph: {
    title: "AI for Professional Services Firms | Apollo[Claw]",
    description:
      "Intake, scheduling, project admin, and client follow-up handled so billable people stay billable.",
    url: "https://apolloclaw.ai/industries/professional-services",
    type: "website",
  },
};

const uc = {
  label: "Professional Services",
  title: "AI for",
  subtitle: "Professional Services Firms",
  description:
    "When your product is your people's time, every hour spent on admin is an hour you cannot bill. Apollo[Claw] agents take the coordination, follow-up, and project overhead off your consultants and advisors so more of the week goes to client work.",
  challenges: [
    "Senior people spending billable hours on scheduling and status updates",
    "New inquiries sitting unanswered while the team is deep in delivery",
    "Project admin, notes, and recaps written up late or not at all",
    "Time entry chased at the end of the month instead of captured as it happens",
    "Proposals and scoping documents starting from a blank page every time",
    "Client check-ins that slip when a project gets busy",
  ],
  solutions: [
    {
      title: "Inquiry Intake and Qualification",
      desc: "New inquiries screened, scoped at a high level, and routed to the right practice lead with a consultation already scheduled.",
    },
    {
      title: "Project Coordination",
      desc: "Kickoffs, check-ins, and deadlines scheduled and confirmed, with the chasing handled so a project manager does not have to do it by hand.",
    },
    {
      title: "Meeting Notes and Recaps",
      desc: "Client calls summarized into notes, decisions, and next steps, sent out while the conversation is still fresh.",
    },
    {
      title: "Proposal First Drafts",
      desc: "Scoping documents and proposals drafted from your prior work and templates, so the team edits rather than starts from nothing.",
    },
    {
      title: "Time and Billing Support",
      desc: "Time entry prompted against actual calendar activity, and billing follow-up run on a schedule so invoices go out and get paid.",
    },
    {
      title: "Client Follow-Up",
      desc: "Status updates and check-ins that go out consistently, including during the weeks when the delivery team has no bandwidth to send them.",
    },
  ],
  results: [
    "More of the week spent on billable client work",
    "Inquiries answered while they are still warm",
    "Project admin that happens on time without a person chasing it",
    "Invoices out and followed up on a predictable schedule",
  ],
};

export default function ProfessionalServicesPage() {
  return <UseCaseTemplate uc={uc} />;
}
