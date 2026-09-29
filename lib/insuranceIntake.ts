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
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made setup feel slow
// and corporate. One short text field is left, for licensed states. The handoff line is now a
// required checklist with binding and coverage advice listed first. The client-voice question
// moved to the shared Voice page.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the agency ──────────────────────────────────────────────────────
const AGENCY: IndustryBranch = {
  stepTitle: "Your Agency",
  stepSubtitle:
    "What kind of shop this is and who works in it. This sets what your agent handles and what goes to a licensed person.",
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
      helper: "So your agent reasons from the right state's rules.",
    },
    {
      key: "agency_systems",
      label: "What do you run the agency on?",
      type: "multiselect",
      options: [
        "Applied Epic",
        "AMS360 or Sagitta (Vertafore)",
        "HawkSoft",
        "EZLynx",
        "QQCatalyst",
        "NowCerts",
        "AgencyZoom",
        "A comparative rater",
        "Carrier portals",
        "Email and spreadsheets",
        "Other",
      ],
      helper: "Tick everything the day runs through: management system, rater and portals.",
    },
  ],
};

// ─── Page 2: the book ────────────────────────────────────────────────────────
const BOOK: IndustryBranch = {
  stepTitle: "Your Book",
  stepSubtitle:
    "What you write and how the work moves. The more specific here, the less your agent has to guess.",
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
      type: "dropdown",
      options: [
        "Personal lines, auto and home",
        "Commercial property and casualty",
        "Workers compensation",
        "Professional liability / E&O",
        "Life",
        "Health / benefits",
        "Bonds",
        "Other",
      ],
    },
    {
      key: "renewal_work",
      label: "When does renewal work start?",
      type: "dropdown",
      options: [
        "120 days or more before expiry",
        "90 days before",
        "60 days before",
        "30 days before",
        "When the carrier sends the renewal",
        "It varies by account",
      ],
      helper: "Your agent plans reminders and re-marketing around this.",
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
    "The last page. What you want handed over, and where a licensed person always takes over.",
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
    // Licensed activities are listed first, so ticking only the top few still gives a safe agent.
    {
      key: "handoff_line",
      label: "Always hand to a licensed person when it involves...",
      type: "multiselect",
      required: true,
      options: [
        "Binding, quoting or changing coverage",
        "Whether a loss is covered",
        "Coverage recommendations and limits",
        "Certificates with special wording or additional insureds",
        "Claims decisions and adjuster conversations",
        "Anything sent to a carrier under our code",
        "Cancellations and non-renewals",
        "Complaints and E&O-sensitive situations",
        "Clients or risks in other states",
        "Every outgoing client message, reviewed first",
        "Other",
      ],
      helper:
        "Tick generously. Quoting, binding and advising on coverage are licensed activities, and your agent drafts up to this line and hands over.",
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Same-day certificates",
        "Renewal prep and reminders",
        "Faster replies to client service email",
        "Endorsement requests",
        "Claims intake and status updates",
        "Submissions and quote comparison",
        "Cross-sell and account rounding",
        "Clean management system data",
        "Other",
      ],
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const INSURANCE_BRANCH: IndustryBranch[] = [AGENCY, BOOK, AGENT];
