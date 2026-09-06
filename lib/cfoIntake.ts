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
      key: "bookkeeping",
      label: "Who keeps the books today?",
      type: "dropdown",
      options: [
        "In-house bookkeeper or controller",
        "Outsourced bookkeeper or firm",
        "Fractional CFO or accounting firm",
        "Founder or owner does it",
        "Nobody consistently",
        "Other",
      ],
    },
    {
      key: "finance_team",
      label: "Who else is involved in the numbers?",
      type: "textarea",
      placeholder:
        "e.g. my controller closes the month, our CPA handles tax and sees everything, my co-founder gets the board pack but not payroll detail.",
      helper:
        "Names, roles, and who sees what. This decides who your agent may send a number to without asking you.",
    },
    {
      key: "books_state",
      label: "How current are the books, honestly?",
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
      key: "close_process",
      label: "What does month-end close look like now?",
      type: "textarea",
      placeholder:
        "e.g. bookkeeper reconciles in the first week, I review the P&L, nobody looks at the balance sheet, it takes about three weeks.",
      helper: "The steps, who does them, and roughly how long it actually takes.",
    },
    {
      key: "entities",
      label: "How many legal entities, and how are they structured?",
      type: "text",
      placeholder: "e.g. one LLC, or 3 entities under a C-corp holdco",
      helper: "Number, structure, and where they file. Consolidation is where reporting goes wrong.",
    },
    {
      key: "fiscal_year_end",
      label: "When does your fiscal year end?",
      type: "dropdown",
      options: ["December (calendar year)", "March", "June", "September", "Other"],
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
      key: "cost_structure",
      label: "Where does the money actually go?",
      type: "textarea",
      placeholder:
        "e.g. payroll is about 60 percent, then contractors, then ad spend which swings hard month to month.",
      helper: "Your biggest cost lines, roughly in order. Variance analysis is guesswork without them.",
    },
    {
      key: "unit_economics",
      label: "What does a good customer look like in numbers?",
      type: "textarea",
      placeholder:
        "e.g. $2k a month, 18 month average life, costs us about $3k to acquire, gross margin around 70 percent.",
      helper:
        "Whatever you track, in your own terms. If you do not track this yet, say so and your agent can help build it.",
    },
    {
      key: "runway_watch",
      label: "What cash number would make you nervous?",
      type: "text",
      placeholder: "e.g. under four months of runway, or below $150k in the operating account",
      helper: "The line where you want to hear from your agent before you have to ask.",
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
      key: "forecasting",
      label: "Do you have a forecast or a model today?",
      type: "dropdown",
      options: [
        "A model I trust and update",
        "A model that exists but is stale",
        "A rough spreadsheet",
        "It is in my head",
        "Nothing yet",
      ],
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
        "Monthly close & P&L",
        "Cash-flow forecast",
        "Budget vs actual",
        "KPI / metrics dashboard",
        "Board deck & investor reporting",
        "Runway & burn tracking",
        "Expense categorization",
        "Invoicing & AR chasing",
        "Fundraising prep",
        "Pricing & margin analysis",
        "Vendor & spend review",
        "Payroll review",
      ],
    },
    // Follow-ups to the two options that ask the agent to write for an audience it has never
    // met. Board reporting and fundraising both go OUT of the building, to people whose
    // questions the agent cannot guess, so ticking either opens the question that configures it.
    {
      key: "board_audience",
      label: "Who reads the board pack, and what do they push on?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Board deck & investor reporting" },
      placeholder:
        "e.g. two investors and an independent, they always go straight to CAC payback and the hiring plan, one hates a slide with no comparison to last quarter.",
      helper: "The audience and their standing questions. This is what makes a pack land rather than get picked apart.",
    },
    {
      key: "fundraising",
      label: "Where are you with fundraising?",
      type: "dropdown",
      showIf: { key: "owns_work", includes: "Fundraising prep" },
      options: [
        "Bootstrapped, not raising",
        "Planning to raise in the next year",
        "Actively raising now",
        "Just closed a round",
        "Debt or credit facility, not equity",
      ],
    },
    {
      key: "reporting_cadence",
      label: "How often do you want financials?",
      type: "dropdown",
      options: ["Weekly", "Monthly", "Quarterly", "On demand"],
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
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
    {
      key: "compliance_rules",
      label: "Any audit, lender, or regulatory rules it must follow?",
      type: "textarea",
      placeholder:
        "e.g. we are audited annually, our lender needs a covenant certificate quarterly, revenue recognition follows ASC 606.",
      helper: "Anything your accountant, auditor, or lender requires belongs here.",
    },
    {
      key: "financial_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The numbers, reports, or clarity you want in hand three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const CFO_BRANCH: IndustryBranch[] = [BOOKS, MONEY, AGENT];
