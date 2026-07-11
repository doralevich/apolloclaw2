// Post-purchase setup questionnaire for the paid agents: a shared business core plus one
// role-specific module per agent type. Rendered by /onboard/[agent] right after checkout
// (while the agent provisions) and written into the instance as USER.md, so the agent's
// first conversation already knows the business.
//
// This is deliberately SEPARATE from the deep sales questionnaire at /onboard — that one
// feeds the pipeline; this one configures a purchased agent. Keep it ~10 minutes.
//
// Imported by both the client form and the server (USER.md builder) — no "server-only".

export interface SetupQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export const CORE_QUESTIONS: SetupQuestion[] = [
  { id: "business_name", label: "Business name", type: "text", required: true },
  { id: "website", label: "Website", type: "text", placeholder: "https://" },
  { id: "industry", label: "What does the business do?", type: "textarea", required: true, placeholder: "One or two sentences — what you sell, who buys it." },
  {
    id: "team_size",
    label: "Team size",
    type: "select",
    options: ["Just me", "2–10", "11–50", "51–200", "200+"],
  },
  {
    id: "tools",
    label: "What tools does the business run on?",
    type: "textarea",
    placeholder: "Email, calendar, CRM, accounting, project management...",
  },
  {
    id: "communication_style",
    label: "How should your agent communicate?",
    type: "select",
    options: [
      "Direct and brief",
      "Warm and conversational",
      "Formal and detailed",
      "Match how I write",
    ],
  },
  {
    id: "top_priority",
    label: "What's the single most valuable thing this agent could take off your plate?",
    type: "textarea",
    required: true,
  },
];

