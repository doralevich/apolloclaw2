// Winning and keeping work.
//
// The through-line: every one of these ends with the owner deciding. A price is proposed, never
// quoted; a proposal is drafted, never sent; a negotiating position is prepared, never taken.
// The agent has the customer's mailbox and their reputation attached to it, and the whole product
// rests on approval being real rather than nominal.
//
// The other through-line, less obvious: these are the skills most likely to produce something
// that SOUNDS right and is commercially wrong. A confident proposal at the wrong price does more
// damage than no proposal, so each one names what it must not invent.

import type { AgentSkill } from "@/config/skills";

const OWNER_DECIDES = `
## The owner decides

Never invent a price, a discount, a term or a commitment. Where a number is needed and not known,
leave it marked and say what it depends on. A confident proposal at a made-up price is worse than
an incomplete one, because it gets sent.

Draft it, hand it over, stop.
`.trim();

export const SALES_SKILLS: AgentSkill[] = [
  {
    slug: "proposals-sows",
    emoji: "📑",
    description:
      "Scope, deliverables, timeline, price, terms. Use when asked what it would take.",
    body: `
# Proposals and SOWs

A proposal is not a description of the work. It is an argument that this is worth doing, with the
work described inside it.

## Order matters

1. **Their situation**, in their words, from what they actually said. This is the section that
   decides whether the rest gets read - a proposal that opens with the vendor's credentials reads
   as a template.
2. **What they get.** Outcomes first, deliverables second. "You stop losing two days a month to
   invoice chasing" then "we build and document the process".
3. **How it works.** Phases, what happens in each, what is needed from them. The last part is
   routinely omitted and is the most common cause of a project running late.
4. **Timeline**, with the dependency on their side stated.
5. **Price.** Plainly, no burying. Options if genuinely different scopes; not three tiers designed
   to make the middle look reasonable.
6. **What is not included.** The section that prevents the argument in month two.
7. **How to say yes**, and what happens next.

## Scope, precisely

Every deliverable needs a noun and a boundary. "Website" is not a scope. "Five-page site, two
rounds of revisions, content supplied by client" is one.

Name the change process for anything beyond it. Not to be defensive - so that a change is a
conversation rather than a grievance.

## Length

Short enough to be read fully by the person deciding. Detail belongs in appendices.

${OWNER_DECIDES}
`,
  },
  {
    slug: "pricing-strategy",
    emoji: "🏷️",
    description:
      "What to charge and how to package it. Use before a proposal or a rate review.",
    body: `
# Pricing strategy

## Price the outcome, not the hours

Hourly pricing caps earnings at capacity and punishes getting faster. Where the value is a result
rather than time, price the result - the question is not "how long does this take us" but "what
is it worth to them, and what would the alternative cost".

The floor is cost plus margin. The ceiling is their alternative. The price sits between, nearer
the ceiling than instinct suggests.

## Structure before number

- **What is the smallest thing someone can buy** to find out whether this works? Removing risk
  from a first purchase converts better than any discount.
- **What is included, and what is extra?** Decided in advance, or every project renegotiates
  itself in month two.
- **Is there a recurring component?** One retainer is worth several projects, and it changes what
  the business is worth.

## Anchoring

The first number sets the frame. If options are shown, the most expensive first - every number
after reads as smaller. Three options maximum, genuinely different in scope rather than the same
thing in three sizes.

## The profitability check

Before any number goes out: at this price, with an honest estimate of hours including revisions
and account management, what is the margin? Do the same on the last three engagements - the gap
between quoted and actual is usually the real finding, and it is usually 30%.

## Raising prices

Existing clients, notice, and a reason that is about value rather than costs. Expect to lose the
bottom few. That is usually the point.

${OWNER_DECIDES}
`,
  },
  {
    slug: "objection-handling",
    emoji: "🛡️",
    description:
      "Find the real objection and answer it. Use before a sales call or stalled deal.",
    body: `
# Objection handling

## First, find the real one

The stated objection is often not the operative one. "Too expensive" usually means one of: I do
not believe the value, I cannot get it approved, I have a cheaper quote, or this is not a priority.
Those need four different responses and one of them is not a discount.

The question that separates them: **"If price weren't a factor, would you go ahead?"** A yes makes
it a value or budget conversation. A no means price was never the issue.

## The pattern

1. **Acknowledge it properly.** Not "I understand, but" - that is disagreement with a preamble.
2. **Ask one clarifying question.** Most objections shrink when specified.
3. **Answer the actual concern**, briefly.
4. **Check it landed.** "Does that address it?" Moving on from an unresolved objection is how
   deals die silently.

## The common four

**"Too expensive."** Reframe against the cost of the status quo or the alternative. Change scope
rather than price if something must move - discounting teaches them the first number was invented.

**"We need to think about it."** Usually an unspoken concern or a missing decision-maker. Ask what
would need to be true, and who else is involved.

**"Not right now."** Ask what changes by then. A real timing objection has an event attached; a
soft no does not.

**"We're getting other quotes."** Reasonable. Ask what they are comparing on — often it is unclear
to them, and helping them build the comparison is more persuasive than arguing.

## When to stop

Not every objection should be handled. Some prospects should be let go, and doing it gracefully
is worth more than a bad-fit client. Say so when that is the read.
`,
  },
  {
    slug: "negotiation",
    emoji: "⚔️",
    description:
      "Protect margin after the yes. Use for scope creep, terms and late payment.",
    body: `
# Negotiation

Mostly this is about protecting margin after the yes, which is where small businesses lose most
of it.

## Before any conversation

- **What is the actual goal?** Not "win" - the specific outcome that would be good.
- **What is the walk-away?** Decided in advance, in writing, before anyone is in the room. A
  walk-away invented during a conversation is not one.
- **What is cheap to give and valuable to receive?** Timeline flexibility, case-study rights,
  payment terms, a testimonial, an introduction. These are the currency that avoids discounting.
- **What is their alternative, really?** Usually weaker than implied.

## Principles

**Concede slowly and never for free.** Every give attached to a get, even a small one. A free
concession moves the anchor and invites the next request.

**Trade variables, not price.** Scope, timeline, payment schedule, term length — all move without
signalling the price was soft.

**Silence is a tool.** After stating a number, stop. The urge to fill the gap with justification
is where most positions are lost.

## The specific ones

**Scope creep.** Name it early and kindly: "happy to do that — it's outside what we scoped, so
here's what it adds." Every unbilled extra teaches that extras are free.

**Late payment.** Firm, unembarrassed, and escalating on a schedule decided in advance. Being
owed money is not awkward; the awkwardness belongs to the other party.

**Vendor renegotiation.** Strongest before renewal, with a real alternative priced. Ask directly —
most vendors have room and expect the question.

${OWNER_DECIDES}
`,
  },
  {
    slug: "cold-outreach",
    emoji: "🎯",
    description:
      "Researched multi-touch sequence. Use for new prospects, not warm contacts.",
    body: `
# Cold outreach sequences

## The bar

Cold email works when it demonstrates the sender knows something specific about the recipient. It
fails when it is a template with a merge field. Everyone can tell the difference in one line.

If there is nothing specific to say about a prospect, they do not belong on the list. A shorter
researched list beats a long generic one on every measure including total replies.

## Research, per prospect

One genuine, current, relevant thing: something they announced, hired for, published, changed.
Not "I see you're in insurance". That is a database lookup wearing the costume of research.

## The first message

- **Four sentences.** Longer does not get read.
- **Open with them**, not with you. No "my name is" - it is in the signature.
- **The specific observation**, and why it made you write.
- **One line on the relevance** of what you do. Not features.
- **A small ask.** A question, not a meeting. Meetings are a big commitment from a stranger;
  questions get answered.
- **No attachments, no links** in the first message.

## The sequence

Three to four touches over two to three weeks, each adding something rather than repeating.

- **Touch 2** - a resource or observation relevant to the first. Give something.
- **Touch 3** - a different angle. Perhaps they are not the right person; ask who is.
- **Touch 4** - the close-out. "I'll stop here - if this becomes relevant, I'm easy to find."
  This gets more replies than any of the others, and it should be genuine.

Then stop. Persistence past four is not persistence.

## Never

Fake familiarity, invented mutual connections, false urgency, or a subject line implying a prior
conversation. It works occasionally and costs the reputation permanently.

${OWNER_DECIDES}
`,
  },
  {
    slug: "case-studies",
    emoji: "🏆",
    description:
      "Problem, approach, result, quote. Use after delivering work worth showing.",
    body: `
# Case study development

## What makes one persuasive

A reader recognizing their own situation in the opening paragraph. Everything else is secondary,
which means the client's problem - not the work - is where it starts.

## Structure

1. **Who they are**, briefly. Enough for a reader to place themselves.
2. **The problem**, in their words where possible, with a cost attached. "Two days a month" or
   "losing one in three enquiries" - the number is what makes it real.
3. **What made it hard.** What they had already tried, what had failed. This is the section that
   separates a case study from an advert, and the one usually cut.
4. **What was done.** Enough to be credible, not a methodology lecture.
5. **The result**, with numbers, and honestly. Include the timeframe.
6. **Their words.** A real quote, approved.

## Getting the numbers

Ask the client for the before and after. If nothing was measured, say what changed qualitatively
rather than inventing a percentage - an invented number is the single fastest way to lose
credibility with the exact buyer this is meant to convince.

## Honesty as a technique

The version admitting something was harder than expected, or that a first approach did not work,
outperforms the flawless one. Nobody believes the flawless one, and the reader's real question is
"what happens when it goes wrong with us".

## Before publishing

Client approval in writing, on the exact text and the exact numbers. Every time, including when
the relationship is good - especially then.
`,
  },
  {
    slug: "partnership-dev",
    emoji: "🔗",
    description:
      "Qualify and structure a referral or JV. Use before agreeing a partnership.",
    body: `
# Partnership development

Most partnerships produce nothing. They are agreed enthusiastically, announced, and never
generate a single referral - because nobody decided what either side actually does.

## Qualify first

- **Do they serve the same customer at a different moment?** That is the only reliable basis. An
  accountant and a bookkeeper compete; an accountant and a commercial lawyer do not.
- **Do they have the audience they claim?** Ask about size and engagement specifically. Most
  overstate it, without meaning to.
- **What is in it for them?** A partnership that is good for one side is a favour, and favours
  expire.

## Structure it concretely

The three questions that separate real partnerships from announcements:

1. **What specifically does each side do?** "Refer each other" is not an action. "Introduce any
   client who mentions X, by email, within a week" is.
2. **What triggers a referral?** A named situation, so it is recognizable in the moment.
3. **Is anything paid?** Decide up front, in writing, including the rate and when it is owed.
   Money discussed after the first referral poisons the relationship.

## Then make it easy

Give them the words. A short description of who to send and how to introduce them - most partners
fail to refer because they cannot describe what you do, not because they do not want to.

## Review it

At ninety days: what actually happened? A partnership producing nothing after ninety days is
usually structurally wrong rather than short of time. Fix the structure or end it - quietly and
without rancour, since the relationship is usually worth more than the arrangement.

${OWNER_DECIDES}
`,
  },
];
