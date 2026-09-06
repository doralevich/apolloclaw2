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
      key: "support_staff",
      label: "What support do you already have?",
      type: "multiselect",
      options: [
        "Transaction coordinator",
        "Executive or virtual assistant",
        "Inside sales agent (ISA)",
        "Marketing person",
        "Showing assistant",
        "Bookkeeper",
        "None of the above",
      ],
      helper: "So the agent complements your people instead of duplicating them.",
    },
    {
      key: "brokerage",
      label: "What brokerage are you with?",
      type: "text",
      placeholder: "e.g. Keller Williams, RE/MAX, eXp, Compass, or independent",
    },
    {
      key: "years_experience",
      label: "How long have you been in real estate?",
      type: "dropdown",
      options: ["Less than a year", "1-3 years", "4-7 years", "8-15 years", "More than 15 years"],
    },
    {
      key: "license_states",
      label: "Which states are you licensed in?",
      type: "text",
      placeholder: "e.g. NY, NJ, CT",
      helper: "So the agent does not draft around rules that do not apply to you.",
    },
    {
      key: "mls",
      label: "Which MLS(es) do you belong to?",
      type: "text",
      placeholder: "e.g. Bright MLS, Stellar MLS, CRMLS",
    },
    {
      key: "designations",
      label: "Any designations or certifications?",
      type: "multiselect",
      options: [
        "GRI",
        "CRS",
        "ABR (buyer's rep)",
        "SRS (seller's rep)",
        "SRES (seniors)",
        "CCIM (commercial)",
        "CIPS (international)",
        "Luxury certification",
        "None",
        "Other",
      ],
      helper: "These show up in your bio and marketing, so the agent should know them.",
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
      key: "market_knowledge",
      label: "What should your agent know about those areas?",
      type: "textarea",
      placeholder:
        "e.g. the school districts buyers ask about, which streets flood, the HOA everyone complains about, the new development changing comps.",
      helper: "The local knowledge that separates you from an out-of-area agent.",
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
      key: "specialties",
      label: "What do you specialize in?",
      type: "multiselect",
      options: [
        "Buyer representation",
        "Listing / seller representation",
        "Luxury",
        "First-time buyers",
        "Investors",
        "Relocation",
        "New construction",
        "Rentals / leasing",
        "Commercial",
        "Land",
        "Distressed / foreclosure",
        "Other",
      ],
    },
    {
      key: "client_profile",
      label: "Who is your typical client?",
      type: "textarea",
      placeholder:
        "e.g. dual-income families moving out from the city for schools, or downsizing retirees, or investors buying their third door.",
      helper: "The agent writes to this person in every message it drafts.",
    },
    {
      key: "positioning",
      label: "Why do clients pick you over the agent down the street?",
      type: "textarea",
      placeholder: "The thing you would say on a listing appointment if you only got one sentence.",
    },
    {
      key: "seasonality",
      label: "How does your year run?",
      type: "textarea",
      placeholder:
        "e.g. spring is listings, summer is relocations, dead from Thanksgiving to mid-January.",
      helper: "So outreach lands when your market is actually paying attention.",
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
      key: "transaction_volume",
      label: "Roughly how many deals do you close a year?",
      type: "dropdown",
      options: ["1-5", "6-15", "16-30", "31-60", "61-120", "More than 120", "Just getting started"],
    },
    {
      key: "pipeline_now",
      label: "What is in your pipeline right now?",
      type: "text",
      placeholder: "e.g. 4 active listings, 6 buyers, 3 under contract",
      helper: "A rough count is fine. It tells the agent what week one looks like.",
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
      key: "lead_response",
      label: "What happens when a new lead comes in today?",
      type: "textarea",
      placeholder:
        "e.g. I get a text alert, call within the hour if I can, then it usually sits until the weekend.",
      helper: "Be honest about where it breaks down. That gap is the first thing to fix.",
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
      key: "vendors",
      label: "Who is on your preferred vendor list?",
      type: "textarea",
      placeholder:
        "e.g. lender, title company, inspector, photographer, stager, handyman, attorney.",
      helper: "So the agent recommends your people by name instead of saying 'a lender'.",
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
    {
      key: "real_estate_pain",
      label: "Biggest headache in your business right now?",
      type: "textarea",
      placeholder:
        "e.g. follow-up falls through the cracks, listings take too long to write, I never have comps ready fast enough.",
    },
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
