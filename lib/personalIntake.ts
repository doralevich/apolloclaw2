// The Personal Agent's intake.
//
// TWO SHORT PAGES OF CLICKS, David's call (Sept 29, 2026). The version before this was five
// pages and about fifteen text boxes - typical day, family in prose, voice tells, recurring
// asks, what must never go out unread - and walking it himself he found it hard, slow and
// corporate. A Personal Agent is bought by a person for their own life; the setup should feel
// like telling a friend a few things, and every answer here is a dropdown or a checkbox.
//
// What the agent still gets, in a form it can use on day one: which calendar and inbox to
// connect, who is in the family it is helping (partner by name, kids by name and age), and what
// to take on. Birthdays, schools and the rest of the detail are things the agent can ask for in
// conversation once it is running, which is a better place to learn them than a form.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the
// generic IndustryStep in the onboarding form. Both pages write into ONE blob
// (`personalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// Keys other code reads by name, so keep them:
//   email_platform   config/connect-flow.ts pre-selects Google or Microsoft from it, and
//                    config/role-tools.ts writes it into TOOLS.md.
//   owns_work        OnboardingForm.tsx's coversScope maps it to aiGoals.
//
// Gone at David's call (Sept 29, 2026): "What should it start with?", "What should it be able
// to read?", "Can it send messages for you?" and "Always check with me first before it...".
// The agent learns the first two in conversation. The last two are replaced by a fixed rule,
// ROLE_INTAKES.personal.standardGuard in OnboardingForm.tsx, which matches the persona's own
// "I draft, and a person sends". Answers saved before this stay in the blob.
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
      key: "partner_name",
      label: "Partner's name",
      type: "text",
      placeholder: "First name",
      showIf: { key: "relationship", includes: ["Dating", "In a relationship", "Engaged", "Married"] },
    },
    {
      key: "kids",
      label: "Do you have kids?",
      type: "radio",
      options: ["Yes", "No"],
    },
    // One row per child, name and age. Stored as "Mia (8)" so it reads naturally everywhere the
    // answers are printed (USER.md, the intake email, the admin summary).
    {
      key: "kids_list",
      label: "Their names and ages",
      type: "people",
      showIf: { key: "kids", includes: "Yes" },
      namePlaceholder: "Name",
      ageOptions: ["Under 1", ...Array.from({ length: 25 }, (_, i) => String(i + 1)), "26+"],
    },
  ],
};

// ─── Page 2: what the agent does ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Should Your Agent Do?",
  stepSubtitle: "Check everything you want handed off. You can change it anytime.",
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
        "Track school events and kids' activities",
        "Coordinate carpools and pickups",
        "Book doctor, dentist, and vet visits",
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
  ],
};

/** Two pages, one blob. You and your family first, then what the agent does. The family
 *  checklist that used to sit on page 1 is folded into owns_work: it asked the same question. */
export const PERSONAL_BRANCH: IndustryBranch[] = [YOU, AGENT];
