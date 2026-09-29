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
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made the form
// slow and corporate, so every question is a click except "What do you sell?", the one answer
// only the owner can give. "How should it sound to a prospect?" (`sales_voice`) is gone; the
// shared Voice page now asks tone for every agent.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No quota, no headcount, no commission
// structure, no territory map, and no "biggest sales headache" - the Executive Profile page asks
// about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rules: no em dashes in any user-facing string; positive framing throughout.

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
      helper: "In the words you would use on a call.",
    },
    {
      key: "customer_size",
      label: "How big are your customers?",
      type: "dropdown",
      options: [
        "Individuals / consumers",
        "Micro businesses (1-10 people)",
        "Small businesses (10-50)",
        "Mid-market (50-1,000)",
        "Enterprise (1,000+)",
        "A mix",
      ],
    },
    {
      key: "icp",
      label: "Who usually makes the buying decision?",
      type: "multiselect",
      options: [
        "Founders and owners",
        "C-suite executives",
        "VPs and directors",
        "Operations managers",
        "IT and technical buyers",
        "Finance and procurement",
        "Marketing and sales leaders",
        "Consumers buying for themselves",
        "Other",
      ],
    },
    {
      key: "competitors",
      label: "Why do you usually lose deals?",
      type: "multiselect",
      options: [
        "Price",
        "They stay with what they have today",
        "Timing or budget cycle",
        "A bigger, better-known competitor",
        "A cheaper point tool",
        "They build it in-house",
        "A feature gap",
        "The deal goes quiet after the demo",
        "Other",
      ],
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
      key: "stages",
      label: "Which steps does a typical deal go through?",
      type: "multiselect",
      options: [
        "Discovery call",
        "Demo",
        "Free trial or pilot",
        "Proposal or quote",
        "Technical or security review",
        "Legal and contract review",
        "Procurement",
        "Sign-off from several decision-makers",
        "Signature",
        "Other",
      ],
      helper: "Your agent plans each deal around these, slow steps included.",
    },
    {
      key: "objections",
      label: "Which objections come up most?",
      type: "multiselect",
      options: [
        "Too expensive",
        "We already have something",
        "Bad timing",
        "Need to check with my boss or team",
        "Budget is spent for the year",
        "Unsure it will work for us",
        "Too much work to switch",
        "Security or compliance concerns",
        "Send me more info",
        "Other",
      ],
      helper: "Your agent preps answers to these before every call.",
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
        "None yet",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle: "The last page. What you want handed over, and where it checks with you first.",
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
        "Follow-up, call notes and next steps",
        "Proposals and quotes",
        "CRM hygiene and data entry",
        "Pipeline review and forecasting",
        "Renewals and upsell prompts",
      ],
    },
    // Price and approval stay one answer: a wrong number in a quote is the hardest thing on
    // this list to walk back, so it leads the options.
    {
      key: "approval_line",
      label: "Always check with me first before it...",
      type: "multiselect",
      options: [
        "Quotes a price or discount",
        "Sends a proposal or contract",
        "Offers custom terms",
        "Promises a delivery date or timeline",
        "Emails an existing customer",
        "Sends the first message to a cold prospect",
        "Adds anyone to an outreach sequence",
        "Books a meeting on my calendar",
        "Other",
      ],
      helper: "A wrong number in a quote is hard to walk back, so pricing belongs on this list.",
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Follow-up after every demo",
        "Faster replies to inbound leads",
        "A steady outbound pipeline",
        "Prospect research before calls",
        "Proposals out the same day",
        "A clean, current CRM",
        "An honest pipeline forecast",
        "Renewals and upsells on time",
        "Other",
      ],
      helper: "Your agent gets configured around this first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const SALES_BRANCH: IndustryBranch[] = [OFFER, MOTION, AGENT];
