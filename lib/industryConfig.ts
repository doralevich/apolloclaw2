// lib/industryConfig.ts
// Apollo[Claw] onboarding - industry branch definitions.
// One config object, keyed by the industry value chosen on Step 2.
// The dynamic Step 4 ("Industry Deep-Dive") renders whichever branch matches
// the PRIMARY company's industry. Answers save into the industry_details JSONB column.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

export type FieldType =
  | "dropdown"
  | "multiselect"
  | "radio"
  | "scale"
  | "text"
  | "textarea";

export interface IndustryField {
  key: string; // becomes the key inside industry_details JSONB
  label: string;
  type: FieldType;
  options?: string[]; // dropdown | multiselect | radio
  placeholder?: string; // text | textarea
  required?: boolean;
  helper?: string; // small grey subtext under the label
}

export interface IndustryBranch {
  stepTitle: string; // e.g. "Your Law Practice"
  stepSubtitle: string;
  fields: IndustryField[];
}

// Step 2 industry dropdown. Note the Finance/Accounting/Legal split into three.
export const INDUSTRY_OPTIONS: string[] = [
  "E-commerce / Retail",
  "Professional Services",
  "Healthcare / Medical",
  "Real Estate",
  "SaaS / Software",
  "Marketing / Ad Agency",
  "Legal",
  "Accounting / CPA",
  "Financial Services / RIA",
  "Hospitality / Food & Beverage",
  "Education / Coaching",
  "Manufacturing / Logistics",
  "Construction / Trades",
  "Non-profit",
  "Consulting",
  "Media / Entertainment",
  "Other",
];

