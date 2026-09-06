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
      key: "office_structure",
      label: "How is your office structured?",
      type: "dropdown",
      options: [
        "Solo agent, no staff",
        "Solo agent with an assistant or TC",
        "Member of a team",
        "I lead a team inside a brokerage",
        "I own the brokerage, one office",
        "I own the brokerage, multiple offices",
        "Partnership between two agents",
        "Other",
      ],
      helper: "Who reports to whom decides what the agent is allowed to do on its own.",
    },
    {
      key: "office_detail",
      label: "Anything else about how the office runs?",
      type: "textarea",
      placeholder:
        "e.g. two buyer agents and a shared TC, my partner handles listings and I handle buyers, admin works Tuesdays and Thursdays.",
      helper: "Who does what, who covers whom, and where the handoffs happen.",
    },
    {
      key: "team_size",
      label: "How many people are in your operation?",
      type: "dropdown",
      options: ["Just me", "2-3", "4-8", "9-20", "21-50", "More than 50"],
    },
    {
      key: "brokerage",
      label: "What brokerage are you with?",
      type: "text",
      placeholder: "e.g. Keller Williams, RE/MAX, eXp, Compass, or independent",
    },
    {
      key: "license_states",
      label: "Which states are you licensed in?",
      type: "text",
      placeholder: "e.g. NY, NJ, CT",
      helper: "So the agent does not draft around rules that do not apply to you.",
    },
  ],
};

// ─── Page 2: the market ──────────────────────────────────────────────────────
const MARKET: IndustryBranch = {
  stepTitle: "Your Market",
  stepSubtitle:
    "Where you work and what you sell. This is what your agent needs to sound like a local rather than a search engine.",
  stepLabel: "Market",
  fields: [
    {
      key: "markets",
      label: "Which markets do you work?",
      type: "text",
      placeholder: "e.g. Austin metro; Round Rock and Cedar Park",
      helper: "Cities, neighborhoods, or regions the agent should know by name.",
    },
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
      key: "price_band",
      label: "What is your typical price range?",
      type: "dropdown",
      options: [
        "Under $250k",
        "$250k - $500k",
        "$500k - $1M",
        "$1M - $2.5M",
        "$2.5M - $5M",
        "Above $5M",
        "It varies widely",
      ],
      helper: "Price band changes the tone of everything the agent writes.",
    },
    {
      key: "client_profile",
      label: "Who is your typical client?",
      type: "textarea",
      placeholder:
        "e.g. dual-income families moving out from the city for schools, or downsizing retirees, or investors buying their third door.",
      helper: "The agent writes to this person in every message it drafts.",
    },
  ],
};

// ─── Page 3: deal flow ───────────────────────────────────────────────────────
const DEALS: IndustryBranch = {
  stepTitle: "Your Deal Flow",
  stepSubtitle:
    "How business actually moves through your practice, from first contact to closing. The more specific here, the less your agent has to guess.",
  stepLabel: "Deal Flow",
  fields: [
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
      key: "followup_cadence",
      label: "How do you follow up with a lead who does not respond?",
      type: "textarea",
      placeholder: "e.g. three calls in the first week then nothing, or a monthly market email.",
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
      key: "transaction_tools",
      label: "What do you run transactions on?",
      type: "multiselect",
      options: [
        "Dotloop",
        "SkySlope",
        "DocuSign",
        "zipForm / Lone Wolf",
        "Brokerage's own system",
        "Email and folders",
        "Other",
      ],
    },
    {
      key: "marketing_tools",
      label: "What do you use for marketing?",
      type: "multiselect",
      options: [
        "Canva",
        "Mailchimp or similar",
        "BombBomb / video email",
        "Matterport / 3D tours",
        "A photographer or videographer",
        "Brokerage templates",
        "Nothing consistent",
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
    {
      key: "deal_breakdowns",
      label: "Where do your deals usually go wrong?",
      type: "textarea",
      placeholder:
        "e.g. financing falls apart late, inspection negotiations stall, sellers get cold feet after the appraisal.",
      helper: "Naming the failure mode is how the agent learns to flag it early.",
    },
  ],
};

// ─── Page 4: what the agent owns ─────────────────────────────────────────────
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
        "Listing descriptions & marketing copy",
        "Comps & market research",
        "Transaction checklists (offer to close)",
        "Lead follow-up & nurture",
        "Past client follow-up & referrals",
        "Contract & disclosure summaries",
        "Investment math (cap rate, cash flow, ROI)",
        "Showing & inspection scheduling",
        "Social media & newsletters",
        "CRM hygiene & data entry",
        "Buyer and seller consultation prep",
        "Open house follow-up",
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
      key: "investment_criteria",
      label: "What do the numbers have to clear?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Investment math (cap rate, cash flow, ROI)" },
      placeholder:
        "e.g. 8% cap minimum in my market, $300+/door monthly cash flow, nothing needing more than $40k of work, 20 year hold.",
      helper:
        "Your rules of thumb, in your words. This is what your agent screens a deal against before it tells you the deal is worth a look.",
    },
    {
      key: "scheduling_setup",
      label: "What is your agent booking into, and what are the rules?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Showing & inspection scheduling" },
      placeholder:
        "e.g. Google Calendar under my work address, showings only Tue to Sat 10-6, 45 minute blocks with 30 minutes of drive time between, never book me before 9am.",
      helper:
        "The calendar, the hours you actually show, and anything it must never do without asking you first.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. nobody falls through the cracks after an open house.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "listing_voice",
      label: "How do you want listing copy to sound?",
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
      key: "client_channels",
      label: "How do your clients prefer to hear from you?",
      type: "multiselect",
      options: ["Text", "Phone call", "Email", "WhatsApp", "Social DM", "Whatever they used first"],
    },
    {
      key: "approval_line",
      label: "What must never go out without you seeing it first?",
      type: "textarea",
      placeholder:
        "e.g. anything with a price in it, anything to a client under contract, anything on social.",
      helper: "The agent drafts up to this line and waits.",
    },
    {
      key: "compliance_rules",
      label: "Any advertising or compliance rules it must follow?",
      type: "textarea",
      placeholder:
        "e.g. brokerage name and license number on every ad, fair housing language reviewed before anything is published, no claims about schools.",
      helper:
        "Real estate advertising is regulated and fair housing rules apply to every word of listing copy. Anything your brokerage or state requires belongs here.",
    },
    // "Biggest headache in your business right now?" was here and is gone. The Executive
    // Profile page already asks "Where's the real bottleneck to growth right now?" two pages
    // later, and the answers were the same sentence typed twice. Asking a person to describe
    // their problem twice in one form does not get a better answer, it gets a shorter one.
    {
      key: "real_estate_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The deals, systems, or time back you want three months from now.",
    },
  ],
};

/** Four pages, one blob. The onboarding form renders these in order. */
export const REALESTATE_BRANCH: IndustryBranch[] = [PRACTICE, MARKET, DEALS, AGENT];
