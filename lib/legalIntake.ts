// The Law Agent's intake deep-dive.
//
// Six pages rather than one: the practice, the documents, legal research tools, email &
// calendar, deadlines & conflicts, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All four write into ONE blob
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

import type { IndustryBranch, IndustryField } from "@/lib/industryConfig";

// The full options list for "What are your primary practice areas?". Kept as its own constant
// (rather than inlined) because PRACTICE_AREA_FOLLOWUPS below has to reference the exact same
// strings in its showIf conditions - one list, so the two can never drift apart into a follow-up
// keyed on an option that no longer exists, or an option with no follow-up at all.
//
// Alphabetical, David's call - a list this long read as an arbitrary grab-bag otherwise. "Other"
// stays last, same convention as every other multiselect on this form: it is the escape hatch,
// not one more area to scan past looking for it.
const PRACTICE_AREA_OPTIONS = [
  "Bankruptcy",
  "Civil rights",
  "Commercial contracts",
  "Construction",
  "Corporate / M&A",
  "Criminal defense",
  "Employment",
  "Environmental",
  "Family",
  "Healthcare",
  "Immigration",
  "Insurance defense",
  "Intellectual property",
  "Litigation support",
  "Personal injury",
  "Privacy & data protection",
  "Real estate",
  "Regulatory & compliance",
  "Securities",
  "Tax",
  "Trusts & estates",
  "Workers' compensation",
  "Other",
];

/** Stamps every field in the group with the same showIf, so a practice area's questions never
 *  drift apart into showing under different conditions from each other. */
function areaFollowups(area: string, fields: Omit<IndustryField, "showIf">[]): IndustryField[] {
  return fields.map((f) => ({ ...f, showIf: { key: "practice_areas", includes: area } }));
}

