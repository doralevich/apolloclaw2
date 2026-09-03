// The CEO Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `ceo` (config/agent-types.ts), on top of the standard business
// questions, so a chief-of-staff agent is set up around how the executive actually runs their day.
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
      required: true,
      placeholder: "e.g. Founder & CEO, Managing Partner, COO",
    },
    {
      key: "team_size",
      label: "How big is the team you run?",
      type: "dropdown",
      options: ["Just me", "2-10", "11-50", "51-200", "200+"],
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
      required: true,
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
      key: "owns_work",
      label: "What do you want your CEO agent to own?",
      type: "multiselect",
      required: true,
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
      key: "meeting_load",
      label: "Roughly how many meetings a week?",
      type: "dropdown",
      options: ["Under 5", "5-15", "16-30", "30+"],
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
      key: "time_drains",
      label: "What eats the most time you wish it did not?",
      type: "textarea",
      required: true,
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
