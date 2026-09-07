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

    // ─── One question per area they picked ───────────────────────────────────
    //
    // WHY THESE EXIST. The list above was collected and then never used: an agent for a patent
    // prosecutor and an agent for a plaintiff-side PI firm were handed the identical brief, and
    // "legal work" is not a practice. Both would then spend the first week being told, one
    // correction at a time, what the person in front of them actually does.
    //
    // WHY ONE EACH, AND CONDITIONAL. This page set has been cut twice on the rule that every
    // question in front of somebody who has already decided to buy is a chance to close the tab.
    // Twelve unconditional questions would break that rule badly. Twelve CONDITIONAL ones do not:
    // a solo who does contracts and employment answers two, right under the boxes they just
    // ticked, and never sees the other ten. The form gets longer only for people who genuinely
    // do more, and for them the extra length is the thing they were hoping we would ask.
    //
    // The specificity lives in the placeholders. Nobody writes a useful answer to "tell us about
    // your practice"; almost everybody writes one when shown the shape of a good answer. That is
    // also why each asks for the SIDE and the SUBTYPE where those change the work - plaintiff or
    // defense, prosecution or enforcement, employer or employee - since those are the splits an
    // agent cannot infer and must not get wrong.
    {
      key: "commercial_contracts_detail",
      label: "Commercial contracts: what paper do you see most?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Commercial contracts" },
      placeholder:
        "e.g. mostly SaaS and vendor MSAs on the customer side, plus NDAs in volume. We rarely draft first - we are reviewing the other side's template 80% of the time.",
      helper: "The document types, and whether you are usually drafting or reviewing.",
    },
    {
      key: "employment_detail",
      label: "Employment: which side, and what kind of matters?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Employment" },
      placeholder:
        "e.g. employer side only. Offer letters, handbooks, separation agreements, and the occasional discrimination charge response. No union work.",
      helper:
        "Employer or employee changes every document you produce, so say which. Advice work, disputes, or both.",
    },
    {
      key: "corporate_detail",
      label: "Corporate and M&A: what kind of deals, and how big?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Corporate / M&A" },
      placeholder:
        "e.g. lower middle market asset purchases, $5M to $40M. Formations and cap table cleanup, seed and Series A financings. We run diligence off a checklist I will share.",
      helper: "Deal types, typical size, and whether you handle diligence, drafting, or both.",
    },
    {
      key: "real_estate_detail",
      label: "Real estate: transactions, leasing, or land use?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Real estate" },
      placeholder:
        "e.g. commercial leasing for landlords, plus purchase and sale for a handful of investor clients. No residential closings, no zoning.",
      helper: "What you handle, and whose side you are usually on.",
    },
    {
      key: "intellectual_property_detail",
      label: "Intellectual property: which kind?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Intellectual property" },
      placeholder:
        "e.g. patent prosecution, software and electronics, mostly US non-provisionals with some PCT. Office action responses are the bulk of it. No litigation, no trademarks.",
      helper:
        "Patents, trademarks, copyright or trade secrets - and prosecution, licensing or enforcement. These are different jobs and the agent should only learn yours.",
    },
    {
      key: "personal_injury_detail",
      label: "Personal injury: plaintiff or defense, and what kind of cases?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Personal injury" },
      placeholder:
        "e.g. plaintiff side. Auto and premises, occasional trucking. Most settle pre-suit. We deal with records requests, liens and demand packages constantly.",
      helper:
        "Which side, the case types, and how much of the work is records, liens and demand packages versus litigation.",
    },
    {
      key: "litigation_detail",
      label: "Litigation: which courts, and what stage do you live in?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Litigation support" },
      placeholder:
        "e.g. state court commercial disputes in Illinois, some N.D. Ill. Mostly written discovery and motion practice. Rarely trial.",
      helper:
        "Courts and venues, the kind of disputes, and the stages you actually spend time in. Deadlines here are unforgiving and vary by court, so be specific about where you appear.",
    },
    {
      key: "immigration_detail",
      label: "Immigration: employment based, family based, or both?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Immigration" },
      placeholder:
        "e.g. employment based. H-1B and PERM for two tech clients, plus O-1s. Some adjustment of status. No removal defense, no asylum.",
      helper: "The categories you file, and anything you deliberately do not take.",
    },
    {
      key: "privacy_detail",
      label: "Privacy: which regimes do you work under?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Privacy & data protection" },
      placeholder:
        "e.g. GDPR and CCPA, plus HIPAA for two healthcare clients. DPAs, privacy policies, and breach response. Not much litigation.",
      helper: "The frameworks that actually apply to your clients, and the work they generate.",
    },
    {
      key: "regulatory_detail",
      label: "Regulatory: which regulators and rules?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Regulatory & compliance" },
      placeholder:
        "e.g. FDA for a medical device client, plus state licensing for healthcare staffing. Mostly submissions and audit response.",
      helper: "Who regulates your clients, and what you produce for them.",
    },
    {
      key: "estate_planning_detail",
      label: "Estate planning: what do you draft, and for whom?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Estate planning" },
      placeholder:
        "e.g. revocable trusts, pour-over wills, powers of attorney for families in the $2M to $15M range. Some irrevocable trust work. Probate only for existing clients.",
      helper: "The instruments, the typical estate size, and whether you handle probate.",
    },
    {
      key: "family_law_detail",
      label: "Family: what kind of matters, and how contested?",
      type: "textarea",
      showIf: { key: "practice_areas", includes: "Family" },
      placeholder:
        "e.g. divorce and custody, mostly negotiated. A lot of collaborative work and mediation. We take contested custody but not high-conflict cases.",
      helper: "Matter types, and whether your work is usually negotiated or litigated.",
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
