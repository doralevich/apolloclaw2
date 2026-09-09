// The Real Estate Agent's intake deep-dive.
//
// Four pages rather than one. This is the flagship agent and the questionnaire is the whole
// product experience before anything is built, so it is deliberately the most thorough of the
// role intakes: a twelve-question single page could not tell a solo buyer's agent from a
// broker-owner running three offices, and both were being sold the same agent.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All four write into ONE blob
// (`realEstateDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// The pages move from who you are, to where you work, to how deals actually run, to what the
// agent should own. That order matters: the last page's answers only make sense once the first
// three have established the practice they apply to.
//
// All fields are optional (David's call): answer what applies, skip the rest.
//
// WHAT IS DELIBERATELY NOT ASKED HERE, and the rule behind it.
//
// This page set peaked at 37 questions and is now 25. The test each survivor had to pass: does
// the agent need this BEFORE its first useful action, or is it something the agent can simply
// ask? It talks to its owner every day. Anything it can learn by asking does not belong in front
// of somebody who has already decided to buy, because every question there is a chance to close
// the tab instead.
//
// Cut because the agent can ask, and the answer keeps better when it comes up in context:
// support staff, years in the business, MLS memberships, designations, local market knowledge,
// specialties, how the year runs seasonally, annual deal volume, what happens to a new lead
// today, and the preferred vendor list.
//
// Cut because it was already asked: "Why do clients pick you over the agent down the street?"
// is the same question as "What makes you different?" on the shared What You Do page, and the
// second ask got the shorter answer.
//
// Cut because it goes stale: "What is in your pipeline right now?" is wrong the week after it
// is answered, and USER.md tells the agent to treat what it holds as ground truth. A fact with
// a one-week shelf life does not belong in a permanent profile.
//
// What stayed is what the agent cannot infer, cannot easily ask, or must not get wrong:
// licensing and compliance boundaries, the approval line, office structure (who it may act for),
// market and price band, voice, the systems it has to work inside, and what to fix first.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the practice ────────────────────────────────────────────────────
const PRACTICE: IndustryBranch = {
  stepTitle: "Your Real Estate Practice",
  stepSubtitle:
    "Who you are in the business. This sets whether your agent is working for one producer, a team, or a whole office.",
  stepLabel: "Practice",
  fields: [
    // FIRST, David's call. It is the question a realtor can answer without thinking, it is the
    // one that most changes what the agent may say (brokerage name and licence number belong on
    // the advertising it writes), and opening on it reads as a form built for them rather than a
    // generic intake that got to real estate eventually.
    {
      key: "brokerage",
      label: "What brokerage are you with?",
      type: "text",
      placeholder: "e.g. Keller Williams, RE/MAX, eXp, Compass, or independent",
    },
    {
      key: "role",
      label: "What is your role in real estate?",
      type: "multiselect",
      options: [
        "Residential agent / Realtor",
        "Commercial broker",
        "Investor / flipper",
        "Buy-and-hold landlord",
        "Property manager",
        "Wholesaler",
        "Team lead",
        "Broker-owner",
        "Other",
      ],
    },
    {
      key: "license_states",
      label: "Which states are you licensed in?",
      type: "text",
      placeholder: "e.g. NY, NJ, CT",
      helper: "So the agent does not draft around rules that do not apply to you.",
    },
    {
      key: "markets",
      label: "Which markets do you work?",
      type: "text",
      placeholder: "e.g. Austin metro; Round Rock and Cedar Park",
      helper: "Cities, neighborhoods, or regions the agent should know by name.",
    },
  ],
};


