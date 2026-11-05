// The College Agent's intake deep-dive: the student questionnaire.
//
// Ported from thecollegeagent.ai's conversational onboarding (components/ConversationalOnboard.tsx
// there) on Nov 5 2026, when the college agent started selling through ApolloClaw's own
// checkout and questionnaire instead of its own. The questions and their option lists are that
// site's, trimmed to the ones its agent files read: every answer here lands in USER.md, and
// three of them (owns_work, first_priority and the fixed guard in ROLE_INTAKES) feed the agent's
// own instructions the same way every other role agent's do.
//
// Three pages rather than one: who the student is, their semester, and how the agent should
// work with them. Same shape as an industry branch (lib/industryConfig.ts) so each page renders
// through the same generic step in both forms. All three write into ONE blob (`collegeDetails`).
//
// WHAT IS DELIBERATELY NOT HERE. The college site collected a résumé upload, a majors dropdown
// of 81 entries, a class-by-class schedule builder and a school typeahead backed by the College
// Scorecard API. Each of those is a control the shared questionnaire does not have, and each
// one's answer is a line of text the student can type in ten seconds, so they are text fields
// here. The résumé goes in through the dashboard's Files tab once the agent exists. A student
// who wants the agent to know their schedule pastes it; the agent asks for the rest.
//
// The business pages (Your Business, What You Do, the Tech Stack, Voice and Exec pages) are
// dropped in ROLE_INTAKES.college: a student has none of those, and the one voice question that
// matters ("How should I communicate with you?") is asked here in the student's words.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: who they are ────────────────────────────────────────────────────
const YOU: IndustryBranch = {
  stepTitle: "About You",
  stepSubtitle: "The basics your agent needs before it can be useful. Skip anything you would rather it ask you later.",
  stepLabel: "About You",
  fields: [
    {
      key: "school",
      label: "What school are you with?",
      type: "text",
      required: true,
      placeholder: "Rutgers University",
    },
    {
      key: "year",
      label: "Where are you in your college journey?",
      type: "radio",
      options: ["Before College", "Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"],
    },
    {
      key: "major",
      label: "What is your major?",
      type: "text",
      placeholder: "Marketing, or Undecided",
      helper: "A minor too, if you have one.",
    },
    {
      key: "living_situation",
      label: "Where are you living this year?",
      type: "radio",
      options: ["On-Campus", "Off-Campus", "Fraternity/Sorority House", "Other"],
    },
    // Greek life, asked of everyone. Most members of a chapter do not live in the house, so
    // hanging this off the living question missed the chapter meetings, rush weeks and
    // philanthropy dates filling their calendar. "Thinking about rushing" earns its place: rush
    // has hard dates and the agent can only help with them if it knows to look.
    {
      key: "greek_life",
      label: "Are you in a fraternity or sorority?",
      type: "radio",
      options: ["Yes", "No", "Thinking about rushing"],
    },
    {
      key: "greek_org",
      label: "Which one, and do you have a role in the chapter?",
      type: "text",
      placeholder: "Sigma Chi, social chair",
      showIf: { key: "greek_life", includes: "Yes" },
    },
    {
      key: "clubs",
      label: "What clubs or organizations are you involved in?",
      type: "multiselect",
      options: [
        "Academic or professional",
        "Cultural or religious",
        "Arts & performance",
        "Service or advocacy",
        "Hobby & interest clubs",
        "Student government",
        "Sports teams",
        "Not involved yet",
      ],
    },
    {
      key: "clubs_detail",
      label: "Share the names, and anything else your agent should know about them.",
      type: "textarea",
      placeholder: "Club names, your role, meeting nights, events you are planning...",
    },
  ],
};

