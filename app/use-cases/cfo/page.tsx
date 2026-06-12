import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The CFO Agent | Apollo Claw AI for Finance Leadership",
  description: "Apollo[Claw] AI agents for CFOs and finance leaders. Automate reporting, cash forecasting, board prep, and month-end close so your team focuses on strategy.",
};

const uc = {
  label: "Finance Leadership",
  title: "AI for",
  subtitle: "The CFO",
  description: "The CFO Agent handles the recurring, time-intensive financial operations that consume your team — so your finance function spends less time producing reports and more time driving decisions.",
  challenges: [
    "Month-end close consuming weeks of manual effort",
    "Board decks and reporting built from scratch every cycle",
    "Cash flow forecasting relying on spreadsheets and guesswork",
    "Variance analysis buried in data nobody has time to synthesize",
    "Audit prep creating last-minute fire drills",
    "Finance team overwhelmed by recurring low-value tasks",
  ],
  solutions: [
    { title: "Automated Reporting", desc: "Monthly close support, variance summaries, and board-ready financial narratives drafted before you have to ask for them." },
    { title: "Cash Flow Intelligence", desc: "Rolling forecasts updated continuously based on actuals, with alerts when projections shift outside acceptable ranges." },
    { title: "Audit & Compliance Prep", desc: "Documentation organized, reconciliations flagged early, and audit trails maintained automatically throughout the year." },
  ],
  results: [
    "Close cycle shortened by days, not hours",
    "Board prep time cut by 60% or more",
    "Finance team redeployed from reporting to analysis",
    "Fewer surprises at year-end with continuous reconciliation",
  ],
};

export default function CfoPage() {
  return <UseCaseTemplate uc={uc} />;
}
