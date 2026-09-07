// The Real Estate Agent's own skills. Nothing else gets these.
//
// The other six families are written for "a professional running a business", which a realtor is,
// and they cover the parts of the job that look like every other business: the week, the writing,
// the money, the follow-up. What they cannot cover is the part that is only this job. There is no
// generic skill that knows a CMA needs adjusting for condition before it produces a range, or
// that the highest offer is routinely not the best one, or that every word of listing copy is
// regulated advertising.
//
// WHAT MAKES THESE DIFFERENT FROM A PROMPT, and the test each one had to pass: it must be
// configured by an answer the intake already collects (lib/realEstateIntake.ts), so it works on
// day one rather than opening with an interview. Those answers land in USER.md under "Real Estate
// Deep-Dive" with humanised labels - `listing_voice` becomes **Listing Voice** - and every skill
// below names the ones it needs. A skill that would have to ask three questions before it could
// start is a skill the owner may as well have asked for in their own words.
//
// The approval line is the other constant. A realtor's work product goes to clients, to the MLS,
// and into regulated advertising, so DRAFT AND STOP is the default posture in all eight, keyed to
// the **Approval Line** answer.
//
// Brand rule: no em dashes.

import type { AgentSkill } from "@/config/skills";

// Real estate advertising is regulated and fair housing applies to every word of it, which makes
// this the one rule in the set that is not about being useful. It is repeated into the three
// skills that produce public-facing copy rather than stated once at the top of the file, because
// a skill is read on its own - the agent never sees this file, only the SKILL.md it becomes.
const FAIR_HOUSING_RULE = `
## The advertising rules

Everything here is regulated advertising, and fair housing applies to every word.

- **Describe the property, never the buyer.** "Four bedrooms and a fenced yard" is the fact.
  "Perfect for a young family" is the violation, and so are walkable-to-church, safe
  neighbourhood, great for professionals, and anything about the schools beyond naming the
  district.
- **Protected characteristics are off limits entirely**: race, colour, religion, national origin,
  sex, familial status, disability, and whatever else their state adds. Not as a preference, not
  as a welcome, not as a compliment.
- **Nothing you cannot stand behind.** No square footage, lot size, year built, tax figure or
  permit status that you did not read in a source. Say "confirm from the tax record" rather than
  producing a number that sounds right.
- **Their brokerage line goes on it**, exactly as **Compliance Rules** states it: brokerage name,
  licence number, and anything else their state or broker requires.

Read **Compliance Rules** in USER.md before drafting and follow it where it is stricter than this.
Where it is silent, this stands.
`.trim();

// The same posture, keyed to the answer that configures it. In the skills where the deliverable
// is a message to a client rather than a document for the owner, "draft, do not send" is the
// difference between a useful assistant and a liability.
const APPROVAL_RULE = `
## Before it goes anywhere

Read **Approval Line** in USER.md and treat it as a hard stop, not a preference. Draft up to it
and hand the draft over. If the answer is missing or vague, the default is that nothing with a
price in it, nothing to a client under contract, and nothing public goes out without them seeing
it first.
`.trim();

