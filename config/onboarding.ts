// Post-purchase setup questionnaire for the paid agents: a shared business core plus one
// role-specific module per agent type. Rendered by /onboard/[agent] right after checkout
// (while the agent provisions) and written into the instance as USER.md, so the agent's
// first conversation already knows the business.
//
// The bar for every question: would a $4,500 executive hire ask this in their first
// meeting? Each module aims to capture (1) the real work the agent will own, (2) how the
// buyer operates and decides, and (3) the boundaries — what the agent must never do
// without asking. Generic "list your tools" filler doesn't belong here.
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
  { id: "industry", label: "What does the business do?", type: "textarea", required: true, placeholder: "One or two sentences — what you sell, who buys it, and how you make money." },
  {
    id: "team_size",
    label: "Team size",
    type: "select",
    options: ["Just me", "2–10", "11–50", "51–200", "200+"],
  },
  {
    id: "tools",
    label: "What tools does the business run on?",
    type: "multiselect",
    options: [
      "Google Workspace",
      "Microsoft 365",
      "Slack",
      "Zoom",
      "Salesforce",
      "HubSpot",
      "QuickBooks",
      "Xero",
      "Notion",
      "Asana / ClickUp / Monday",
      "Shopify",
      "Stripe / Square",
    ],
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
    placeholder: "Be specific — the task, how often it happens, and why it hurts.",
  },
  {
    id: "week_one",
    label: "What should your agent take over in its first week?",
    type: "textarea",
    required: true,
    placeholder: "The first concrete win. e.g. Draft every client follow-up, build our budget model, review the vendor contracts sitting in my inbox...",
  },
  {
    id: "never_without_asking",
    label: "What should it NEVER do without checking with you first?",
    type: "textarea",
    placeholder: "e.g. Send anything to a client, commit to dates or prices, touch anything involving the board...",
  },
  {
    id: "regulations",
    label: "Are there regulations your business must follow?",
    type: "multiselect",
    options: [
      "HIPAA (healthcare)",
      "PCI-DSS (payments)",
      "GDPR (EU data)",
      "CCPA (California)",
      "SOC 2",
      "FINRA / SEC",
      "State bar / professional ethics rules",
      "None / not sure",
    ],
  },
];

// Step 2 — the personal/family/life context carried over from the original /onboard
// questionnaire. All optional: it shapes how the agent fits the owner's life (what it
// protects, when it stays quiet), not whether it can do the job.
export const PERSONAL_QUESTIONS: SetupQuestion[] = [
  {
    id: "life_stage",
    label: "Where are you in the journey?",
    type: "select",
    options: [
      "Building - early, grinding hard",
      "Scaling - growing fast, feeling stretched",
      "Optimizing - established, refining",
      "Exiting - preparing to sell or step back",
      "Pivoting - changing direction",
      "Surviving - navigating a hard period",
    ],
  },
  {
    id: "work_rhythm",
    label: "How does work fit your life?",
    type: "select",
    options: [
      "I work from home full-time",
      "I have a separate office outside the home",
      "I split time between home and office",
      "I travel frequently / location-independent",
      "My family is involved in the business",
    ],
  },
  {
    id: "family_context",
    label: "Family and life context your agent should respect",
    type: "textarea",
    placeholder: "Kids' schedules, a spouse in the business, aging parents, Fridays off — whatever shapes your time.",
  },
  {
    id: "protecting",
    label: "What are you protecting — the non-negotiables?",
    type: "textarea",
    placeholder: "Dinner with the family, weekends, your health, time to think. Your agent defends these.",
  },
  {
    id: "three_year",
    label: "Where do you want to be in 3 years?",
    type: "textarea",
    placeholder: "Sell the business, run it without you, double revenue, buy back your time...",
  },
];

