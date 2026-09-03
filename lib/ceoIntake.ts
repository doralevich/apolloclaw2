// The CEO Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `ceo` (config/agent-types.ts), on top of the standard business
// questions, so a chief-of-staff agent is set up around how the executive actually runs their day.
//
// All fields are optional (David's call): answer what applies, skip the rest.
//
// Answers land under the `ceoDetails` key and are surfaced in USER.md / the intake email via the
// "CEO Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const CEO_BRANCH: IndustryBranch = {
  stepTitle: "How You Run Your Day",
  stepSubtitle: "A few specifics so your chief of staff runs your day the way you would.",
  fields: [
    {
      key: "title",
      label: "Your role or title?",
      type: "text",
      placeholder: "e.g. Founder & CEO, Managing Partner, COO",
    },
    {
      key: "team_size",
      label: "How big is the team you run?",
      type: "dropdown",
      options: ["Just me", "2-10", "11-50", "51-200", "200+"],
    },
    {
      key: "direct_reports",
      label: "Who do you manage, or who are your direct reports?",
      type: "text",
      placeholder: "e.g. VP Sales, Head of Ops, and 4 engineers",
      helper: "So it knows the org and who to route things to.",
    },
    {
      key: "assistant",
      label: "Do you have an assistant or chief of staff today?",
      type: "dropdown",
      options: [
        "No, I run my own day",
        "A part-time / virtual assistant",
        "A full-time EA",
        "A chief of staff",
        "Other",
      ],
    },
    {
      key: "email_tool",
      label: "What do you run email and calendar in?",
      type: "dropdown",
      options: ["Google Workspace (Gmail)", "Microsoft 365 (Outlook)", "Other"],
    },
    {
      key: "ops_stack",
      label: "Which tools should it work across?",
      type: "multiselect",
      helper: "Where your work and communication actually live.",
      options: [
        "Slack",
        "Microsoft Teams",
        "Notion",
        "Asana",
        "Linear",
        "Jira",
        "Trello",
        "Monday.com",
        "Salesforce / CRM",
        "Zoom",
        "Other",
      ],
    },
    {
      key: "recurring_meetings",
      label: "Which recurring meetings do you run or sit in?",
      type: "multiselect",
      helper: "So it can prep agendas, notes, and follow-ups for the ones that matter.",
      options: [
        "Leadership / exec team",
        "Board",
        "Investor updates",
        "1:1s with reports",
        "All-hands",
        "Team standups",
        "Client / customer meetings",
        "Sales / pipeline reviews",
        "None regular",
        "Other",
      ],
    },
    {
      key: "meeting_load",
      label: "Roughly how many meetings a week?",
      type: "dropdown",
      options: ["Under 5", "5-15", "16-30", "30+"],
    },
    {
      key: "key_stakeholders",
      label: "Key people the agent should know?",
      type: "text",
      placeholder: "e.g. co-founder Priya, lead investor at Acme, top client Globex, my EA Sam",
      helper: "Names and how they matter, so briefings and follow-ups land right.",
    },
    {
      key: "priorities",
      label: "What are your top priorities right now?",
      type: "textarea",
      placeholder: "The 2-3 things that matter most this quarter.",
    },
    {
      key: "owns_work",
      label: "What do you want your CEO agent to own?",
      type: "multiselect",
      options: [
        "Inbox triage & draft replies",
        "Calendar & scheduling",
        "Defending focus time",
        "Follow-ups & open loops",
        "Meeting briefings & agendas",
        "Summarizing long threads / docs",
        "Board & investor prep",
        "Weekly priorities & planning",
        "Research & quick answers",
      ],
    },
    {
      key: "autonomy",
      label: "What should it handle on its own, and what should it always run by you first?",
      type: "textarea",
      placeholder: "e.g. it can schedule and draft replies, but never send anything external or decline a meeting without my OK.",
    },
    {
      key: "comm_style",
      label: "How should it communicate with you?",
      type: "dropdown",
      options: [
        "Summary first, detail on request",
        "Just tell me what to decide",
        "Full context every time",
        "Match the situation",
      ],
    },
    {
      key: "guardrails",
      label: "Anything the agent should never do without your OK?",
      type: "textarea",
      placeholder: "e.g. do not touch my personal calendar, never email the board directly, no commitments on my behalf.",
      helper: "The agent will treat these as hard rules.",
    },
    {
      key: "time_drains",
      label: "What eats the most time you wish it did not?",
      type: "textarea",
      placeholder: "e.g. inbox never gets to zero, scheduling ping-pong, prepping for back-to-back meetings.",
    },
    {
      key: "ceo_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The time back, the systems, or the calm you want three months from now.",
    },
  ],
};
