// The Marketing Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `marketing` (config/agent-types.ts), on top of the standard business
// questions, so a marketing agent writes in the client's voice and works their channels day one.
//
// All fields are optional: answer what applies, skip the rest.
//
// Answers land under the `marketingDetails` key and are surfaced in USER.md / the intake email via
// the "Marketing Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const MARKETING_BRANCH: IndustryBranch = {
  stepTitle: "Your Marketing",
  stepSubtitle: "A few specifics so your marketing agent writes in your voice and works your channels from day one.",
  fields: [
    {
      key: "audience",
      label: "Who are you marketing to?",
      type: "textarea",
      placeholder: "Your ideal customer: who they are, what they care about, what they are trying to solve.",
    },
    {
      key: "channels",
      label: "Which channels do you market on?",
      type: "multiselect",
      options: [
        "Email / newsletter",
        "Instagram",
        "LinkedIn",
        "Facebook",
        "X / Twitter",
        "TikTok",
        "YouTube",
        "Blog / SEO",
        "Paid ads (Google / Meta)",
        "Podcast",
        "Other",
      ],
    },
    {
      key: "brand_voice",
      label: "How would you describe your brand voice?",
      type: "textarea",
      placeholder: "e.g. warm and plain-spoken, or bold and punchy. Words you love, words you avoid.",
    },
    {
      key: "content_types",
      label: "What content do you need most?",
      type: "multiselect",
      options: [
        "Social posts",
        "Email campaigns",
        "Landing pages",
        "Blog articles",
        "Ad copy",
        "Case studies",
        "Newsletters",
        "Video scripts",
        "Other",
      ],
    },
    {
      key: "cadence",
      label: "How often do you want to publish?",
      type: "dropdown",
      options: ["Daily", "A few times a week", "Weekly", "A few times a month", "Ad hoc"],
    },
    {
      key: "marketing_tools",
      label: "Which marketing tools do you use?",
      type: "multiselect",
      options: [
        "Mailchimp",
        "HubSpot",
        "Klaviyo",
        "Canva",
        "Buffer / Hootsuite",
        "Later",
        "Google Analytics",
        "Meta Ads",
        "Google Ads",
        "WordPress",
        "Webflow",
        "Other",
      ],
    },
    {
      key: "growth_focus",
      label: "What are you trying to grow?",
      type: "multiselect",
      options: [
        "Awareness / reach",
        "Leads",
        "Email list",
        "Sales / revenue",
        "Engagement",
        "Retention",
        "A product launch",
        "Other",
      ],
    },
    {
      key: "owns_work",
      label: "What do you want your marketing agent to own?",
      type: "multiselect",
      options: [
        "Writing social posts",
        "Email campaigns",
        "Content calendar",
        "Repurposing content",
        "Ad copy",
        "Blog / SEO drafts",
        "Competitor & audience research",
        "Performance recaps",
      ],
    },
    {
      key: "marketing_pain",
      label: "Biggest marketing headache right now?",
      type: "textarea",
      placeholder: "e.g. I post inconsistently, the blog never gets written, I don't know what's working.",
    },
    {
      key: "marketing_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The reach, the pipeline, or the consistency you want three months from now.",
    },
  ],
};
