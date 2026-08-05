// Writing, in the owner's voice.
//
// The thing that makes these worth having over a blank chat window is that the voice is already
// known. The onboarding questionnaire captured how they describe their own voice, the brands they
// admire, the words they like, the words they hate, and a sample of their actual writing — and
// lib/agent-files.ts puts all of it in AGENTS.md, which the runtime loads every session.
//
// So every skill here starts the same way: read that before writing a word. A draft that sounds
// like an AI is worse than no draft, because the owner has to rewrite it AND has learned the tool
// does not work.
//
// The seven overlap by design — they are the customer's own categories — so each description says
// precisely when it applies. Seven similar-sounding skills is exactly the situation where the
// agent picks the wrong one, and the descriptions are the only thing preventing that.

import type { AgentSkill } from "@/config/skills";

const VOICE_RULE = `
## Voice, first

Before writing anything, read the voice section of AGENTS.md and the owner's writing sample in
USER.md: how they describe their own voice, the brands they admire, the words they like, and the
words they hate. Those were collected for exactly this moment.

Match sentence length and rhythm, not just vocabulary — that is what makes writing recognisable.
If they write in short declaratives, do not produce balanced two-clause sentences because they
read as more professional.

Never use a word from their hate list. It is the fastest way to make a draft unusable.
`.trim();

const DRAFT_RULE = `
## It's a draft

Hand it over and stop. Do not send, publish or post, whatever access exists. Their name is on it.
`.trim();

