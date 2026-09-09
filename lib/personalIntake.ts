// The Personal Agent's intake deep-dive.
//
// Three pages rather than one: the day, the people, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`personalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// ACCESS IS THE QUESTION THAT MAKES THIS ONE DIFFERENT. Every other role agent is pointed at a
// bounded thing: contracts, a book of business, a brand guide. This one is pointed at an inbox and
// a calendar, which do not separate work from the rest of a life and which hold other people's
// information as much as the customer's. So the scope question is required, it is asked in plain
// words, and it is asked BEFORE anything about what the agent should do - because a customer who
// has not decided what it may read has not decided anything yet.
//
// The second thing this intake gets that the others do not need: how the customer sounds. Every
// role agent gets the shared voice pages later in the form, and for most of them the drafts are
// documents. Here the drafts are messages to people who already know the customer, where being
// approximately right is worse than being late. So this asks for the tells - the greeting, the
// sign-off, the phrases they would never use - rather than relying on a writing sample alone.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No job title, no org chart, no productivity
// system preference, and no "biggest time sink" - the Executive Profile page asks about the
// bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the day ─────────────────────────────────────────────────────────
const DAY: IndustryBranch = {
  stepTitle: "Your Day",
  stepSubtitle:
    "What the week actually looks like, and what the agent may see. The second one is the important question.",
  stepLabel: "Your Day",
  fields: [
    {
      key: "role_context",
      label: "What do you do all day?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. I run a 30 person software company. Half my week is customer and investor calls, the rest is whatever is on fire.",
      helper: "In the words you would use to a friend, not the words on your LinkedIn.",
    },
    {
      key: "email_platform",
      label: "Where does your email and calendar live?",
      type: "dropdown",
      required: true,
      options: [
        "Google Workspace",
        "Microsoft 365 / Outlook",
        "Both, for different things",
        "Something else",
      ],
    },
    // THE QUESTION THIS WHOLE INTAKE EXISTS FOR. An agent pointed at a mailbox can see a
    // customer's medical results, their lawyer, their family. Nobody should discover the scope
    // of that after the fact, so it is required, it is asked early, and the most conservative
    // option is listed first.
    {
      key: "access_scope",
      label: "What should your agent be able to read?",
      type: "dropdown",
      required: true,
      options: [
        "Work email and calendar only",
        "Work email and calendar, plus specific personal threads I forward",
        "Everything in one account, work and personal together",
        "I want to talk this through before deciding",
      ],
      helper:
        "There is no wrong answer and starting narrow costs nothing. You can widen it later in a minute.",
    },
    {
      key: "access_exclusions",
      label: "Is there anything it must never read?",
      type: "textarea",
      placeholder:
        "e.g. anything from my accountant or my doctor, the folder marked Personal, anything from my wife.",
      helper:
        "Senders, folders, labels or subjects. Worth writing down even if the answer feels obvious to you.",
    },
    {
      key: "protected_time",
      label: "What should it defend on your calendar?",
      type: "textarea",
      placeholder:
        "e.g. no meetings before 10, Friday afternoons are for writing, school pickup Tuesdays and Thursdays, never book me two hours back to back.",
      helper: "Including the blocks that are not meetings. This is most of what an assistant is for.",
    },
  ],
};

// ─── Page 2: the people ──────────────────────────────────────────────────────
const PEOPLE: IndustryBranch = {
  stepTitle: "Your People and Your Voice",
  stepSubtitle:
    "Who matters, and how you sound to them. These messages go to people who already know you.",
  stepLabel: "People",
  fields: [
    {
      key: "key_people",
      label: "Who are the people whose messages always matter?",
      type: "textarea",
      placeholder:
        "e.g. my two co-founders, our biggest customer's COO, my board chair, my kids' school.",
      helper: "Your agent surfaces these first and never buries them, whatever else is in the inbox.",
    },
    {
      key: "voice_tells",
      label: "How do you sound in writing, and does that change depending on who it is?",
      type: "textarea",
      placeholder:
        "e.g. short, no greeting, sign off with just my initial, never use exclamation marks, never say 'circling back' or 'per my last email'.",
      helper:
        "The tells matter more than the description: your greeting, your sign-off, and the phrases you would never send.",
    },
    {
      key: "recurring_asks",
      label: "What do people ask you for over and over?",
      type: "textarea",
      placeholder:
        "e.g. my availability, the deck, an intro to someone, the same three questions about pricing.",
      helper: "The requests worth having a good draft ready for.",
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, and what must never leave without you.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your personal agent to own?",
      type: "multiselect",
      options: [
        "Inbox triage and sorting",
        "Drafting replies",
        "Scheduling and rescheduling",
        "Meeting briefs and call notes",
        "Tracking what I promised people",
        "Chasing replies I am waiting on",
        "Research before decisions",
        "Travel and expenses",
      ],
    },
    // The follow-up to the one option that talks to other people without a document in between.
    // Everything else on the list is internal or produces a draft the customer reads; scheduling
    // is the agent negotiating in the customer's name in real time, and it is the first thing
    // people are tempted to let run unattended.
    {
      key: "sending_authority",
      label: "Can it send, or only draft?",
      type: "dropdown",
      required: true,
      options: [
        "Draft only, I send everything myself",
        "It can send routine confirmations and scheduling, everything else I read first",
        "It can send anything internal, external I read first",
        "It can send anything within the rules I set",
      ],
      helper: "There is no wrong answer, and starting cautious costs nothing.",
    },
    // The list every customer has and none of them volunteer unprompted. Asked separately from
    // the authority dropdown because "it can send routine things" and "but never these" are two
    // different decisions, and the second one is the one that prevents the bad afternoon.
    {
      key: "never_unattended",
      label: "What must never go out without you reading it?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything to a customer or investor, anything with a number or a price in it, anything about hiring or firing, anything to my family, any apology.",
      helper: "These go to people who know you. A message that is nearly right is worse than a slow one.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. I want to stop opening my inbox to two hundred unread and no idea where to start.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const PERSONAL_BRANCH: IndustryBranch[] = [DAY, PEOPLE, AGENT];
