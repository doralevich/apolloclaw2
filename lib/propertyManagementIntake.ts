// The Property Management Agent's intake deep-dive.
//
// Three pages rather than one: the portfolio, how the work runs, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`propertyManagementDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// WHY THIS IS NOT THE REAL ESTATE INTAKE. Property management was a tick-box on two real estate
// questions - `re_focus` in the industry branch and `role` in lib/realEstateIntake.ts - and ticking
// it changed nothing downstream. The real estate intake is built around a TRANSACTION: its required
// long-form question is "walk us through a deal from accepted offer to closing", and what the agent
// is offered to own is listing copy, comps and transaction checklists. A property manager has no
// accepted offer and no closing. They have a maintenance queue, a rent roll, a renewal calendar and
// an owner who wants to know why the boiler cost $1,400. Handing them the transaction form asked
// twelve questions about somebody else's business.
//
// THE TWO-AUDIENCE PROBLEM IS THE DEFINING FACT of this role and it shapes the whole form. Every
// other role agent writes to one party. This one writes to a tenant and to an owner in the same
// hour, about the same event, and the registers are not the same - the tenant needs to know
// somebody is coming, the owner needs to know what it costs and why it was approved. That is why
// `who_you_answer_to` is on the form at all: managing for one landlord and managing for an HOA
// board are different jobs with the same job title.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other nine role intakes: does the agent need
// this before its first useful action, or can it just ask? No unit-level rent roll, no vendor list,
// no fee structure, no occupancy or delinquency rate - all of that is in the management system the
// moment the agent connects, and asking somebody to hand-copy their own rent roll into a form is
// the CFO agent's cost-structure mistake wearing different clothes. No "biggest headache" either:
// the Executive Profile page asks about the bottleneck two steps later and the second ask got the
// shorter answer.
//
// The last page is the shared family tail - what it owns, where it stops, what to fix first - so
// this reads as the tenth member of a family rather than a form that arrived from somewhere else.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made setup feel slow
// and corporate. One text field is left, `markets`, because landlord-tenant law is local and no
// list covers it. The handoff line is now a required checklist with emergencies, fair housing and
// evictions listed first. The tenant-and-owner voice question moved to the shared Voice page.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// A NOTE ON KEY NAMES, because they leak. Every key here becomes a heading in the USER.md the
// agent reads as ground truth, via a generic title-caser in lib/onboardingSections.ts that only
// splits on underscores: `pm_type` renders as "Pm Type" and `voice_two_ways` as "Voice Two Ways".
// Both of those were in this file until the demo walkthrough rendered the actual file and showed
// them. So: no abbreviations, and phrase the key the way you would want the heading to read.

// ─── Page 1: the portfolio ───────────────────────────────────────────────────
const PORTFOLIO: IndustryBranch = {
  stepTitle: "Your Portfolio",
  stepSubtitle:
    "What you manage and where. This sets the rules your agent reasons from before anything else.",
  stepLabel: "Portfolio",
  fields: [
    {
      key: "management_type",
      label: "What kind of management is it?",
      type: "dropdown",
      required: true,
      options: [
        "Residential, single-family and small rentals",
        "Residential, multifamily and apartments",
        "Mixed residential and commercial",
        "Commercial only",
        "HOA and condo association management",
        "Short-term and vacation rentals",
        "Student housing",
        "Other",
      ],
      helper:
        "This changes everything downstream. An HOA manager answers to a board and a budget; a short-term operator turns units over weekly; a commercial manager reads leases unlike anyone else on this list.",
    },
    {
      key: "portfolio_size",
      label: "How many units are under management?",
      type: "dropdown",
      required: true,
      options: ["Under 50", "50 to 200", "200 to 750", "750 to 2,000", "Over 2,000"],
      helper: "Roughly. It tells the agent whether it is helping one person or feeding a team.",
    },
    {
      key: "markets",
      label: "Which states and markets do you manage in?",
      type: "text",
      required: true,
      placeholder: "e.g. New York City and Westchester; a few buildings in northern New Jersey",
      // The single most load-bearing question on the page, and the direct analogue of the Law
      // Agent's `jurisdictions`. Landlord-tenant law is local down to the city: notice periods,
      // deposit limits and deposit deadlines, rent regulation, entry rules, late fee caps. An
      // agent that reasons from the wrong state does not fail loudly, it answers confidently and
      // wrongly, and a wrong notice period is a lost case rather than a typo. The one text box
      // left on this form, for that reason.
      helper:
        "Down to the city where it matters. Notice periods, deposit rules and entry rights are local, and this is the single most common way a confident answer goes wrong.",
    },
    {
      key: "management_systems",
      label: "What do you run the business on?",
      type: "multiselect",
      options: [
        "AppFolio",
        "Buildium",
        "Yardi",
        "Rent Manager",
        "DoorLoop",
        "Entrata",
        "RealPage",
        "Propertyware",
        "A shared inbox for maintenance",
        "Spreadsheets",
        "Other",
      ],
      // A multiselect rather than a single pick: a management shop is never on one system - there
      // is the platform of record, and then the places the work really happens.
      helper: "Tick the platform of record and everywhere else the work happens.",
    },
  ],
};

