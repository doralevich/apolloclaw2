// The Recruiting Agent's intake deep-dive.
//
// Three pages rather than one: who you recruit, how recruiting runs, and what the agent should
// own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`recruitingDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// TWO KINDS OF RECRUITING, ONE QUESTIONNAIRE (Oct 8, 2026). The first question asks what kind of
// recruiting this is, and every field after it is gated on that answer with `showIf`:
//
//   hiring   recruiting employees, in-house or for clients: job titles, interview stages, an ATS,
//            and the fairness questions below.
//   sports   a sports agency signing athletes and coaches to represent (WIN Sports Group, the
//            first customer for it): prospects and their families, the recruiting board, agent
//            certification and NCAA rules.
//
// The pages, the blob and the three keys the form reads by name (owns_work, first_priority and
// screening_authority, via ROLE_INTAKES.recruiting.coversScope) are shared, so the agent's own
// instructions are built the same way whichever path was taken. The sports variant of a shared
// key carries its own options and its own wording. `showIf` is read against the whole blob, so a
// page 1 answer gates pages 2 and 3 as well. Switching the first answer after filling later pages
// leaves the earlier ticks showing as extra options (withLegacy in IndustryStep) until unticked;
// the right pages, not a clean slate, is the trade.
//
// THE FAIRNESS QUESTIONS ARE NOT DECORATION. Hiring is a regulated activity in most of the places
// this will be sold, and an agent that screens, ranks, or rejects candidates can create real legal
// exposure and real harm to real people. So this intake asks directly what the agent may decide
// versus recommend, and treats "it never rejects anyone on its own" as the sane default rather
// than a setting to discover later. Sports recruiting has its own version of the same line:
// players association certification, NCAA eligibility and NIL, state athlete-agent laws and
// league contact rules are hard lines, and nothing reaches a prospect in the owner's name until
// the owner approves it.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No headcount plan, no salary bands, no
// historical time-to-fill, no commission schedule, and no "biggest headache" - the Executive
// Profile page asks about the bottleneck two steps later and the second ask got the shorter answer.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made setup feel slow
// and corporate. One short text field is left per path, for job titles or sports, because those
// are unique to the business. The candidate-voice question moved to the shared Voice page every
// agent gets.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch, IndustryField } from "@/lib/industryConfig";

/** The first-question answer that puts the form on the sports path. Read by the persona
 *  (config/personas.ts) as well, so the agent's SOUL.md matches the questionnaire it came from. */
export const SPORTS_AGENCY_CONTEXT = "Signing athletes and coaches to represent, as a sports agency";

// The hiring answers, including the two spellings from before the sports option existed, so a
// saved questionnaire from then still shows its hiring pages.
const HIRING_CONTEXTS = [
  "Hiring for our own company, in-house",
  "Hiring for clients, as an agency or search firm",
  "Both, our own company and clients",
  "Staffing or contract placement",
  "Our own company, in-house",
  "Clients, as an agency or search firm",
  "Both",
  "A staffing or contract placement business",
];

/** Is this recruiting questionnaire the sports-agency kind? Works on the whole answers blob. */
export function isSportsRecruiting(answers: Record<string, unknown> | null | undefined): boolean {
  const d = answers?.recruitingDetails;
  return !!d && typeof d === "object" && (d as Record<string, unknown>).context === SPORTS_AGENCY_CONTEXT;
}

const hiring = (f: Omit<IndustryField, "showIf">): IndustryField => ({ ...f, showIf: { key: "context", includes: HIRING_CONTEXTS } });
const sports = (f: Omit<IndustryField, "showIf">): IndustryField => ({ ...f, showIf: { key: "context", includes: SPORTS_AGENCY_CONTEXT } });

