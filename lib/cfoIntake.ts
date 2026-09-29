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
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made the form
// slow and corporate, so every question here is a click. "How do you want financial writing to
// sound?" (`numbers_voice`) is gone; the shared Voice page now asks tone for every agent.
//
// All fields are optional except the accounting system, which decides where every number the
// agent touches comes from.
//
// Brand rules: no em dashes in any user-facing string; positive framing throughout.

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
        "None yet",
        "Other",
      ],
      helper: "Every number your agent gives you traces back to here.",
    },
    {
      key: "books_state",
      label: "How current are the books?",
      type: "dropdown",
      options: [
        "Closed and reconciled through last month",
        "About a month behind",
        "A quarter or more behind",
        "Reconciled at tax time only",
        "Unsure",
      ],
      helper: "The honest answer is the useful one. It tells your agent how far to trust the ledger.",
    },
    {
      key: "entities",
      label: "How many legal entities does the business run through?",
      type: "dropdown",
      options: [
        "One entity",
        "2 to 3 entities",
        "4 to 10 entities",
        "More than 10 entities",
        "Unsure",
      ],
      helper: "Consolidation is where reporting goes wrong, so your agent checks it first.",
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
      label: "What are your usual payment terms?",
      type: "dropdown",
      options: [
        "Paid upfront or at checkout",
        "Due on receipt",
        "Net 15",
        "Net 30",
        "Net 45 to 60",
        "Net 90 or longer",
        "Milestone or progress billing",
        "Mixed, it varies by client",
        "Other",
      ],
      helper: "Your agent uses this to spot slow payers early.",
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
      label: "Which audit, lender, or regulatory rules apply?",
      type: "multiselect",
      options: [
        "Annual audit",
        "Annual CPA review",
        "Lender covenants and reporting",
        "Investor or board reporting",
        "Revenue recognition (ASC 606)",
        "Sales tax in multiple states",
        "Grant or government funding rules",
        "Industry regulation (healthcare, financial services)",
        "None that I know of",
        "Other",
      ],
      helper: "Anything your accountant, auditor, or lender requires.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle: "The last page. What you want handed over, and where it checks with you first.",
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
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Knowing my real cash runway",
        "Closing the month on time",
        "A monthly P&L I can read at a glance",
        "Getting paid faster",
        "Budget vs actual tracking",
        "Cleaning up expense categories",
        "Board and investor reporting",
        "Tightening spend and margins",
        "Other",
      ],
      helper: "Your agent gets configured around this first.",
    },
    {
      key: "approval_line",
      label: "Always check with me first before it...",
      type: "multiselect",
      options: [
        "Sends numbers to the board or investors",
        "Shares anything with a bank or lender",
        "Sends anything to a client or vendor",
        "Touches payroll or compensation",
        "Moves money or schedules a payment",
        "Sends anything to our accountant or auditor",
        "Shares financials with my team",
        "Other",
      ],
      helper:
        "The one question on this form worth being strict about. A number sent to a board or a bank is hard to take back.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const CFO_BRANCH: IndustryBranch[] = [BOOKS, MONEY, AGENT];
