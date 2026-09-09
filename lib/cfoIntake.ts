// The CFO Agent's intake deep-dive.
//
// Three pages rather than one: the books, the money, and what the agent should own. A single
// eleven-question page could not tell a bootstrapped founder doing their own bookkeeping from a
// controller running three entities through a monthly close, and both were being sold the same
// agent.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`cfoDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the real estate intake: does the agent need this
// before its first useful action, or can it just ask? It talks to its owner every day, so anything
// it can learn by asking does not belong in front of somebody who has already decided to buy.
// So no revenue band (the shared Your Business page already asks), no headcount history, no
// seasonality, and no "biggest financial headache" - the Executive Profile page asks about the
// bottleneck two steps later and the second ask got the shorter answer.
//
// What stayed is what the agent cannot infer, cannot easily ask, or must not get wrong: the
// systems it has to work inside, who is allowed to see which numbers, the review line before
// anything goes to a board or a bank, and what to fix first.
//
// All fields are optional except the accounting system, which decides where every number the
// agent touches comes from.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the books ───────────────────────────────────────────────────────
const BOOKS: IndustryBranch = {
  stepTitle: "Your Books",
  stepSubtitle:
    "Where your numbers live and who touches them. This sets what your agent can rely on before it tells you anything.",
  stepLabel: "Books",
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
      helper: "Every number your agent gives you traces back to here.",
    },
    {
      key: "books_state",
      label: "How current are the books, and what does month-end close look like?",
      type: "dropdown",
      options: [
        "Closed and reconciled through last month",
        "A month or so behind",
        "A quarter or more behind",
        "Reconciled only at tax time",
        "Genuinely not sure",
      ],
      helper:
        "There is no wrong answer, and the honest one is the useful one. An agent that thinks the books are current will state stale numbers with confidence.",
    },
    {
      key: "entities",
      label: "How many legal entities, and how are they structured?",
      type: "text",
      placeholder: "e.g. one LLC, or 3 entities under a C-corp holdco",
      helper: "Number, structure, and where they file. Consolidation is where reporting goes wrong.",
    },
    {
      key: "reporting_cadence",
      label: "How often do you want financials?",
      type: "dropdown",
      options: ["Weekly", "Monthly", "Quarterly", "On demand"],
    },
  ],
};

// ─── Page 2: the money ───────────────────────────────────────────────────────
const MONEY: IndustryBranch = {
  stepTitle: "How Money Moves",
  stepSubtitle:
    "Where revenue comes from, where it goes, and what you watch. This is what turns a report into an opinion.",
  stepLabel: "Money",
  fields: [
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
        "Licensing / royalties",
        "Advertising",
        "Other",
      ],
    },
    {
      key: "ar_process",
      label: "How does getting paid work?",
      type: "textarea",
      placeholder:
        "e.g. invoice on the first, net 30, two clients always run to 60 and I chase them myself.",
      helper: "Terms, who invoices, and where collections actually stall.",
    },
    {
      key: "finance_stack",
      label: "Which money tools do you run?",
      type: "multiselect",
      helper: "Payments, cards, payroll, AP and AR. Your agent has to work inside these.",
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
      key: "compliance_rules",
      label: "Any audit, lender, or regulatory rules it must follow?",
      type: "textarea",
      placeholder:
        "e.g. we are audited annually, our lender needs a covenant certificate quarterly, revenue recognition follows ASC 606.",
      helper: "Anything your accountant, auditor, or lender requires belongs here.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, who it may speak to, and the lines it must not cross.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your CFO agent to own?",
      type: "multiselect",
      options: [
        "Monthly close and P&L",
        "Cash-flow forecast and runway",
        "Budget vs actual",
        "KPI dashboard and board reporting",
        "Expense categorization",
        "Invoicing and AR chasing",
        "Pricing and margin analysis",
        "Vendor, spend and payroll review",
      ],
    },
    // Follow-ups to the two options that ask the agent to write for an audience it has never
    // met. Board reporting and fundraising both go OUT of the building, to people whose
    // questions the agent cannot guess, so ticking either opens the question that configures it.
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. I want to know my real runway without asking anyone.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "numbers_voice",
      label: "How do you want financial writing to sound?",
      type: "textarea",
      placeholder:
        "e.g. lead with the number and the so-what, no hedging, tell me what you would do about it, never bury bad news in paragraph three.",
      helper: "How you want a variance explained to you, and how blunt you want it.",
    },
    {
      key: "approval_line",
      label: "What must never go out without you seeing it first?",
      type: "textarea",
      placeholder:
        "e.g. anything to the board or the bank, any number sent to an investor, anything touching payroll or an employee's compensation.",
      helper:
        "The one question on this form worth being strict about. A finance agent can send a wrong number somewhere it cannot be taken back from.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const CFO_BRANCH: IndustryBranch[] = [BOOKS, MONEY, AGENT];
