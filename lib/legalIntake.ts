// The Law Agent's intake deep-dive.
//
// Three pages rather than one: the practice, the documents, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`legalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THE BOUNDARY QUESTIONS ARE THE POINT HERE. More than any other role agent, this one has to know
// where it must stop: what it may draft, what a licensed attorney must always touch, and what
// must never leave the building unreviewed. Unauthorized practice of law is a real risk and it
// is not a risk the customer should discover by finding out what the agent did. So the last page
// asks about it three separate ways rather than once, and those are the questions worth the
// customer's time even if they skip everything else.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No headcount, no billing rates, no matter
// history, and no "biggest legal headache" - the Executive Profile page asks about the bottleneck
// two steps later and the second ask got the shorter answer.
//
// `responsibilities` is now `owns_work`, matching every other role intake so the shared scope
// mapping in the onboarding form can find it. Older submissions keep the old key and still render
// (the section builder maps over whatever keys are in the blob), they just do not feed the scope
// slots.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the practice ────────────────────────────────────────────────────
const PRACTICE: IndustryBranch = {
  stepTitle: "Your Legal Practice",
  stepSubtitle:
    "Who the agent works for and what kind of law it is reading. This sets what it may assume before anything else.",
  stepLabel: "Practice",
  fields: [
    {
      key: "legal_context",
      label: "Who will the agent work for?",
      type: "dropdown",
      required: true,
      options: [
        "A law firm, serving clients",
        "An in-house legal team",
        "A solo attorney",
        "A business with no lawyer on staff",
        "A compliance or contracts team",
        "Other",
      ],
      helper:
        "This changes everything downstream. A firm's agent writes for clients; an in-house agent writes for colleagues; a business without counsel needs the agent to be far more cautious.",
    },
    {
      key: "practice_areas",
      label: "What kinds of legal work come up most?",
      type: "multiselect",
      options: [
        "Commercial contracts",
        "Employment",
        "Corporate / M&A",
        "Real estate",
        "Intellectual property",
        "Litigation support",
        "Immigration",
        "Privacy & data protection",
        "Regulatory & compliance",
        "Estate planning",
        "Family",
        "Other",
      ],
    },
    {
      key: "clientele",
      label: "Who are your typical clients?",
      type: "multiselect",
      options: [
        "Startups and founders",
        "Small and mid-sized businesses",
        "Enterprise",
        "Individuals",
        "Non-profits",
        "Government or public sector",
        "Internal colleagues (in-house)",
        "Other",
      ],
    },
    {
      key: "client_industries",
      label: "What industries do your clients operate in?",
      type: "text",
      placeholder: "e.g. healthcare, construction, SaaS",
      helper: "Industry decides which regulations sit behind an ordinary-looking clause.",
    },
    {
      key: "jurisdictions",
      label: "Which states or countries govern your agreements?",
      type: "text",
      placeholder: "e.g. New York and Delaware, occasionally England and Wales",
      helper:
        "So the agent does not reason from the wrong body of law. This is the single most common way a confident answer goes wrong.",
    },
    {
      key: "templates_status",
      label: "Do you have your own templates and playbook?",
      type: "dropdown",
      options: [
        "Yes, a full template set and a negotiation playbook",
        "Templates, but no written playbook",
        "A few starting points",
        "We start from whatever the other side sends",
        "Nothing standard yet",
      ],
      helper: "If you have them, upload them later in the form and your agent will work from yours.",
    },
    {
      key: "legal_tools",
      label: "Which tools do your documents live in?",
      type: "multiselect",
      options: [
        "Word / Microsoft 365",
        "Google Docs",
        "DocuSign",
        "Ironclad",
        "ContractPodAi",
        "Clio",
        "NetDocuments",
        "iManage",
        "SharePoint",
        "Email and folders",
        "Other",
      ],
    },
  ],
};

