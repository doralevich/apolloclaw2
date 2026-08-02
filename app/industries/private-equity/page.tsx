import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: { absolute: "AI for PE-Backed Portfolio Companies | Apollo[Claw]" },
  description:
    "Apollo[Claw] deploys AI agents across portfolio companies to standardize reporting and cut back-office cost, without adding headcount at each company.",
  alternates: { canonical: "https://apolloclaw.ai/industries/private-equity" },
  openGraph: {
    title: "AI for PE-Backed Portfolio Companies | Apollo[Claw]",
    description:
      "AI agents deployed across portfolio companies to standardize reporting and cut back-office cost.",
    url: "https://apolloclaw.ai/industries/private-equity",
    type: "website",
  },
};

const uc = {
  label: "Private Equity",
  title: "AI for",
  subtitle: "PE-Backed Portfolio Companies",
  description:
    "Value creation plans call for margin improvement without a matching increase in headcount. Apollo[Claw] deploys agents into portfolio companies to take on the manual back-office work, standardize how reporting gets produced, and make the same playbook repeatable at the next company.",
  challenges: [
    "Every portfolio company reporting in its own format on its own timeline",
    "Monthly and quarterly reporting packages assembled by hand",
    "Back-office headcount that scales with revenue instead of staying flat",
    "Operating partners pulled into data gathering rather than decisions",
    "Diligence and integration work stretching lean finance teams",
    "Improvements at one company that never make it to the rest of the portfolio",
  ],
  solutions: [
    {
      title: "Standardized Reporting",
      desc: "The same reporting package produced the same way at every company, pulled and drafted on schedule rather than chased at the end of each period.",
    },
    {
      title: "Back-Office Automation",
      desc: "Invoice processing, reconciliation, expense categorization, and collections follow-up handled by an agent so finance headcount stays flat as revenue grows.",
    },
    {
      title: "Portfolio-Wide Visibility",
      desc: "Operating metrics gathered from each company on a consistent cadence, so a portfolio view does not require a round of emails to assemble.",
    },
    {
      title: "A Repeatable Deployment",
      desc: "Once an agent proves out at one company, the same configuration deploys at the next one, which turns a one-off improvement into a portfolio playbook.",
    },
    {
      title: "Integration Support",
      desc: "During onboarding of a new acquisition, the agent absorbs the manual reporting and data-cleanup work that otherwise lands on an already-stretched team.",
    },
    {
      title: "Approval Before Action",
      desc: "You set what the agent does on its own and what it brings to a person first. Anything touching cash, contracts, or external parties waits for approval.",
    },
  ],
  results: [
    "Reporting produced on a consistent format and schedule across companies",
    "Back-office cost held flat while revenue grows",
    "Operating partners working from current numbers instead of gathering them",
    "A deployment pattern that repeats at the next portfolio company",
  ],
};

export default function PrivateEquityPage() {
  return <UseCaseTemplate uc={uc} />;
}
