// The Recruiting Agent's intake deep-dive.
//
// Three pages rather than one: who you hire, how hiring runs, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`recruitingDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THE FAIRNESS QUESTIONS ARE NOT DECORATION. Hiring is a regulated activity in most of the places
// this will be sold, and an agent that screens, ranks, or rejects candidates can create real legal
// exposure and real harm to real people. So this intake asks directly what the agent may decide
// versus recommend, and treats "it never rejects anyone on its own" as the sane default rather
// than a setting to discover later. The screening follow-up on page three exists for exactly that.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No headcount plan, no salary bands, no
// historical time-to-fill, and no "biggest hiring headache" - the Executive Profile page asks
// about the bottleneck two steps later and the second ask got the shorter answer.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made setup feel slow
// and corporate. One short text field is left, for job titles, because those are unique to the
// business. The candidate-voice question moved to the shared Voice page every agent gets.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: who you hire ────────────────────────────────────────────────────
const HIRING: IndustryBranch = {
  stepTitle: "Who You Hire",
  stepSubtitle:
    "The roles and the people. Your agent has to be able to tell a strong candidate from a keyword match.",
  stepLabel: "Who You Hire",
  fields: [
    {
      key: "context",
      label: "Who will the agent recruit for?",
      type: "dropdown",
      required: true,
      options: [
        "Our own company, in-house",
        "Clients, as an agency or search firm",
        "Both",
        "A staffing or contract placement business",
      ],
      helper:
        "An in-house agent works one pipeline deeply. An agency agent juggles many and keeps each client's pipeline separate.",
    },
    {
      key: "roles",
      label: "Which job titles do you hire for most?",
      type: "text",
      placeholder: "e.g. field service technician, dispatcher, office coordinator",
    },
    {
      key: "seniority",
      label: "What levels do you usually fill?",
      type: "multiselect",
      options: [
        "Entry level / apprentice",
        "Individual contributor",
        "Senior individual contributor",
        "Manager",
        "Director",
        "Executive",
        "Contract or temporary",
      ],
    },
    {
      key: "good_hire",
      label: "What makes a great hire that a resume would miss?",
      type: "multiselect",
      options: [
        "Reliable, shows up on time",
        "Calm with customers under pressure",
        "Learns quickly",
        "Works well independently",
        "Strong team player",
        "Stays for the long haul",
        "Clear communicator",
        "Takes ownership of problems",
        "Other",
      ],
      helper: "This is what points your agent at the right person over the best-formatted CV.",
    },
    {
      key: "dealbreakers",
      label: "Which hard requirements apply?",
      type: "multiselect",
      options: [
        "Valid driver's license",
        "Specific license or certification",
        "Work authorization, sponsorship unavailable",
        "Available for the shift pattern or weekends",
        "Passes a background check",
        "Passes a drug screen",
        "Minimum years of experience",
        "Lives within commuting distance",
        "Meets physical job requirements",
        "Other",
      ],
      helper: "Job-related requirements only. Your agent applies them the same way to every candidate.",
    },
  ],
};

// ─── Page 2: how hiring runs ─────────────────────────────────────────────────
const PROCESS: IndustryBranch = {
  stepTitle: "How Hiring Runs",
  stepSubtitle:
    "The pipeline as it runs today. The more specific here, the less your agent has to guess.",
  stepLabel: "The Process",
  fields: [
    {
      key: "sourcing",
      label: "Where do your candidates come from?",
      type: "multiselect",
      options: [
        "Job boards (Indeed, LinkedIn)",
        "Our own careers page",
        "Referrals",
        "Direct outreach and sourcing",
        "Agencies",
        "University or trade programs",
        "Social media",
        "Walk-ins and local advertising",
        "Other",
      ],
    },
    {
      key: "interview_process",
      label: "Which stages are in your interview process?",
      type: "multiselect",
      options: [
        "Phone or video screen",
        "Skills test or assessment",
        "Working interview or trial shift",
        "Interview with the hiring manager",
        "Panel interview",
        "Final interview with an owner or executive",
        "Reference checks",
        "Background check",
        "Other",
      ],
    },
    {
      key: "ats",
      label: "What ATS or hiring system do you use?",
      type: "dropdown",
      options: [
        "Greenhouse",
        "Lever",
        "Ashby",
        "Workable",
        "BambooHR",
        "Workday",
        "JazzHR",
        "Indeed / LinkedIn only",
        "Spreadsheets and email",
        "None yet",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, and the decisions that stay with you.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your recruiting agent to own?",
      type: "multiselect",
      options: [
        "Job descriptions and adverts",
        "Reviewing and summarizing applications",
        "Candidate outreach and sourcing",
        "Scheduling interviews",
        "Keeping candidates warm and updated",
        "Interview prep and question sets",
        "Offer letters and paperwork",
        "ATS hygiene and pipeline reporting",
      ],
    },
    // The follow-up to the single highest-risk option on this list. Summarising applications is
    // one step from ranking them and two from rejecting people, and a customer who has not
    // thought about that will discover their agent's screening rules from the outcome. So the
    // question is asked plainly, and the safe answer is offered first.
    {
      key: "screening_authority",
      label: "How far may it go when reviewing applicants?",
      type: "dropdown",
      required: true,
      options: [
        "Summarize only, I read every application myself",
        "Summarize and flag against my hard requirements, I decide",
        "Shortlist a recommended few, I make every rejection",
        "Screen out clear misses on hard requirements only",
      ],
      helper:
        "Hiring decisions carry legal weight and affect real people. The top option is the safest start and easy to loosen later.",
    },
    // Took over the fairness and record-keeping half of the old free-text box that sat below the
    // dropdown. It lands in USER.md with the rest of the blob; the Boundaries line still reads
    // `screening_authority` alone (coversScope.guard in OnboardingForm).
    {
      key: "human_review",
      label: "Always hand to a person when it involves...",
      type: "multiselect",
      options: [
        "Rejecting or declining a candidate",
        "Offers, pay and benefits",
        "Disability, accommodation or medical questions",
        "Age, religion, family or other protected traits (EEO)",
        "Visa and work authorization questions",
        "Background checks and references",
        "Anything sent to a candidate in my name",
        "Other",
      ],
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Faster first replies to applicants",
        "Clearing the backlog of applications",
        "Interview scheduling",
        "Keeping candidates updated through the process",
        "Better job ads and descriptions",
        "Sourcing more qualified candidates",
        "Clean ATS data and pipeline reporting",
        "Offer letters and onboarding paperwork",
        "Other",
      ],
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const RECRUITING_BRANCH: IndustryBranch[] = [HIRING, PROCESS, AGENT];
