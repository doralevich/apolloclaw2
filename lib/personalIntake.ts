// The Personal Agent's intake deep-dive.
//
// Three pages rather than one: the day, the people, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`personalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// ACCESS IS STILL A QUESTION THIS ONE ASKS THAT THE OTHERS DO NOT. Every other role agent is
// pointed at a bounded thing: contracts, a book of business, a brand guide. This one is pointed
// at an inbox and a calendar, which do not separate work from the rest of a life and which hold
// other people's information as much as the customer's. So the scope question is required, it
// is asked in plain words, and the most conservative option is listed first. What it does NOT
// ask any more is a forced list of exclusions or a calendar-defense rule up front - starting
// narrow already covers that, and both read as homework rather than as the agent's first
// useful action. Either can still come up later, in the agent's own conversation with the
// customer, once there is a relationship to have it in.
//
// THE SECOND THING THIS INTAKE GETS that the others do not need: how the customer sounds. Every
// role agent gets the shared voice pages later in the form, and for most of them the drafts are
// documents. Here the drafts are messages to people who already know the customer, where being
// approximately right is worse than being late. So this asks for the tells - the greeting, the
// sign-off, the phrases they would never use - rather than relying on a writing sample alone.
//
// THE THIRD: this is the one role agent whose job is somebody's whole life, not one function of
// a business, so the People page also covers family, important dates and the organizations they
// show up for - the context a real assistant would pick up in the first week, not the bounded
// facts a CFO or Law Agent's client would hand over.
//
// WHAT IS STILL DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need
// this before its first useful action, or can it just ask? No job title, no org chart, no
// productivity system preference. The Executive Profile page other role agents get is dropped
// entirely for this one (OnboardingForm.tsx's dropPages) - "biggest growth bottleneck" has no
// personal equivalent, and asking it anyway is what made this intake read as a business form
// wearing a personal costume.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the day ─────────────────────────────────────────────────────────
const DAY: IndustryBranch = {
  stepTitle: "Your Day",
  stepSubtitle:
    "What your life actually looks like, and what the agent may see. The second one is the important question.",
  stepLabel: "Your Day",
  fields: [
    {
      key: "role_context",
      label: "What does a typical day look like for you, weekdays and weekends?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. up at 6 for a run, kids to school by 8, the day is a mix of calls and whatever is on fire, weekends are family time and errands unless something's traveling.",
      helper: "In the words you would use to a friend, not the words on your LinkedIn.",
    },
    {
      key: "professional_day",
      label: "What does your professional day look like, if applicable?",
      type: "textarea",
      placeholder:
        "e.g. I run a 30 person software company. Half my week is customer and investor calls, the rest is whatever is on fire.",
      helper: "Leave this blank if you are not currently working.",
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
      key: "finances",
      label: "How involved should it be in your finances?",
      type: "dropdown",
      options: [
        "Not involved at all",
        "Just reminders - bills due, subscriptions renewing",
        "Reminders plus a running picture of what's coming in and out",
        "Everything, including flagging anything that looks unusual",
      ],
      helper: "Starting narrow costs nothing. You can widen it later.",
    },
  ],
};

// ─── Page 2: the people ──────────────────────────────────────────────────────
const PEOPLE: IndustryBranch = {
  stepTitle: "Your People",
  stepSubtitle:
    "Who matters, the dates that matter, and how you sound to all of them.",
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
      key: "family",
      label: "Who's in your family, and anything it should know about them?",
      type: "textarea",
      placeholder:
        "e.g. married to Sarah, our two kids Mia (8, Lincoln Elementary, gymnastics Tuesdays, piano Thursdays) and Leo (5, same school, plays soccer), my parents nearby who help with pickup. Or: single, no kids, close with my sister and her family.",
      helper:
        "Married, single, partnered, kids or not - whatever's true for you. For kids: names, ages, schools, camps, sports, music, and other activities it should keep straight without you re-explaining them.",
    },
    {
      key: "important_dates",
      label: "Birthdays, anniversaries, deadlines, or other dates it should never let you miss?",
      type: "textarea",
      placeholder:
        "e.g. Sarah's birthday March 4, our anniversary June 12, Mom's birthday in September, passport renewal due in March, camp registration opens in January.",
      helper: "It reminds you with enough lead time to actually do something about it.",
    },
    {
      key: "organizations",
      label: "Any organizations, boards, or volunteering it should track?",
      type: "textarea",
      placeholder:
        "e.g. HOA board, meets first Tuesday, my son's school PTA, volunteering at the food bank every other Saturday.",
      helper: "Meetings, deadlines, and who to contact there.",
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
        "Vacation and personal travel planning",
        "Birthdays, anniversaries, and holidays",
        "Bills, subscriptions, and financial reminders",
        "Organizations and volunteering coordination",
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
      key: "holidays",
      label: "Anything about holidays it should stay on top of?",
      type: "textarea",
      placeholder:
        "e.g. book flights home for Thanksgiving by October, order holiday cards by December 1, gifts wrapped up by the first week of December.",
      helper: "The planning, not just the date.",
    },
    {
      key: "daily_briefing",
      label: "Do you want a daily task sheet, like a morning briefing?",
      type: "dropdown",
      options: [
        "Yes, send me one every morning",
        "Only when I ask for one",
        "No, I don't need one",
      ],
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

/** Three pages, one blob. The onboarding form renders these in order.
 *
 * People before Day, David's call: this is the one role agent that reads as somebody getting to
 * know you rather than somebody sizing up a business, so who you are and who is around you comes
 * first. The logistics of your day are the second thing an assistant would ask, not the first. */
export const PERSONAL_BRANCH: IndustryBranch[] = [PEOPLE, DAY, AGENT];
