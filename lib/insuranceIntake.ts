// The Insurance Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `insurance` (config/agent-types.ts), on top of the standard
// business questions, so an agency's agent is set up around the lines it actually writes and the
// carriers it actually places with from day one.
//
// All fields are optional: answer what applies, skip the rest.
//
// This agent SUPPORTS a licensed professional; it does not replace one. It compares, explains,
// drafts, and chases - it does not bind coverage, make underwriting calls, or give regulatory
// advice (see the `insurance` persona in config/personas.ts). Every question below asks about the
// agency's own workflow and book, never about a determination only a licensed person can make.
//
// Answers land under the `insuranceDetails` key and are surfaced in USER.md / the intake email via
// the "Insurance Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const INSURANCE_BRANCH: IndustryBranch = {
  stepTitle: "Your Book of Business",
  stepSubtitle:
    "A few specifics so your insurance agent works your renewals, quotes, and client questions the way your agency does. It supports your licensed team; it does not bind coverage or make underwriting decisions.",
  fields: [
    {
      key: "agency_type",
      label: "What kind of shop is it?",
      type: "dropdown",
      options: [
        "Independent agency",
        "Captive agent",
        "Brokerage",
        "MGA or wholesaler",
        "Solo producer",
        "Other",
      ],
    },
    {
      key: "lines_written",
      label: "Which lines do you write?",
      type: "multiselect",
      options: [
        "Personal auto",
        "Homeowners",
        "Commercial property",
        "Commercial auto",
        "General liability",
        "Workers compensation",
        "Professional liability / E&O",
        "Cyber",
        "Life",
        "Health / benefits",
        "Umbrella / excess",
        "Specialty or surplus lines",
      ],
      helper: "Pick everything you actively place. It changes which questions your agent knows to ask.",
    },
    {
      key: "primary_line",
      label: "Which line is most of your revenue?",
      type: "text",
      placeholder: "e.g. commercial property, personal auto, group benefits",
      helper: "The one worth getting right first, if the agent has to pick.",
    },
    {
      key: "carriers",
      label: "Which carriers do you place with most?",
      type: "textarea",
      placeholder: "e.g. Travelers, Chubb, Nationwide, Progressive, plus two regional carriers for coastal property.",
      helper: "So comparisons and proposals reference the markets you actually have access to.",
    },
    {
      key: "agency_size",
      label: "How big is the agency?",
      type: "dropdown",
      options: ["Solo producer", "2-5 people", "6-15 people", "16-50 people", "More than 50"],
    },
    {
      key: "book_size",
      label: "Roughly how large is the book?",
      type: "text",
      placeholder: "e.g. 900 policies, or about $2.4M in written premium",
      helper: "A rough number is fine. It sets expectations for renewal volume.",
    },
    {
      key: "agency_systems",
      label: "What do you run the agency on?",
      type: "textarea",
      placeholder: "e.g. Applied Epic for management, EZLynx for rating, HawkSoft for personal lines, plus Outlook and a shared drive.",
      helper: "Management system, rater, CRM, comparative quoting, anything else that holds client data.",
    },
    {
      key: "renewal_work",
      label: "How do renewals run today?",
      type: "textarea",
      placeholder: "e.g. we pull a 60-day renewal list every Monday, remarket anything with a rate increase over 10%, and the producer calls the top 20 accounts.",
      helper: "The lapses and the surprises usually live here, so the more detail the better.",
    },
    {
      key: "quoting_work",
      label: "What does quoting a new account look like?",
      type: "textarea",
      placeholder: "e.g. intake call, run it through three carriers, build a side-by-side, send a proposal PDF, follow up twice.",
    },
    {
      key: "claims_work",
      label: "How involved are you in claims?",
      type: "textarea",
      placeholder: "e.g. we take first notice of loss, hand off to the carrier adjuster, then chase status weekly until it closes.",
    },
    {
      key: "client_comms",
      label: "What client communication eats the most time?",
      type: "multiselect",
      options: [
        "Renewal notices and reminders",
        "Certificates of insurance",
        "Explaining coverage and exclusions",
        "Quote follow-up",
        "Claims status chasing",
        "Policy change requests",
        "Payment and billing questions",
        "Onboarding new clients",
      ],
    },
    {
      key: "certificates",
      label: "How much certificate work do you do?",
      type: "dropdown",
      options: [
        "Constant - it is a daily job",
        "Steady, a few a week",
        "Occasional",
        "Almost none",
      ],
      helper: "Certificates are high-volume and low-judgment, which makes them worth handing over first.",
    },
    {
      key: "cross_sell",
      label: "What do you wish you were cross-selling but never get to?",
      type: "textarea",
      placeholder: "e.g. umbrella on every personal auto household, cyber on every commercial account.",
    },
    {
      key: "states_licensed",
      label: "Which states are you licensed in?",
      type: "text",
      placeholder: "e.g. NY, NJ, CT",
      helper: "So the agent does not draft around rules that do not apply to you.",
    },
    {
      key: "compliance_rules",
      label: "Any compliance rules the agent must respect?",
      type: "textarea",
      placeholder: "e.g. never quote a bindable number in writing, always include the carrier's disclosure language, no client data leaves the management system.",
      helper: "This is a regulated business. Anything the agent must never do belongs here.",
    },
    {
      key: "handoff_line",
      label: "Where must a licensed person always take over?",
      type: "textarea",
      placeholder: "e.g. anything binding, any coverage determination, any claim denial conversation.",
      helper: "The agent drafts and prepares up to this line and stops.",
    },
  ],
};