export const REAL_ESTATE_SKILLS: AgentSkill[] = [
  {
    slug: "listing-copy",
    emoji: "🏡",
    description:
      "Listing description in their voice, fair-housing clean. Use when writing or rewriting a listing.",
    body: `
# Listing copy

A listing description for the MLS and the marketing that hangs off it. The owner's voice, the
property's actual selling point, and nothing that breaks the advertising rules.

## Before you write

Read three things in USER.md: **Listing Voice** (the house style, including the words they
refuse to use), **Price Band** and **Client Profile** (who is reading it). A description written
for a first-time buyer at $300k and one written at $2M are different documents, and the tell is
usually length: the expensive one says less.

Then get the facts. Beds, baths, square footage, lot, year, and what has been done to it. If the
owner has not given you these, ask for them in one message rather than writing around the gaps.

## Find the one thing

Every property has a single reason someone will pay for it: the lot, the kitchen, the school
district, the fact that it is the only three-bedroom under $500k this month. Lead with it in the
first sentence. Everything after is support.

This is the whole job. A description that lists rooms in order is what the MLS field already
does.

## Structure

1. **One sentence on the one thing.** No "welcome to", no "nestled".
2. **Two or three sentences of specifics** that back it up. Concrete nouns and real numbers.
3. **The practical block**: recent work, systems, what conveys, parking.
4. **The close**: one line on what happens next, in their voice.

## Words to cut

Stunning, must see, charming, cozy, immaculate, one of a kind, dream home, opportunity knocks,
priced to sell, TLC, motivated seller. They are filler in every listing on the page, which means
they do not distinguish this one. Their **Listing Voice** answer usually names more; those win.

Cozy and TLC have a second problem: they are read as code, and the reader is right.

${FAIR_HOUSING_RULE}

## Deliver

The MLS description at the length the owner asks for, and if they have not said, one at around
400 characters and one long. Flag every fact you could not verify in a short list underneath, so
they can confirm before it goes live.

${APPROVAL_RULE}
`,
  },
  {
    slug: "cma-prep",
    emoji: "📊",
    description:
      "Pick comps, adjust them, land on a range with the working shown. Use for pricing a property.",
    body: `
# CMA prep

A comparative market analysis: what this property is worth, why, and how confident you are. The
output is a recommendation the owner can defend in a room, which means the working matters as
much as the number.

## Pull the comps

Read **Markets**, **Property Types** and **Price Band** in USER.md so you know what normal looks
like here. Then find sold comparables, in this order of preference:

1. Sold in the last 90 days, same neighbourhood, same property type, within 15% on size.
2. Widen to 180 days before you widen the geography. A stale comp in the right place beats a
   fresh one across a boundary that matters.
3. Under contract and active listings are context, not comps. Actives tell you the competition;
   they do not tell you what anyone paid.

Three to six good comps. Ten mediocre ones do not average into a better answer, they hide the
two that were doing the work.

## Adjust them

For each comp, say what is different and what that difference is worth, in dollars, with the
reasoning in half a sentence:

- Size, at the local price per square foot rather than a national rule of thumb.
- Condition. The biggest adjustment and the one most often skipped.
- Beds and baths, garage, lot, view, and anything the market here actually pays for.
- Date, if the market has moved since it sold. Say which direction and why you think so.

Show the adjusted price for each comp. That column is the analysis.

## Land the range

Give a range, not a number, and make the range mean something: the low end is where it sells in a
week, the high end is where it sits and you are having the price-reduction conversation in
thirty days.

Then give one recommended list price and one sentence on why, including the strategy it implies.
Pricing at the top of the range to leave negotiating room and pricing just under a round number
to catch a search filter are different decisions with different outcomes, and the owner should
know which one you picked.

## Say how confident you are

Explicitly, in a line. Six recent comps on the same street is a different answer from three
loose ones across a wide area, and presenting both with the same certainty is how a seller ends
up angry in week six. Name what would change your mind.

## What not to do

Do not invent sold prices, days on market, or square footage. If you could not find real comps,
say so and say what you would need. A confident CMA built on nothing is the single most damaging
thing in this file.
`,
  },
  {
    slug: "transaction-timeline",
    emoji: "📋",
    description:
      "Turn an accepted offer into a dated checklist with the usual failure points flagged. Use at contract.",
    body: `
# Transaction timeline

An accepted offer becomes a list of dates, and every one of them is someone else's job that
becomes the owner's problem if it slips. This turns their own process into that list.

## Use their process, not a generic one

Read **Transaction Process** in USER.md. That is how deals actually run in their market and their
brokerage, and it is the spine of the checklist. A generic offer-to-close template is wrong in
the details that matter, and the details that matter are the deadlines.

Read **Deal Breakdowns** too. That answer names where their deals go wrong, which tells you which
dates to flag rather than merely list.

## Build it

From the accepted-offer date and the contract terms, produce every deadline in order. For each:

- **The date**, calculated from the contract, in their timezone.
- **What has to happen**, in five words.
- **Whose job it is.** Owner, client, lender, title, inspector, other agent. This column is the
  reason the checklist works.
- **When to chase**, which is earlier than the deadline. A financing contingency chased on the
  day it expires is chased too late.

## Flag the risk

Mark the dates from **Deal Breakdowns** and say what the early warning looks like. If their
answer is "financing falls apart late", the flag is on the appraisal and the two weeks before it,
with a note to confirm the lender is actually ordering it.

Also flag anything that is hard to reverse: an expired contingency, the earnest money going
non-refundable, and the point after which walking away costs the client money.

## Keep it live

When something moves, reissue the affected dates rather than the whole list, and say what caused
the shift. A checklist that is regenerated from scratch every time nobody can tell what changed.

${APPROVAL_RULE}
`,
  },
  {
    slug: "offer-comparison",
    emoji: "⚖️",
    description:
      "Compare offers on net proceeds and risk, not price. Use when a seller has more than one.",
    body: `
# Offer comparison

Multiple offers on a listing. The job is to show the seller what each one is actually worth to
them, which is rarely the biggest number.

## Net, not price

Start with a net sheet per offer. Purchase price, minus commission, concessions, seller-paid
closing costs, repairs already agreed, payoff and transfer taxes. The bottom line is the
comparison; the price is an input to it.

An offer $10k higher with $12k in requested concessions is the lower offer, and this is the
single most common way a seller picks wrong.

## Then risk

Price is what they are offered. Risk is what they are likely to receive. For each offer:

- **Financing.** Cash, then conventional with a large down payment, then low-down, then FHA or
  VA on a property that may not appraise or pass. Is there a pre-approval or only a
  pre-qualification, and who is the lender?
- **Appraisal.** Gap coverage, waived, or wide open. On a competitive offer above the comps this
  is the term that decides whether the deal survives.
- **Contingencies.** Inspection, financing, appraisal, and the big one: a home sale contingency,
  which makes this offer a second deal you do not control.
- **Timeline.** Close date against the seller's actual need, and how long each contingency runs.
- **The buyer.** Anything known about how likely they are to walk.

## The recommendation

A table, then a paragraph. The table is the numbers; the paragraph is the call, with the tradeoff
named: "Offer B nets $4k less and is the one I would take, because A is FHA with no appraisal gap
on a house priced above the last comp."

Give the counter worth making on the offer you recommend. There almost always is one.

## Say what you do not know

If a pre-approval letter, a proof of funds or a contingency period is missing from what you were
given, say which offer is missing what rather than assuming the best case. The seller is about to
make a six-figure decision on this summary.

${APPROVAL_RULE}
`,
  },
  {
    slug: "listing-appointment",
    emoji: "🗝️",
    description:
      "Prep the seller pitch: pricing story, marketing plan, likely objections. Use before a listing appointment.",
    body: `
# Listing appointment

Prep for the meeting where a seller decides whether to hire them. One page they can hold, plus the
answers to the four questions that always come.

## What you need first

The address and what you can learn about the property, the CMA (run \`cma-prep\` if it has not
been), and **Markets**, **Client Profile** and **Price Band** from USER.md. If the seller came
from a specific lead source, say which, because a referral from a past client and a Zillow lead
are different conversations.

## The page

1. **What their house is worth**, as a range with the two or three comps that set it. Not the
   full CMA. The full CMA is the backup they bring in the folder.
2. **What it takes to get the top of that range**: the specific work, staging or price positioning
   this property needs. This is the part sellers remember.
3. **The marketing plan**, concrete and dated. Photography Tuesday, live Thursday, open house
   Saturday. Whatever they actually do, from **Marketing Tools**.
4. **The timeline** from listing to close in their market.

## The four questions

Prepare an answer to each, in the owner's voice, before they walk in:

- **"Can we try a higher price first?"** The real answer is what happens to a listing that sits:
  the price drop, the days-on-market stamp, the buyers who read it as something wrong with the
  house. Have the local number for how long that takes.
- **"What is your commission?"** Answer it plainly, then what it buys. Never apologise for it and
  never lead with a discount.
- **"Why you and not the agent who sold the house down the street?"** Read **What Makes You
  Different** in USER.md and use their words, with one specific piece of evidence.
- **"What if it does not sell?"** The listing period, what happens at the end of it, and the point
  at which they will recommend a change.

Add any objection their **Client Profile** makes likely.

## Tone

They are going into a living room, not a boardroom. Short sentences, real numbers, no deck
language. The page exists so they are not reading it: it is what they checked in the car.
`,
  },
  {
    slug: "open-house",
    emoji: "🚪",
    description:
      "Plan the open house and follow up every name within 24 hours. Use before and after one.",
    body: `
# Open house

Two halves, and the second is the one that makes money. Most open houses are run well and
followed up badly, which is why "nobody falls through the cracks after an open house" is the
answer so many agents give when asked what to fix first.

## Before

- **Confirm the basics**: date, hours, and that the sellers and any pets are out.
- **Signs and route.** Where they go and who puts them out.
- **What to have on hand**: the listing sheet, the disclosures that are ready, a financing
  one-pager from their lender contact, and the sign-in method.
- **Know the three questions** this specific property will get. Price, the obvious flaw, and
  whatever the neighbourhood is known for. Have the answers written down.
- **Know the competition.** The other two houses a visitor is seeing that weekend, and why this
  one is the better buy or the better value.

## During

Capture a name, a contact method, and one sentence about what they are looking for. That sentence
is the entire difference between a follow-up that works and a mass email. "Second home, wants the
yard, selling in Tacoma first" is a lead. A name and an email address is a row in a spreadsheet.

## After, within 24 hours

This is the skill. Every name gets a message the next morning at the latest, and they are not the
same message.

Sort what came through the door into three:

- **Buying now, no agent.** Highest value. A personal message referencing their sentence, and a
  specific next step: another showing, a similar listing, an introduction to a lender. Then a call.
- **Buying now, has an agent.** Short, warm, no poaching. Pass the feedback to their agent and
  leave the door open.
- **Neighbours and browsers.** Not a waste of time. A neighbour at an open house is often a seller
  in eighteen months, and they go on the farming list rather than the buyer list.

Write the drafts, grouped, in the owner's voice. Read **Followup Cadence** in USER.md for what
happens after the first message and put those touches on the calendar.

## Feedback to the seller

One message: how many came through, what they said about the price, and what they said about the
house. Sellers judge an agent by whether this arrives without being asked.

${APPROVAL_RULE}
`,
  },
  {
    slug: "lead-followup",
    emoji: "📞",
    description:
      "Turn their cadence into a real sequence, by lead source. Use for a new lead or a stalled one.",
    body: `
# Lead follow-up

Most real estate leads are lost to silence rather than to a competitor. The job is to make their
own stated cadence actually happen, per lead, and to write what goes out.

## Their cadence, not a generic one

Read **Followup Cadence**, **Lead Sources** and **CRM** in USER.md. The cadence answer is the
schedule. If it is vague ("I call a few times then give up"), turn it into specific days and say
that you have, so they can correct it once instead of every time.

## Source decides the opening

The first message is not the same for a referral and a portal lead, and treating them alike is
what makes follow-up feel like spam:

- **Referral or sphere.** Lead with the person who connected you. Warm, short, no qualifying
  questions in the first message.
- **Portal lead (Zillow and similar).** They enquired about one property and expect to hear about
  that property. Answer the actual question first. Speed matters more here than anywhere else:
  minutes, not days.
- **Open house.** Reference the sentence captured at the door.
- **Past client.** Not a lead, a relationship. Never open with business.
- **Circle prospecting or farming.** Lead with the local fact, not with yourself.

## The sequence

Each touch does one job and gets shorter:

1. **Now.** Answer their question. One ask: are they looking to buy, sell, or both, and by when.
2. **Day 2.** Something useful and specific to what they asked about. A comparable listing, a
   recent sale on that street.
3. **Day 5.** Change the channel. If the first two were email, this one is a text or a call.
   Read **Client Channels** for what they prefer.
4. **Day 12.** The market update touch. Value with no ask in it.
5. **Then the long game.** Monthly, indefinitely, until they say stop. Most people who fill in a
   form are not moving for a year.

Never send two touches that could have been the same message. If there is nothing new to say,
the touch is early, not overdue.

## Stalled leads

For a lead that went quiet, do not restart the sequence. One message that acknowledges the gap
without apologising for it, references the specific thing they wanted, and gives an easy out:
"still looking, or did you find something?" A clear no is worth more than a maybe in the CRM.

## What to hand over

The drafts, in order, with send dates. Say which ones need the owner and which are safe to
schedule, per **Approval Line**. Log what went out where their CRM allows it, and if it does not,
give them the list to paste.

${APPROVAL_RULE}
`,
  },
  {
    slug: "investment-math",
    emoji: "🧮",
    description:
      "Cap rate, cash-on-cash and DSCR, screened against their own criteria. Use to evaluate a deal.",
    body: `
# Investment math

Run the numbers on a property and say whether it clears the bar. Their bar, not a textbook one.

## Their criteria first

Read **Investment Criteria** in USER.md before anything else. That is what the deal is screened
against, in their words: the minimum cap, the cash flow per door, the rehab ceiling, the hold
period. If it is empty, run the math anyway and ask what the thresholds are once, at the end,
rather than refusing to start.

## The inputs

Get these before calculating, and ask for the ones you do not have rather than assuming:

- Purchase price, and what the rehab actually costs.
- Gross rent, at market rather than at what the current owner is charging.
- Taxes, insurance, HOA. Real numbers from the listing or the tax record.
- Vacancy, maintenance, capex and management as percentages. Say which percentages you used.
- Financing: down payment, rate, term, and points.

## The numbers

Show each with its inputs so they can argue with an assumption instead of the answer:

- **Cap rate** = NOI / purchase price. NOI excludes financing. A cap rate calculated on cash flow
  after debt service is not a cap rate, and it is the most common error in this work.
- **Cash-on-cash** = annual pre-tax cash flow / total cash in, including rehab and closing.
- **Monthly cash flow**, per door and total.
- **DSCR** = NOI / annual debt service. Under 1.2 and most lenders on this product decline.
- **The 1% check** as a sanity test, not a verdict.

## Screen it

State plainly whether it clears each of their criteria, item by item, and then the call: pass,
worth a look, or no. If it fails on one number, say which and by how much, and what would have to
change for it to work. Usually that is the price, and the number is more useful than the verdict.

## Assumptions are the answer

Every one of these is only as good as its inputs, so list the assumptions at the bottom, marked
as either given or estimated. An estimated rent is the difference between an 8% cap and a 5% one,
and the owner needs to know which numbers are theirs and which are yours.

Never present an estimated figure as a fact, and never smooth a bad deal by adjusting an
assumption until it clears.
`,
  },
];