// ─── Page 2: this semester, and after ───────────────────────────────────────
const SEMESTER: IndustryBranch = {
  stepTitle: "Your Semester",
  stepSubtitle: "Classes, goals and what comes after. Your agent plans around all of it.",
  stepLabel: "Your Semester",
  fields: [
    {
      key: "classes",
      label: "What classes are you taking this semester?",
      type: "textarea",
      placeholder: "MKT 301 Marketing, Mon/Wed 10am, Prof. Lee\nECON 102, Tue/Thu 1pm...",
      helper: "One per line, with days, times and the professor if you have them. Your agent builds your week from this.",
    },
    {
      key: "gpa_goal",
      label: "Do you have a GPA goal this year?",
      type: "text",
      placeholder: "3.5, or leave blank",
    },
    {
      key: "after_college",
      label: "What is the plan for after college?",
      type: "radio",
      options: ["Start my career", "Grad or professional school", "Gap year", "Start a business", "Still figuring it out"],
    },
    {
      key: "after_college_detail",
      label: "Tell your agent more about that.",
      type: "textarea",
      placeholder: "Grad schools you are eyeing, dream companies, cities, timelines...",
    },
    {
      key: "linkedin",
      label: "Your LinkedIn, if you have one",
      type: "text",
      placeholder: "linkedin.com/in/you",
      helper: "Optional. It helps with networking, your profile, and the internship and job search.",
    },
  ],
};

// ─── Page 3: how the agent works with them ──────────────────────────────────
//
// owns_work and first_priority are the two keys ROLE_INTAKES.college.coversScope names, so
// they reach the agent's "What to push on" section (lib/agent-files.ts) by name. Every other
// role intake uses the same two keys for the same reason.
const AGENT: IndustryBranch = {
  stepTitle: "Working Together",
  stepSubtitle: "How your agent should sound, what it should take on, and when it should speak up.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "response_style",
      label: "How should your agent communicate with you?",
      type: "multiselect",
      required: true,
      options: [
        "Direct & to the point",
        "Calm & thoughtful",
        "Warm & encouraging",
        "Funny & personable",
        "Motivational & challenging",
        "Patient & easygoing",
        "Honest & straightforward",
        "Analytical & curious",
      ],
      helper: "Pick all that fit.",
    },
    {
      key: "checkin_frequency",
      label: "How often should it check in with you?",
      type: "radio",
      options: ["Daily morning briefing", "Twice a week", "Weekly digest", "Only when something is urgent", "Only when I ask"],
    },
    {
      key: "owns_work",
      label: "What should it take care of first?",
      type: "multiselect",
      required: true,
      options: [
        "Staying on top of deadlines",
        "Planning my week",
        "Email & messages",
        "Study scheduling",
        "The job / internship search",
        "Just keeping me organized",
        "Other",
      ],
      helper: "Check all that apply.",
    },
    {
      key: "watch_for",
      label: "What should it proactively keep an eye on for you?",
      type: "multiselect",
      options: [
        "Upcoming deadlines",
        "Important or unread emails",
        "Schedule conflicts",
        "Study & exam reminders",
        "Internship & job deadlines",
        "Wellbeing check-ins",
      ],
    },
    {
      key: "first_priority",
      label: "What does a great semester look like?",
      type: "multiselect",
      options: [
        "Grades up",
        "Deadlines met, zero surprises",
        "An internship or job lined up",
        "Less stress",
        "More free time",
        "Better habits that stick",
      ],
      helper: "Pick up to two. This is how your agent judges whether it is working.",
    },
    {
      key: "biggest_stressors",
      label: "What stresses you out most, or tends to slip through the cracks?",
      type: "textarea",
      placeholder: "Deadlines sneaking up, replying to emails, prepping for exams early...",
    },
  ],
};

/** Three pages, one blob: who they are, their semester, how the agent works with them. */
export const COLLEGE_BRANCH: IndustryBranch[] = [YOU, SEMESTER, AGENT];

/** Starter lines under the final open question. Each one is a concrete instruction the agent
 *  can act on. From the college site's own list. */
export const COLLEGE_ANYTHING_ELSE_PLACEHOLDER =
  "I want you to push me when I start falling behind. Mornings are for the gym, plan my day around it. Big exams stress me out, get me studying a week early.";