// Two or three short, structured questions per area (dropdown or multiselect, never another
// essay box) - the splits an agent cannot infer without being told: which side of the matter the
// customer acts for, and which kind of work inside a broad area actually comes up. Field keys are
// prefixed per area (cc_, emp_, ma_, ...) because every area's fields land in the same flat
// legalDetails blob as page 2 and page 3's fields, and a collision would silently overwrite an
// unrelated answer.
// Same alphabetical order as PRACTICE_AREA_OPTIONS - not load-bearing (each block is gated on
// its own showIf, so order here never changes what shows), but a customer who ticks several
// areas sees their follow-ups in the same order they ticked the options in, not a random one.
const PRACTICE_AREA_FOLLOWUPS: IndustryField[] = [
  ...areaFollowups("Bankruptcy", [
    { key: "bk_side", label: "Which side?", type: "dropdown", options: ["Debtor side", "Creditor side", "Both"] },
    { key: "bk_types", label: "What comes up most?", type: "multiselect", options: ["Chapter 7 (liquidation)", "Chapter 11 (reorganization)", "Chapter 13", "Workouts / restructuring outside bankruptcy", "Other"] },
  ]),
  ...areaFollowups("Civil rights", [
    { key: "cr_types", label: "What comes up most?", type: "multiselect", options: ["Employment discrimination", "Police / government misconduct", "Housing / fair housing", "Disability access (ADA)", "Other"] },
    { key: "cr_side", label: "Which side?", type: "dropdown", options: ["Plaintiff / complainant side", "Defense (government / institutional)", "Both"] },
  ]),
  ...areaFollowups("Commercial contracts", [
    { key: "cc_side", label: "Which side do you typically sit on?", type: "dropdown", options: ["Drafting party", "Reviewing / negotiating the other side's paper", "Both, evenly"] },
    { key: "cc_types", label: "What kinds of agreements come up most?", type: "multiselect", options: ["SaaS / vendor agreements", "NDAs", "MSAs and SOWs", "Licensing", "Distribution / reseller", "Supply agreements", "Other"] },
  ]),
  ...areaFollowups("Construction", [
    { key: "con_side", label: "Which side of the table?", type: "dropdown", options: ["Owner / developer side", "Contractor / subcontractor side", "Both"] },
    { key: "con_types", label: "What comes up most?", type: "multiselect", options: ["Contract drafting & negotiation", "Payment / lien disputes", "Delay & defect claims", "Bid protests", "Other"] },
  ]),
  ...areaFollowups("Corporate / M&A", [
    { key: "ma_side", label: "Typical deal side?", type: "dropdown", options: ["Buy-side", "Sell-side", "Both", "Formation / governance only"] },
    { key: "ma_types", label: "What comes up most?", type: "multiselect", options: ["Entity formation & governance", "Fundraising / financing rounds", "Mergers & acquisitions", "Joint ventures", "Shareholder / operating agreements", "Other"] },
  ]),
  ...areaFollowups("Criminal defense", [
    { key: "crim_level", label: "Level?", type: "dropdown", options: ["Misdemeanor", "Felony", "Both", "White-collar / regulatory"] },
    { key: "crim_stage", label: "What comes up most?", type: "multiselect", options: ["Pre-charge / investigation", "Arraignment & pretrial", "Trial", "Appeals & post-conviction", "Other"] },
  ]),
  ...areaFollowups("Employment", [
    { key: "emp_side", label: "Which side do you represent?", type: "dropdown", options: ["Employer side only", "Employee side only", "Both"] },
    { key: "emp_types", label: "What comes up most?", type: "multiselect", options: ["Offer letters & separation agreements", "Handbooks & policies", "Non-competes / restrictive covenants", "Wage & hour compliance", "Discrimination / harassment claims", "Union / labor relations", "Other"] },
  ]),
  ...areaFollowups("Environmental", [
    { key: "env_types", label: "What comes up most?", type: "multiselect", options: ["Permitting & compliance", "Remediation / contamination", "Enforcement & citizen suits", "Transactional due diligence", "Other"] },
    { key: "env_clients", label: "Client type?", type: "dropdown", options: ["Businesses / developers", "Government agencies", "Community / advocacy groups", "Other"] },
  ]),
  ...areaFollowups("Family", [
    { key: "fam_types", label: "What comes up most?", type: "multiselect", options: ["Divorce & separation", "Custody & parenting plans", "Child / spousal support", "Adoption", "Prenuptial / postnuptial agreements", "Other"] },
    { key: "fam_posture", label: "Posture?", type: "dropdown", options: ["Amicable / collaborative, mostly", "Contested / litigated, mostly", "Mixed"] },
  ]),
  ...areaFollowups("Healthcare", [
    { key: "hc_types", label: "What comes up most?", type: "multiselect", options: ["Regulatory compliance (HIPAA, licensing)", "Provider contracts", "Medical malpractice defense", "Credentialing", "Reimbursement / payer disputes", "Other"] },
    { key: "hc_clients", label: "Client type?", type: "dropdown", options: ["Hospitals / health systems", "Individual practitioners / practices", "Payers / insurers", "Other"] },
  ]),
  ...areaFollowups("Immigration", [
    { key: "imm_focus", label: "Primary focus?", type: "dropdown", options: ["Employment-based", "Family-based", "Asylum / humanitarian", "Business / investor visas", "Removal defense", "Mixed"] },
    { key: "imm_types", label: "What comes up most?", type: "multiselect", options: ["Visa petitions & extensions", "Green card applications", "Naturalization", "Compliance / I-9 audits", "Other"] },
  ]),
  ...areaFollowups("Insurance defense", [
    { key: "insd_role", label: "Typical role?", type: "dropdown", options: ["Defending insureds on behalf of carriers", "Coverage / bad-faith disputes", "Both"] },
    { key: "insd_types", label: "What kinds of claims come up most?", type: "multiselect", options: ["Auto", "Premises liability", "Products liability", "Professional liability", "Other"] },
  ]),
  ...areaFollowups("Intellectual property", [
    { key: "ip_focus", label: "Main focus?", type: "dropdown", options: ["Prosecution / filing", "Licensing & transactions", "Enforcement / litigation", "Mixed"] },
    { key: "ip_types", label: "What kinds of IP?", type: "multiselect", options: ["Patents", "Trademarks", "Copyright", "Trade secrets", "Other"] },
  ]),
  ...areaFollowups("Litigation support", [
    { key: "lit_side", label: "Which side do you typically represent?", type: "dropdown", options: ["Plaintiff", "Defense", "Both"] },
    { key: "lit_courts", label: "Court level?", type: "multiselect", options: ["State trial courts", "Federal district courts", "Appellate", "Administrative / agency", "Arbitration / ADR", "Other"] },
    { key: "lit_types", label: "What comes up most?", type: "multiselect", options: ["Written discovery", "Depositions", "Motion practice", "Trial prep", "Settlement negotiation", "Other"] },
  ]),
  // Personal injury gets a third question, David's own example of what this whole change was
  // for: what the agent needs to actually track (liens, deadlines, settlement posture) is not
  // something "plaintiff vs. defense" or "case type" alone tells it.
  ...areaFollowups("Personal injury", [
    { key: "pi_side", label: "Which side?", type: "dropdown", options: ["Plaintiff", "Defense", "Both"] },
    { key: "pi_types", label: "What kinds of cases come up most?", type: "multiselect", options: ["Auto accidents", "Slip and fall / premises liability", "Medical malpractice", "Product liability", "Workplace injuries", "Wrongful death", "Other"] },
    { key: "pi_track", label: "What does the agent need to keep on top of?", type: "multiselect", options: ["Medical liens & subrogation", "Statute of limitations deadlines", "Settlement negotiations", "Trial prep", "Other"] },
  ]),
  ...areaFollowups("Privacy & data protection", [
    { key: "priv_focus", label: "Primary focus?", type: "dropdown", options: ["Compliance & policy drafting", "Incident response / breach", "Vendor & data-sharing agreements", "Regulatory defense", "Mixed"] },
    { key: "priv_regimes", label: "Which regimes matter most?", type: "multiselect", options: ["GDPR", "CCPA / CPRA", "HIPAA", "Other US state laws", "Sector-specific (financial / health)", "Other"] },
  ]),
  ...areaFollowups("Real estate", [
    { key: "re_side", label: "Which side of the table?", type: "dropdown", options: ["Landlord / seller side", "Tenant / buyer side", "Both"] },
    { key: "re_types", label: "What comes up most?", type: "multiselect", options: ["Commercial leasing", "Residential leasing", "Purchase & sale agreements", "Financing / liens", "Zoning & land use", "Construction contracts", "Other"] },
  ]),
  ...areaFollowups("Regulatory & compliance", [
    { key: "reg_types", label: "What comes up most?", type: "multiselect", options: ["Licensing & filings", "Investigations & audits", "Policy / compliance program design", "Government inquiries / enforcement", "Other"] },
    { key: "reg_posture", label: "Posture?", type: "dropdown", options: ["Proactive compliance / advisory", "Responding to an active inquiry or investigation", "Both"] },
  ]),
  ...areaFollowups("Securities", [
    { key: "sec_types", label: "What comes up most?", type: "multiselect", options: ["Public offerings & disclosure", "Private placements", "Regulatory filings & compliance", "Enforcement / investigations", "Other"] },
    { key: "sec_clients", label: "Client type?", type: "dropdown", options: ["Public companies", "Private companies / startups", "Investment funds", "Other"] },
  ]),
  ...areaFollowups("Tax", [
    { key: "tax_focus", label: "Primary focus?", type: "dropdown", options: ["Planning & structuring", "Controversy / audit defense", "Transactional (deal-related)", "Compliance & filings"] },
    { key: "tax_clients", label: "Client type?", type: "dropdown", options: ["Individuals", "Businesses", "Both"] },
  ]),
  ...areaFollowups("Trusts & estates", [
    { key: "tre_types", label: "What comes up most?", type: "multiselect", options: ["Wills & trusts drafting", "Probate & estate administration", "Guardianship / conservatorship", "Tax planning", "Other"] },
    { key: "tre_clients", label: "Typical client?", type: "dropdown", options: ["High-net-worth individuals", "General / middle-market families", "Business succession planning", "Mixed"] },
  ]),
  ...areaFollowups("Workers' compensation", [
    { key: "wc_side", label: "Which side?", type: "dropdown", options: ["Claimant / employee side", "Employer / carrier defense", "Both"] },
    { key: "wc_types", label: "What comes up most?", type: "multiselect", options: ["Initial claims & benefits disputes", "Return-to-work / settlement negotiations", "Appeals / hearings", "Other"] },
  ]),
];

