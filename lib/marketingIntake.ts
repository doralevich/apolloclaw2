// The Marketing Agent's intake deep-dive.
//
// Three pages rather than one: the audience, the machine, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`marketingDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THIS ONE HAS A VOICE PROBLEM THE OTHERS DO NOT. Every role agent gets the shared voice pages
// later in the form, which capture how the OWNER writes. A marketing agent usually writes as the
// BRAND, and the two are often deliberately different: a blunt founder can run a warm, careful
// brand. So this intake asks about brand voice separately, and asks for the words the brand does
// not use, which is the half that actually prevents off-brand copy.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No follower counts, no historical campaign
// results, no budget breakdown, and no "biggest marketing headache" - the Executive Profile page
// asks about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the audience ────────────────────────────────────────────────────
const AUDIENCE: IndustryBranch = {
  stepTitle: "Who You Are Talking To",
  stepSubtitle:
    "The audience and the brand they hear. Everything your agent writes is aimed at this person.",
  stepLabel: "Audience",
  fields: [
    {
      key: "audience",
      label: "Who are you marketing to?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. operations managers at 50 to 500 person manufacturers, usually the person who inherited a process nobody documented.",
      helper: "Who they are, and what is going on in their week when your marketing reaches them.",
    },
    {
      key: "brand_voice",
      label: "How should the brand sound?",
      type: "textarea",
      placeholder:
        "e.g. plain-spoken and confident, we explain rather than persuade, closer to a trade magazine than a tech company.",
      helper:
        "The brand's voice, which may not be your own. Your personal writing style is captured later in the form.",
    },
    {
      key: "banned_words",
      label: "What words and claims are off limits?",
      type: "textarea",
      placeholder:
        "e.g. never 'revolutionary', 'game-changing' or 'seamless', never claim a percentage we cannot cite, no emoji, never say AI in a headline.",
      helper:
        "The most useful question on this page. A list of what the brand never says prevents more bad copy than any description of what it does.",
    },
    {
      key: "positioning",
      label: "What do you want to be known for?",
      type: "textarea",
      placeholder: "The one idea you want to own in your market.",
    },
  ],
};

// ─── Page 2: the machine ─────────────────────────────────────────────────────
const MACHINE: IndustryBranch = {
  stepTitle: "Your Marketing Machine",
  stepSubtitle:
    "What you publish, where it goes, and what happens after. The more specific here, the less your agent has to guess.",
  stepLabel: "The Machine",
  fields: [
    {
      key: "channels",
      label: "Which channels do you market on?",
      type: "multiselect",
      options: [
        "Email / newsletter",
        "LinkedIn",
        "Instagram / Facebook",
        "TikTok / YouTube",
        "Blog / SEO",
        "Paid ads",
        "Events",
        "Other",
      ],
      helper:
        "Tick where you actually publish, and say in the box which of them works and which is a chore - your agent should spend its time on the first kind.",
    },
    {
      key: "content_types",
      label: "What content do you need most?",
      type: "multiselect",
      options: [
        "Social posts",
        "Email campaigns and newsletters",
        "Blog posts and articles",
        "Landing page copy",
        "Ad copy",
        "Case studies",
        "Video scripts",
        "Sales collateral",
        "Product and launch announcements",
        "Other",
      ],
    },
    {
      key: "cadence",
      label: "How often do you want to publish?",
      type: "dropdown",
      options: ["Daily", "A few times a week", "Weekly", "A few times a month", "Monthly", "Campaign by campaign"],
    },
    {
      key: "marketing_tools",
      label: "Which marketing tools do you use?",
      type: "multiselect",
      options: [
        "Mailchimp",
        "Klaviyo",
        "HubSpot",
        "Beehiiv or Substack",
        "Canva",
        "Figma",
        "Buffer or Hootsuite",
        "WordPress",
        "Webflow",
        "Google Analytics",
        "Google Ads",
        "Meta Ads Manager",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. What you want handed over, and the lines it must not cross.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your marketing agent to own?",
      type: "multiselect",
      options: [
        "Social posts",
        "The newsletter",
        "Blog posts and articles",
        "Ad and landing page copy",
        "Content calendar and planning",
        "Repurposing one piece into many",
        "Competitor and market research",
        "Campaign reporting",
      ],
    },
    // The follow-up to the one option that talks to the public unsupervised. Everything else on
    // this list is drafted and reviewed; replying in the brand's name in a comment thread is
    // published the moment it is written.
    {
      key: "publishing_authority",
      label: "Can it publish, or only draft?",
      type: "dropdown",
      options: [
        "Draft only, I publish everything myself",
        "Draft and schedule, I approve before it goes",
        "Publish social directly, everything else reviewed",
        "Publish anything within the brief",
      ],
      helper:
        "There is no wrong answer, and starting cautious costs nothing. Use the claims question below to say who signs off on what, and what the rules are for replying in public under your name.",
    },
    {
      key: "claims_rules",
      label: "Any claims or compliance rules it must follow?",
      type: "textarea",
      placeholder:
        "e.g. no customer named without written permission, no results claim without a source, regulated industry so nothing that reads as advice.",
      helper: "Anything your industry, your customers, or your legal counsel require.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. the newsletter goes out every week without me writing it at midnight.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const MARKETING_BRANCH: IndustryBranch[] = [AUDIENCE, MACHINE, AGENT];