export const WRITING_SKILLS: AgentSkill[] = [
  {
    slug: "email-writing",
    emoji: "✉️",
    description:
      "Draft an email in the owner's voice — proposals, follow-ups, introductions, difficult conversations. Use when the deliverable is an email specifically.",
    body: `
# Email writing

${VOICE_RULE}

## Before drafting

Establish three things, and ask if any is unclear rather than guessing:

- **Who is this to**, and what is the relationship? A cold prospect and a client of six years get
  different emails with the same content.
- **What is the one thing** it needs to achieve? An email with three asks gets none of them.
- **What do they already know?** Recapping what the reader lived through is the most common way a
  short email becomes a long one.

## Structure

**Subject** — specific enough to be searched for in a year. "Thursday's pricing question" beats
"Following up".

**First line** — the point. Not the context, not the pleasantries. Busy readers decide whether to
keep reading in one line, and many read only that one on a phone.

**The middle** — whatever is genuinely needed. Usually less than expected.

**The ask** — one, specific, with a date. "Can you confirm by Thursday?" not "let me know your
thoughts".

## The difficult ones

Bad news, a price rise, a boundary, a mistake. The rules invert: say the thing in the first
sentence, no build-up. Do not over-explain — length reads as guilt. Own what is yours, and do not
apologise for what is not.

Offer the next step. People handle bad news far better with something to do about it.

${DRAFT_RULE}
`,
  },
  {
    slug: "business-writing",
    emoji: "📝",
    description:
      "Write memos, letters, executive summaries and formal correspondence. Use for internal or formal documents — not emails, not public content.",
    body: `
# Business writing

Memos, letters, executive summaries, briefing notes, formal correspondence. The kind of writing
where structure does most of the work.

${VOICE_RULE}

## Conclusion first

Whatever the document, the reader's question is "what does this mean for me?" Answer it in the
first paragraph. The McKinsey pyramid skill covers this properly if the argument is complex.

## By type

**Memo** — the decision or recommendation, the reasoning, what happens next and who does it. One
page. If it needs two, the first should be readable alone.

**Executive summary** — written last, read first, standing entirely on its own. Someone who reads
only this should be able to act. Include the numbers; a summary without them is an abstract.

**Formal letter** — a fixed shape, and the shape is the point. Purpose, substance, required
action, clear close. Formality does not mean archaic — "as per our conversation" helps nobody.

## What to cut

Throat-clearing openings. Passive voice hiding who does what. Adverbs doing the work adjectives
should. Anything hedging a position the writer actually holds.

## Length

Say what the length should be before drafting, and hold it. Business documents expand to fill
available space, and nobody has ever complained that a memo was too short.

${DRAFT_RULE}
`,
  },
  {
    slug: "content-writing",
    emoji: "🌐",
    description:
      "Write public-facing content — blog posts, service pages, landing copy, case studies. Use when it's going on the website or out to an audience.",
    body: `
# Content writing

Public content. Someone chose to read it and will stop the moment it stops earning attention.

${VOICE_RULE}

## Before writing

- **Who is this for**, and what did they type or click to arrive?
- **What do they want to know?** Not what the business wants to say. Those are different, and the
  gap is why most business content goes unread.
- **What should they do next?** One thing.

## Structure

**Open with the reader's problem**, in their words. Not the company's history, not "in today's
fast-paced world".

**Deliver the useful thing early.** Content that withholds value to build to a pitch trains
people to leave.

**Subheads that carry meaning** — a skimmer reading only headings should get the argument.

**Specifics over claims.** "Cut invoice chasing from six hours a week to twenty minutes" beats
"dramatically improves efficiency", and it is the sentence people quote.

## SEO, kept in proportion

Use the term someone would actually search, in the title and naturally in the body. Then write
for the human. Content optimised past readability ranks for a while and converts nobody.

## Case studies

Situation, what was tried, what was done, what changed — with numbers. A client quote in their own
words. Keep it honest: the version that admits what was hard is more persuasive than the one where
everything went smoothly, because nobody believes the second.

${DRAFT_RULE}
`,
  },
  {
    slug: "thought-leadership",
    emoji: "💡",
    description:
      "Build the owner's authority in their field — LinkedIn articles, op-eds, positioning, podcast angles. Use when the goal is credibility rather than a sale.",
    body: `
# Thought leadership

The goal is that the right people come to think of this person as worth listening to. That is
earned by saying something, not by posting frequently.

${VOICE_RULE}

## The only real requirement

**A position somebody could disagree with.** Content that everyone in the industry already agrees
with builds nothing — it reads as filler even when it is well written.

Start from what this person believes that their peers do not. It is usually in what frustrates
them, what they have changed their mind about, or what they think their industry gets wrong.
Their answers in USER.md often contain it verbatim.

## The shape that works

1. **The claim.** Stated plainly, early, without softening.
2. **Why it is not obvious.** What most people believe instead, and why that is reasonable but
   wrong.
3. **The evidence.** From their own work. This is what they have that a commentator does not — a
   specific engagement, a number, a thing they watched happen.
4. **What follows.** What someone should do differently.

## What to avoid

- Listicles of things everyone knows.
- Borrowed frameworks with no first-hand experience behind them.
- Hedging the claim until it is uncontroversial. That is the same as deleting it.
- Volume as strategy. One thing worth arguing about beats twelve worth nothing.

## Formats

**LinkedIn** — first two lines carry it; the rest is only read if those land. **Op-ed** — one
argument, 800 words, a concrete recommendation. **Podcast angle** — a title, the claim, and three
stories only this person can tell.

${DRAFT_RULE}
`,
  },
  {
    slug: "newsletter-writing",
    emoji: "📬",
    description:
      "Research, write and format a recurring newsletter. Use for the regular send to a list, not one-off emails or blog posts.",
    body: `
# Newsletter writing

The one piece of writing where consistency matters more than any individual issue. A brilliant
newsletter every four months builds nothing.

${VOICE_RULE}

## Decide once, then hold

The **promise** — what a subscriber gets, every time. Specific enough that they can tell whether
it was delivered.

The **shape** — the same sections in the same order. Familiarity is what makes it skimmable, and
skimmable is what keeps people subscribed.

The **length** — and it should be shorter than instinct suggests.

## Per issue

**Subject line** — written last, once you know what the issue actually says. Specific, not clever.

**Open with the substance.** No "hope you've had a great week". People opened it for the content.

**One main idea.** A newsletter covering five things is a digest, and digests get archived unread.

**Something usable.** A number, a method, a link worth the click. The test is whether a reader
could tell someone else one thing from it.

**One clear next step**, if any. Not four buttons.

## The recurring temptation

Writing about the business — a new hire, an award, an anniversary. Almost nobody subscribed for
that. It belongs occasionally and briefly, near the end.

${DRAFT_RULE}
`,
  },
  {
    slug: "speech-writing",
    emoji: "🎤",
    description:
      "Write for spoken delivery — keynotes, presentations, panel points, toasts. Use when it will be heard rather than read.",
    body: `
# Speech writing

Written to be heard once, by people who cannot re-read a sentence. That changes almost everything
about how it is built.

${VOICE_RULE}

## Write for the ear

- **Short sentences.** A listener has no punctuation.
- **Concrete over abstract.** "Three people in a garage" not "a nascent enterprise".
- **Repetition is a feature.** In writing it is redundancy; in speech it is how a point survives.
- **Numbers rounded.** "Nearly a thousand" not "973".
- **Read it aloud.** Anything that trips the tongue gets rewritten. This is not optional — it is
  the only real test.

## Structure

**Open with something true and specific** — a moment, a number, a question that lands. Not a
thank-you list; that is throat-clearing in front of the audience.

**One argument, three movements.** A listener can follow three things. Four is a document.

**Close on the strongest line**, and stop. The most common failure is talking past the ending
because the ending felt abrupt. It felt abrupt to the speaker, not the room.

## Timing

Roughly 130 words a minute. Draft to the time, not the page count, and say the target word count
before starting. Overrunning is the most common and least forgivable failure.

## Delivery notes

Mark where to pause, what to emphasise, and where a slide changes. Deliver as a script plus
notes, not prose — nobody reads paragraphs aloud well.

${DRAFT_RULE}
`,
  },
  {
    slug: "document-formatting",
    emoji: "📐",
    description:
      "Apply consistent structure and brand standards to an existing document. Use when the content is written and it needs to look right.",
    body: `
# Document formatting

Content is done. This is about making it look like it came from one organisation that pays
attention.

## Establish the standard first

Check whether a template or brand guide exists before inventing anything — the workspace files or
their Drive usually have one. Matching an existing standard badly is worse than not matching it.

If there is none, derive it from their most recent good document and say that is what you did.

## The checklist

- **Heading hierarchy**, used consistently. One H1. Headings that describe rather than label.
- **One body font, one heading font.** Sizes from a fixed scale, not chosen per document.
- **Spacing that is consistent**, particularly before and after headings. Inconsistent spacing is
  the single biggest source of "this looks amateur" and almost nobody can name it.
- **Alignment** — one grid. Tables, images and text sharing edges.
- **Page furniture** — numbers, a footer with the document name, a date. Missing page numbers on
  anything over three pages is a small thing that reads as carelessness.
- **The first page** — title, who it is for, date, author. Astonishingly often missing.

## What to leave alone

The words. If something reads badly, say so separately — do not quietly rewrite while formatting.
The author needs to know.

## Deliver

The formatted document, plus a note of what was changed and anything that could not be fixed
without a decision from them.
`,
  },
];