// ─── Page 2: deal flow ───────────────────────────────────────────────────────
const DEALS: IndustryBranch = {
  stepTitle: "Your Deal Flow",
  stepSubtitle:
    "How business actually moves through your practice, from first contact to closing. The more specific here, the less your agent has to guess.",
  stepLabel: "Deal Flow",
  fields: [
    {
      key: "property_types",
      label: "What property types do you handle?",
      type: "multiselect",
      options: [
        "Single-family homes",
        "Condos / townhomes",
        "Multifamily (2-4 units)",
        "Apartment buildings (5+)",
        "Land / lots",
        "Commercial (office / retail / industrial)",
        "Short-term rentals",
        "New construction",
        "Farm / ranch",
        "Other",
      ],
    },
    {
      key: "lead_sources",
      label: "Where do your leads come from?",
      type: "multiselect",
      options: [
        "Referrals / sphere",
        "Zillow / portals",
        "Open houses",
        "Social media",
        "Paid ads",
        "Cold outreach / circle prospecting",
        "Past clients",
        "Farming a neighborhood",
        "Builder or developer relationships",
        "Other",
      ],
    },
    {
      key: "crm",
      label: "What CRM do you use?",
      type: "dropdown",
      options: [
        "Follow Up Boss",
        "kvCORE / BoldTrail",
        "LionDesk",
        "Sierra Interactive",
        "Wise Agent",
        "Real Geeks",
        "Chime",
        "HubSpot",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "transaction_process",
      label: "Walk us through a deal from accepted offer to closing.",
      type: "textarea",
      placeholder:
        "e.g. accepted offer, order inspection within 3 days, negotiate repairs by day 10, appraisal, clear to close, final walkthrough the morning of.",
      helper:
        "The dates, the order, and who you chase at each step. This is what the agent turns into your transaction checklist.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, how it should sound, and the lines it must not cross.",
  stepLabel: "Your Agent",
  // The mascot lives here now. It was on the generic "What your agent should take on" page,
  // which a role agent no longer sees - that page asked the same two questions this one does,
  // in blander words. This is the page it was always meant for anyway: the one about the agent.
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your real estate agent to own?",
      type: "multiselect",
      options: [
        "Listing descriptions and marketing copy",
        "Comps and market research",
        "Transaction checklists (offer to close)",
        "Lead and open-house follow-up",
        "Past client follow-up and referrals",
        "Contract and disclosure summaries",
        "Showing and inspection scheduling",
        "CRM hygiene and data entry",
      ],
    },
    // The two follow-ups to owns_work, and the reason they exist: those two options are the
    // only ones on the list that ask the agent to APPLY A RULE it cannot infer. "Write listing
    // copy" is configured by the voice question below; "run my investment math" is not
    // configured by anything unless we ask what the numbers have to clear, and "handle my
    // scheduling" is not configured by anything unless we ask what it is booking into.
    //
    // Without these the agent is told to do two jobs and has to open by interviewing its owner
    // about both, on day one, having just been handed forty other answers.
    //
    // Conditional, so the realtor who ticked neither never sees them.
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. nobody falls through the cracks after an open house.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "listing_voice",
      label: "How do you want your listing copy to sound?",
      type: "textarea",
      placeholder:
        "e.g. warm and specific, never 'stunning' or 'must see', always lead with the thing a buyer actually cares about.",
      // Deliberately asks for the RULE, not an example. The writing-sample page later in the
      // form asks for a listing they were proud of; asking for one here too would get the same
      // paste twice and lose the one thing this question can get that a sample cannot - the
      // words they refuse to use.
      helper: "The house style, not an example. There is a page for a listing later.",
    },
    {
      key: "approval_line",
      label: "What must never go out without you seeing it first?",
      type: "textarea",
      placeholder:
        "e.g. anything with a price in it, anything to a client under contract, anything on social.",
      helper: "The agent drafts up to this line and waits.",
    },
    // "Biggest headache in your business right now?" was here and is gone. The Executive
    // Profile page already asks "Where's the real bottleneck to growth right now?" two pages
    // later, and the answers were the same sentence typed twice. Asking a person to describe
    // their problem twice in one form does not get a better answer, it gets a shorter one.
  ],
};

/** Four pages, one blob. The onboarding form renders these in order. */
export const REALESTATE_BRANCH: IndustryBranch[] = [PRACTICE, DEALS, AGENT];