// ─── Page 2: how the work runs ───────────────────────────────────────────────
const OPERATIONS: IndustryBranch = {
  stepTitle: "How the Work Runs",
  stepSubtitle:
    "The loop your agent is going to live inside. The more specific here, the less it has to guess.",
  stepLabel: "Operations",
  fields: [
    {
      key: "who_you_answer_to",
      label: "Who are you managing for?",
      type: "multiselect",
      options: [
        "Individual owners, one or two doors each",
        "Small investor groups",
        "Institutional or fund owners",
        "HOA or condo boards",
        "You own the portfolio yourself",
        "Other",
      ],
      helper:
        "This sets the reporting posture. An individual owner wants a text when the boiler dies; a fund wants it in the monthly.",
    },
    {
      key: "service_load",
      label: "What eats the most time?",
      type: "multiselect",
      options: [
        "Maintenance intake and dispatch",
        "Leasing enquiries and showings",
        "Rent collection and delinquency",
        "Renewals",
        "Turnovers and make-ready",
        "Owner reporting and statements",
        "Vendor coordination",
        "Compliance and inspections",
      ],
    },
    {
      key: "maintenance_flow",
      label: "Which of these describe your maintenance process?",
      type: "multiselect",
      required: true,
      options: [
        "Tenants submit requests through a portal",
        "Tenants text, call or email",
        "We triage every request the same day",
        "Heat, water and locks are always emergencies",
        "Emergency vendor on site within 4 hours",
        "Routine work scheduled within 3 business days",
        "Owner approval above a set amount",
        "In-house maintenance team",
        "Outside vendors",
        "Vendor invoices land on the owner's monthly statement",
        "Other",
      ],
      // The loop the agent will spend most of its day inside, and this intake's equivalent of the
      // real estate agent's `transaction_process`. Still required: it becomes the checklist the
      // agent works from, and the agent asks for the timings it cannot see once connected.
      helper: "Tick every step that fits. Your agent turns this into its working checklist.",
    },
    {
      key: "spend_authority",
      label: "How much can be spent before the owner is asked?",
      type: "dropdown",
      required: true,
      options: [
        "$0, the owner approves every expense",
        "Up to $250",
        "Up to $500",
        "Up to $1,000",
        "Up to $2,500",
        "Set per owner or property",
        "Other",
      ],
      // The one number the agent cannot infer and must not get wrong in either direction. Guess
      // low and it interrupts the owner over a $40 washer; guess high and it authorises spending
      // somebody else's money. Emergency carve-outs go in "Other" or the handoff list below.
      helper:
        "The threshold in your management agreement. Your agent keeps spending inside this line and brings emergencies straight to you.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page, and the most important one. What you want handed over, and where a person takes over.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your Property Management Agent to own?",
      type: "multiselect",
      options: [
        "First response to tenant messages",
        "Maintenance triage and vendor dispatch",
        "Leasing enquiries and tour scheduling",
        "Rent reminders and delinquency follow-up",
        "Renewal outreach",
        "Owner updates and reporting",
        "Vendor chasing and scheduling",
        "Notices and routine correspondence",
      ],
    },
    {
      key: "handoff_line",
      label: "Always hand to a person when it involves...",
      type: "multiselect",
      required: true,
      options: [
        "Habitability emergencies (heat, water, gas, locks, safety)",
        "Fair housing, accessibility and accommodation requests",
        "Applicant screening decisions and denials",
        "Evictions, legal notices and court matters",
        "Security deposit deductions and disputes",
        "Signing, changing or ending a lease",
        "Rent amounts, concessions and payment plans",
        "Discrimination or harassment complaints",
        "Entry into an occupied unit",
        "Spending above the owner's limit",
        "Other",
      ],
      // This is the guard slot for this role, and it is carrying more than the others: the list of
      // things a property management agent must not do on its own is longer and more specific than
      // for any role in the family except medical. The dangerous cases are listed first so ticking
      // only the top few still gives a safe agent. Fair housing in particular is where a fluent
      // writer is actively dangerous - the phrasing that gets a manager sued reads as friendly and
      // helpful, so the persona holds that line too and does not rely on this answer alone.
      helper:
        "Tick generously. Your agent drafts up to this line and hands the rest to you.",
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Faster first replies to tenants",
        "Maintenance triage and vendor dispatch",
        "Leasing enquiries and showings",
        "Rent reminders and delinquency follow-up",
        "Renewal outreach",
        "Owner updates and monthly reporting",
        "Turnovers and make-ready",
        "Vendor scheduling and chasing",
        "Other",
      ],
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const PROPERTY_MANAGEMENT_BRANCH: IndustryBranch[] = [PORTFOLIO, OPERATIONS, AGENT];
