// Mental models: seventeen ways to look at a decision.
//
// Two tiers, matching the product catalogue. Tier 1 is named thinkers — each one a coherent
// worldview with a characteristic question it asks first. Tier 2 is named frameworks, which are
// procedures rather than worldviews.
//
// WHAT MAKES THESE WORTH SHIPPING. Every one is pure method: no integration, no schedule, no
// customer data. They are also the part no stock runtime provides — a box full of tool skills
// can do things, and none of them will ask whether the thing is worth doing.
//
// A RULE FOR WRITING THEM. Each is the model APPLIED, not the model DESCRIBED. Nobody needs an
// encyclopedia entry on Buffett from their assistant; they need the four questions he would ask
// about the decision in front of them. Where a model has a famous failure mode, it says so — a
// model used everywhere is a model used badly.

import type { AgentSkill } from "@/config/skills";

export const MENTAL_MODEL_SKILLS: AgentSkill[] = [
  // ─── Tier 1: named thinkers ────────────────────────────────────────────────────────────────
  {
    slug: "buffett-model",
    emoji: "🎩",
    description:
      "Circle of competence, margin of safety, inversion. Use for hard-to-undo commitments.",
    body: `
# Think like Warren Buffett

Four questions, in this order. The first one disqualifies most opportunities before the others
are needed.

## 1. Circle of competence

Is this inside what you actually understand? Not "could I learn it" - do you understand it now,
well enough to know what would go wrong?

The circle's size does not matter. Knowing where its edge is does. Outside it, the honest answer
is "I don't know", and "I don't know" is a complete answer.

## 2. Margin of safety

If your estimate is wrong by half, does this still work? Good decisions survive being wrong about
the details. Anything that only works if the plan lands exactly is a bet, not an investment -
which is fine, as long as it is called one.

## 3. Inversion

Instead of "how do I succeed at this", ask "how would I guarantee failure?" - then avoid those
things. Avoiding stupidity is more reliable than seeking brilliance, and considerably easier.

## 4. The ten-year test

Would you be happy owning this - the client, the commitment, the position - if you could not
change it for ten years? If the answer depends on being able to exit quickly, that assumption
deserves scrutiny, because exits are hardest exactly when they are most wanted.

## The characteristic move

Say no easily and often. Most opportunities are outside the circle, and the cost of passing on a
good one is far smaller than the cost of taking a bad one you did not understand.
`,
  },
  {
    slug: "musk-model",
    emoji: "🚀",
    description:
      "First principles and 10x framing. Use when the conventional answer looks expensive.",
    body: `
# Think like Elon Musk

## First principles

Take the problem apart to things that are physically or economically true, then rebuild from
there. The question is never "what does this cost?" - it is "what does it cost to make, from its
components, and why is the gap what it is?"

Most costs are conventional rather than necessary. Somebody decided it once, everyone copied
them, and the price is now treated as a law of nature.

Applied to a business: "agencies charge 15% of spend" is a convention. "This engagement takes 40
hours of skilled work" is closer to a fact. Price from the second.

## 10x, not 10%

A 10% improvement comes from optimising what exists. A 10x improvement usually requires deciding
that the current approach is wrong. Ask for the 10x version first - it reframes the problem even
when you end up shipping the 10%.

## The assumption audit

For any established practice: **who decided this, when, and does the reason still hold?** A
surprising amount of business process is a fossil of a constraint that disappeared years ago.

## The failure mode, stated honestly

First-principles reasoning applied to things you do not understand produces confident nonsense.
Conventions often encode hard-won knowledge, and "everyone does it this way" sometimes means
"everyone who did it the other way is no longer trading". Question the convention; find out why
it exists before overriding it.
`,
  },
  {
    slug: "bezos-model",
    emoji: "📦",
    description:
      "Working backwards, one-way vs two-way doors. Use for launches and stalled decisions.",
    body: `
# Think like Jeff Bezos

## Working backwards

Start at the end. Write the announcement - what changed, for whom, and why they care - before any
work begins. If that is hard to write, the idea is not ready, and no amount of building will fix
what the description could not.

Then work back from that to the first move.

## Type 1 and Type 2 decisions

**Type 1 is a one-way door.** Hard or impossible to reverse. Deserves deliberation, dissent, and
time.

**Type 2 is a two-way door.** Walk through, look around, walk back if wrong. Should be made
quickly, by whoever is closest to it.

The common failure is applying Type 1 process to Type 2 decisions - committees and analysis for
something that could have been tried in a week. Most decisions are Type 2 and are treated as
Type 1. Ask which this is, first, because it determines how much process it earns.

## Regret minimisation

Project forward to eighty years old, looking back. Which choice do you regret not making? This
strips out short-term embarrassment and the fear of looking foolish, which are usually the real
obstacles rather than the stated ones.

## Day 1

Day 2 is stasis dressed up as maturity: process for its own sake, decisions made by proxy,
customers discussed rather than listened to. Ask which day the business is operating on, and name
the specific behavior that shows it.
`,
  },
  {
    slug: "jobs-model",
    emoji: "🍎",
    description:
      "Ruthless simplicity and the power of no. Use when something has grown complicated.",
    body: `
# Think like Steve Jobs

## Simplicity is the hard version

Simple is not what is left when you run out of time. It is what is left when you understand the
problem well enough to remove everything that was not load-bearing. That is more work than
adding, not less.

For anything under review: **what can be removed without loss?** Then ask again. The second pass
is where the real cuts are.

## The power of no

Focus is not deciding what to do - that part is easy and pleasant. It is deciding what not to do,
including good ideas. Especially good ideas, because bad ones decline themselves.

For any list of initiatives: which three matter? What happens to the rest? "Later" is usually a
polite no that costs attention anyway. Say the real no.

## Start with the experience

Not with what is buildable, or what the competition ships. Start with what it should feel like to
the person on the other end, then work back to what that requires. Most products are assembled
outward from capability and feel like it.

## Taste

Some decisions are not analysable and are made on judgement about what is good. Say so plainly
rather than reverse-engineering a business case for an aesthetic call. "This is better and I
cannot fully justify it" is an honest position, and pretending otherwise fools nobody.

## The failure mode

This model justifies overruling people by asserting superior taste. Used by someone who does not
have it, it is just stubbornness with better branding.
`,
  },
  {
    slug: "munger-model",
    emoji: "🧠",
    description:
      "Incentives first, several models at once. Use when behavior looks irrational.",
    body: `
# Think like Charlie Munger

## Look at incentives first

**"Show me the incentive and I'll show you the outcome."** When behavior looks irrational, the
usual explanation is that it is entirely rational for someone whose incentives you have not
mapped.

For any situation involving other people: who is paid, promoted, or protected by which outcome?
Answer that before theorising about motives.

## Use several models, not one

A single framework applied to everything produces a predictable answer and a blind spot the size
of the framework. Run a decision through two or three unrelated lenses - economic, psychological,
competitive - and pay attention to where they disagree. That disagreement is information.

## The Lollapalooza effect

Big outcomes rarely have one cause. They come from several forces pointing the same way at once
and compounding. Ask: **what would have to line up for this to be much bigger than expected?** And
the same question for much worse.

## Invert

Spend real effort on how this fails, not only how it succeeds. Most people are better at avoiding
disaster than engineering triumph, and that asymmetry is worth exploiting.

## Say when you don't know

"I have nothing to add" is a complete contribution. Manufacturing an opinion to fill silence is
how bad decisions acquire false support.
`,
  },
  {
    slug: "dalio-model",
    emoji: "⚙️",
    description:
      "Principles over cases, radical honesty. Use for recurring problems and disputes.",
    body: `
# Think like Ray Dalio

## Everything is a machine

A business is a system that produces outcomes. A bad outcome is not bad luck - it is the machine
working as built. So the useful question is never "how do we fix this instance?" but **"what in
the machine produced this, and what change stops the next one?"**

## Pain plus reflection equals progress

A problem examined properly is worth more than a problem avoided. When something goes wrong, the
temptation is to move past the discomfort quickly. Sit in it long enough to extract the lesson,
write the lesson down, and it becomes a principle rather than a repeat.

## Principles over cases

Every recurring decision should eventually become a rule. "How do we handle a client who pays
late?" answered once is a fire drill; answered as a principle it is a policy, and it stops
consuming judgement.

Ask: has this decision been made before? If so, why is it being made again?

## Believability weighting

Not all opinions are equal, and pretending otherwise wastes the good ones. Weight by track record
in **this specific domain** - someone excellent at sales is not therefore worth listening to on
hiring. When people disagree, ask who has actually done this before and how it went.

## Radical honesty

Say the true thing, including when it is uncomfortable, and especially when the person is not
going to enjoy it. The alternative is a slow accumulation of unspoken problems, which is worse
for everyone and eventually surfaces anyway.
`,
  },
  {
    slug: "thiel-model",
    emoji: "♟️",
    description:
      "Contrarian question, monopoly over competition. Use for positioning and strategy.",
    body: `
# Think like Peter Thiel

## The contrarian question

**"What important truth do very few people agree with you on?"**

Applied to a business: what do you believe about your market that your competitors do not? If
there is no answer, the strategy is imitation, and imitation competes on price.

## Competition is for losers

Being in a crowded market is not validation, it is margin compression. The goal is to be the only
one doing a specific thing for a specific group - not the best of many at the same thing.

For any positioning question: **what is the smallest market this could dominate?** Start there.
Dominating something small is a real position; being fourth in something large is not.

## Zero to one

Doing a new thing (0→1) and doing more of an existing thing (1→n) are different activities that
need different people, timelines and tolerance for failure. Confusing them is how a company
applies scaling process to something that has not been invented yet.

Which is this? Answer before planning.

## Definite over indefinite

A definite plan - "we will do these five things in this order and here is why" - beats optionality
and waiting to see. Indefinite optimism is a way of avoiding the work of having a view.

## The failure mode

The contrarian frame rewards being different, and different is not the same as right. Most
consensus is consensus because it is correct. The question is not "what does everyone believe?"
but "what do they believe that the evidence does not actually support?"
`,
  },
  {
    slug: "grove-model",
    emoji: "🏭",
    description:
      "Inflection points and productive paranoia. Use when the ground is shifting.",
    body: `
# Think like Andy Grove

## Strategic inflection points

Sometimes the rules of a business change permanently - a technology, a regulation, a competitor's
new model. The signal is subtle at first and unmistakable too late.

The tell: **the things that used to work stop working, and doing more of them does not help.**
When effort stops converting to results at the old rate, that is the question to ask - not "how
do we push harder" but "has the game changed?"

## Only the paranoid survive

Complacency is the actual risk, particularly after success. What is the one development that
would most damage this business? Who would have to do what? How would you know early?

That question deserves asking on a schedule, not when the damage has begun.

## Manage output, not activity

A manager's output is the output of their team plus the teams they influence. Meetings, emails
and effort are inputs, and inputs are not achievements. For any process: what does it produce,
and would anyone notice if it stopped?

## The 50/50 test

For a decision that is genuinely balanced, the tiebreak is which way you could recover from. Grove
ran Intel out of memory chips by asking what a new management brought in from outside would do -
then doing that, rather than defending a history he happened to be attached to.

Ask: **if someone took over tomorrow with no loyalty to how we got here, what would they change?**
`,
  },

  // ─── Tier 2: named frameworks ──────────────────────────────────────────────────────────────
  {
    slug: "first-principles",
    emoji: "🔬",
    description:
      "Strip to what's true and rebuild. Use when the standard answer is inherited.",
    body: `
# First principles analysis

## The method

1. **State the problem and the conventional answer.** Both, explicitly.
2. **Ask what is actually true.** Separate physical and economic facts from convention, habit and
   assumption. "Printing costs money" is a fact. "Proposals are twelve pages" is a convention.
3. **Ask why the convention exists.** Often there was a good reason once. Find out whether it
   still applies - this step is what separates first-principles thinking from ignorance.
4. **Rebuild from the facts.** Given only what is true, what would you design? Ignore the
   existing answer entirely at this stage.
5. **Compare.** Where the rebuild differs from the convention, you have either found something or
   missed something. Investigate which.

## Where it pays

Pricing, process, and anything described as "how it's done". Those three are where inherited
answers survive longest without examination.

## Where it costs

Areas where you lack domain knowledge. Reasoning from first principles requires knowing what the
principles are; without that it produces confident answers built on missing facts. If step 3
cannot be answered, stop and go and learn rather than proceeding.
`,
  },
  {
    slug: "pareto-audit",
    emoji: "📊",
    description:
      "Find the 20% driving 80%, and what to do about the rest. Use on clients and time.",
    body: `
# 80/20 audit

## Run it

1. **Pick the population.** Clients, services, marketing channels, hours in a week, sources of
   revenue. One at a time.
2. **Rank by contribution.** Revenue, profit, referrals, satisfaction - say which measure and why.
   Profit and revenue often rank very differently, and profit is usually the honest one.
3. **Find the break.** Where does the top slice account for most of the total? Rarely exactly
   80/20; sometimes 90/10, sometimes 60/30. The exact ratio does not matter.
4. **Look at both ends.** The top is where to invest more. The bottom is the harder question:
   what is it costing, in attention as well as money?

## The uncomfortable part

The bottom of a client list is usually consuming disproportionate time. This is where the audit
gets avoided, because the answer is often to raise prices on them or let them go, and both feel
like losing.

Name the specific cost - hours, stress, opportunity - rather than leaving it abstract.

## What to deliver

The ranking, the break point, one concrete action for the top and one for the bottom. An audit
that ends in a chart has not finished.

## Caveat

Small revenue is not always small value. A tiny client who refers constantly, or an unprofitable
project that opened a market, ranks badly on the obvious measure. Check before cutting.
`,
  },
  {
    slug: "zero-based",
    emoji: "🔄",
    description:
      "Would you start this today? Use on anything continuing out of inertia.",
    body: `
# Zero-based thinking

## The question

**"Knowing what I know now, would I start this today?"**

If no, the follow-up is: what would it take to end it, and what is the cost of not ending it?

## What it applies to

Anything that costs time, money or attention and is continuing because it already exists rather
than because it is being chosen: clients, subscriptions, meetings, service lines, roles,
partnerships, whole strategies.

## Why it works

It defeats the sunk cost fallacy by removing the past from the question. What has already been
spent cannot be recovered by continuing, and the only thing that matters is whether the next
period of investment is worth its return.

## Running it

For each item: would you start it today? If not, sort into:

- **End it** - the cost of continuing exceeds the cost of stopping.
- **Change it** - it would be worth starting in a different shape. Rescope, reprice, renegotiate.
- **Keep it, deliberately** - there is a reason that survives the question. Write the reason down;
  next time, that is what gets re-examined instead of the whole thing.

## The honest use

Most things fail this test on first pass and that does not mean end them all at once. The output
is a ranked list of what to change, not a bonfire.
`,
  },
  {
    slug: "think-in-bets",
    emoji: "🎲",
    description:
      "Odds, payout, decision vs outcome quality. Use for uncertain calls and reviews.",
    body: `
# Think in bets

## The frame

Every decision under uncertainty is a bet. Making that explicit forces the two things people
usually skip: the probability, and the size of the loss.

For any decision:

- **What am I betting on?** The specific thing that has to be true.
- **What are the odds?** A number, even a rough one. "Likely" hides a range from 55% to 95%, and
  those are different decisions.
- **What is the payout, and the loss?** Both in real terms.
- **Can I afford the loss at that frequency?** A 90% bet taken often enough loses eventually. Can
  the business take that when it happens?

## Separate decision quality from outcome quality

A good decision can lose. A bad decision can win. Judging by outcome - "resulting" - teaches the
wrong lesson from both.

When reviewing something that went badly: **was the process wrong, or was this the 20% landing?**
Those need opposite responses. Changing a sound process because of one bad result is how
organizations get worse by trying to learn.

## In practice

The most valuable move is stating the odds out loud beforehand, in writing. It calibrates
judgement over time, and it stops the retrospective certainty that makes every past decision look
obvious in hindsight.
`,
  },
  {
    slug: "jtbd",
    emoji: "🔧",
    description:
      "What job is this really hired to do? Use for positioning, pricing, lost deals.",
    body: `
# Jobs to be done

## The idea

People do not buy products. They hire them to make progress in a situation. The job is the
progress, and it is usually not what the product description says.

Nobody wants a drill. Nobody wants a hole either - they want a shelf up before their partner gets
home.

## The questions

1. **What situation are they in when they start looking?** The trigger, not the demographic.
2. **What progress are they trying to make?** Functional, but also social and emotional - how it
   makes them look, and how it makes them feel.
3. **What are they using instead today?** The real competition is usually a spreadsheet, an
   assistant, or doing nothing. Not the obvious competitor.
4. **What would make them fire the current solution?** And what anxiety stops them switching?

## What it changes

- **Positioning:** describe the progress, not the features.
- **Pricing:** anchored on the value of the progress, not the cost of delivery.
- **Competition:** you are competing with inertia far more often than with a named rival.
- **Lost deals:** "we went with someone else" and "we did nothing" are completely different
  losses. Ask which.

## The tell you have found it

The job is stated in the customer's words, describes a situation rather than a category, and
makes at least one current business decision look wrong.
`,
  },
  {
    slug: "working-backwards",
    emoji: "⏪",
    description:
      "Start from the finished outcome, work back. Use for launches and new offerings.",
    body: `
# Working backwards

## The method

Write the end first. Then work back to today, and the first step falls out of it.

## Step 1: write the announcement

As if it already shipped. One page, for the customer, in plain language:

- What is now possible that was not before
- Who it is for, and the problem it solves for them
- Why they would choose it over what they do today
- The quote you would want from a customer who used it

Written before any building. If it is hard to write, the idea is not ready - and that is a cheap
discovery at this stage rather than an expensive one later.

## Step 2: list the questions

What would a sceptical customer ask? What would go wrong? Answer them now, on paper. Anything
unanswerable is a real risk, not a detail to sort out during delivery.

## Step 3: work back

From the finished state, what had to be true immediately before? And before that? Keep going
until you reach something doable this week. That is the first move.

## Why it beats planning forwards

Forwards planning starts from capability - what can we build with what we have - and arrives
somewhere adjacent to what was needed. Backwards planning starts from the outcome and finds out
early that the plan does not reach it.

## The discipline

If the announcement has to be watered down to stay true, that is the project changing shape.
Notice it and decide, rather than quietly editing the page.
`,
  },
  {
    slug: "blue-ocean",
    emoji: "🌊",
    description:
      "Map where everyone competes, find what's uncontested. Use for differentiation.",
    body: `
# Blue ocean analysis

## The premise

Most businesses compete in a red ocean: same customers, same factors, differentiated by price and
volume. A blue ocean is demand nobody is fighting over - created by competing on different things
rather than winning on the same ones.

## The map

1. **List the factors everyone competes on** in this market. Price, speed, service, features,
   whatever the category takes for granted.
2. **Score the main players on each**, honestly. Including you.
3. **Look at the shape.** In most markets everyone's line is nearly identical, which is itself
   the finding: the category has converged and price is the only remaining lever.

## The four actions

- **Eliminate** - which factors the industry competes on could be removed entirely? Usually one
  is legacy nobody has questioned.
- **Reduce** - what is over-served? Effort spent beyond what customers value.
- **Raise** - what should be well above the standard?
- **Create** - what does nobody in the category offer at all?

Eliminate and Reduce are what fund the other two. A strategy that only adds is a cost increase
wearing a strategy costume.

## The test

A real blue ocean position makes some customers a bad fit - plainly and deliberately. If the new
positioning appeals to everyone the old one did, plus more, it is not repositioning, it is
marketing copy.
`,
  },
  {
    slug: "mckinsey-pyramid",
    emoji: "🔺",
    description:
      "Conclusion first, then reasons, then evidence. Use for proposals and updates.",
    body: `
# The McKinsey pyramid

## The structure

**Conclusion first.** Then the reasons it holds. Then the evidence under each reason.

Most writing is built the other way - context, then analysis, then finally the point - because
that is the order it was discovered in. Nobody wants to read the order of discovery. They want
the answer and the option to interrogate it.

## The shape

1. **The answer**, in one sentence. What you recommend, or what is true.
2. **Three reasons.** Rarely fewer than two, rarely more than four. Each independently supporting
   the answer.
3. **Evidence under each.** Data, examples, precedent.

## The two rules

- **Mutually exclusive.** The reasons should not overlap. Two reasons that are the same reason in
  different words weaken the argument, because a reader who dismisses one has dismissed both.
- **Collectively exhaustive.** Together they should cover the case. If someone can name an
  obvious fourth reason you have not mentioned, the structure has a hole in it.

## What it eliminates

Throat-clearing. "As we discussed", "there are many considerations", "it's complicated". Every one
of those delays the point and costs the reader's attention.

## The test

Read only the first sentence of each section. Does the argument still stand up? If so, the
structure works. If the point only appears at the end, it is not a pyramid - it is a story with
a twist, and business readers do not want twists.
`,
  },
  {
    slug: "five-whys",
    emoji: "❓",
    description:
      "Drill from symptom to root cause. Use for failures and recurring problems.",
    body: `
# The five whys

## The method

State the problem. Ask why it happened. Ask why that happened. Five times, or until the answers
stop being about a person and start being about a system.

## Worked example

*The proposal went out two days late.*

1. **Why?** It was still waiting on pricing. →
2. **Why?** The pricing needed sign-off and the approver was travelling. →
3. **Why?** All pricing needs one person's approval. →
4. **Why?** There is no documented pricing rule, so every quote is a judgement call. →
5. **Why?** Pricing has never been written down - it lives in one person's head.

The fix at level 1 is "chase harder". The fix at level 5 is a written pricing policy, which stops
every future instance. Same problem, entirely different intervention.

## The rules

- **Follow one chain.** Multiple causes are common; do them one at a time or you get a mess.
- **Stop when you reach a system, not a person.** "Because Dave forgot" is not a root cause -
  the next why is "why does this depend on Dave remembering?"
- **Five is a guide.** Sometimes three, sometimes seven. Stop when the answer is something you
  can actually change.

## When to use it

Anything that has recurred. A one-off is often just an accident; the second occurrence is a
system telling you something.

## The failure mode

Used carelessly, it becomes a way to assign blame with extra steps. If the chain ends at a
person's failing, it has not gone far enough.
`,
  },
];
