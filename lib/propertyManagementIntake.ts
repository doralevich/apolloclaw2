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
// somebody is coming, the owner needs to know what it costs and why it was approved. So the voice
// question asks for both in one answer rather than asking twice, and `who_you_answer_to` is on the
// form at all because managing for one landlord and managing for an HOA board are different jobs
// with the same job title.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other nine role intakes: does the agent need
// this before its first useful action, or can it just ask? No unit-level rent roll, no vendor list,
// no fee structure, no occupancy or delinquency rate - all of that is in the management system the
// moment the agent connects, and asking somebody to hand-copy their own rent roll into a form is
// the CFO agent's cost-structure mistake wearing different clothes. No "biggest headache" either:
// the Executive Profile page asks about the bottleneck two steps later and the second ask got the
// shorter answer.
//
// Twelve questions, matching the ceiling every role intake was cut to. The last four are the shared
// family tail - what it owns, where it stops, how it sounds, what to fix first - so this reads as
// the tenth member of a family rather than a form that arrived from somewhere else.
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
        "This changes everything downstream. An HOA manager answers to a board and a budget; a short-term operator turns units over weekly; a commercial manager reads leases nobody else in this list has.",
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
      // wrongly, and a wrong notice period is a lost case rather than a typo.
      helper:
        "Down to the city where it matters. Notice periods, deposit rules and entry rights are local, and this is the single most common way a confident answer goes wrong.",
    },
    {
      key: "management_systems",
      label: "What do you run the business on?",
      type: "textarea",
      placeholder:
        "e.g. AppFolio for accounting and the owner portal, a shared inbox for maintenance, Slack with the vendors, spreadsheets for turnovers.",
      // Textarea rather than a picker, following the insurance intake's `agency_systems`. A
      // management shop is never on one system - there is the platform of record, and then the
      // three places the work actually happens. The gaps between them are where the agent earns
      // its money, and a checklist of vendor names cannot describe a gap.
      helper:
        "AppFolio, Buildium, Yardi, Rent Manager, DoorLoop, or a stack of spreadsheets. Say where the work really happens, not just what you pay for.",
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
      label: "Walk us through a maintenance request, from the tenant's message to the paid invoice.",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. tenant texts or uses the portal, we triage same day, anything with water or heat is an emergency and gets a vendor within 4 hours, everything else is scheduled within 3 business days. Over $500 we call the owner first. Vendor invoices us, we pay from the operating account and it lands on the owner's monthly statement.",
      // The highest-signal answer in the form, and the reason it is required. This is the loop the
      // agent will spend most of its day inside, and it is the one process no two shops run the
      // same way. It is this intake's equivalent of the real estate agent's `transaction_process`,
      // and it does the same job: it becomes the checklist the agent works from.
      helper:
        "The order, the timings, and who you chase at each step. This is what your agent turns into its working checklist, so it is worth being long.",
    },
    {
      key: "spend_authority",
      label: "What can be spent without asking the owner first?",
      type: "text",
      required: true,
      placeholder: "e.g. $500 per item, or $250 unless it is heat, water or a lock",
      // The one number the agent cannot infer and must not get wrong in either direction. Guess
      // low and it interrupts the owner over a $40 washer; guess high and it authorises spending
      // somebody else's money. There is usually an emergency carve-out, which is why the
      // placeholder shows one rather than just a figure.
      helper:
        "The threshold in your management agreement, and any emergency carve-out above it. Your agent will not commit money past this line.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page, and the most important one. What you want handed over, and the lines it must never cross.",
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
      label: "Where must a person take over, and what must never go out without you seeing it?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything to do with an eviction or a legal notice, any deduction from a deposit, any screening decision or a reason somebody was turned down, anything that commits us to a lease term or a rent number, and anything about heat, water or a lock stops being email and becomes a phone call to me.",
      // Two things in one answer because they are the same instinct, same as the Law Agent's
      // question of this name. This is the guard slot for this role, and it is carrying more than
      // the others: the list of things a property management agent must not do on its own is
      // longer and more specific than for any role in the family except medical. Fair housing in
      // particular is where a fluent writer is actively dangerous - the phrasing that gets a
      // manager sued reads as friendly and helpful, so the persona holds that line too and does
      // not rely on this answer alone.
      helper:
        "Be generous here. Evictions and legal notices, screening decisions and the reasons behind them, deposit deductions, anything binding a lease or a rent, and anything that is a habitability emergency. Your agent drafts up to this line and stops.",
    },
    {
      key: "tenant_owner_voice",
      label: "How should it sound to a tenant, and how should it sound to an owner?",
      type: "textarea",
      placeholder:
        "e.g. to a tenant: short, warm, always says what happens next and when, never defensive even when we are in the wrong. To an owner: plain numbers first, then the recommendation, no drama, and never a surprise in a monthly statement.",
      // Deliberately one question rather than two, and the gap between the halves IS the answer.
      // Asked separately these get the same paragraph twice; asked together, people write the
      // contrast, which is the thing the agent actually needs in order to switch registers.
      helper:
        "Both, in one answer. The difference between the two is the part your agent cannot work out on its own.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder:
        "e.g. no tenant waits more than an hour for a first reply, and no work order sits unassigned overnight.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const PROPERTY_MANAGEMENT_BRANCH: IndustryBranch[] = [PORTFOLIO, OPERATIONS, AGENT];