// ─── Page 1: who you recruit ─────────────────────────────────────────────────
const WHO: IndustryBranch = {
  stepTitle: "Who You Recruit",
  stepSubtitle:
    "The people your agent has to recognize. It needs to tell a real fit from a name on a list.",
  stepLabel: "Who You Recruit",
  fields: [
    {
      key: "context",
      label: "What kind of recruiting is this?",
      type: "dropdown",
      required: true,
      options: [
        "Hiring for our own company, in-house",
        "Hiring for clients, as an agency or search firm",
        "Both, our own company and clients",
        "Staffing or contract placement",
        SPORTS_AGENCY_CONTEXT,
      ],
      helper:
        "This picks the questions that follow. An in-house agent works one pipeline deeply, an agency agent keeps every client's pipeline separate, and a sports agency's agent recruits people, not candidates for a job.",
    },

    // Hiring
    hiring({
      key: "roles",
      label: "Which job titles do you hire for most?",
      type: "text",
      placeholder: "e.g. field service technician, dispatcher, office coordinator",
    }),
    hiring({
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
    }),
    hiring({
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
    }),
    hiring({
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
    }),

    // Sports
    sports({
      key: "sports",
      label: "Which sports do you recruit in?",
      type: "text",
      required: true,
      placeholder: "e.g. football, golf, basketball",
    }),
    sports({
      key: "client_types",
      label: "Who are you looking to sign?",
      type: "multiselect",
      options: [
        "College athletes ahead of the draft",
        "Current professional athletes",
        "High school and youth prospects",
        "Coaches and front-office staff",
        "Broadcasters and media talent",
        "International athletes",
        "Other",
      ],
      helper: "Your agent talks differently to a nineteen-year-old's parents than to a veteran's financial advisor.",
    }),
    sports({
      key: "prospect_sources",
      label: "Where do prospects come from?",
      type: "multiselect",
      options: [
        "Draft boards and scouting reports",
        "College programs and their coaching staffs",
        "Combines, showcases and tournaments",
        "Referrals from current clients",
        "Trainers, financial advisors and family advisors",
        "Highlight film and social media",
        "Athletes leaving another agency",
        "Other",
      ],
    }),
    sports({
      key: "worth_pursuing",
      label: "What makes a prospect worth pursuing, beyond the stat line?",
      type: "multiselect",
      options: [
        "Draft or contract value in the next 12 to 24 months",
        "Marketability and brand potential",
        "Character and coachability",
        "A family and advisor circle we can work with",
        "Fit with the clients we already represent",
        "A long career ahead of them",
        "Other",
      ],
      helper: "This is what points your agent at the right prospect over the loudest highlight reel.",
    }),
    sports({
      key: "rule_outs",
      label: "What takes a prospect off the board?",
      type: "multiselect",
      options: [
        "Signed with an agency we do not recruit against",
        "Outside our sports or leagues",
        "Eligibility or NCAA compliance concerns",
        "Off-field or character concerns",
        "A family or advisor situation we cannot work with",
        "Other",
      ],
      helper: "Your agent applies these the same way to every prospect, and brings you the close calls.",
    }),
  ],
};

