// The CEO Agent's intake deep-dive.
//
// Three pages: your seat, your week, and what the agent should own.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026). The version before this was two thin
// pages and four type-in boxes, and walking it he found it slow, cursory and corporate. Every
// answer here is now a click. Tools moved to the shared Tech Stack page and voice to the shared
// Voice page, which every business agent now gets (components/onboard/OnboardingForm.tsx), so
// this branch no longer asks `email_tool` or `ops_stack`. Both stay in the blob on records
// already written; config/connect-flow.ts reads the Tech Stack's mail tiles when they are absent.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the
// generic IndustryStep. All three write into ONE blob (`ceoDetails`), so USER.md, the intake
// email and the edit pre-fill are unchanged.
//
// Keys other code reads by name, so keep them: owns_work, first_priority and guardrails
// (OnboardingForm.tsx's coversScope maps them to aiGoals, successMetric and autonomyLine).
//
// Brand rules: no em dashes in any user-facing string; positive framing throughout.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the seat ────────────────────────────────────────────────────────
const SEAT: IndustryBranch = {
  stepTitle: "Your Seat",
  stepSubtitle: "What you run and who is around you, so your agent knows whose name it writes in.",
  stepLabel: "Your Seat",
  fields: [
    {
      key: "title",
      label: "What's your role?",
      type: "dropdown",
      options: [
        "Founder & CEO",
        "CEO",
        "President",
        "Owner",
        "Managing Partner",
        "Managing Director",
        "Executive Director",
        "COO",
        "Other",
      ],
    },
    {
      key: "team_size",
      label: "How big is the organization you run?",
      type: "dropdown",
      options: ["Just me", "2-10", "11-50", "51-200", "201-1000", "More than 1000"],
    },
    {
      key: "reports_to",
      label: "Who do you answer to?",
      type: "dropdown",
      options: [
        "I own the company outright",
        "A board of directors",
        "Investors",
        "Partners or co-owners",
        "A parent company",
        "Other",
      ],
    },
    {
      key: "direct_reports",
      label: "Which functions report to you?",
      type: "multiselect",
      options: [
        "Sales",
        "Marketing",
        "Operations",
        "Finance",
        "Engineering or product",
        "Customer success",
        "People and HR",
        "Legal",
        "Other",
      ],
      helper: "Check all that apply.",
    },
  ],
};

// ─── Page 2: the week ────────────────────────────────────────────────────────
const WEEK: IndustryBranch = {
  stepTitle: "Your Week",
  stepSubtitle: "Where your time goes, so your agent knows what to protect and what to prepare.",
  stepLabel: "Your Week",
  fields: [
    {
      key: "time_sinks",
      label: "Where does most of your week go?",
      type: "multiselect",
      options: [
        "Internal meetings",
        "Customer and partner calls",
        "Board and investor work",
        "Email and messages",
        "Hiring and interviews",
        "Travel",
        "Reviewing numbers and reports",
        "Putting out fires",
        "Other",
      ],
      helper: "Check all that apply.",
    },
    {
      key: "recurring_meetings",
      label: "Which recurring meetings do you run or sit in?",
      type: "multiselect",
      options: [
        "Leadership team meeting",
        "One-on-ones",
        "Board meetings",
        "Investor updates",
        "All-hands",
        "Pipeline or sales review",
        "Weekly business review",
        "Other",
      ],
      helper: "Check all that apply.",
    },
    {
      key: "inbox_reality",
      label: "How many emails land in your inbox on a typical day?",
      type: "dropdown",
      options: ["Under 50", "50-100", "100-200", "200-500", "More than 500"],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle: "The last page. What you want handed over, and where it checks with you first.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your CEO agent to own?",
      type: "multiselect",
      options: [
        "Inbox triage and drafting",
        "Calendar and scheduling",
        "Meeting prep and briefs",
        "Meeting notes and follow-ups",
        "Board and investor updates",
        "Internal comms and announcements",
        "Weekly business review",
        "Tracking what I asked people for",
        "Research before decisions",
        "Travel planning",
        "Other",
      ],
      helper: "Check all that apply.",
    },
    // An agent writing in a chief executive's name can do real damage with a message that is
    // merely tone-deaf, so this stays required - as checkboxes now, the riskiest first.
    {
      key: "guardrails",
      label: "Always check with me first before it...",
      type: "multiselect",
      required: true,
      options: [
        "Messages the board or investors",
        "Replies to press or media",
        "Commits to a number, price or deadline",
        "Discusses anyone's role or performance",
        "Sends anything in my name to a client",
        "Sends a company-wide announcement",
        "Accepts or declines a meeting for me",
        "Spends money or books travel",
        "Other",
      ],
      helper: "Check all that apply. Your agent carries your name, so it's worth being strict.",
    },
    {
      key: "comm_style",
      label: "How should it communicate with you?",
      type: "dropdown",
      options: [
        "Short and direct",
        "Brief, with the reasoning underneath",
        "Full context, I like to read",
        "Bullet points only",
      ],
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Getting my inbox under control",
        "Protecting my calendar",
        "Prepping me for every meeting",
        "Following up on what people owe me",
        "Board and investor reporting",
        "A clear weekly view of the business",
        "Other",
      ],
    },
  ],
};

/** Three pages, one blob. The onboarding form moves the LAST one to the end of the questionnaire
 *  (see rolePageKeys in components/onboard/OnboardingForm.tsx), so a CEO answers "Your Seat" and
 *  "Your Week" up front and "Your Agent" once everything else is known. */
export const CEO_BRANCH: IndustryBranch[] = [SEAT, WEEK, AGENT];
