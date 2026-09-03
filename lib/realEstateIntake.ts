// The Real Estate Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `realestate` (config/agent-types.ts), on top of the standard
// business questions, so a real-estate agent is set up around the client's actual practice from
// day one.
//
// Every field is required (David's call): the whole step is the discipline detail that makes the
// agent useful, so none of it is optional.
//
// Answers land under the `realEstateDetails` key and are surfaced in USER.md / the intake email
// via the "Real Estate Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const REALESTATE_BRANCH: IndustryBranch = {
  stepTitle: "Your Real Estate Practice",
  stepSubtitle: "A few specifics so your real estate agent works your market and your deals from day one.",
  fields: [
    {
      key: "role",
      label: "What is your role in real estate?",
      type: "multiselect",
      required: true,
      options: [
        "Residential agent / Realtor",
        "Commercial broker",
        "Investor / flipper",
        "Buy-and-hold landlord",
        "Property manager",
        "Wholesaler",
        "Team lead / brokerage owner",
        "Other",
      ],
    },
    {
      key: "brokerage",
      label: "What brokerage are you with?",
      type: "text",
      required: true,
      placeholder: "e.g. Keller Williams, RE/MAX, eXp, Compass, or independent",
    },
    {
      key: "mls",
      label: "Which MLS(es) do you belong to?",
      type: "text",
      required: true,
      placeholder: "e.g. Bright MLS, Stellar MLS, CRMLS",
      helper: "The multiple listing service(s) you are a member of.",
    },
    {
      key: "markets",
      label: "Which markets do you work?",
      type: "text",
      required: true,
      placeholder: "e.g. Austin metro; Round Rock and Cedar Park",
      helper: "Cities, neighborhoods, or regions the agent should know.",
    },
    {
      key: "property_types",
      label: "What property types do you handle?",
      type: "multiselect",
      required: true,
      options: [
        "Single-family homes",
        "Condos / townhomes",
        "Multifamily (2-4 units)",
        "Apartment buildings (5+)",
        "Land / lots",
        "Commercial (office / retail / industrial)",
        "Short-term rentals",
        "Other",
      ],
    },
    {
      key: "specialties",
      label: "What do you specialize in?",
      type: "multiselect",
      required: true,
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
        "Other",
      ],
    },
    {
      key: "transaction_volume",
      label: "Roughly how many deals do you close a year?",
      type: "dropdown",
      required: true,
      options: ["1-5", "6-15", "16-30", "31-60", "60+", "Just getting started"],
    },
    {
      key: "crm",
      label: "What CRM or transaction system do you use?",
      type: "dropdown",
      required: true,
      options: [
        "Follow Up Boss",
        "kvCORE / BoldTrail",
        "LionDesk",
        "Sierra Interactive",
        "Wise Agent",
        "HubSpot",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "re_tools",
      label: "Which real estate tools and programs do you use?",
      type: "multiselect",
      required: true,
      helper: "E-signature, showings, lockboxes, comps, marketing, 3D tours.",
      options: [
        "DocuSign",
        "dotloop",
        "SkySlope",
        "ShowingTime",
        "SentriLock / Supra lockbox",
        "Cloud CMA / RPR (comps)",
        "Canva",
        "BombBomb",
        "Matterport / 3D tours",
        "Zillow Premier Agent",
        "None yet",
        "Other",
      ],
    },
    {
      key: "lead_sources",
      label: "Where do your leads come from?",
      type: "multiselect",
      required: true,
      options: [
        "Referrals / sphere",
        "Zillow / portals",
        "Open houses",
        "Social media",
        "Paid ads",
        "Cold outreach",
        "Past clients",
        "Other",
      ],
    },
    {
      key: "owns_work",
      label: "What do you want your real estate agent to own?",
      type: "multiselect",
      required: true,
      options: [
        "Listing descriptions & marketing copy",
        "Comps & market research",
        "Transaction checklists (offer to close)",
        "Client follow-up & nurture",
        "Contract & disclosure summaries",
        "Investment math (cap rate, cash flow, ROI)",
        "Showing & inspection scheduling",
        "Social media & newsletters",
      ],
    },
    {
      key: "real_estate_pain",
      label: "Biggest headache in your business right now?",
      type: "textarea",
      required: true,
      placeholder: "e.g. follow-up falls through the cracks, listings take too long to write, I never have comps ready fast enough.",
    },
    {
      key: "real_estate_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      required: true,
      placeholder: "The deals, systems, or time back you want three months from now.",
    },
  ],
};
