// The Insurance Agent's intake deep-dive.
//
// Three pages rather than one: the agency, the book, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`insuranceDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THE LICENSING LINE IS THE WHOLE GAME HERE. Quoting, binding, advising on coverage and answering
// "am I covered for this" are licensed activities in every state, and an agent that drifts across
// that line creates E&O exposure for the customer, not for us. So the handoff question is required,
// it is asked in plain words, and the certificate follow-up exists because certificates are where
// an unlicensed process most often ends up asserting coverage that does not exist.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No commission splits, no loss ratios, no
// carrier appointment history, and no "biggest headache" - the Executive Profile page asks about
// the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the agency ──────────────────────────────────────────────────────
const AGENCY: IndustryBranch = {
  stepTitle: "Your Agency",
  stepSubtitle:
    "What kind of shop this is and who works in it. This sets what your agent may do without a licensed person present.",
  stepLabel: "Agency",
  fields: [
    {
      key: "agency_type",
      label: "What kind of shop is it?",
      type: "dropdown",
      required: true,
      options: [
        "Independent agency",
        "Captive agent for one carrier",
        "Broker",
        "Managing general agent (MGA)",
        "Wholesaler",
        "Solo producer",
        "Other",
      ],
    },
    {
      key: "agency_size",
      label: "How big is the agency?",
      type: "dropdown",
      options: ["Just me", "2-5", "6-15", "16-50", "More than 50"],
    },
    {
      key: "states_licensed",
      label: "Which states are you licensed in?",
      type: "text",
      placeholder: "e.g. NY, NJ, CT",
      helper: "So your agent does not reason from the wrong state's rules.",
    },
    {
      key: "agency_systems",
      label: "What do you run the agency on?",
      type: "textarea",
      placeholder: "e.g. AMS360, plus carrier portals and a lot of email.",
      helper: "Management system, rater, and anything else the day runs through.",
    },
  ],
};

// ─── Page 2: the book ────────────────────────────────────────────────────────
const BOOK: IndustryBranch = {
  stepTitle: "Your Book",
  stepSubtitle:
    "What you write and how the work actually moves. The more specific here, the less your agent has to guess.",
  stepLabel: "The Book",
  fields: [
    {
      key: "lines_written",
      label: "Which lines do you write?",
      type: "multiselect",
      options: [
        "Personal auto",
        "Homeowners",
        "Umbrella",
        "Commercial property",
        "General liability",
        "Commercial auto",
        "Workers compensation",
        "Professional liability / E&O",
        "Cyber",
        "Life",
        "Health / benefits",
        "Bonds",
        "Other",
      ],
    },
    {
      key: "primary_line",
      label: "Which line is most of your revenue?",
      type: "text",
      placeholder: "e.g. commercial property for contractors",
    },
    {
      key: "renewal_work",
      label: "How do renewals run today?",
      type: "textarea",
      placeholder:
        "e.g. a list comes out 60 days ahead, my CSR re-markets anything with a rate increase, I only touch the accounts over $10k.",
      helper: "The lead time, who does what, and where it slips.",
    },
    {
      key: "service_load",
      label: "What service work eats the most time?",
      type: "multiselect",
      options: [
        "Certificates of insurance",
        "Endorsement requests",
        "Billing and payment questions",
        "Claims intake and follow-up",
        "ID cards and policy documents",
        "Renewal questions",
        "Audit requests",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, and where a licensed person must always take over.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your insurance agent to own?",
      type: "multiselect",
      options: [
        "Certificate requests",
        "Renewal prep and reminders",
        "Submissions and quote comparison",
        "Client service email and follow-up",
        "Claims intake and status chasing",
        "Policy and endorsement checking",
        "Cross-sell and account rounding prompts",
        "Management system data entry",
      ],
    },
    // The follow-up to the option that most often crosses the licensing line without anybody
    // noticing. A certificate is a statement about coverage; issuing one that says something the
    // policy does not say is an E&O claim waiting to happen, so the rules are asked for up front.
    {
      key: "handoff_line",
      label: "Where must a licensed person take over, and what never goes out without you seeing it?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything that binds, any advice on whether a loss is covered, any coverage recommendation, any conversation with an adjuster. Nothing goes to a carrier under my code without me reading it, and certificates follow the wording our E&O carrier requires.",
      helper:
        "This was three questions - the licensed handoff, the approval line, and carrier or compliance rules - and they are one instinct. Answering it once, at length, gets a better answer than three smaller boxes did. Be generous: quoting, binding and advising on coverage are licensed activities.",
    },
    {
      key: "client_voice",
      label: "How should it sound to a client?",
      type: "textarea",
      placeholder:
        "e.g. plain English, no policy jargon, never make them feel stupid for asking, always say what happens next and when.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. certificates go out same day without me touching them.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const INSURANCE_BRANCH: IndustryBranch[] = [AGENCY, BOOK, AGENT];
