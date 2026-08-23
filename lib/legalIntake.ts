// The Law Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `legal` (config/agent-types.ts), on top of the standard business
// questions, so a legal-drafting agent is set up around the client's actual contracts and matters
// from day one.
//
// Answers land under the `legalDetails` key and are surfaced in USER.md / the intake email via the
// "Legal Deep-Dive" section (lib/onboardingSections.ts).
//
// This is a drafting-and-review assistant, not counsel: the questions ask what the agent should
// help produce and keep track of, not for anything that would have it give legal advice.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const LEGAL_BRANCH: IndustryBranch = {
  stepTitle: "Your Legal Work",
  stepSubtitle: "A few specifics so your Law Agent works from your contracts and your terms, day one.",
  fields: [
    {
      key: "legal_context",
      label: "Who will the agent work for?",
      type: "dropdown",
      required: true,
      options: [
        "A business handling its own contracts (in-house)",
        "A law firm or solo attorney",
        "A founder or owner without in-house legal",
        "Other",
      ],
    },
    {
      key: "practice_areas",
      label: "What kinds of legal work come up most?",
      type: "multiselect",
      required: true,
      options: [
        "Commercial contracts (MSAs, SOWs)",
        "NDAs / confidentiality",
        "Employment / contractor agreements",
        "Vendor / supplier agreements",
        "Sales / customer agreements",
        "Privacy policies & terms of service",
        "Corporate / entity formation",
        "Real estate / leases",
        "Intellectual property / licensing",
        "Compliance & policy",
        "Litigation support",
        "Other",
      ],
    },
    {
      key: "document_volume",
      label: "How many agreements do you handle in a typical month?",
      type: "dropdown",
      options: ["A handful (1-10)", "Steady (10-50)", "High (50-200)", "Very high (200+)", "Not sure"],
    },
    {
      key: "jurisdictions",
      label: "Which states or countries do your agreements usually govern?",
      type: "text",
      placeholder: "e.g. New York and Delaware, or US plus EU",
      helper: "Governing law and where you operate. The agent flags when something falls outside these.",
    },
    {
      key: "templates_status",
      label: "Do you have your own templates and playbook?",
      type: "dropdown",
      options: [
        "Yes, a full template library and standard positions",
        "Some templates, no written playbook",
        "A few old documents we reuse",
        "Nothing standardized yet",
        "Other",
      ],
    },
    {
      key: "legal_tools",
      label: "Which tools do your documents live in?",
      type: "multiselect",
      helper: "Where contracts are drafted, signed, and stored.",
      options: [
        "Microsoft Word",
        "Google Docs",
        "DocuSign",
        "PandaDoc / Adobe Sign",
        "A CLM (Ironclad, Juro, LinkSquares...)",
        "SharePoint / OneDrive",
        "Google Drive",
        "Dropbox / Box",
        "Other",
      ],
    },
    {
      key: "responsibilities",
      label: "What do you want your Law Agent to own?",
      type: "multiselect",
      required: true,
      options: [
        "Draft first versions from your templates",
        "Review incoming contracts and redline against your positions",
        "Summarize documents in plain English",
        "Flag risky or unusual clauses",
        "Track obligations, deadlines, and renewals",
        "Maintain a clause / template library",
        "Generate policies (privacy, ToS, handbook)",
        "Answer 'what does this clause mean' questions",
        "Organize and file executed agreements",
      ],
    },
    {
      key: "review_authority",
      label: "How should the agent handle anything it drafts or reviews?",
      type: "dropdown",
      required: true,
      options: [
        "Draft only; a person reviews everything before it leaves",
        "Draft and recommend; attorney signs off on anything binding",
        "Handle routine low-risk documents, escalate the rest",
        "Not sure yet",
      ],
    },
    {
      key: "confidentiality",
      label: "Any confidentiality or handling rules we should build in?",
      type: "textarea",
      placeholder: "e.g. privileged matters stay off shared drives, client data never leaves our systems.",
      helper: "The agent will treat these as hard rules.",
    },
    {
      key: "legal_pain",
      label: "Biggest legal bottleneck or headache right now?",
      type: "textarea",
      required: true,
      placeholder: "e.g. contracts sit in my inbox for a week, I never know what renews when, every NDA starts from scratch.",
    },
    {
      key: "legal_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The turnaround, the visibility, or the off-your-plate work you want three months from now.",
    },
  ],
};
