// The Personal Agent's intake.
//
// TWO SHORT PAGES OF CLICKS, David's call (Sept 29, 2026). The version before this was five
// pages and about fifteen text boxes - typical day, family in prose, voice tells, recurring
// asks, what must never go out unread - and walking it himself he found it hard, slow and
// corporate. A Personal Agent is bought by a person for their own life; the setup should feel
// like telling a friend a few things, and every answer here is a dropdown or a checkbox.
//
// What the agent still gets, in a form it can use on day one: which calendar and inbox to
// connect, the shape of the family it is helping, what to take on, what to start with, what it
// may read and send, and what to always run past the owner first. Names, dates and the detail
// behind each of those are things the agent can ask for in conversation once it is running,
// which is a better place to learn them than a form.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the
// generic IndustryStep in the onboarding form. Both pages write into ONE blob
// (`personalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// Keys other code reads by name, so keep them:
//   email_platform   config/connect-flow.ts pre-selects Google or Microsoft from it, and
//                    config/role-tools.ts writes it into TOOLS.md.
//   owns_work, first_priority, never_unattended
//                    OnboardingForm.tsx's coversScope maps these to aiGoals, successMetric and
//                    autonomyLine (the Boundaries section of the agent's instructions).
//
// Brand rules: no em dashes in any user-facing string; positive framing throughout.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: you and your family ─────────────────────────────────────────────
const YOU: IndustryBranch = {
  stepTitle: "About You",
  stepSubtitle: "A few quick clicks so your agent fits your life.",
  stepLabel: "About You",
  fields: [
    {
      key: "email_platform",
      label: "Which calendar and email do you use?",
      type: "dropdown",
      required: true,
      options: [
        "Google (Gmail and Google Calendar)",
        "Microsoft (Outlook)",
        "Apple (iCloud)",
        "Other",
      ],
      helper: "Your agent connects to it after setup.",
    },
    {
      key: "relationship",
      label: "Relationship status",
      type: "dropdown",
      options: ["Single", "Dating", "In a relationship", "Engaged", "Married", "Prefer to skip"],
    },
    {
      key: "kids",
      label: "Do you have kids?",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      key: "kids_ages",
      label: "How old are they?",
      type: "multiselect",
      showIf: { key: "kids", includes: "Yes" },
      options: [
        "Baby or toddler",
        "Preschool",
        "Elementary school",
        "Middle school",
        "High school",
        "College",
        "Grown up",
      ],
      helper: "Check all that apply.",
    },
    {
      key: "family_help",
      label: "What should it help keep track of for your family?",
      type: "multiselect",
      options: [
        "School calendars and events",
        "Sports, lessons, and activities",
        "Carpools and pickups",
        "Doctor and dentist visits",
        "Birthdays and parties",
        "Family trips",
        "Helping my parents",
        "Pets and vet visits",
        "Other",
      ],
      helper: "Check all that apply.",
    },
  ],
};

// ─── Page 2: what the agent does ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Should Your Agent Do?",
  stepSubtitle: "Check everything you want handed off. You can change any of this later.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your agent to do?",
      type: "multiselect",
      required: true,
      options: [
        "Keep my calendar organized",
        "Sort my inbox and flag what matters",
        "Draft emails and replies",
        "Send me a morning briefing",
        "Remind me of birthdays and anniversaries",
        "Plan trips and vacations",
        "Track bills and subscriptions",
        "Research purchases and decisions",
        "Grocery lists and meal plans",
        "Home repairs and appointments",
        "Gift ideas and shopping",
        "Other",
      ],
      helper: "Check all that apply.",
    },
    {
      key: "first_priority",
      label: "What should it start with?",
      type: "dropdown",
      options: [
        "Getting my inbox under control",
        "Keeping my calendar organized",
        "Staying on top of family schedules",
        "Remembering important dates",
        "Planning upcoming travel",
        "Keeping up with bills and errands",
      ],
    },
    // An agent pointed at a mailbox can see a person's whole life, so what it may read is still
    // asked outright and still required - as one dropdown now, narrowest option first.
    {
      key: "access_scope",
      label: "What should it be able to read?",
      type: "dropdown",
      required: true,
      options: [
        "My calendar only",
        "My calendar, plus emails I forward to it",
        "My personal email and calendar",
        "Work and personal email and calendar",
        "Let's talk it through on a call",
      ],
      helper: "Starting small is a great way to begin. You can widen it anytime.",
    },
    {
      key: "sending_authority",
      label: "Can it send messages for you?",
      type: "dropdown",
      required: true,
      options: [
        "Drafts only, I send everything myself",
        "It can send scheduling confirmations, I review the rest",
        "It can send routine messages within the rules I set",
      ],
    },
    {
      key: "never_unattended",
      label: "Always check with me first before it...",
      type: "multiselect",
      options: [
        "Messages my family",
        "Messages my boss or clients",
        "Spends money or books anything",
        "Accepts or declines invitations",
        "Shares my personal information",
        "Cancels or moves plans",
      ],
      helper: "Check all that apply.",
    },
  ],
};

/** Two pages, one blob. You and your family first, then what the agent does. */
export const PERSONAL_BRANCH: IndustryBranch[] = [YOU, AGENT];