// ─── Page 2: the documents ───────────────────────────────────────────────────
const DOCUMENTS: IndustryBranch = {
  stepTitle: "Your Documents",
  stepSubtitle:
    "How paper actually moves through your practice. The more specific here, the less your agent has to guess.",
  stepLabel: "Documents",
  fields: [
    {
      key: "document_volume",
      label: "How many agreements do you handle in a typical month?",
      type: "dropdown",
      options: ["Fewer than 5", "5-20", "20-50", "50-100", "More than 100"],
    },
    {
      key: "matter_intake",
      label: "How does work reach you today?",
      type: "textarea",
      placeholder:
        "e.g. sales forwards a redline to a shared inbox, I triage on Mondays, anything over $50k comes to me directly.",
      helper: "Where requests come from, who triages, and what jumps the queue.",
    },
    {
      key: "key_clauses",
      label: "Which clauses or terms do you care most about?",
      type: "text",
      placeholder: "e.g. indemnity, limitation of liability, IP assignment, auto-renewal",
      helper: "The ones you check first on every document.",
    },
    {
      key: "negotiation_posture",
      label: "Where do you hold firm, and where do you usually concede?",
      type: "textarea",
      placeholder:
        "e.g. never move on IP assignment or uncapped indemnity, will trade payment terms and notice periods all day, cap is negotiable above 2x fees.",
      helper:
        "Your actual playbook in a paragraph. This is what lets the agent flag a real problem instead of every difference from your template.",
    },
    {
      key: "redline_style",
      label: "How do you like a redline presented?",
      type: "textarea",
      placeholder:
        "e.g. tracked changes plus a short cover note listing only the issues that matter, ranked, with a plain-English reason for each.",
      helper: "How you want to receive a review, and how much explanation you want with it.",
    },
    {
      key: "turnaround",
      label: "Typical turnaround you need on a document?",
      type: "dropdown",
      options: ["Same day", "1-2 days", "About a week", "It varies by matter"],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page, and the most important one. What you want handed over, and the lines it must never cross.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What do you want your Law Agent to own?",
      type: "multiselect",
      options: [
        "First-pass contract review",
        "Drafting from your templates",
        "Redlining the other side's paper",
        "Summarizing agreements in plain English",
        "Clause and precedent lookup",
        "Tracking key dates and renewals",
        "Client or internal intake",
        "Research memos",
        "Document organisation and filing",
        "Correspondence drafting",
      ],
    },
    {
      key: "review_authority",
      label: "How should the agent handle anything it drafts or reviews?",
      type: "dropdown",
      required: true,
      options: [
        "Draft only, an attorney reviews everything before it moves",
        "Draft and flag issues, attorney reviews before it goes out externally",
        "Internal work can go direct, anything external is reviewed",
        "Not sure yet, advise me",
      ],
      helper: "The default is the first option, and there is no shame in leaving it there.",
    },
    {
      key: "handoff_line",
      label: "Where must a licensed attorney always take over?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything filed with a court, any advice to a client, any opinion on whether we would win, anything signed.",
      helper:
        "Be generous here. Your agent is a drafting and analysis tool, and the practice of law is not something it may drift into by accident.",
    },
    {
      key: "confidentiality",
      label: "Any confidentiality or handling rules we should build in?",
      type: "textarea",
      placeholder:
        "e.g. client matters never leave our systems, privileged material is not summarized into shared channels, matter numbers instead of client names in anything internal.",
      helper: "Privilege, client confidentiality, and anything your engagement letters require.",
    },
    {
      key: "drafting_voice",
      label: "How should its drafting and correspondence sound?",
      type: "textarea",
      placeholder:
        "e.g. plain English wherever the law allows, short sentences, no Latin, never hedge in a way that makes a client feel unsafe.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. no NDA sits in the queue for more than a day.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "legal_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The turnaround, the backlog, or the clarity you want three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const LEGAL_BRANCH: IndustryBranch[] = [PRACTICE, DOCUMENTS, AGENT];