export const industryConfig: Record<string, IndustryBranch> = {
  "Healthcare / Medical": {
    stepTitle: "Your Practice",
    stepSubtitle: "A few specifics so your agent speaks your clinical world fluently.",
    fields: [
      {
        key: "practice_type",
        label: "Practice type",
        type: "dropdown",
        required: true,
        options: [
          "Solo practice",
          "Group practice",
          "Specialty clinic",
          "Concierge / membership medicine",
          "Med spa / aesthetics",
          "Dental",
          "Behavioral / mental health",
          "Hospital or health system",
          "Other",
        ],
      },
      {
        key: "patient_volume",
        label: "Patients seen per week",
        type: "dropdown",
        required: true,
        options: ["Under 50", "50 to 150", "150 to 300", "300+"],
      },
      {
        key: "patient_bottlenecks",
        label: "Where patients slip through the cracks",
        type: "multiselect",
        options: [
          "Scheduling and no-shows",
          "Intake and forms",
          "Insurance and billing",
          "Patient follow-up",
          "Refill / prescription requests",
          "Records requests",
          "Reviews and reputation",
        ],
      },
      {
        key: "ehr_system",
        label: "EHR / practice management system",
        type: "dropdown",
        options: [
          "Epic",
          "Athenahealth",
          "eClinicalWorks",
          "Tebra / Kareo",
          "DrChrono",
          "SimplePractice",
          "RxNT",
          "None",
          "Other",
        ],
      },
    ],
  },

  Legal: {
    stepTitle: "Your Law Practice",
    stepSubtitle: "The shape of your firm so the agent handles matters the way you do.",
    fields: [
      {
        key: "practice_areas",
        label: "Practice areas",
        type: "multiselect",
        required: true,
        options: [
          "Personal injury",
          "Family",
          "Estate planning",
          "Corporate / business",
          "Real estate",
          "Criminal",
          "Immigration",
          "IP",
          "General litigation",
          "Other",
        ],
      },
      {
        key: "firm_size",
        label: "Firm size",
        type: "dropdown",
        required: true,
        options: [
          "Solo",
          "2 to 5 attorneys",
          "6 to 15 attorneys",
          "16 to 50 attorneys",
          "50+ attorneys",
        ],
      },
      {
        key: "billing_model",
        label: "Primary billing model",
        type: "dropdown",
        required: true,
        options: ["Hourly", "Flat fee", "Contingency", "Retainer", "Hybrid"],
      },
      {
        key: "case_mgmt",
        label: "Case management system",
        type: "dropdown",
        options: [
          "Clio",
          "MyCase",
          "PracticePanther",
          "Filevine",
          "Smokeball",
          "Litify",
          "None",
          "Other",
        ],
      },
    ],
  },

  "Real Estate": {
    stepTitle: "Your Real Estate Business",
    stepSubtitle: "How you transact so the agent works your pipeline, not a generic one.",
    fields: [
      {
        key: "re_focus",
        label: "Primary focus",
        type: "dropdown",
        required: true,
        options: [
          "Residential brokerage",
          "Commercial",
          "Property management",
          "Investment / flipping",
          "Mortgage / lending",
          "Title",
          "Development",
        ],
      },
      {
        key: "transaction_volume",
        label: "Transactions per year",
        type: "dropdown",
        required: true,
        options: ["Under 10", "10 to 50", "50 to 150", "150+"],
      },
      {
        key: "re_bottlenecks",
        label: "Biggest bottleneck",
        type: "multiselect",
        options: [
          "Lead follow-up and nurture",
          "Showing scheduling",
          "Transaction coordination",
          "Listing marketing",
          "Tenant / owner comms",
          "Document management",
        ],
      },
      {
        key: "re_platform",
        label: "CRM / platform",
        type: "dropdown",
        options: [
          "Follow Up Boss",
          "kvCORE",
          "BoomTown",
          "Chime",
          "kw Command",
          "AppFolio / Buildium",
          "None",
          "Other",
        ],
      },
    ],
  },

  "Accounting / CPA": {
    stepTitle: "Your Firm",
    stepSubtitle: "How you serve clients so the agent survives busy season with you.",
    fields: [
      {
        key: "firm_type",
        label: "Firm type",
        type: "dropdown",
        required: true,
        options: [
          "Tax prep",
          "Full-service CPA",
          "Bookkeeping",
          "Fractional CFO / advisory",
          "Audit",
        ],
      },
      {
        key: "client_count",
        label: "Active client count",
        type: "dropdown",
        required: true,
        options: ["Under 50", "50 to 200", "200 to 500", "500+"],
      },
      {
        key: "cpa_bottlenecks",
        label: "Busy-season bottleneck",
        type: "multiselect",
        options: [
          "Document collection",
          "Client onboarding",
          "Deadline tracking",
          "Client questions and support",
          "Engagement letters and proposals",
          "Billing",
        ],
      },
      {
        key: "cpa_software",
        label: "Primary software",
        type: "dropdown",
        options: [
          "QuickBooks",
          "Xero",
          "UltraTax",
          "Lacerte",
          "ProConnect",
          "Drake",
          "Karbon",
          "Canopy",
          "Other",
        ],
      },
    ],
  },

  "Financial Services / RIA": {
    stepTitle: "Your Firm",
    stepSubtitle: "Your book and compliance posture so the agent stays inside the lines.",
    fields: [
      {
        key: "ria_type",
        label: "Firm type",
        type: "dropdown",
        required: true,
        options: [
          "RIA",
          "Broker-dealer",
          "Wealth management",
          "Financial planning",
          "Insurance",
        ],
      },
      {
        key: "aum_range",
        label: "Assets under management",
        type: "dropdown",
        required: true,
        options: [
          "Under $50M",
          "$50M to $250M",
          "$250M to $1B",
          "$1B+",
          "Prefer not to say",
        ],
      },
      {
        key: "ria_bottlenecks",
        label: "Biggest bottleneck",
        type: "multiselect",
        options: [
          "Client onboarding and KYC",
          "Meeting prep and notes",
          "Compliance documentation",
          "Client reporting",
          "Prospecting follow-up",
        ],
      },
      {
        key: "ria_platform",
        label: "Primary CRM / platform",
        type: "dropdown",
        options: [
          "Redtail",
          "Wealthbox",
          "Salesforce FSC",
          "Orion",
          "Black Diamond",
          "None",
          "Other",
        ],
      },
    ],
  },

  "E-commerce / Retail": {
    stepTitle: "Your Store",
    stepSubtitle: "How you sell so the agent handles the volume behind it.",
    fields: [
      {
        key: "ecom_platform",
        label: "Primary platform",
        type: "dropdown",
        required: true,
        options: [
          "Shopify",
          "WooCommerce",
          "BigCommerce",
          "Amazon",
          "Etsy",
          "Physical / POS",
          "Other",
        ],
      },
      {
        key: "sku_count",
        label: "SKU count",
        type: "dropdown",
        required: true,
        options: ["Under 50", "50 to 500", "500 to 2000", "2000+"],
      },
      {
        key: "order_volume",
        label: "Monthly order volume",
        type: "dropdown",
        required: true,
        options: ["Under 100", "100 to 500", "500 to 2000", "2000+"],
      },
      {
        key: "ecom_bottlenecks",
        label: "Biggest bottleneck",
        type: "multiselect",
        options: [
          "Support tickets",
          "Order and shipping status",
          "Returns and refunds",
          "Inventory questions",
          "Abandoned cart follow-up",
          "Product Q and A",
          "Review management",
        ],
      },
    ],
  },

  "Marketing / Ad Agency": {
    stepTitle: "Your Agency",
    stepSubtitle: "How your shop runs so the agent works your accounts, not a generic one.",
    fields: [
      { key: "agency_type", label: "Agency type", type: "dropdown", required: true, options: ["Full-service", "Digital / performance", "Branding / creative", "PR / communications", "Social media", "SEO / content", "Web / dev shop", "Media buying"] },
      { key: "client_load", label: "Active clients", type: "dropdown", required: true, options: ["Under 10", "10 to 25", "25 to 60", "60+"] },
      { key: "agency_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["New business and pitching", "Client reporting", "Content production", "Campaign management", "Scope creep and billing", "Team capacity", "Lead follow-up"] },
      { key: "agency_tool", label: "Primary platform", type: "dropdown", options: ["HubSpot", "Monday.com", "Asana", "ClickUp", "Airtable", "GoHighLevel", "AgencyAnalytics", "None", "Other"] },
    ],
  },

  "SaaS / Software": {
    stepTitle: "Your Product",
    stepSubtitle: "Your motion and stage so the agent fits how you grow and retain.",
    fields: [
      { key: "saas_stage", label: "Stage", type: "dropdown", required: true, options: ["Pre-revenue / MVP", "Early (under $1M ARR)", "Growth ($1M to $10M ARR)", "Scale ($10M+ ARR)"] },
      { key: "saas_motion", label: "Go-to-market motion", type: "dropdown", required: true, options: ["Product-led / self-serve", "Sales-led", "Hybrid"] },
      { key: "saas_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Onboarding and activation", "Support tickets", "Churn and retention", "Sales follow-up", "Lead qualification", "Billing and dunning", "Feature request triage"] },
      { key: "saas_tool", label: "Primary CRM / support tool", type: "dropdown", options: ["HubSpot", "Salesforce", "Intercom", "Zendesk", "Pipedrive", "Stripe Billing", "None", "Other"] },
    ],
  },

  "Professional Services": {
    stepTitle: "Your Practice",
    stepSubtitle: "How you serve clients so the agent supports your delivery.",
    fields: [
      { key: "services_type", label: "Type of practice", type: "dropdown", required: true, options: ["Consulting", "Design / creative", "Engineering / architecture", "Coaching", "Recruiting / staffing", "Other services"] },
      { key: "engagement_model", label: "Primary engagement model", type: "dropdown", required: true, options: ["Retainer", "Project-based", "Hourly", "Performance-based", "Mix"] },
      { key: "services_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Proposals and scoping", "Client onboarding", "Project delivery", "Time tracking and billing", "Lead follow-up", "Scheduling"] },
      { key: "services_tool", label: "Primary tool", type: "dropdown", options: ["HubSpot", "Monday.com", "Asana", "ClickUp", "Notion", "Dubsado / HoneyBook", "None", "Other"] },
    ],
  },

  "Hospitality / Food & Beverage": {
    stepTitle: "Your Venue",
    stepSubtitle: "How you serve guests so the agent handles the volume behind it.",
    fields: [
      { key: "hosp_type", label: "Type", type: "dropdown", required: true, options: ["Restaurant", "Bar / cafe", "Hotel / lodging", "Catering / events", "Franchise", "Multi-location group"] },
      { key: "covers_volume", label: "Weekly covers / guests", type: "dropdown", required: true, options: ["Under 500", "500 to 2000", "2000 to 5000", "5000+"] },
      { key: "hosp_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Reservations and no-shows", "Staffing and scheduling", "Reviews and reputation", "Ordering and inventory", "Guest messaging", "Loyalty and marketing"] },
      { key: "hosp_tool", label: "Primary system", type: "dropdown", options: ["Toast", "Square", "Resy / OpenTable", "Clover", "7shifts", "None", "Other"] },
    ],
  },

  "Education / Coaching": {
    stepTitle: "Your Program",
    stepSubtitle: "How you teach so the agent supports enrollment and students.",
    fields: [
      { key: "edu_type", label: "Format", type: "dropdown", required: true, options: ["1:1 coaching", "Group coaching", "Online courses", "Tutoring", "Membership / community", "Corporate training"] },
      { key: "student_volume", label: "Active students / members", type: "dropdown", required: true, options: ["Under 25", "25 to 100", "100 to 500", "500+"] },
      { key: "edu_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Enrollment and sales", "Student onboarding", "Content delivery", "Scheduling", "Support and questions", "Retention and renewals"] },
      { key: "edu_tool", label: "Primary platform", type: "dropdown", options: ["Kajabi", "Teachable", "Thinkific", "Circle", "Skool", "Calendly", "None", "Other"] },
    ],
  },

  "Manufacturing / Logistics": {
    stepTitle: "Your Operation",
    stepSubtitle: "How product moves so the agent supports orders and fulfillment.",
    fields: [
      { key: "mfg_type", label: "Type", type: "dropdown", required: true, options: ["Manufacturing", "Distribution / wholesale", "Logistics / 3PL", "Warehousing", "Import / export"] },
      { key: "mfg_volume", label: "Monthly order volume", type: "dropdown", required: true, options: ["Under 100", "100 to 1000", "1000 to 5000", "5000+"] },
      { key: "mfg_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Order processing", "Inventory management", "Quoting and RFQs", "Supplier coordination", "Shipping and tracking", "Customer service"] },
      { key: "mfg_tool", label: "Primary system", type: "dropdown", options: ["NetSuite", "SAP", "QuickBooks", "Fishbowl", "ShipStation", "None", "Other"] },
    ],
  },

  "Construction / Trades": {
    stepTitle: "Your Business",
    stepSubtitle: "How you win and run jobs so the agent keeps work moving.",
    fields: [
      { key: "trade_type", label: "Type", type: "dropdown", required: true, options: ["General contractor", "Specialty trade (HVAC / plumbing / electrical)", "Remodeling", "Roofing", "Landscaping", "Commercial construction"] },
      { key: "job_volume", label: "Jobs per month", type: "dropdown", required: true, options: ["Under 10", "10 to 30", "30 to 100", "100+"] },
      { key: "trade_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Lead follow-up and estimates", "Scheduling and dispatch", "Quoting and bids", "Invoicing and collections", "Client updates", "Crew coordination"] },
      { key: "trade_tool", label: "Primary system", type: "dropdown", options: ["ServiceTitan", "Jobber", "Housecall Pro", "Procore", "Buildertrend", "QuickBooks", "None", "Other"] },
    ],
  },

  "Non-profit": {
    stepTitle: "Your Organization",
    stepSubtitle: "How you operate so the agent supports donors and programs.",
    fields: [
      { key: "np_type", label: "Type", type: "dropdown", required: true, options: ["Charity / direct service", "Foundation / grantmaking", "Advocacy", "Faith-based", "Arts / culture", "Education"] },
      { key: "np_size", label: "Annual budget", type: "dropdown", required: true, options: ["Under $250k", "$250k to $1M", "$1M to $5M", "$5M+"] },
      { key: "np_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Donor outreach and follow-up", "Grant writing and reporting", "Volunteer coordination", "Event management", "Donor data and CRM", "Communications"] },
      { key: "np_tool", label: "Primary system", type: "dropdown", options: ["Salesforce NPSP", "Bloomerang", "DonorPerfect", "Little Green Light", "Kindful", "None", "Other"] },
    ],
  },

  "Consulting": {
    stepTitle: "Your Practice",
    stepSubtitle: "How you deliver so the agent supports clients and pipeline.",
    fields: [
      { key: "consult_type", label: "Focus", type: "dropdown", required: true, options: ["Management / strategy", "IT / technical", "Financial / advisory", "Marketing", "HR / operations", "Boutique / solo"] },
      { key: "consult_load", label: "Active clients", type: "dropdown", required: true, options: ["1 to 3", "4 to 10", "10 to 25", "25+"] },
      { key: "consult_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Proposals and pitching", "Client onboarding", "Deliverable production", "Scheduling", "Billing and time tracking", "Lead follow-up"] },
      { key: "consult_tool", label: "Primary tool", type: "dropdown", options: ["HubSpot", "Monday.com", "Notion", "Asana", "Dubsado", "None", "Other"] },
    ],
  },

  "Media / Entertainment": {
    stepTitle: "Your Media Business",
    stepSubtitle: "How you produce and monetize so the agent supports the work.",
    fields: [
      { key: "media_type", label: "Type", type: "dropdown", required: true, options: ["Creator / influencer", "Production company", "Publishing / media outlet", "Podcast / audio", "Agency / talent", "Events / live"] },
      { key: "audience_volume", label: "Audience size", type: "dropdown", required: true, options: ["Under 10k", "10k to 100k", "100k to 1M", "1M+"] },
      { key: "media_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Content production", "Scheduling and publishing", "Audience and community", "Sponsor and brand deals", "Monetization", "Analytics and reporting"] },
      { key: "media_tool", label: "Primary tool", type: "dropdown", options: ["Notion", "Airtable", "Later / Buffer", "Patreon", "ConvertKit", "None", "Other"] },
    ],
  },
};

// Generic fallback for any industry without a dedicated branch (or "Other").
export const genericBranch: IndustryBranch = {
  stepTitle: "A Bit More About Your Industry",
  stepSubtitle: "Skip if nothing here applies.",
  fields: [
    {
      key: "industry_detail",
      label: "What is unique about how your industry operates?",
      type: "textarea",
      placeholder: "Anything about your industry we should know before we build.",
    },
  ],
};

/**
 * Resolve the branch to render for the primary company's industry.
 * Returns null when the caller should skip the Industry Deep-Dive step
 * entirely (industry not chosen yet).
 */
export function getIndustryBranch(industry?: string): IndustryBranch | null {
  if (!industry) return null;
  return industryConfig[industry] ?? genericBranch;
}
