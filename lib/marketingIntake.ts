// The Marketing Agent's intake deep-dive.
//
// Three pages rather than one: the audience, the machine, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`marketingDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made the form
// slow and corporate, so every question is a click except `audience`, the one answer only the
// owner can give. "How should the brand sound?" (`brand_voice`) is gone; the shared Voice page
// now asks tone for every agent. What the brand steers clear of (`banned_words`) stays here as
// checkboxes, because a list of what the brand avoids prevents more off-brand copy than any tone.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No follower counts, no historical campaign
// results, no budget breakdown, and no "biggest marketing headache" - the Executive Profile page
// asks about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rules: no em dashes in any user-facing string; positive framing throughout.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the audience ────────────────────────────────────────────────────
const AUDIENCE: IndustryBranch = {
  stepTitle: "Who You Are Talking To",
  stepSubtitle:
    "The audience and what the brand stands for. Everything your agent writes is aimed at this person.",
  stepLabel: "Audience",
  fields: [
    {
      key: "audience",
      label: "Who are you marketing to?",
      type: "text",
      required: true,
      placeholder: "e.g. operations managers at 50 to 500 person manufacturers",
      helper: "Who they are and what they do. Your agent aims every draft at this person.",
    },
    {
      key: "positioning",
      label: "What do you want to be known for?",
      type: "dropdown",
      options: [
        "The expert in our niche",
        "The most trusted name",
        "The premium choice",
        "The best value",
        "The easiest to work with",
        "The fastest turnaround",
        "The most innovative",
        "The local favorite",
        "Other",
      ],
    },
    {
      key: "banned_words",
      label: "What should the brand steer clear of?",
      type: "multiselect",
      options: [
        "Hype words like revolutionary or game-changing",
        "Uncited stats or percentages",
        "Jargon and buzzwords",
        "Emoji",
        "Exclamation marks",
        "Mentioning AI in headlines",
        "Naming competitors",
        "Discount-led messaging",
        "Other",
      ],
      helper: "A short list of what the brand avoids keeps more copy on-brand than any description.",
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
      helper: "Tick every place you publish today.",
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
  stepSubtitle: "The last page. What you want handed over, and where it checks with you first.",
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
    // The guard (coversScope.guard in OnboardingForm.tsx). Everything drafted can be reviewed;
    // anything published speaks for the brand the moment it goes live, so this sets the line.
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
      helper: "Starting cautious is a fine default, and you can widen it anytime.",
    },
    {
      key: "claims_rules",
      label: "Always check with me first before it...",
      type: "multiselect",
      options: [
        "Names a customer or uses a testimonial",
        "Makes a results or performance claim",
        "Mentions pricing or a discount",
        "Replies to comments or DMs in public",
        "Mentions a competitor",
        "Touches a regulated topic (health, finance, legal)",
        "Posts about news or current events",
        "Uses someone's photo or likeness",
        "Other",
      ],
      helper: "Anything your industry, your customers, or your legal counsel require.",
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "A weekly newsletter that ships on time",
        "A steady social posting rhythm",
        "More blog and SEO content",
        "Sharper ad and landing page copy",
        "A content calendar planned weeks ahead",
        "Repurposing what we already make",
        "Campaign reporting I can read at a glance",
        "Launch or promo support",
        "Other",
      ],
      helper: "Your agent gets configured around this first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const MARKETING_BRANCH: IndustryBranch[] = [AUDIENCE, MACHINE, AGENT];
