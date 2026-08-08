// C-suite functions: the work a CEO, CFO or COO does that nobody else in a small business does.
//
// The category the product is named for. A business with eight people has all three jobs and
// nobody holding them — the founder does the CEO thinking at 11pm, the CFO thinking never, and
// the COO thinking only after something breaks.
//
// Like the mental models, these need no integration and no schedule. Unlike them, they produce a
// DELIVERABLE — a forecast, an audit, a board update — so each says what the finished thing looks
// like and how long it should be. A strategic skill that returns three paragraphs of
// consideration has not done the job.
//
// The recurring instruction across all sixteen: reach a position. These are decisions someone has
// to make, and "it depends" is what they already had before they asked.

import type { AgentSkill } from "@/config/skills";

const NOT_ADVICE = `
## What this is and isn't

Structured thinking with the owner's own numbers and context, not professional advice. Where a
decision has legal or tax consequences, say which specialist should see it before it is acted on
- and still give the analysis, because "ask an accountant" alone is not worth asking for.
`.trim();

export const EXECUTIVE_SKILLS: AgentSkill[] = [
  // ─── CEO ───────────────────────────────────────────────────────────────────────────────────
  {
    slug: "vision-mission",
    emoji: "🧭",
    description:
      "Mission, vision and values that can settle an argument. Use when positioning is vague.",
    body: `
# Vision and mission

Most mission statements are decorative. The test of a real one is whether it can settle an
argument - if it cannot be used to decline an opportunity, it is wall art.

## What to produce

**Mission** — what the business does, for whom, and why that matters. One sentence, present
tense, no adjectives that could apply to a competitor.

**Vision** — what is true in three to five years if this works. Specific enough to be wrong.

**Values** — three to five, each with the behaviour it implies and, crucially, **the cost of
holding it**. A value with no cost is a preference. "We answer within the hour" costs evenings;
"we do great work" costs nothing and means nothing.

## How to get there

1. Start from what the business actually does today and does well - evidence, not aspiration.
2. Ask what they turn down, and why. Refusals reveal values that stated principles hide.
3. Ask who they are NOT for. A mission that excludes nobody guides nothing.
4. Draft, then test each line: could a competitor put their name on this? If yes, cut it.

## The test before delivering

Take a real decision the business faced recently and check whether these would have settled it.
If not, they are not finished.
`,
  },
  {
    slug: "strategic-planning",
    emoji: "🗺️",
    description:
      "Objectives and key results for the period. Use for annual and quarterly planning.",
    body: `
# Strategic planning and OKRs

## The shape

**Three objectives, maximum.** Each with two to four key results. An objective is a direction; a
key result is a number with a date. "Improve client retention" is an objective; "renew 9 of the
11 contracts expiring by 31 March" is a key result.

More than three objectives is not ambition, it is an absence of decision.

## Before writing any of it

- **What actually happened last period?** Against what was planned. Start here or the new plan
  inherits the last one's fiction.
- **What is the constraint?** Cash, capacity, demand, or founder attention. One of them is
  binding, and a plan that ignores which is the binding one will not survive the quarter.

## The rules for key results

- A number and a date, or it is not one.
- Outcomes, not activity. "Publish 12 posts" is activity; "30 qualified inbound leads" is an
  outcome. Activity is easy to hit and easy to hit uselessly.
- Owned by a person, by name.
- Between "certain" and "impossible" - if they are all comfortably achievable, the plan is a
  forecast.

## The part usually skipped

**What is explicitly not being done this period.** Written down, alongside the objectives. Every
quarter has a list of good ideas that quietly consumed capacity; naming them in advance is what
makes the three real.

## Deliverable

One page. Three objectives, their key results, owners, the binding constraint, and the not-doing
list.
`,
  },
  {
    slug: "gtm-planning",
    emoji: "🎬",
    description:
      "Positioning, pricing, sequence and sales motion. Use for launches and new markets.",
    body: `
# Go-to-market planning

## 1. Who exactly

Not a segment - a describable buyer. What situation are they in when this becomes urgent? If the
answer covers most businesses, it is not narrow enough to sell to yet.

## 2. What it replaces

Everything is bought instead of something, including instead of nothing. Name the incumbent -
a spreadsheet, an agency, an employee, doing without - and what it costs them today. The pitch
is the difference, not the features.

## 3. The one sentence

"For [buyer] who [situation], this is [what] that [outcome], unlike [incumbent]."

If that sentence is hard to write, the offer is not ready and no launch plan will save it.

## 4. Price

Anchored to the value of the outcome, not the cost of delivery. Decide the packaging before the
number: what is included, what is extra, what is the smallest thing someone can buy to find out
whether it works.

## 5. The motion

How does it actually get sold? Outbound, referral, inbound, partnership. Pick ONE to start -
a launch running four channels badly learns nothing from any of them.

## 6. Sequence

What has to be true before launch: the offer, the proof, the mechanics of buying it, and someone
able to deliver it. Order them, and identify what can be tested before it is all built.

## 7. What would tell us this is working

A number, at a date, that would justify doubling down - and one that would mean stopping. Decide
both now, while it is still cheap to be honest.
`,
  },
  {
    slug: "board-comms",
    emoji: "📄",
    description:
      "Board decks and investor updates. Use for any update to people with money in it.",
    body: `
# Board and investor communications

## The principle

The people reading this cannot see the business day to day. They can only see what is written,
so the update is not a performance - it is the instrument they use to help.

**Bad news early and plainly.** An investor who finds out late helps less and trusts less, and
the cost compounds. The reflex to soften is the thing to resist.

## The structure

1. **The headline.** One paragraph: how the period went, and the one thing that matters most.
2. **The numbers.** Revenue, cash, runway, and the two or three metrics this business actually
   turns on. Against plan and against last period, both.
3. **What went well.** Specific and attributable. Not a list of activity.
4. **What did not.** Same specificity. Include what is being done about it and by when.
5. **Decisions ahead.** What is being weighed, and what input would help.
6. **Asks.** Intros, hires, advice. Concrete enough to action - most readers want to help and
   cannot work out how.

## Length and tone

Two pages. Written so someone who has not thought about this business in ninety days can follow
it without a call.

No hype and no hedging. Both read as uncertainty to anyone who has seen a few of these.

## What to check before it goes

Would the writer be comfortable if this were read back to them in twelve months next to what
actually happened? If not, the number that would embarrass them is the one to state plainly now.
`,
  },
  {
    slug: "ma-evaluation",
    emoji: "🤝",
    description:
      "Strategic, financial and operational fit. Use before serious acquisition talks.",
    body: `
# M&A and partnership evaluation

## Start with why

What does this buy that cannot be built or hired? If the honest answer is "speed", say so - that
can be worth a great deal, but it prices differently from capability that cannot be acquired
another way.

## Three separate assessments

**Strategic fit.** Does this move the business toward what it is trying to become, or sideways
into something adjacent that will need its own attention? Adjacent is where most small-company
acquisitions quietly go wrong.

**Financial fit.** What is being paid, in what form, against what return, over what period? Model
the case where it delivers half of what is projected - most do - and see whether it is still
sensible.

**Operational fit.** Who integrates this, on top of what they already do? Integration is where
value is destroyed, and it is always done by people who already had full weeks.

## The questions that get skipped

- **What are we buying that we cannot see?** Liabilities, key-person risk, a customer
  concentration nobody mentioned, a culture that will not merge.
- **What happens to their people?** Especially the ones the value depends on. If the value walks
  in ninety days, it was not an acquisition.
- **What is the exit if this does not work?** Almost nobody asks before signing.

## Deliverable

A recommendation - proceed, proceed with conditions, or decline - with the two or three things
that would change it, and what to verify in diligence.

${NOT_ADVICE}
`,
  },

  // ─── CFO ───────────────────────────────────────────────────────────────────────────────────
  {
    slug: "budget-forecasting",
    emoji: "📈",
    description:
      "Revenue and expense forecast, plus variance. Use for budgets and re-forecasts.",
    body: `
# Budget forecasting

## Build it from drivers, not from last year plus ten percent

Revenue is a small number of things multiplied together: clients × average value × retention, or
leads × conversion × price. Model those, because those are the things that can be influenced. A
top-line growth percentage is a wish with a decimal point.

## Three cases, always

**Base** — what happens if things continue roughly as they are.
**Downside** — a major client leaves, or the pipeline halves. Not a catastrophe; a bad quarter.
**Upside** — the thing that is being worked on lands.

The downside is the one that matters. It is what determines whether the plan is survivable, and
it is the one people skip.

## Expenses

Split fixed from variable, because they behave completely differently when revenue moves. Then
find the ones that scale with headcount and the ones that scale with revenue - those are the two
that surprise people.

Include the things budgets always omit: tax set-aside, tooling creep, the annual renewals nobody
remembers until they hit.

## Variance, monthly

Forecast against actual, by line. The point is not accuracy - every forecast is wrong. The point
is finding out WHICH assumption was wrong and by how much, because that is the thing that makes
the next forecast better.

A variance nobody explains is a forecast nobody will trust in six months.

${NOT_ADVICE}
`,
  },
  {
    slug: "pl-analysis",
    emoji: "🧾",
    description:
      "What the P&L actually means: margin, cost drivers, trends. Use monthly.",
    body: `
# P&L analysis

Descriptive analysis is worthless. "Revenue was £180k and costs were £140k" is the document, read
aloud. The job is what to do about it.

## Read it in this order

1. **Gross margin, and its direction.** The single most informative number. Revenue growing while
   gross margin falls means the business is buying growth, and it is worth knowing whether that
   is deliberate.
2. **The biggest three cost lines**, as a percentage of revenue, over time. Absolute numbers hide
   the trend; percentages show it.
3. **What moved most versus last period**, and why. Every material move has a cause and it is
   usually knowable.
4. **What is growing faster than revenue.** That is next year's problem, visible now.

## The questions to answer

- Is this business more or less profitable per unit of work than it was six months ago?
- Which costs are investments and which are drift? Both look identical on a P&L, and only one
  should survive a bad quarter.
- If revenue fell 20% tomorrow, what could actually be cut, and how fast?

## Deliverable

Three findings and one recommendation. Each finding with the number that supports it. If the
answer is that the business is healthy and nothing needs doing, say that - it is a real finding
and it is rarer than people think.

${NOT_ADVICE}
`,
  },
  {
    slug: "cash-flow",
    emoji: "💧",
    description:
      "Rolling 13-week cash model with gap dates. Use when cash is tight or growth fast.",
    body: `
# Cash flow modelling

Profitable businesses fail on cash. Thirteen weeks is the standard horizon because it is long
enough to see a problem and short enough to be worth trusting.

## What goes in

**Money in**, by week, by source, with a probability attached. Invoiced-and-due is not the same
as expected-to-arrive - apply what is actually known about each payer, not the terms on the
invoice.

**Money out**, by week: payroll, tax, rent, subscriptions, suppliers. Payroll and tax are the two
that cannot slip, so they anchor everything else.

**The opening balance**, accurate to the day.

## What it produces

The weekly closing balance, thirteen weeks out. The lowest point in that line is the number that
matters, and the week it occurs is the deadline for doing something about it.

## What to flag

- **Any week below the operating floor** - the minimum needed to trade comfortably. Not zero;
  zero is already a crisis.
- **Concentration.** If one client's payment is the difference between fine and not fine, that
  is the finding, whatever the total says.
- **The gap between profit and cash.** When they diverge sharply, the cause is usually receivables
  stretching or stock building - both fixable, and both invisible on a P&L.

## Tone

Direct about timing. "Week 6 is tight" is not useful. "You are £14k short in the week of 12
October unless the Henderson invoice lands" is something someone can act on.

${NOT_ADVICE}
`,
  },
  {
    slug: "scenario-planning",
    emoji: "🔀",
    description:
      "Model a big decision three ways. Use before hiring, pricing or expanding.",
    body: `
# Scenario planning

## The method

For any significant decision, model three futures and be specific about each:

- **It works** - the case being hoped for. What has to be true for it?
- **It half works** - the most likely case, and the one nobody plans. Usually the right basis for
  the decision.
- **It does not** - what it costs, how quickly that is known, and what can be recovered.

## What to model in each

- **Cash impact by month**, including the timing. A hire costs money from day one and returns
  value from month four; that gap is the actual decision.
- **Capacity impact.** Who does the work, and what stops being done.
- **The point of no return.** When does this become expensive to reverse? That date is more
  important than the total cost, because before it the decision is cheap.

## The specific questions worth running this on

**A hire:** what revenue must they support to be worth it, and by when? What happens if it takes
twice as long as expected - which it usually does?

**A price change:** how much volume can be lost before it is worse than doing nothing? Usually far
more than people fear, which is itself worth knowing.

**Expansion:** what does it cost to enter, and what is the cost of the founder's attention moving
there from what already works?

## The output

A recommendation with the number that drives it, the date the decision becomes irreversible, and
the leading indicator to watch in the meantime.

${NOT_ADVICE}
`,
  },
  {
    slug: "unit-economics",
    emoji: "🧮",
    description:
      "CAC, LTV, payback, margin by line. Use to find what actually makes money.",
    body: `
# Unit economics

Most small businesses know their revenue and their profit and nothing in between. The middle is
where the decisions are.

## The four numbers

**CAC** — everything spent to acquire a customer, divided by customers acquired. Include the
founder's selling time at a real rate. Excluding it is the most common way this gets flattered.

**LTV** — gross margin per customer per period × how long they stay. Gross margin, not revenue;
revenue-based LTV is a number that makes bad businesses look good.

**Payback period** — how many months until a customer has repaid what it cost to win them. For a
small business this matters more than the LTV/CAC ratio, because it determines how fast growth
can be funded without borrowing.

**Contribution margin** — what is left from one more sale after the costs that scale with it.

## Then split it

By service line, by channel, by client size. The averages nearly always hide something
significant - one segment carrying another, or a channel that looks fine on volume and loses
money per customer.

## What good looks like

Payback under twelve months, and shorter for a business without outside funding. LTV comfortably
above CAC - three times is the usual rule of thumb, and the number matters less than whether it
is improving.

## The finding to look for

Which part of this business makes money, and which part is being subsidised by it. That sentence
is usually the entire value of the exercise, and most owners have never seen it written down.

${NOT_ADVICE}
`,
  },
  {
    slug: "vendor-contract-review",
    emoji: "📋",
    description:
      "Unfavourable terms, auto-renewals, leverage. Use before signing or renewing.",
    body: `
# Vendor contract review

## Read for these first

- **Term and auto-renewal.** How long, and what is the notice window? A 90-day notice on an
  annual contract means the decision is due nine months in, and that is the single most common
  way businesses stay in contracts they meant to leave.
- **Price escalation.** Any clause allowing increases, and whether it is capped.
- **What is actually committed.** Minimum spend, seat counts, usage floors. Committed is not the
  same as expected.
- **Exit.** What it takes to leave, what is owed on leaving, and what happens to the data.
- **Liability.** What the vendor is on the hook for when it fails. Usually far less than assumed.

## Then look for what is missing

Absent protections are harder to spot than bad ones: no SLA, no data portability, no cap on
price rises, no termination for convenience. Silence usually favours whoever wrote the document.

## Negotiation room

Most vendor terms are more flexible than they appear, particularly on: notice period, escalation
cap, exit terms, and the first-year price in exchange for a longer term. Name the two or three
worth pushing on and what to ask for.

## Deliverable

A short list of concerns ranked by what they could cost, the specific clause each refers to, and
what to ask for instead. Plus the diary date: when notice must be given to avoid auto-renewal.

${NOT_ADVICE}
`,
  },
  {
    slug: "kpi-dashboard",
    emoji: "📟",
    description:
      "Pick the five to seven metrics worth watching. Use when reporting overwhelms.",
    body: `
# KPI dashboard design

## The rule

**Five to seven metrics.** Fewer and it misses something; more and nobody looks. A dashboard
nobody opens is not a reporting problem, it is a design failure.

## Choosing them

For each candidate metric, three tests:

1. **Would a change here alter a decision?** If it moves and nothing happens differently, it is
   trivia.
2. **Can it be influenced?** Metrics nobody can move produce anxiety, not action.
3. **Is it available without heroics?** A metric requiring a monthly manual export will be
   accurate twice and then abandoned.

## The shape of a good set

- **One or two leading** - pipeline, enquiries, capacity booked. These move first and are the
  early warning.
- **Two or three current** - revenue, gross margin, cash position.
- **One or two health** - retention, satisfaction, utilisation. The ones that predict next year.

Pair leading with lagging deliberately. A dashboard of only lagging metrics reports history.

## For each, specify

The definition - precisely, because "active client" means four different things to four people -
the source system, how often it updates, and what number would trigger a conversation.

## The last question

**Who looks at this, and when?** A weekly number nobody reviews weekly should be monthly. Design
the ritual with the dashboard or it will not survive its first busy month.
`,
  },

  // ─── COO ───────────────────────────────────────────────────────────────────────────────────
  {
    slug: "ops-audit",
    emoji: "🔧",
    description:
      "Find what's redundant, fragile or missing. Use when things feel busy but slow.",
    body: `
# Operations audit

## Map before judging

Take the two or three processes that carry the most volume - client onboarding, delivery,
invoicing - and write down what actually happens, step by step, including the parts that live in
someone's head. The gap between the documented process and the real one is usually the finding.

## The four questions per process

1. **Where does it wait?** Queues, not work, are where most elapsed time goes. Look for handoffs,
   approvals, and anything waiting on one person.
2. **Where is it done twice?** The same information typed into two systems is both a cost and a
   source of divergence.
3. **What breaks when volume doubles?** Everything works at current volume - that is why it is
   current. Find what does not survive growth.
4. **What depends on one person?** Not as blame; as risk. Every business has three or four of
   these and rarely has them written down.

## Then rank

By **impact × ease**, honestly. The list should have a couple of things fixable this week, because
an audit that produces only a six-month roadmap changes nothing. Momentum matters more than
completeness here.

## What to resist

Recommending software as the first answer. Most operational problems are unclear ownership or an
undefined process, and tooling applied to those makes them faster and no clearer.

## Deliverable

What is working (say so - it stops the audit reading as an indictment), the fragile points ranked,
and three things to do first with who does them.
`,
  },
  {
    slug: "capacity-planning",
    emoji: "⚖️",
    description:
      "Team capacity against pipeline. Use when stretched or weighing a hire.",
    body: `
# Capacity planning

## Start with real hours, not headcount

A full-time person delivers far less billable or productive work than their contracted hours -
after admin, meetings, holiday and the ordinary friction of a week. Use the honest number.
Planning against contracted hours is how teams end up permanently 20% over.

## Then

1. **Current committed load.** What is already promised, and when it must be delivered.
2. **Expected load.** Pipeline weighted by likelihood, landing in the months it would land.
3. **The gap, by month.** Where demand exceeds capacity, and by how much.

## Reading the gap

- **A short spike** - a few weeks - is overtime, sequencing, or a contractor. Not a hire.
- **A sustained gap three months out** is a hire, and it needs starting now: recruiting plus
  notice plus ramp is usually three to five months, which means the decision is due well before
  the pain.
- **A gap that closes on its own** in the model is often optimism about delivery dates. Check it.

## The signals that matter more than the model

Quality slipping, deadlines moving, the same person in every critical path, nobody taking
holiday. Those say the team is over capacity regardless of what the spreadsheet says.

## Deliverable

The month-by-month gap, the recommendation (hire, contract, sequence, or decline work), and the
date by which the decision must be made for it to help.
`,
  },
  {
    slug: "qc-frameworks",
    emoji: "✅",
    description:
      "Make quality repeatable without you checking. Use before delegating work.",
    body: `
# Quality control frameworks

## The purpose

Consistency without the founder in the loop. Quality that depends on one person reviewing
everything is a ceiling on the business, not a standard.

## Define "good" concretely

Not "professional" or "high quality". Specific, checkable statements: every claim sourced, the
client's name spelled correctly throughout, deliverables named to convention, no placeholder text.

The test for a criterion: could two different people apply it and agree? If not, it is a
preference and it will not survive delegation.

## Build the checklist

Ten items or fewer. Ordered by what fails most often, because that is what gets checked when
someone is rushing.

Split it: what the person doing the work checks before submitting, and what a reviewer checks.
Different lists - self-checks catch mechanics, reviewer checks catch judgement.

## Design the review to be cheap

If review takes as long as the work, it will be skipped under pressure. Sample rather than check
everything once the failure rate is low, and check everything again whenever something changes:
a new person, a new service, a new client type.

## Close the loop

When something gets through, the question is not who missed it - it is which check was absent.
Add it. A framework that does not grow from its own failures is a document rather than a system.
`,
  },
  {
    slug: "crisis-ops",
    emoji: "🚨",
    description:
      "Work through an operational emergency. Use when something has gone badly wrong.",
    body: `
# Crisis operations

Something has gone wrong and someone is upset. The order matters more than the content.

## 1. Stop the bleeding

What is still getting worse? Deal with that before anything else, including before understanding
it fully. An ongoing failure is a different problem from a failure that has stopped, and analysis
of the first is a luxury.

## 2. Establish the facts

What actually happened, in sequence, with times. Separate what is known from what is assumed -
under pressure those blur, and acting on a blurred version is how a problem doubles.

## 3. Contain who is affected

Who is impacted, who will be, and who needs telling. **Tell them before they find out.** This is
the step most often delayed and most often decisive: the difference between a mistake and a
cover-up is entirely one of timing.

## 4. Communicate

Short, factual, and owning it. What happened, what is being done, when they will hear next. No
excuses, no explanation of internal causes - the affected party does not care why, and reasons
read as deflection whatever the intent.

**Give a next-update time and keep it**, even if the update is that there is nothing new.

## 5. Fix, then learn

Resolve first, then a proper look at cause - the five whys is the right tool once the fire is
out. Doing it while the fire burns produces blame rather than causes.

## What to hold on to

Speed over polish in the first hour. Honesty over face throughout. Almost every crisis that
became a lasting problem did so because of what was said afterwards, not what happened.
`,
  },
];