// ─── Page 1: the practice ────────────────────────────────────────────────────
const PRACTICE: IndustryBranch = {
  stepTitle: "Your Legal Practice",
  stepSubtitle:
    "What kind of law the agent is reading. This sets what it may assume before anything else.",
  stepLabel: "Practice",
  fields: [
    // "Who will the agent work for?" (a firm, in-house, solo, a business with no lawyer on
    // staff) was here and is gone, David's call. `s.legal_context` is no longer asked; nothing
    // downstream read it by name, so nothing else changes.
    {
      key: "practice_areas",
      label: "What are your primary practice areas?",
      type: "multiselect",
      options: PRACTICE_AREA_OPTIONS,
      helper: "Select what you actually practice. Each one opens a couple of quick follow-up questions specific to it.",
    },

    // ─── One small follow-up group per area, not one shared essay ───────────
    //
    // This used to be a single combined textarea asking about every ticked area at once. That
    // fixed an earlier problem (twelve near-identical conditional textareas, one per area, which
    // read as six long-form essays in a row for anyone who ticked six) by merging them into one
    // free-text box. It solved the repetition and lost the structure: a plaintiff-side PI firm
    // and an insurance defense shop both just wrote paragraphs, and nothing forced either of them
    // to say the one thing that actually splits their agent's brief - which side they act for,
    // and what kind of matter it actually is.
    //
    // So this goes back to per-area questions, but as short, structured picks (dropdown or
    // multiselect, one or two per area) rather than essays - the splits an agent cannot guess
    // (plaintiff or defense, employer or employee, buyer or seller side) asked directly, not
    // fished for in a paragraph. Still conditional, still `showIf`-gated on the exact area, so
    // ticking two areas shows four to six short questions, not the whole list.
    //
    // "Other" gets one small catch-all textarea instead of structured fields - there is no fixed
    // set of questions for a practice area not on the list, so the same free-text escape hatch
    // the old field gave everyone now belongs only to the one option that actually needs it.
    ...PRACTICE_AREA_FOLLOWUPS,
    {
      key: "practice_areas_other_detail",
      label: "You ticked \"Other\". What kind of work is it?",
      type: "textarea",
      placeholder: "e.g. entertainment and media contracts, mostly talent agreements and content licensing.",
      showIf: { key: "practice_areas", includes: "Other" },
    },
    // "Describe your business" moved down here from its own generic page, David's call - it
    // reads better right after practice areas than as its own page beforehand. Relabeled
    // "Describe your practice" for the same reason the name field says "Firm Name" instead of
    // "Company / business name" - a law firm's own word for itself, not the generic one. See
    // ROLE_INTAKES.legal's `businessDescField`/`dropPages` in OnboardingForm.tsx, which points
    // buildData at this field instead of the generic page's and removes that page from the flow.
    {
      key: "business_desc",
      label: "Describe your practice",
      type: "textarea",
      required: true,
      placeholder: "We help [who] do [what] by [how]...",
      helper: "Who do you serve, and what do you deliver for them?",
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
      label: "Which tools do your documents and files live in?",
      type: "multiselect",
      options: [
        "Word / Microsoft 365",
        "Google Docs",
        "DocuSign",
        "Ironclad",
        "ContractPodAi",
        "Clio",
        "MyCase",
        "PracticePanther",
        "Filevine",
        "NetDocuments",
        "iManage",
        "SharePoint",
        "Email and folders",
        "Other",
      ],
    },
  ],
};