export const AGENT_MODULES: Record<string, { title: string; questions: SetupQuestion[] }> = {
  ceo: {
    title: "About your day",
    questions: [
      {
        id: "inbox_volume",
        label: "Daily email volume",
        type: "select",
        options: ["Under 25", "25–75", "75–150", "150+"],
      },
      {
        id: "meeting_load",
        label: "Meetings per week",
        type: "select",
        options: ["Under 5", "5–15", "15–30", "30+"],
      },
      { id: "assistant_now", label: "Who handles your inbox/calendar today?", type: "text", placeholder: "Me / an EA / nobody, it's chaos" },
      { id: "recurring", label: "Recurring commitments the agent should protect or track", type: "textarea", placeholder: "Weekly leadership meeting, monthly investor update, gym at 6..." },
      { id: "escalation", label: "What must ALWAYS reach you directly, untouched?", type: "textarea", placeholder: "Anything from the board, key customers, family..." },
    ],
  },
  cfo: {
    title: "About your finances",
    questions: [
      { id: "accounting_stack", label: "Accounting platform", type: "text", placeholder: "QuickBooks, Xero, spreadsheets..." },
      {
        id: "revenue_model",
        label: "Revenue model",
        type: "select",
        options: ["Subscriptions / recurring", "One-time sales", "Services / billable time", "Mix of these"],
      },
      {
        id: "reporting_cadence",
        label: "How often do you want financials reported?",
        type: "select",
        options: ["Weekly", "Monthly", "Quarterly", "Only when I ask"],
      },
      { id: "fundraising", label: "Fundraising or debt plans in the next 12 months?", type: "text", placeholder: "Raising a seed round in Q4 / no plans" },
      { id: "key_metrics", label: "The 3–5 numbers you care about most", type: "textarea", placeholder: "MRR, burn, runway, gross margin..." },
    ],
  },
  legal: {
    title: "About your contracts",
    questions: [
      {
        id: "contract_types",
        label: "Contracts you handle most",
        type: "multiselect",
        options: ["NDAs", "MSAs / service agreements", "Employment / contractor", "Vendor agreements", "Leases", "Privacy / terms of service"],
      },
      { id: "jurisdiction", label: "Primary state / jurisdiction", type: "text", required: true },
      { id: "templates", label: "Do you have existing templates the agent should follow?", type: "text", placeholder: "Yes, I'll upload them / no, start fresh" },
      {
        id: "review_volume",
        label: "Contracts reviewed per month",
        type: "select",
        options: ["1–5", "5–20", "20–50", "50+"],
      },
      { id: "counsel", label: "Do you have outside counsel the agent should defer to?", type: "text", placeholder: "Firm name / no" },
    ],
  },
  medical: {
    title: "About your practice",
    questions: [
      { id: "practice_type", label: "Practice type and specialty", type: "text", required: true, placeholder: "Family medicine clinic, 3 providers" },
      { id: "ehr", label: "EHR / practice management software", type: "text", placeholder: "Epic, Athena, SimplePractice..." },
      {
        id: "admin_pain",
        label: "Biggest administrative pain",
        type: "multiselect",
        options: ["Insurance / billing prep", "Scheduling", "Patient communications", "Records organization", "Literature keeping-up"],
      },
      { id: "patient_channels", label: "How do you communicate with patients?", type: "text", placeholder: "Portal, email, SMS, phone" },
      { id: "phi_note", label: "Anything the agent should know about how you handle patient data?", type: "textarea", placeholder: "We never email PHI; portal only..." },
    ],
  },
  insurance: {
    title: "About your book",
    questions: [
      {
        id: "lines",
        label: "Lines you write",
        type: "multiselect",
        options: ["Personal P&C", "Commercial P&C", "Life", "Health", "Medicare", "Specialty"],
      },
      { id: "carriers", label: "Main carriers and AMS/rater tools", type: "textarea", placeholder: "Carriers you quote most; EZLynx, Applied, HawkSoft..." },
      {
        id: "book_size",
        label: "Clients in your book",
        type: "select",
        options: ["Under 100", "100–500", "500–2,000", "2,000+"],
      },
      { id: "renewals", label: "How do renewals work today?", type: "textarea", placeholder: "Who tracks them, when clients get contacted..." },
      { id: "quoting", label: "What does your quoting workflow look like?", type: "textarea" },
    ],
  },
  realestate: {
    title: "About your deals",
    questions: [
      {
        id: "role",
        label: "Your role",
        type: "select",
        options: ["Agent / realtor", "Broker", "Investor", "Buyer or seller", "Property manager"],
      },
      { id: "market", label: "Primary market / area", type: "text", required: true, placeholder: "Austin metro, South Florida..." },
      {
        id: "volume",
        label: "Transactions per year",
        type: "select",
        options: ["1–5", "5–15", "15–40", "40+"],
      },
      { id: "re_tools", label: "MLS, CRM, and marketing tools you use", type: "text", placeholder: "MLS, Follow Up Boss, Canva..." },
      { id: "investing", label: "If you invest: what do you buy and what numbers matter?", type: "textarea", placeholder: "Small multifamily; cap rate and cash-on-cash..." },
    ],
  },
  sales: {
    title: "About your pipeline",
    questions: [
      { id: "offer", label: "What do you sell, and at what price point?", type: "textarea", required: true },
      { id: "icp", label: "Who's your ideal customer?", type: "textarea", required: true, placeholder: "Title, company size, industry, the pain that makes them buy." },
      { id: "crm", label: "CRM", type: "text", placeholder: "HubSpot, Salesforce, Pipedrive, spreadsheet..." },
      {
        id: "channels",
        label: "Outbound channels you use",
        type: "multiselect",
        options: ["Cold email", "LinkedIn", "Cold calls", "Referrals", "Inbound / content", "Events"],
      },
      {
        id: "cycle",
        label: "Typical sales cycle",
        type: "select",
        options: ["Same week", "2–4 weeks", "1–3 months", "3+ months"],
      },
    ],
  },
};

export function setupQuestionsFor(agentTypeId: string): { core: SetupQuestion[]; module?: { title: string; questions: SetupQuestion[] } } {
  return { core: CORE_QUESTIONS, module: AGENT_MODULES[agentTypeId] };
}
