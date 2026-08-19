// The CFO Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `cfo` (config/agent-types.ts), on top of the standard business
// questions, so a fractional-CFO agent is set up around the client's actual books from day one.
//
// Answers land under the `cfoDetails` key and are surfaced in USER.md / the intake email via the
// "CFO Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const CFO_BRANCH: IndustryBranch = {
  stepTitle: "Your Finances",
  stepSubtitle: "A few specifics so your CFO agent speaks your numbers from day one.",
  fields: [
    {
      key: "accounting_system",
      label: "What accounting system do you use?",
      type: "dropdown",
      required: true,
      options: [
        "QuickBooks Online",
        "QuickBooks Desktop",
        "Xero",
        "NetSuite",
        "Sage Intacct",
        "Wave",
        "FreshBooks",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "bookkeeping",
      label: "Who keeps the books today?",
      type: "dropdown",
      options: [
        "In-house bookkeeper or controller",
        "Outsourced bookkeeper or firm",
        "Founder or owner does it",
        "Nobody consistently",
        "Other",
      ],
    },
    {
      key: "entities",
      label: "How many legal entities, and how are they structured?",
      type: "text",
      placeholder: "e.g. one LLC, or 3 entities under a C-corp holdco",
      helper: "Number of entities, their structure, and where they file.",
    },
    {
      key: "fiscal_year_end",
      label: "When does your fiscal year end?",
      type: "dropdown",
      options: ["December (calendar year)", "March", "June", "September", "Other"],
    },
    {
      key: "revenue_model",
      label: "How does the business make money?",
      type: "multiselect",
      options: [
        "Subscription / recurring (SaaS)",
        "Services / retainers",
        "Products / e-commerce",
        "Project / one-time",
        "Marketplace / fees",
        "Other",
      ],
    },
    {
      key: "finance_stack",
      label: "Which money tools do you run?",
      type: "multiselect",
      helper: "Payments, cards, payroll, AP/AR.",
      options: [
        "Stripe",
        "PayPal",
        "Square",
        "Bill.com",
        "Ramp",
        "Brex",
        "Mercury",
        "Expensify",
        "Gusto",
        "Rippling",
        "ADP",
        "Other",
      ],
    },
    {
      key: "reports_needed",
      label: "What do you want your CFO agent to own?",
      type: "multiselect",
      required: true,
      options: [
        "Monthly P&L / close",
        "Cash-flow forecast",
        "Budget vs actual",
        "KPI / metrics dashboard",
        "Board deck / investor reporting",
        "Runway & burn tracking",
        "Expense categorization",
        "Invoice & AR chasing",
        "Fundraising prep",
        "Pricing & margin analysis",
      ],
    },
    {
      key: "reporting_cadence",
      label: "How often do you want financials?",
      type: "dropdown",
      options: ["Weekly", "Monthly", "Quarterly", "On demand"],
    },
    {
      key: "fundraising",
      label: "Fundraising status",
      type: "dropdown",
      options: [
        "Bootstrapped, not raising",
        "Planning to raise",
        "Currently raising",
        "Raised (post-round)",
        "Not applicable",
      ],
    },
    {
      key: "financial_pain",
      label: "Biggest financial question or headache right now?",
      type: "textarea",
      required: true,
      placeholder: "e.g. I never know my true runway, close takes three weeks, margins are a mystery.",
    },
    {
      key: "financial_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The numbers, reports, or clarity you want in hand three months from now.",
    },
  ],
};
