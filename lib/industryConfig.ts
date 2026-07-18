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
