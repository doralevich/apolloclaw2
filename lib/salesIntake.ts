// The Sales Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `sales` (config/agent-types.ts), on top of the standard business
// questions, so a sales agent is set up around how the client actually sells from day one.
//
// All fields are optional: answer what applies, skip the rest.
//
// Answers land under the `salesDetails` key and are surfaced in USER.md / the intake email via the
// "Sales Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const SALES_BRANCH: IndustryBranch = {
  stepTitle: "How You Sell",
  stepSubtitle: "A few specifics so your sales agent works your pipeline and sounds like your team from day one.",
  fields: [
    {
      key: "what_you_sell",
      label: "What do you sell?",
      type: "textarea",
      placeholder: "Your product or service, and the problem it solves for the buyer.",
    },
    {
      key: "icp",
      label: "Who is your ideal customer?",
      type: "textarea",
      placeholder: "The companies and people you sell to best: size, role, industry, what triggers a purchase.",
    },
    {
      key: "motion",
      label: "What kind of sales motion is it?",
      type: "multiselect",
      options: [
        "Outbound / cold outreach",
        "Inbound / leads come to us",
        "Referrals / word of mouth",
        "Self-serve / product-led",
        "Channel / partners",
        "Field / in person",
        "Other",
      ],
    },
    {
      key: "deal_size",
      label: "Typical deal size?",
      type: "dropdown",
      options: [
        "Under $1k",
        "$1k-$10k",
        "$10k-$50k",
        "$50k-$250k",
        "$250k+",
        "Varies widely",
      ],
    },
    {
      key: "cycle_length",
      label: "How long is a typical sales cycle?",
      type: "dropdown",
      options: [
        "Same day / transactional",
        "A few days",
        "A few weeks",
        "1-3 months",
        "3-6 months",
        "6 months+",
      ],
    },
    {
      key: "crm",
      label: "What CRM do you use?",
      type: "dropdown",
      options: [
        "Salesforce",
        "HubSpot",
        "Pipedrive",
        "Close",
        "Zoho",
        "Copper",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "sales_tools",
      label: "Which sales tools do you use?",
      type: "multiselect",
      options: [
        "Apollo",
        "Outreach",
        "Salesloft",
        "LinkedIn Sales Navigator",
        "ZoomInfo",
        "Gong / Chorus",
        "Calendly",
        "DocuSign / PandaDoc",
        "Email (Gmail / Outlook)",
        "Other",
      ],
    },
    {
      key: "objections",
      label: "What objections come up most?",
      type: "textarea",
      placeholder: "e.g. too expensive, happy with current vendor, no budget this quarter, need to check with the team.",
      helper: "So the agent has honest, specific responses ready.",
    },
    {
      key: "owns_work",
      label: "What do you want your sales agent to own?",
      type: "multiselect",
      options: [
        "Prospect & account research",
        "Personalized cold outreach",
        "Follow-up cadences",
        "Call briefs & prep",
        "Objection handling scripts",
        "Proposal drafts",
        "CRM notes & pipeline updates",
        "Lead qualification",
      ],
    },
    {
      key: "sales_pain",
      label: "Biggest sales headache right now?",
      type: "textarea",
      placeholder: "e.g. follow-up falls through the cracks, outreach gets ignored, the pipeline is a mess, I hate writing proposals.",
    },
    {
      key: "sales_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The pipeline, the meetings booked, or the time back you want three months from now.",
    },
  ],
};
