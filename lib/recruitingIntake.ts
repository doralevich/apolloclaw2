// The Recruiting Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `recruiting` (config/agent-types.ts), on top of the standard
// business questions, so a recruiting agent is set up around how the client actually hires from
// day one.
//
// All fields are optional: answer what applies, skip the rest.
//
// Answers land under the `recruitingDetails` key and are surfaced in USER.md / the intake email
// via the "Recruiting Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const RECRUITING_BRANCH: IndustryBranch = {
  stepTitle: "How You Hire",
  stepSubtitle: "A few specifics so your recruiting agent works your roles and your pipeline from day one.",
  fields: [
    {
      key: "context",
      label: "Who will the agent recruit for?",
      type: "dropdown",
      options: [
        "In-house / one company's own hiring",
        "A staffing or recruiting agency",
        "An RPO / talent partner",
        "A founder hiring their first team",
        "Other",
      ],
    },
    {
      key: "roles",
      label: "What roles do you hire for most?",
      type: "textarea",
      placeholder: "e.g. software engineers, sales reps, nurses, warehouse staff, or a mix.",
    },
    {
      key: "seniority",
      label: "What levels do you usually fill?",
      type: "multiselect",
      options: [
        "Entry level",
        "Individual contributor",
        "Senior / specialist",
        "Management",
        "Executive",
        "Contract / temp",
        "Other",
      ],
    },
    {
      key: "volume",
      label: "Roughly how many roles are open at once?",
      type: "dropdown",
      options: ["1-3", "4-10", "11-25", "25+", "Varies"],
    },
    {
      key: "ats",
      label: "What ATS or hiring system do you use?",
      type: "dropdown",
      options: [
        "Greenhouse",
        "Lever",
        "Workday",
        "Ashby",
        "Bamboo HR",
        "JazzHR",
        "LinkedIn Recruiter",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "sourcing",
      label: "Where do your candidates come from?",
      type: "multiselect",
      options: [
        "LinkedIn",
        "Job boards (Indeed, ZipRecruiter...)",
        "Referrals",
        "Inbound applicants",
        "Cold sourcing / outreach",
        "University / early careers",
        "Agencies",
        "Other",
      ],
    },
    {
      key: "interview_process",
      label: "What does your interview process look like?",
      type: "textarea",
      placeholder: "e.g. recruiter screen, hiring manager call, technical round, final panel, offer.",
      helper: "So the agent can schedule and move candidates through it correctly.",
    },
    {
      key: "owns_work",
      label: "What do you want your recruiting agent to own?",
      type: "multiselect",
      options: [
        "Resume screening against requirements",
        "Candidate outreach & follow-up",
        "Interview scheduling & coordination",
        "Job description drafts",
        "Candidate pipeline tracking",
        "Hiring-manager & client updates",
        "Reference & offer prep",
        "Keeping the ATS current",
      ],
    },
    {
      key: "recruiting_pain",
      label: "Biggest hiring headache right now?",
      type: "textarea",
      placeholder: "e.g. resumes pile up unscreened, candidates go cold, scheduling is a nightmare, the ATS is always out of date.",
    },
    {
      key: "recruiting_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The time-to-fill, the candidate experience, or the off-your-plate work you want three months from now.",
    },
  ],
};
