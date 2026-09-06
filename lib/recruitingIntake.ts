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
        "An in-house agent works one pipeline deeply. An agency agent juggles many, and must never mix them up.",
    },
    {
      key: "roles",
      label: "What roles do you hire for most?",
      type: "textarea",
      placeholder: "e.g. field service technicians, and one or two office roles a year.",
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
      label: "What does a great hire look like that a resume would miss?",
      type: "textarea",
      placeholder:
        "e.g. they have run a route alone before, they can talk to a frustrated customer without escalating, they stay when it gets boring.",
      helper:
        "The most useful question here. This is what stops your agent shortlisting the best-formatted CV instead of the right person.",
    },
    {
      key: "dealbreakers",
      label: "What rules a candidate out?",
      type: "textarea",
      placeholder: "e.g. no valid licence, cannot work the shift pattern, needs sponsorship we cannot provide.",
      helper: "Hard requirements only, please. Preferences belong in the question above.",
    },
    {
      key: "volume",
      label: "Roughly how many roles are open at once?",
      type: "dropdown",
      options: ["1-2", "3-5", "6-10", "11-25", "More than 25"],
    },
  ],
};

// ─── Page 2: how hiring runs ─────────────────────────────────────────────────
const PROCESS: IndustryBranch = {
  stepTitle: "How Hiring Runs",
  stepSubtitle:
    "The pipeline as it actually works, including where it breaks. The more specific here, the less your agent has to guess.",
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
      label: "What does your interview process look like?",
      type: "textarea",
      placeholder:
        "e.g. phone screen with me, a working interview on site, then a reference call. About two weeks end to end.",
      helper: "The stages, who runs each, and how long it really takes.",
    },
    {
      key: "drop_off",
      label: "Where do you lose candidates?",
      type: "textarea",
      placeholder:
        "e.g. between applying and the first call, because nobody replies for four days and they take another offer.",
      helper: "The stage where good people disappear. This is usually where the agent pays for itself.",
    },
    {
      key: "candidate_experience",
      label: "How do you want candidates treated?",
      type: "textarea",
      placeholder:
        "e.g. everybody hears back within 48 hours even if it is a no, nobody gets a form rejection after an interview, always a real name on the email.",
      helper:
        "Including the people you do not hire. Most of them are also your customers or your neighbours.",
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
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "hiring_team",
      label: "Who else is involved in a hire?",
      type: "textarea",
      placeholder: "e.g. the hiring manager runs interviews, I make the offer, our owner signs anything above a certain rate.",
      helper: "Who decides, who interviews, and who your agent may chase.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, and the decisions it must never make alone.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your recruiting agent to own?",
      type: "multiselect",
      options: [
        "Writing job descriptions and adverts",
        "Reviewing and summarizing applications",
        "Candidate outreach and sourcing messages",
        "Scheduling interviews",
        "Keeping candidates warm and updated",
        "Interview prep and question sets",
        "Reference and background chasing",
        "Offer letters and paperwork",
        "ATS hygiene and data entry",
        "Pipeline reporting",
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
      showIf: { key: "owns_work", includes: "Reviewing and summarizing applications" },
      required: true,
      options: [
        "Summarize only, I read every application myself",
        "Summarize and flag against my hard requirements, I decide",
        "Shortlist a recommended few, nobody is rejected without me",
        "Screen out clear misses on hard requirements only",
      ],
      helper:
        "Hiring decisions carry legal weight and affect real people. Starting at the top of this list costs you very little and is easy to loosen later.",
    },
    {
      key: "fairness_rules",
      label: "Any fairness or compliance rules it must follow?",
      type: "textarea",
      placeholder:
        "e.g. EEO applies, never infer age or nationality from a CV, never ask about salary history, keep records for a year, follow our accommodation process.",
      helper: "Anything your policy, your industry, or your jurisdiction requires.",
    },
    {
      key: "outreach_voice",
      label: "How should it sound to a candidate?",
      type: "textarea",
      placeholder:
        "e.g. warm and specific, name what they did that caught our eye, never templated, never oversell the role.",
    },
    {
      key: "approval_line",
      label: "What must never go out without you seeing it first?",
      type: "textarea",
      placeholder:
        "e.g. any rejection, any offer or number, anything to a candidate already at interview stage, anything to a client of ours.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. nobody waits more than a day to hear from us.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "recruiting_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The roles filled, the time back, or the candidate experience you want three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const RECRUITING_BRANCH: IndustryBranch[] = [HIRING, PROCESS, AGENT];
