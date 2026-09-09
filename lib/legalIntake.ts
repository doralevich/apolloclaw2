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
        "Personal injury",
        "Litigation support",
        "Immigration",
        "Privacy & data protection",
        "Regulatory & compliance",
        "Estate planning",
        "Family",
        "Other",
      ],
      helper: "Pick what you actually do. Each one you tick asks you one more question about it.",
    },

    // ─── One question about the areas they picked ────────────────────────────
    //
    // THIS WAS TWELVE QUESTIONS. One conditional textarea per practice area, each asking a
    // variation of "tell us about this area". The argument for them was that they are
    // conditional, so a solo doing contracts and employment answered two and never saw the other
    // ten - and that argument held right up until somebody ticked six. Then it was six long-form
    // essays in a row, each looking like the last, at the point in the form where a buyer has
    // already decided and is looking for the end.
    //
    // WHAT THE TWELVE WERE ACTUALLY FOR is still true and still worth having: an agent for a
    // patent prosecutor and an agent for a plaintiff-side PI firm must not be handed the same
    // brief, and the splits an agent cannot infer - plaintiff or defense, prosecution or
    // enforcement, employer or employee - have to come from the customer.
    //
    // So this asks for all of it once. The specificity lived in the placeholders rather than the
    // labels, which is why the placeholder here is long and shows the shape of a good answer for
    // more than one area: somebody who ticked four writes four lines, and the answer is better
    // for being written in one pass than as four disconnected boxes.
    {
      key: "practice_detail",
      label: "Tell us about the work in the areas you ticked.",
      type: "textarea",
      placeholder:
        "e.g. Commercial contracts: mostly SaaS and vendor MSAs on the customer side, reviewing the other side's paper 80% of the time. Employment: employer side only, offer letters and separation agreements, no union work. Litigation: state court commercial disputes in Illinois, written discovery and motion practice, rarely trial.",
      helper:
        "A line or two per area. Where it matters, say which side you act for and what you deliberately do not take - those are the splits your agent cannot guess and must not get wrong.",
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
        "Plain-English summaries",
        "Clause and precedent lookup",
        "Key dates and renewals",
        "Intake and correspondence",
        "Research memos",
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
      label: "Where must a licensed attorney take over, and what must never leave your systems?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything filed with a court, any advice to a client, any opinion on whether we would win, anything signed. Client matters never leave our systems, and privileged material is never summarized into shared channels.",
      helper:
        "Two things in one answer, because they are the same instinct: where a person must step in, and what the agent must never handle or repeat. Be generous. Your agent is a drafting and analysis tool, and the practice of law is not something it may drift into by accident.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. no NDA sits in the queue for more than a day, and the renewal backlog is clear.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const LEGAL_BRANCH: IndustryBranch[] = [PRACTICE, DOCUMENTS, AGENT];