// ─── Pages 3-5: legal technology ─────────────────────────────────────────────
// WHAT MAKES A LAW FIRM DIFFERENT FROM ANY OTHER BUSINESS ANSWERING "which tools do you use":
// legal research, legal-specific AI, email, and how deadlines and conflicts get tracked. A
// generic tech-stack question (CRM, billing, email, in the same shape every other role intake
// asks) treats a law firm like any other services business and asks nothing that couldn't apply
// to a plumber's CRM. These three exist because the answers change what the agent can actually
// plug into and what it must never confuse itself with.
//
// Three pages now rather than one, David's call - each one is short, but they cover different
// ground (what the agent researches with, what it connects to, what it has to be careful with),
// and cramming all three onto one page under a single "Technology" heading read as thinner than
// three pages each worth their own beat.

const TECH_RESEARCH: IndustryBranch = {
  stepTitle: "Legal Research & AI Tools",
  stepSubtitle: "What you already use for research, so your agent complements it instead of duplicating it.",
  stepLabel: "Research Tools",
  fields: [
    {
      key: "legal_research_tools",
      label: "Which legal research or AI tools do you already use?",
      type: "multiselect",
      options: [
        "Westlaw",
        "LexisNexis / Lexis+ AI",
        "Bloomberg Law",
        "vLex",
        "Fastcase",
        "Casetext / CoCounsel",
        "Harvey",
        "Spellbook",
        "Litera",
        "Clio Duo",
        "Relativity (e-discovery)",
        "None yet",
        "Other",
      ],
      helper: "So your agent complements what you already pay for rather than duplicating it, and knows what it is allowed to pull citations from.",
    },
    {
      key: "ai_comfort",
      label: "Where is your team with AI tools generally?",
      type: "dropdown",
      options: [
        "Early exploration, still getting a feel for it",
        "Regular use for specific tasks",
        "Deeply integrated into how we already work",
        "Cautious, and want to move slowly",
      ],
      helper: "Sets how much you want to review at first versus how much the agent can just get on with.",
    },
  ],
};

