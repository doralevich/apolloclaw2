// How to think before answering.
//
// These are the skills that make an agent feel like a colleague rather than a fast search. None
// of them needs an integration, a schedule or a single byte of customer data — they are pure
// method, which is exactly what a SKILL.md is good at carrying.
//
// A NOTE ON "AUTO". Three of these are marked AUTO in the product catalogue, meaning they should
// apply to every recommendation without being asked. A skill cannot guarantee that: the runtime
// picks a skill when it judges it relevant, so "always" is a matter of persuasion, not mechanism.
// The descriptions below are written to be reached for at the right moment, and the genuinely
// non-negotiable version of this belongs in SOUL.md / AGENTS.md where it is read every session.

import type { AgentSkill } from "@/config/skills";

export const REASONING_SKILLS: AgentSkill[] = [
  {
    slug: "devils-advocate",
    emoji: "😈",
    description:
      "Argue against a recommendation before giving it. Use before any strategic advice.",
    body: `
# Devil's advocate

Before delivering a recommendation, argue against it properly. Not a token caveat at the end —
a real attempt to knock it down.

## The four questions

1. **What has to be true for this to work?** List the assumptions the recommendation rests on.
   Mark each one: verified, plausible, or hoped for. Anything in the third column is the risk.
2. **Who disagrees, and why are they not stupid?** State the strongest opposing case as its
   holder would state it. If you cannot make it sound reasonable, you do not understand it yet.
3. **What would change my mind?** Name the specific evidence that would flip the answer. If
   nothing would, the recommendation is a belief rather than a conclusion.
4. **What is the cost of being wrong?** Reversible and cheap is a different decision from
   permanent and expensive, even at identical odds.

## What to deliver

The recommendation, then the strongest objection to it, then why the recommendation survives
anyway — or does not. If the objection wins, say so and change the answer.

## When it matters most

When the owner already sounds convinced. Agreement is the least useful thing you can offer
someone about to commit; they have that already. The value is in the thing they have not thought
of, and a decision that survives an honest attack is worth far more than one that was never
tested.

## What this is not

Not contrarianism, and not hedging. Do not manufacture doubt to look rigorous, and do not
retreat into "it depends". Reach a position.
`,
  },
  {
    slug: "pre-mortem",
    emoji: "⚰️",
    description:
      "Assume it failed, work back to why. Use before launches and hard-to-reverse calls.",
    body: `
# Pre-mortem

Imagine it is six months from now and this failed badly. Not "it underperformed" — it failed,
visibly, and everyone knows. Write the story of how.

The trick is the tense. "What might go wrong?" produces a polite list of risks nobody acts on.
"It went wrong — why?" produces specifics, because the mind explains far better than it predicts.

## How to run it

1. **State the failure out loud.** One sentence, in past tense, concrete. "The launch shipped
   three months late and the two anchor customers walked."
2. **List the causes.** At least six. Push past the obvious two — the useful ones are third
   through sixth, after the easy answers are spent.
3. **Sort them.** Which were foreseeable? Which were inside our control? The intersection of
   those two is the whole point of the exercise.
4. **Name the earliest warning sign for each.** Not the failure itself — the thing visible weeks
   before it, while there is still room to act.
5. **Decide what changes today.** A pre-mortem that ends in awareness has failed. It should end
   in an altered plan, a tripwire, or an explicit accepted risk.

## Tone

Blunt. This is the one place where imagining the worst is the job, and softening it defeats the
purpose. Say "the client fires us" rather than "the relationship becomes challenging".
`,
  },
  {
    slug: "second-order-thinking",
    emoji: "🌊",
    description:
      "Trace what happens next, and after that. Use on decisions with knock-on effects.",
    body: `
# Second-order thinking

Most decisions are judged on the first consequence. The ones that hurt do their damage at the
second and third.

## The chain

For any proposed action, walk it forward:

- **First order:** the intended, obvious result. Usually why it is being considered.
- **Second order:** what that result causes. How do other people respond to it?
- **Third order:** what those responses compound into over months.

Stop when the chain stops being specific. Two honest links beat five speculative ones.

## The question that does the work

**"And then what?"** Ask it three times of any answer. Most reasoning stops after the first
because the first is where the appeal lives.

Cut the price to win the deal → *and then?* → the client anchors on the discount → *and then?* →
the renewal is a fight and the margin never comes back, and other clients hear the number.

## What to watch for

- **Incentives.** Any change alters what people are rewarded for. That is where second-order
  effects usually originate.
- **Precedent.** "Just this once" is a first-order framing of something that will be cited later.
- **Asymmetry.** Some second-order effects are permanent while the first-order gain was
  temporary. Those are the ones to refuse.

## What to deliver

The recommendation, plus the one downstream consequence most likely to be missed. Not a
catalogue — the single one worth changing the plan for.
`,
  },
  {
    slug: "strategic-business",
    emoji: "🎯",
    description:
      "Owner-mode: pursue, decline, or focus where. Use for direction, not execution.",
    body: `
# Strategic business thinking

The shift from operator mode ("how do we do this well?") to owner mode ("should we be doing this
at all?"). Reach for it when the question is about direction rather than execution.

## The frame

1. **What is the actual decision?** Most stated questions are downstream of a bigger one.
   "Should we hire a second designer" is often really "are we a design firm or a strategy firm".
   Name the real one before answering the asked one.
2. **What does this cost that is not money?** Focus, optionality, positioning, and the other
   thing that does not get done. These are the expensive currencies for a small business, and
   the ones nobody budgets.
3. **What does it look like if it works?** Concretely, in numbers, at a named date. A yes you
   cannot describe the success of is a maybe.
4. **What is the reversal cost?** Cheap to undo means decide fast and move. Expensive to undo
   deserves the extra week.
5. **What are we saying no to by saying yes?** Always something. Name it.

## The bias to correct for

Small businesses die of too many yeses far more often than too few. When the answer is genuinely
close, the tiebreak is usually no — the compounding cost of a divided focus exceeds the value of
a marginal opportunity.

## What to deliver

A position, not a menu. "I would do X, because Y, and the thing that would change my mind is Z."
The owner can overrule a recommendation. They cannot act on a list of considerations.
`,
  },
  {
    slug: "board-of-advisors",
    emoji: "🪑",
    description:
      "Review a decision as investor, operator, skeptic and customer. Use before big bets.",
    body: `
# Board of advisors

Put the decision in front of four people who would each see it differently, and report what each
one says. The value is in the disagreement between them.

## The four chairs

**The investor** — asks about return, risk and opportunity cost. Where does the money go, what
comes back, when, and what else could that capital or attention have done? Unsentimental about
sunk cost.

**The operator** — asks whether it can actually be delivered. Who does the work, what breaks
under load, what happens when the person doing it is on holiday? Has watched good strategy die of
staffing.

**The skeptic** — attacks the reasoning. Which claims are evidence and which are assertion? What
is the failure case nobody wants to talk about? What is being decided emotionally and justified
afterwards?

**The customer** — asks what changes for them. Do they want this, or do we want them to want it?
What does it cost them in money, effort or habit? Would they notice if it never shipped?

## How to run it

Give each chair a short, distinct answer in their own register — the operator should sound
practical, the skeptic sharp. Then the important part: **name where they disagree**, and say
which disagreement matters most.

## Close it out

End with your own read, informed by all four. A board advises; someone still decides. Leaving the
owner with four opinions and no synthesis has moved the problem, not solved it.
`,
  },
  {
    slug: "research-confidence",
    emoji: "🔎",
    description:
      "Research from several angles with confidence ratings. Use when claims need checking.",
    body: `
# Research with confidence

The goal is not an answer. It is an answer plus an honest statement of how much weight it will
bear.

## Method

1. **State the question precisely.** Vague questions produce confident nonsense. "Is this market
   growing?" becomes "is UK commercial cleaning revenue growing, 2023 to 2026, and by how much?"
2. **Look from three angles, not three sources that copy each other.** Primary data, industry
   or trade coverage, and a party with an interest in the opposite conclusion. Ten articles
   citing the same press release is one source.
3. **Separate fact from inference.** What is measured, versus what someone concluded from it.
   Both are useful; conflating them is how a forecast becomes a fact.
4. **Note the date on everything.** A 2019 number in a market that moved in 2024 is worse than
   no number, because it carries false authority.

## The confidence rating

Every substantive claim gets one:

- **High** — multiple independent sources, recent, primary where possible.
- **Medium** — credible but thin, dated, or all tracing to one origin.
- **Low** — plausible, uncorroborated, inferred. Say so plainly.

## The rule that matters

**Never round a Low up.** The purpose of this skill is that the owner can act on High and
investigate Medium and discount Low. A uniformly confident answer is worth less than a mixed one,
because they cannot tell which parts to trust.

If the honest answer is "this cannot be established from public sources", that IS the finding.
Deliver it and say what would settle it.
`,
  },
];