// ─── Page 2: how recruiting runs ─────────────────────────────────────────────
const PROCESS: IndustryBranch = {
  stepTitle: "How Recruiting Runs",
  stepSubtitle:
    "The pipeline as it runs today. The more specific here, the less your agent has to guess.",
  stepLabel: "The Process",
  fields: [
    // Hiring
    hiring({
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
    }),
    hiring({
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
    }),
    hiring({
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
    }),

    // Sports
    sports({
      key: "first_contact",
      label: "How does first contact usually happen?",
      type: "multiselect",
      options: [
        "Phone call or text",
        "Email",
        "Instagram, X or other direct messages",
        "Through a parent or family member",
        "Through a coach or trainer",
        "Through a financial advisor or lawyer",
        "In person at games, combines or campus visits",
        "Other",
      ],
    }),
    sports({
      key: "decision_makers",
      label: "Who is in the room when a prospect decides?",
      type: "multiselect",
      options: [
        "The athlete or coach",
        "Parents and family",
        "A college or high school coach",
        "A financial advisor or lawyer",
        "A trainer or mentor",
        "Other",
      ],
      helper: "Your agent keeps every one of them warm, in the right voice for each.",
    }),
    sports({
      key: "stages",
      label: "What are the steps from first contact to signing?",
      type: "multiselect",
      options: [
        "First contact and gauging interest",
        "Film, background and character review",
        "Intro call",
        "Family or advisor meeting",
        "In-person visit or dinner",
        "Pitch presentation",
        "Competing against other agencies' pitches",
        "Representation agreement signed",
        "League or players association paperwork",
        "Other",
      ],
    }),
    sports({
      key: "tracking_system",
      label: "Where do you track prospects today?",
      type: "dropdown",
      options: [
        "Spreadsheets and email",
        "HubSpot",
        "Salesforce",
        "Attio",
        "Notion or Airtable",
        "Our own database",
        "Nothing formal yet",
        "Other",
      ],
    }),
    sports({
      key: "rules",
      label: "Which rules shape your outreach?",
      type: "multiselect",
      options: [
        "Players association agent certification (NFLPA, NBPA, MLBPA, NHLPA)",
        "NCAA eligibility and NIL rules",
        "State athlete-agent laws (UAAA)",
        "League tampering and contact rules",
        "International federation rules",
        "Not sure yet",
        "Other",
      ],
      helper: "Your agent treats these as hard lines. Anything close to one goes to you before it goes out.",
    }),
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
    // Hiring
    hiring({
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
    }),
    // The follow-up to the single highest-risk option on this list. Summarising applications is
    // one step from ranking them and two from rejecting people, and a customer who has not
    // thought about that will discover their agent's screening rules from the outcome. So the
    // question is asked plainly, and the safe answer is offered first.
    hiring({
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
    }),
    // Took over the fairness and record-keeping half of the old free-text box that sat below the
    // dropdown. It lands in USER.md with the rest of the blob; the Boundaries line still reads
    // `screening_authority` alone (coversScope.guard in OnboardingForm).
    hiring({
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
    }),
    hiring({
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
    }),

    // Sports. Same three keys the form reads by name, with the agency's own vocabulary.
    sports({
      key: "owns_work",
      label: "What do you want your recruiting agent to own?",
      type: "multiselect",
      options: [
        "Prospect research and scouting summaries",
        "Building and updating the recruiting board",
        "First-touch outreach drafts to prospects and families",
        "Keeping prospects warm between conversations",
        "Scheduling calls, visits and meetings",
        "Pitch decks and recruiting presentations",
        "Tracking which other agencies are in on a prospect",
        "Prospect pipeline, notes and reporting",
      ],
    }),
    // The sports version of the screening question. Representation is a relationship, and the
    // rules around first contact are stricter than in hiring, so "I send everything" is the
    // safe start and the agent earns the rest.
    sports({
      key: "screening_authority",
      label: "How far may it go with prospects?",
      type: "dropdown",
      required: true,
      options: [
        "Research and summarize only, I decide who we pursue",
        "Rank prospects against my criteria, I decide who we pursue",
        "Draft outreach for my approval, I send everything myself",
        "Send routine follow-ups in my name once I approve the first message",
      ],
      helper:
        "Representation is a relationship, and a regulated one. The top option is the safest start and easy to loosen later.",
    }),
    sports({
      key: "human_review",
      label: "Always hand to a person when it involves...",
      type: "multiselect",
      options: [
        "The first message to any prospect, parent or coach",
        "Fee, commission or contract terms",
        "Anything touching NCAA eligibility or NIL",
        "Gifts, benefits or inducements of any kind",
        "A prospect under contract with another agency",
        "Anything a league or players association could read as tampering",
        "Other",
      ],
    }),
    sports({
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "A living recruiting board for the next class",
        "Faster replies to interested prospects and families",
        "Keeping current prospects warm",
        "Scheduling calls and visits",
        "Better pitch materials",
        "Finding more prospects worth pursuing",
        "Clean prospect pipeline and reporting",
        "Other",
      ],
      helper: "This is what your agent gets configured around first.",
    }),
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const RECRUITING_BRANCH: IndustryBranch[] = [WHO, PROCESS, AGENT];
