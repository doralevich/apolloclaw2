// The Sales Agent's intake deep-dive.
//
// Three pages rather than one: what you sell, how you sell it, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`salesDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THE QUESTIONS THAT MAKE THIS AGENT GOOD are the ones about losing, not winning. Anyone can
// describe their product. What separates a useful sales agent from a template is knowing which
// objection kills deals, what a bad-fit prospect looks like, and where deals actually stall - so
// this intake asks all three directly rather than inferring them from a win story.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No quota, no headcount, no commission
// structure, no territory map, and no "biggest sales headache" - the Executive Profile page asks
// about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: what you sell ───────────────────────────────────────────────────
const OFFER: IndustryBranch = {
  stepTitle: "What You Sell",
  stepSubtitle:
    "The offer and the buyer. Your agent writes to this person in every message it drafts.",
  stepLabel: "The Offer",
  fields: [
    {
      key: "what_you_sell",
      label: "What do you sell?",
      type: "textarea",
      required: true,
      placeholder: "e.g. a compliance platform for mid-market insurers, sold as an annual license.",
      helper: "In the words you would use on a call, not the words on the website.",
    },
    {
      key: "icp",
      label: "Who is your ideal customer?",
      type: "textarea",
      placeholder:
        "e.g. 200 to 1000 people, has a compliance officer but no dedicated team, already been fined once.",
      helper: "Size, role, and the situation that makes them ready to buy.",
    },
    {
      key: "bad_fit",
      label: "Who is a bad fit, even when they want to buy?",
      type: "textarea",
      placeholder:
        "e.g. under 50 people, they churn in six months; anyone who needs it live in under a month; anyone shopping purely on price.",
      helper:
        "The deals you regret taking. An agent that only knows your ideal customer will happily fill your pipeline with the wrong ones.",
    },
    {
      key: "buying_committee",
      label: "Who else has to say yes?",
      type: "textarea",
      placeholder:
        "e.g. my champion is the compliance lead, IT has a veto on security review, finance signs above $50k.",
      helper: "Champion, blockers, and who actually signs. This is where deals quietly die.",
    },
    {
      key: "competitors",
      label: "Who do you lose to, and why?",
      type: "textarea",
      placeholder:
        "e.g. we lose to the incumbent on inertia and to a cheaper tool on price, almost never on the product itself.",
      helper: "Naming the real reason matters more than naming the competitor.",
    },
  ],
};

// ─── Page 2: how you sell ────────────────────────────────────────────────────
const MOTION: IndustryBranch = {
  stepTitle: "How You Sell",
  stepSubtitle:
    "The motion, the cycle, and where it stalls. The more specific here, the less your agent has to guess.",
  stepLabel: "The Motion",
  fields: [
    {
      key: "motion",
      label: "What kind of sales motion is it?",
      type: "multiselect",
      options: [
        "Outbound / cold outreach",
        "Inbound / demand gen",
        "Partner or channel",
        "Product-led with a sales assist",
        "Referral and network",
        "Events and conferences",
        "Retail or in-person",
        "Other",
      ],
    },
    {
      key: "deal_size",
      label: "Typical deal size?",
      type: "dropdown",
      options: [
        "Under $1k",
        "$1k - $10k",
        "$10k - $50k",
        "$50k - $250k",
        "$250k - $1M",
        "Above $1M",
        "It varies widely",
      ],
    },
    {
      key: "cycle_length",
      label: "How long is a typical sales cycle?",
      type: "dropdown",
      options: ["Same day", "Under 2 weeks", "2-6 weeks", "1-3 months", "3-6 months", "More than 6 months"],
    },
    {
      key: "stages",
      label: "Walk us through a deal, first contact to signed.",
      type: "textarea",
      placeholder:
        "e.g. discovery call, technical demo with their IT, security review which takes three weeks, procurement, signature.",
      helper: "The real steps in your order, including the one everybody forgets to plan for.",
    },
    {
      key: "stall_point",
      label: "Where do deals usually stall?",
      type: "textarea",
      placeholder:
        "e.g. after the demo, when my champion has to sell it internally and I have given them nothing to sell it with.",
      helper: "The stage where your pipeline actually leaks. This is where the agent goes to work first.",
    },
    {
      key: "objections",
      label: "What objections come up most?",
      type: "textarea",
      placeholder: "e.g. too expensive, we already have something, not the right time, security review is too much work.",
      helper: "And, if you have them, the answers that actually work.",
    },
    {
      key: "crm",
      label: "What CRM do you use?",
      type: "dropdown",
      options: [
        "Salesforce",
        "HubSpot",
        "Pipedrive",
        "Attio",
        "Close",
        "Zoho CRM",
        "Microsoft Dynamics 365",
        "Spreadsheets only",
        "Nothing yet",
        "Other",
      ],
    },
    {
      key: "sales_tools",
      label: "Which sales tools do you run?",
      type: "multiselect",
      options: [
        "Outreach",
        "Salesloft",
        "Apollo.io",
        "Gong",
        "Chorus",
        "ZoomInfo",
        "LinkedIn Sales Navigator",
        "Clay",
        "Calendly",
        "DocuSign",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, how it should sound, and the lines it must not cross.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your sales agent to own?",
      type: "multiselect",
      options: [
        "Prospect research before a call",
        "Outbound sequences and drafting",
        "Inbound lead qualification",
        "Follow-up after meetings",
        "Proposals and quotes",
        "Objection handling prep",
        "CRM hygiene and data entry",
        "Pipeline review and forecasting",
        "Call notes and next steps",
        "Renewals and upsell prompts",
      ],
    },
    // The follow-up to the one option that puts words in front of a stranger under the
    // customer's name. Everything else on this list is internal or reactive; cold outreach is
    // the customer's reputation, sent at volume, and "make it sound like us" does not configure it.
    {
      key: "outreach_rules",
      label: "What are the rules for outbound in your name?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Outbound sequences and drafting" },
      placeholder:
        "e.g. never send without me approving the sequence, no fake personalisation, never claim we work with a logo we do not, three touches then stop.",
      helper:
        "What it may send, what it must never claim, and whether anything goes out before you have read it.",
    },
    {
      key: "sales_voice",
      label: "How should it sound to a prospect?",
      type: "textarea",
      placeholder:
        "e.g. short, specific, no exclamation marks, never 'just circling back', lead with something true about their business.",
      helper: "Including the phrases you never want to see sent in your name.",
    },
    {
      key: "approval_line",
      label: "What must never go out without you seeing it first?",
      type: "textarea",
      placeholder:
        "e.g. anything with a price in it, any proposal, anything to an existing customer, anything promising a delivery date.",
      helper: "A wrong number in a quote is hard to walk back.",
    },
    {
      key: "pricing_rules",
      label: "What can it say about price, and what is off limits?",
      type: "textarea",
      placeholder:
        "e.g. list price is fine to state, never discount in writing, never quote a multi-year rate, always send anything custom to me.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. nobody goes cold after a demo.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "sales_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The pipeline, the response rate, or the time back you want three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const SALES_BRANCH: IndustryBranch[] = [OFFER, MOTION, AGENT];