export const AGENT_MODULES: Record<string, { title: string; questions: SetupQuestion[] }> = {
  ceo: {
    title: "How your day actually runs",
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
      { id: "assistant_now", label: "Who handles your inbox and calendar today?", type: "text", placeholder: "Me / an EA / nobody, it's chaos" },
      { id: "vips", label: "Who are the people that always get through — and who handles the rest?", type: "textarea", required: true, placeholder: "Co-founder, board members, top 3 clients by name. Everyone else can wait a day." },
      { id: "recurring", label: "Recurring commitments the agent must protect or track", type: "textarea", placeholder: "Monday leadership meeting, monthly investor update, kids' pickup at 5, gym..." },
      { id: "decision_style", label: "How do you like decisions brought to you?", type: "select", options: ["Give me a recommendation and the reason", "Give me 2–3 options with trade-offs", "Give me the raw facts, I'll decide", "Just handle it and tell me after"] },
      { id: "dropped_balls", label: "What's falling through the cracks right now?", type: "textarea", required: true, placeholder: "Follow-ups that die, intros never made, promises to the team you forget..." },
    ],
  },
  cfo: {
    title: "Your numbers, honestly",
    questions: [
      { id: "accounting_stack", label: "Accounting platform and who keeps the books", type: "text", required: true, placeholder: "QuickBooks + outside bookkeeper / Xero, I do it myself / spreadsheets" },
      {
        id: "revenue_model",
        label: "Revenue model",
        type: "select",
        options: ["Subscriptions / recurring", "One-time sales", "Services / billable time", "Mix of these"],
      },
      { id: "financial_picture", label: "Rough financial picture — revenue, margins, cash", type: "textarea", required: true, placeholder: "e.g. ~$80k/mo revenue, ~40% margin, 6 months of cash. Ballpark is fine — your agent works with what you give it." },
      { id: "key_metrics", label: "The 3–5 numbers you check (or know you should check)", type: "textarea", required: true, placeholder: "MRR, burn, runway, gross margin, AR over 30 days..." },
      { id: "money_decision", label: "What's the biggest money decision on your desk in the next 90 days?", type: "textarea", placeholder: "A hire, a raise, a price change, an equipment purchase, cutting a vendor..." },
      {
        id: "reporting_cadence",
        label: "How often do you want financials reported to you?",
        type: "select",
        options: ["Weekly", "Monthly", "Quarterly", "Only when I ask"],
      },
      { id: "numbers_blindspot", label: "Where do the numbers surprise you or go dark?", type: "textarea", placeholder: "e.g. I never know true project profitability. Cash dips I don't see coming. What we actually spend on software." },
    ],
  },
  legal: {
    title: "Your legal work, specifically",
    questions: [
      {
        id: "practice_context",
        label: "Which best describes you?",
        type: "select",
        options: [
          "I run a law firm / I'm an attorney",
          "In-house legal or legal operations",
          "Business owner handling my own legal",
          "Other professional working with legal documents",
        ],
      },
      {
        id: "practice_areas",
        label: "Practice / legal areas you work in",
        type: "multiselect",
        options: [
          "Litigation",
          "Corporate / M&A",
          "Contracts / Commercial",
          "Real estate",
          "Employment / Labor",
          "Bankruptcy",
          "Estate planning / Probate",
          "Family law",
          "Immigration",
          "IP / Trademark",
          "Personal injury",
          "Criminal defense",
        ],
      },
      {
        id: "legal_software",
        label: "Legal software you use",
        type: "multiselect",
        options: [
          "Clio",
          "MyCase",
          "PracticePanther",
          "Smokeball",
          "Filevine",
          "Westlaw / LexisNexis",
          "NetDocuments / iManage",
          "DocuSign / Adobe Sign",
          "None of these",
        ],
      },
      { id: "entity", label: "Business structure and where it's registered", type: "text", placeholder: "Delaware C-corp / Florida LLC / FL PLLC law firm..." },
      { id: "jurisdiction", label: "States / jurisdictions where you practice or do business", type: "text", required: true, placeholder: "Licensed in FL and GA / operating in TX, customers nationwide" },
      {
        id: "review_volume",
        label: "Matters or contracts touched per month",
        type: "select",
        options: ["1–5", "5–20", "20–50", "50+"],
      },
      { id: "high_stakes", label: "Describe the highest-stakes matter or agreement on your desk right now", type: "textarea", required: true, placeholder: "The case going to mediation, the client contract that's 40% of revenue, the lease you're negotiating..." },
      { id: "redlines", label: "Terms you always push back on — and terms you'll never accept", type: "textarea", required: true, placeholder: "e.g. No unlimited liability, no auto-renewals over 12 months, IP stays ours, payment net-30 max. This becomes your agent's drafting playbook." },
      { id: "templates", label: "Do you have templates, forms, or past documents the agent should learn from?", type: "text", placeholder: "Yes — our MSA, NDA, and engagement letter / no, start from scratch" },
      { id: "counsel", label: "Who gets the call when something needs a licensed attorney's sign-off?", type: "text", placeholder: "Me — I'm the attorney / Smith & Assoc. for anything over $50k / no counsel currently" },
      { id: "obligations", label: "What deadlines, renewals, or filing dates are you tracking in your head right now?", type: "textarea", placeholder: "Office lease renews in March, discovery deadline June 2, contractor agreements expire year-end..." },
    ],
  },
  medical: {
    title: "Your practice, day to day",
    questions: [
      { id: "practice_type", label: "Practice type, specialty, and size", type: "text", required: true, placeholder: "Family medicine, 3 providers + 4 staff / solo dermatology practice" },
      { id: "ehr", label: "EHR / practice management software", type: "text", placeholder: "Epic, Athena, SimplePractice..." },
      {
        id: "admin_pain",
        label: "Where does admin time actually go?",
        type: "multiselect",
        options: ["Insurance / billing prep", "Prior authorizations", "Scheduling", "Patient communications", "Records and documentation", "Referral coordination", "Staying current on literature"],
      },
      { id: "clinical_time_thief", label: "What administrative work steals the most clinical time?", type: "textarea", required: true, placeholder: "The task that keeps providers charting at 9pm or the front desk underwater." },
      { id: "patient_channels", label: "How do you communicate with patients, and in what tone?", type: "textarea", placeholder: "Portal + phone. Warm but efficient. Spanish for about a third of our panel." },
      { id: "payers", label: "Main insurance payers you bill", type: "text", placeholder: "Medicare, BCBS, Aetna, self-pay..." },
      { id: "phi_rules", label: "Your rules for patient data — where it may and may not go", type: "textarea", required: true, placeholder: "e.g. PHI stays in the EHR and portal only; never in email; the agent works with de-identified summaries." },
    ],
  },
  insurance: {
    title: "Your book, your carriers, your process",
    questions: [
      {
        id: "lines",
        label: "Lines you write",
        type: "multiselect",
        options: ["Personal P&C", "Commercial P&C", "Life", "Health", "Medicare", "Specialty"],
      },
      { id: "carriers", label: "Carriers you quote most, and your AMS / rater", type: "textarea", required: true, placeholder: "Progressive, Travelers, Chubb for commercial; EZLynx for rating; HawkSoft AMS." },
      {
        id: "book_size",
        label: "Clients in your book",
        type: "select",
        options: ["Under 100", "100–500", "500–2,000", "2,000+"],
      },
      { id: "ideal_client", label: "Describe your most profitable client — the one you want more of", type: "textarea", required: true, placeholder: "e.g. Small contractors, 5–20 employees, bundled GL + auto + umbrella, renews without shopping." },
      { id: "renewals", label: "Walk through your renewal process — and where it breaks down", type: "textarea", required: true, placeholder: "Who pulls the renewal list, when clients get contacted, which ones slip through." },
      { id: "quoting", label: "What does quoting look like from request to bound?", type: "textarea", placeholder: "Intake, which raters, how proposals are presented, typical turnaround." },
      { id: "client_confusion", label: "What do clients misunderstand most about their coverage?", type: "textarea", placeholder: "The explanations you give over and over — your agent will take those." },
    ],
  },
  realestate: {
    title: "Your market and your deals",
    questions: [
      {
        id: "role",
        label: "Your role",
        type: "select",
        options: ["Agent / realtor", "Broker", "Investor", "Buyer or seller", "Property manager"],
      },
      { id: "market", label: "Primary market, niche, and price band", type: "text", required: true, placeholder: "Austin metro, single-family $400–800k / South FL luxury condos / small multifamily" },
      {
        id: "volume",
        label: "Transactions per year",
        type: "select",
        options: ["1–5", "5–15", "15–40", "40+"],
      },
      { id: "re_tools", label: "MLS, CRM, and marketing tools", type: "text", placeholder: "MLS, Follow Up Boss, Canva, Zillow Premier..." },
      { id: "pipeline_now", label: "What's in your pipeline right now?", type: "textarea", required: true, placeholder: "3 active listings, 2 buyers under contract, 40 leads from the spring open houses going cold..." },
      { id: "deal_friction", label: "Which part of a transaction goes sideways most often?", type: "textarea", required: true, placeholder: "Inspection negotiations, lender delays, listing prep, keeping sellers informed..." },
      { id: "followup_today", label: "What does your follow-up actually look like today?", type: "textarea", placeholder: "Honest answer — who follows up, how fast, and where leads die." },
      { id: "investing", label: "If you invest: what do you buy and what numbers make you say yes?", type: "textarea", placeholder: "Small multifamily; 7%+ cap, $200+/door cash flow; I walk from anything needing a roof." },
    ],
  },
  sales: {
    title: "Your pipeline and how you win",
    questions: [
      { id: "offer", label: "What do you sell, at what price, and what does the buyer get?", type: "textarea", required: true },
      { id: "icp", label: "Your ideal customer — and the pain that makes them buy", type: "textarea", required: true, placeholder: "Title, company size, industry, and the moment they realize they need you." },
      { id: "crm", label: "CRM and how religiously it's kept up", type: "text", placeholder: "HubSpot, updated weekly / Salesforce, honestly a mess / spreadsheet" },
      {
        id: "channels",
        label: "Where your deals actually come from",
        type: "multiselect",
        options: ["Cold email", "LinkedIn", "Cold calls", "Referrals", "Inbound / content", "Events"],
      },
      {
        id: "cycle",
        label: "Typical sales cycle",
        type: "select",
        options: ["Same week", "2–4 weeks", "1–3 months", "3+ months"],
      },
      { id: "best_pitch", label: "Your best-performing pitch or message — paste it", type: "textarea", required: true, placeholder: "The email, opener, or one-liner that gets replies. Your agent writes in this voice, not generic sales-speak." },
      { id: "objections", label: "The top 3 objections you hear, and how you answer them today", type: "textarea", required: true, placeholder: "'Too expensive' → ... 'We already have X' → ... 'Not right now' → ..." },
      { id: "pipeline_leak", label: "Where does your pipeline leak?", type: "textarea", placeholder: "Leads that never get a second touch, proposals that go quiet, demos that don't close..." },
    ],
  },
};

export interface SetupSection {
  title: string;
  subtitle: string;
  questions: SetupQuestion[];
}

/** The full wizard for an agent type: business core -> personal context -> role module. */
export function setupSectionsFor(agentTypeId: string, agentLabel: string): SetupSection[] {
  const module = AGENT_MODULES[agentTypeId];
  return [
    {
      title: "Tell us about your business",
      subtitle: "Everything here goes straight to your agent — the more real detail, the more useful its first day.",
      questions: CORE_QUESTIONS,
    },
    {
      title: "About you (optional)",
      subtitle: "Your agent works for a person, not just a business. Skip anything you'd rather not share.",
      questions: PERSONAL_QUESTIONS,
    },
    ...(module
      ? [{ title: module.title, subtitle: `The specifics that make your ${agentLabel} actually yours.`, questions: module.questions }]
      : []),
  ];
}
