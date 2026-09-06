// The CEO Agent's intake deep-dive.
//
// Three pages rather than one: your seat, your week, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`ceoDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// WHAT MAKES THIS ONE DIFFERENT FROM THE OTHER ROLE AGENTS: every other agent is configured around
// a body of work. This one is configured around a PERSON and the people around them. An agent that
// drafts in a chief executive's name can do real damage with a message that is merely tone-deaf,
// so the questions that matter most here are about who it may speak to, in whose name, and what it
// must never send without being asked. Those sit on the last page and are worth the time even if
// the customer skims the rest.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No org chart, no meeting count, no travel
// preferences, and no "biggest time drain" as a separate question - the Executive Profile page
// asks about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the seat ────────────────────────────────────────────────────────
const SEAT: IndustryBranch = {
  stepTitle: "Your Seat",
  stepSubtitle:
    "What you actually run, and who is around you. Your agent has to know whose name it is writing in.",
  stepLabel: "Your Seat",
  fields: [
    {
      key: "title",
      label: "Your role or title?",
      type: "text",
      placeholder: "e.g. Founder & CEO, Managing Partner, President",
    },
    {
      key: "team_size",
      label: "How big is the organisation you run?",
      type: "dropdown",
      options: ["Just me", "2-10", "11-50", "51-200", "201-1000", "More than 1000"],
    },
    {
      key: "direct_reports",
      label: "Who reports to you, and what do they own?",
      type: "textarea",
      placeholder:
        "e.g. Maria runs sales, Dan runs engineering, our COO seat is empty and I am covering it.",
      helper: "Names and remits. Your agent should never ask you who runs something twice.",
    },
    {
      key: "key_stakeholders",
      label: "Who else matters, outside your reports?",
      type: "textarea",
      placeholder:
        "e.g. two board members, our lead investor, my co-founder who is not operational, our biggest customer's COO.",
      helper:
        "Board, investors, partners, key customers. The people whose emails change your week.",
    },
    {
      key: "assistant",
      label: "Do you have an assistant or chief of staff today?",
      type: "dropdown",
      options: [
        "Yes, a full-time chief of staff",
        "Yes, an executive assistant",
        "Someone part-time or shared",
        "No, I run my own calendar and inbox",
      ],
      helper: "If you do, your agent works alongside them rather than around them.",
    },
    {
      key: "decision_rights",
      label: "What comes to you that probably should not?",
      type: "textarea",
      placeholder:
        "e.g. every discount over 10 percent, hiring approvals for junior roles, any customer complaint that reaches a manager.",
      helper:
        "The decisions that land on your desk by habit rather than necessity. This is where an agent buys back the most time.",
    },
  ],
};

// ─── Page 2: the week ────────────────────────────────────────────────────────
const WEEK: IndustryBranch = {
  stepTitle: "Your Week",
  stepSubtitle:
    "How your time actually goes, and what you are trying to move. The more specific here, the less your agent has to guess.",
  stepLabel: "Your Week",
  fields: [
    {
      key: "priorities",
      label: "What are you actually trying to move right now?",
      type: "textarea",
      placeholder:
        "e.g. close the Series A, get the enterprise tier shipped, replace our head of sales without the team noticing the gap.",
      helper: "The two or three things that would make this a good quarter.",
    },
    {
      key: "recurring_meetings",
      label: "Which recurring meetings do you run or sit in?",
      type: "multiselect",
      options: [
        "Executive or leadership team",
        "Board meeting",
        "All-hands",
        "One-to-ones with reports",
        "Sales pipeline review",
        "Product or roadmap review",
        "Investor updates",
        "Customer or partner calls",
        "Other",
      ],
    },
    {
      key: "meeting_prep",
      label: "What does good preparation look like for you?",
      type: "textarea",
      placeholder:
        "e.g. one page before every external meeting: who they are, last three interactions, what they want, what I want.",
      helper: "What you wish were on your screen before you walk in.",
    },
    {
      key: "inbox_reality",
      label: "How bad is the inbox, and what is clogging it?",
      type: "textarea",
      placeholder:
        "e.g. 200 a day, most of it cc traffic I do not need, the ones that matter are buried under vendor outreach.",
      helper: "So your agent knows what to surface and what to bury.",
    },
    {
      key: "email_tool",
      label: "What do you run email and calendar in?",
      type: "dropdown",
      options: ["Google Workspace", "Microsoft 365 / Outlook", "Both", "Other"],
    },
    {
      key: "ops_stack",
      label: "Which tools should it work across?",
      type: "multiselect",
      options: [
        "Slack",
        "Microsoft Teams",
        "Notion",
        "Asana",
        "Linear",
        "Jira",
        "Monday.com",
        "Salesforce",
        "HubSpot",
        "Google Drive",
        "SharePoint",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, who it may speak to, and the lines it must not cross.",
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
        "Meeting prep briefs",
        "Meeting notes and follow-ups",
        "Board and investor updates",
        "Internal comms and announcements",
        "Research before decisions",
        "Tracking what you asked people for",
        "Weekly business review",
        "Drafting on your behalf",
      ],
    },
    // The follow-up to the option that carries the most risk on this list. An agent writing in a
    // chief executive's name to their own company is a different thing from drafting a document,
    // and "how should it sound" is not enough to configure it safely.
    {
      key: "ghostwriting_rules",
      label: "When it writes as you, what are the rules?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Drafting on your behalf" },
      placeholder:
        "e.g. never send as me without showing me first, my name goes on nothing about people or performance, short and warm to the team, blunt to vendors.",
      helper:
        "Who it may write to as you, what it must never write as you, and whether anything at all goes out without your eyes on it.",
    },
    {
      key: "autonomy",
      label: "What should it handle alone, and what should always come to you?",
      type: "textarea",
      placeholder:
        "e.g. book anything internal without asking, never accept an external meeting on my behalf, answer scheduling mail directly but never anything about money.",
      helper: "Where its judgment ends and yours begins.",
    },
    {
      key: "guardrails",
      label: "What must it never do without your say-so?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. contact the board, message anyone about their performance or role, commit to a number, reply to press, forward anything from my co-founder.",
      helper:
        "Worth being strict about. Your agent carries your name, and a message sent in it cannot be unsent.",
    },
    {
      key: "comm_style",
      label: "How should it communicate with you?",
      type: "dropdown",
      options: [
        "Short and direct, no preamble",
        "Brief with the reasoning underneath",
        "Full context, I like to read",
        "Bullet points only",
        "Ask me before long explanations",
      ],
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. I stop being the reason things wait.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "ceo_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The time back, the things off your desk, or the clarity you want three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const CEO_BRANCH: IndustryBranch[] = [SEAT, WEEK, AGENT];
