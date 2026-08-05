// The procedures we install on every agent at provision time.
//
// WHY THESE EXIST. A stock OpenClaw box already ships 50+ skills — diagram-maker, notion,
// debuggers, taskflow, the rest. It is not short of capability. What it has no opinion about is
// how to do the specific jobs this product is sold on: the morning brief, the follow-up that
// never came back, the meeting nobody prepped for. Those are in the marketing and the demo, and
// until now they lived nowhere in the agent.
//
// HOW THEY GET THERE. OpenClaw discovers skills on its own from $OPENCLAW_STATE_DIR/plugin-skills
// — a directory per skill, each holding a SKILL.md — and lists them in the session's
// available_skills. There is no index to maintain: lib/provision.ts writes the files and the
// runtime finds them. (Confirmed by asking a live instance what it could see.)
//
// WHAT MAKES A GOOD ONE HERE. Every skill below is a METHOD, not a capability: it assumes the
// tools already exist through Connections and says what order to do things in, what to check, and
// when to stop and ask. A skill that needs an integration the customer hasn't connected should
// say so and stop, rather than inventing an answer — each one carries that instruction, because a
// confidently empty daily brief is worse than "your calendar isn't connected yet".

export type AgentSkill = {
  /** Directory name under plugin-skills, and the name the runtime lists it under. */
  slug: string;
  /** One line. This is what the agent sees when deciding whether the skill applies. */
  description: string;
  /** Shown beside the skill in OpenClaw's own listings. */
  emoji: string;
  /** The body of SKILL.md, below the frontmatter. */
  body: string;
};

/**
 * SKILL.md as the runtime expects it, copied from a real installed skill rather than guessed:
 *
 *   ---
 *   name: slack
 *   description: "Slack tool actions: send/read/edit/delete messages, react, pin/unpin, …"
 *   metadata: { "openclaw": { "emoji": "💬" } }
 *   ---
 *
 *   # Slack
 *   …
 *
 * THE DESCRIPTION IS QUOTED, and that is not cosmetic. Two of ours contain a colon, and a colon
 * in an unquoted YAML scalar either fails the parse or truncates the value at that point — either
 * way the file lands looking fine and the runtime sees a skill with half a description or none.
 * That is the silent failure this whole detour was about, so it is enforced here rather than left
 * to whoever writes the next skill to remember.
 */
export function skillFile(skill: AgentSkill): string {
  return [
    `---`,
    `name: ${skill.slug}`,
    `description: ${yamlQuote(skill.description)}`,
    `metadata: { "openclaw": { "emoji": ${JSON.stringify(skill.emoji)} } }`,
    `---`,
    ``,
    skill.body.trim(),
    ``,
  ].join("\n");
}

/** A double-quoted YAML scalar. JSON string escaping is a valid subset, so this is exact. */
function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

const MISSING_CONNECTION_RULE = `
## When something isn't connected

If a step needs an integration the owner hasn't connected, say which one and stop. Do not guess,
do not substitute a different source, and do not produce the deliverable with a hole in it. An
empty brief that says "your calendar isn't connected" is useful. A brief that quietly omits the
calendar looks like a day with no meetings.
`.trim();

export const AGENT_SKILLS: AgentSkill[] = [
  {
    slug: "daily-brief",
    emoji: "☀️",
    description:
      "Assemble the owner's morning brief: today's schedule, what needs a reply, what moved yesterday. Use when asked for a brief, a rundown, or what the day looks like.",
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
      "Find sent messages that never got a reply and draft the nudges. Use when asked what's gone quiet, what needs chasing, or to follow up on something.",
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
      "Prepare a one-page brief for an upcoming meeting: who's coming, the history, what's open. Use before a call, or when asked to prep for a meeting.",
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
];