const TECH_COMMS: IndustryBranch = {
  stepTitle: "Email & Calendar",
  stepSubtitle: "What this connects to first - the platform, not a specific address.",
  stepLabel: "Email & Calendar",
  fields: [
    {
      key: "email_platform",
      label: "What email and calendar software does the firm run on?",
      type: "radio",
      options: ["Microsoft 365 / Outlook", "Google Workspace", "Other", "Not sure yet"],
      helper: "This is what your agent's inbox and calendar connections point at during setup.",
    },
    {
      key: "scheduling_tool",
      label: "Does your calendar sync with a client-facing scheduling tool?",
      type: "dropdown",
      options: ["Yes, Calendly or similar", "No, scheduling is handled manually", "Not sure"],
    },
  ],
};

const TECH_DOCKETING: IndustryBranch = {
  stepTitle: "Deadlines & Conflicts",
  stepSubtitle: "A missed deadline or an unchecked conflict is not a typo, it is a malpractice exposure - worth knowing exactly what stands between you and one before the agent adds a second set of hands to the process.",
  stepLabel: "Deadlines & Conflicts",
  fields: [
    {
      key: "docketing",
      label: "How do you track deadlines and conflicts today?",
      type: "dropdown",
      options: [
        "A dedicated docketing / conflicts system",
        "Built into our practice management software",
        "Calendar and spreadsheets",
        "Nothing formal yet",
      ],
    },
    {
      key: "docketing_help",
      label: "What would you want the agent to help with here?",
      type: "multiselect",
      options: [
        "Flagging upcoming deadlines before they're close",
        "Running conflict checks against new intake",
        "Sending renewal or statute-of-limitations reminders",
        "Nothing yet, still evaluating",
      ],
      helper: "Names the actual job, not just the current state of things.",
    },
  ],
};

// ─── Page 6: what the agent owns ─────────────────────────────────────────────
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
        "First-pass review of incoming contracts and redlines",
        "Drafting from your templates and precedent library",
        "Redlining the other side's paper against your playbook",
        "Plain-English summaries for clients or colleagues",
        "Clause and precedent lookup across your own matter history",
        "Key dates, deadlines, and renewal tracking",
        "Conflict checks on new intake",
        "Client intake and correspondence (non-privileged)",
        "Legal research memos and case law summaries",
        "Discovery review and document organization",
        "Billing narratives and time entry cleanup",
      ],
      helper: "Specific beats broad. \"Contract review\" covers a lot of ground - the more of these you tick, the less your agent has to guess where it's actually useful versus just busy.",
    },
    // review_authority and handoff_line used to sit here - a dropdown on how the agent's drafts
    // get reviewed, and a required essay on where a licensed attorney must take over. Both are
    // gone, David's call: the boundary they asked about is not a per-firm preference, it is the
    // same standard for every Law Agent, so it is no longer a question - see ROLE_INTAKES.legal's
    // `standardGuard` in OnboardingForm.tsx, which writes that line into every build directly.
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
export const LEGAL_BRANCH: IndustryBranch[] = [PRACTICE, DOCUMENTS, TECH_RESEARCH, TECH_COMMS, TECH_DOCKETING, AGENT];
