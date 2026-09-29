// The Real Estate Agent's intake deep-dive.
//
// Three pages rather than one. This is the flagship agent and the questionnaire is the whole
// product experience before anything is built, so it is deliberately the most thorough of the
// role intakes: a twelve-question single page could not tell a solo buyer's agent from a
// broker-owner running three offices, and both were being sold the same agent.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`realEstateDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// The pages move from who you are, to how deals run, to what the agent should own. That order
// matters: the last page's answers only make sense once the first two have established the
// practice they apply to.
//
// All fields are optional (David's call): answer what applies, skip the rest.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made the form
// slow and corporate, so every question is a click except `markets`, the one answer only the
// realtor can give. `license_states` folded into it. "How do you want your listing copy to
// sound?" (`listing_voice`) is gone; the shared Voice page now asks tone for every agent.
//
// WHAT IS DELIBERATELY NOT ASKED HERE, and the rule behind it.
//
// This page set peaked at 37 questions and is now ten. The test each survivor had to pass: does
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
// market and price band, the systems it has to work inside, and what to fix first.
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
      type: "dropdown",
      options: [
        "Keller Williams",
        "RE/MAX",
        "eXp Realty",
        "Compass",
        "Coldwell Banker",
        "Century 21",
        "Berkshire Hathaway HomeServices",
        "Sotheby's International Realty",
        "Real Brokerage",
        "Independent brokerage",
        "Other",
      ],
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
    // The one free-text answer on this intake, because a market is a list of names only the
    // realtor knows. It carries the licence states too, which saves a question.
    {
      key: "markets",
      label: "Which markets do you work, and in which states?",
      type: "text",
      placeholder: "e.g. Austin metro, TX; Hoboken and Jersey City, NJ",
      helper: "Cities, neighborhoods, or regions your agent should know by name.",
    },
  ],
};


// ─── Page 2: deal flow ───────────────────────────────────────────────────────
const DEALS: IndustryBranch = {
  stepTitle: "Your Deal Flow",
  stepSubtitle:
    "How business moves through your practice, from first contact to closing. The more specific here, the less your agent has to guess.",
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
        "Pre-construction and builder homes",
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
        "None yet",
        "Other",
      ],
    },
    // config/skills/real-estate.ts reads this as **Transaction Process**, the spine of the
    // transaction checklist, so the key stays even though the answer is now a set of ticks.
    {
      key: "transaction_process",
      label: "Which steps does a typical deal run through, offer to close?",
      type: "multiselect",
      options: [
        "Earnest money deposit",
        "Home inspection",
        "Repair negotiation",
        "Appraisal",
        "Loan approval and clear to close",
        "HOA or condo documents",
        "Title search and survey",
        "Attorney review",
        "Final walkthrough",
        "Closing and signing",
        "Other",
      ],
      helper: "Your agent turns these into your dated transaction checklist.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle: "The last page. What you want handed over, and where it checks with you first.",
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
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Follow-up after open houses and showings",
        "Faster replies to incoming leads",
        "Keeping past clients and referrals warm",
        "Listing descriptions and marketing",
        "Staying ahead of transaction deadlines",
        "Comps and pricing prep",
        "Showing and inspection scheduling",
        "A clean, current CRM",
        "Other",
      ],
      helper: "Your agent gets configured around this first.",
    },
    {
      key: "approval_line",
      label: "Always check with me first before it...",
      type: "multiselect",
      options: [
        "Sends anything with a price in it",
        "Messages a client under contract",
        "Posts anything on social media",
        "Publishes or updates a listing",
        "Replies to an incoming lead",
        "Contacts another agent or broker",
        "Shares contract or disclosure details",
        "Books a showing or inspection",
        "Other",
      ],
      helper: "Your agent drafts up to this line and waits for you.",
    },
    // "Biggest headache in your business right now?" was here and is gone. The Executive
    // Profile page already asks "Where's the real bottleneck to growth right now?" two pages
    // later, and the answers were the same sentence typed twice. Asking a person to describe
    // their problem twice in one form does not get a better answer, it gets a shorter one.
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const REALESTATE_BRANCH: IndustryBranch[] = [PRACTICE, DEALS, AGENT];
