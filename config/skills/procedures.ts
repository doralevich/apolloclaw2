// The three procedures: what to do, in what order, for the jobs this product is sold on.
//
// Every one is a METHOD, not a capability. It assumes the tools already exist through Connections
// and says what order to do things in, what to check, and when to stop and ask. A skill that
// needs an integration the customer hasn't connected should say so and stop rather than inventing
// an answer — each carries that rule, because a confidently empty daily brief is worse than "your
// calendar isn't connected yet".

import type { AgentSkill } from "@/config/skills";

const MISSING_CONNECTION_RULE = `
## When something isn't connected

If a step needs an integration the owner hasn't connected, say which one and stop. Do not guess,
do not substitute a different source, and do not produce the deliverable with a hole in it. An
empty brief that says "your calendar isn't connected" is useful. A brief that quietly omits the
calendar looks like a day with no meetings.
`.trim();

export const PROCEDURE_SKILLS: AgentSkill[] = [
  {
    slug: "daily-brief",
    emoji: "☀️",
    description:
      "Today's schedule, replies needed, what moved. Use for a morning brief or day rundown.",
    body: `
# Daily brief

The owner wants to know what today looks like and what needs them in it. Four blocks, in this
order, and nothing else unless they ask.

## 1. Today

Their calendar for the day, in time order. For each: time, who's in it, and the one-line purpose.
Flag anything back to back with no gap, and anything they haven't accepted yet.

## 2. Waiting on you

Threads where the last message is from someone else and it asks for something. Order by how long
it has been sitting, oldest first. Name the person and what they want in one line each — not a
subject line, which tells them nothing they didn't know.

## 3. Moved yesterday

What actually changed since the last brief: replies that arrived on things they were chasing,
work that closed, decisions made. Skip this block entirely if nothing did — a heading with
"nothing to report" underneath is noise.

## 4. If you only do one thing

One item. The one with a deadline, or the one blocking someone else. Say why in half a sentence.

## Tone

Short lines. No preamble, no "here's your brief", no summary at the end. They are reading this on
a phone before their first meeting.

${MISSING_CONNECTION_RULE}
`,
  },
  {
    slug: "follow-up-chaser",
    emoji: "📌",
    description:
      "Find unanswered sent messages and draft nudges. Use for chasing what's gone quiet.",
    body: `
# Follow-up chaser

Things the owner sent that never came back. The job is to find them, judge which are worth a
nudge, and write the nudges — not to send anything.

## Finding them

Sent messages where nobody replied, older than three days and newer than six weeks. Older than
that is not a follow-up, it is an apology, and the owner should decide whether to reopen it.

## What to drop

Not everything unanswered deserves chasing:

- Anything that didn't ask for something. A thank-you needs no reply.
- Newsletters, receipts, automated mail, no-reply addresses.
- Threads where they got their answer another way — a meeting happened, someone else replied,
  the work landed. Check before assuming silence means stalled.

## The draft

One short message per thread. In the owner's voice, which means read AGENTS.md and USER.md first
if you haven't this session.

Reference the specific thing, not the fact of silence — "still after the Q3 numbers before
Thursday" beats "just following up on my last email". Give them an easy out: a deadline, a
narrowed ask, or an explicit "if this isn't yours, who should I ask?".

Never guilt. Never "I notice you haven't responded".

## Always stop here

Present the drafts and wait. Do not send. Sending on someone's behalf without them seeing the
words is the fastest way to lose their trust in you, and the whole product is built on their
approval being real.

${MISSING_CONNECTION_RULE}
`,
  },
  {
    slug: "meeting-prep",
    emoji: "🗂️",
    description:
      "One-page brief for a meeting: who, history, open items. Use before a call.",
    body: `
# Meeting prep

One page, for one meeting. If they didn't say which, take the next one on the calendar and say
which one you picked.

## Who's in it

Each external attendee: name, role, company. Where you know it from — the last correspondence,
their signature, the calendar invite. If you don't know who someone is, say so rather than
inferring from their email domain.

## Where you left it

The last two or three exchanges with these people, compressed to what was decided and what was
promised. Dates matter here: "agreed on the 12th to send pricing by the 19th" is the sentence
that changes how the meeting opens.

## Open items

Anything promised and not delivered, in either direction. Theirs and the owner's, marked clearly
as which. This is the block the owner actually reads.

## Likely to come up

At most three. Grounded in the thread — a question they asked that never got answered, a decision
that was deferred, a deadline that has since moved. Not generic meeting advice.

## What you need from them

If preparing this surfaced something only the owner knows — a price they haven't shared, a
decision they haven't made — ask it as a direct question at the end. One line each.

## Length

One screen. If it doesn't fit, cut "likely to come up" first and "open items" last.

${MISSING_CONNECTION_RULE}
`,
  },
  {
    slug: "eod-summary",
    emoji: "🌙",
    description:
      "Close the day: what finished, what slipped, what's due tomorrow. Use at end of day.",
    body: `
# End of day summary

A short, honest close. The point is a trail — so that a week does not pass without anyone being
able to say where it went — and a clean start tomorrow.

Three blocks. Keep the whole thing to one screen.

## Done today

What actually completed. Not what was worked on — what finished. Sent, shipped, decided, signed.
If something moved a long way without finishing, say so in those terms: "proposal drafted, not
sent" is more useful than either "done" or silence.

## Still open

What was expected today and did not happen. For each, one line on where it stopped. Resist
softening this — a carried-over item that reads as progress is how the same thing carries over
for three weeks.

Anything now overdue gets marked plainly, with how long.

## Tomorrow

What is already committed for tomorrow: meetings, deadlines, anything promised to someone with a
date on it. If today's slippage has made tomorrow undeliverable, say that tonight rather than
letting them find out at 4pm tomorrow.

## Tone

This is read at the end of a long day. No encouragement, no summary of the summary. Short lines,
specific nouns, and nothing that needs a second read.

If it was a genuinely bad day, a plain account of it is more respectful than a positive spin.
They were there.

${MISSING_CONNECTION_RULE}
`,
  },
  {
    slug: "weekly-planning",
    emoji: "🗓️",
    description:
      "Build the week: what's fixed, carrying over, the three that matter. Use Mondays.",
    body: `
# Weekly planning session

The job is to arrive at Monday with a week that has a shape, rather than a calendar that
happens to you.

## 1. What is already fixed

The week's meetings and hard deadlines. This is the container everything else has to fit inside,
so it comes first — a plan made without it is a wish list.

Total the committed hours. If more than about half the week is already booked, say so plainly;
it changes what is realistic and they may want to move something.

## 2. What is carrying over

Everything that did not finish last week, with how long it has been open. Anything on its third
week gets called out as such — that is usually a sign it is either blocked or not actually
important, and both are worth knowing.

## 3. What has to happen this week

The genuinely time-bound: client commitments with dates, deadlines, anything blocking somebody
else. Distinguish between "promised to someone" and "would like to do" — the first is not
negotiable without a conversation, and the second is.

## 4. The three that matter

From everything above, three things. Not five, not a list. For each: why this week specifically,
and roughly how long it needs.

Then check them against block 1. If the three do not fit in the unbooked time, the plan is
already wrong — say so now and propose what moves.

## 5. What is not happening

Name the things being consciously left. A week without an explicit not-doing list quietly
becomes a week of doing everything badly.

## Format

Written to be read in two minutes before the first call, and used as a checklist on Friday.

${MISSING_CONNECTION_RULE}
`,
  },
];
