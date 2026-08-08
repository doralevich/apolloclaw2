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
  "Funeral & Memorial Services",
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
      {
        key: "clinical_staff",
        label: "Clinical and admin staff",
        type: "dropdown",
        required: true,
        options: ["Just me", "2 to 5", "6 to 15", "16 to 40", "40+"],
      },
      {
        key: "payer_mix",
        label: "Payer mix",
        type: "multiselect",
        helper: "Shapes how much of the agent's work is billing and authorization chasing.",
        options: ["Commercial insurance", "Medicare", "Medicaid", "Cash pay / self pay", "Workers' compensation", "Concierge / membership", "Grant or program funded"],
      },
      {
        key: "patient_comms",
        label: "How patients reach you",
        type: "multiselect",
        options: ["Phone", "Patient portal", "Email", "Text message", "Online booking", "Walk-in", "Referring provider"],
      },
      {
        key: "admin_burden",
        label: "How heavy is documentation and compliance right now?",
        type: "scale",
        helper: "1 is manageable, 10 is the thing keeping you late.",
      },
    ],
  },

  // Repaired, not written from scratch. The first four fields below were sitting in the
  // Healthcare branch, and this branch existed with an EMPTY fields array. Two live bugs
  // fell out of that: every medical practice was asked, as required questions, which
  // practice areas it covers (from a list starting "Personal injury, Family, Estate
  // planning") and whether it runs Clio or Filevine, with no way past the step without
  // answering nonsense; and every law firm got an Industry Deep-Dive step containing no
  // questions at all. Same fields, correct home, plus the three a firm actually needs.
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
          "Employment / labor",
          "Bankruptcy",
          "Tax",
          "Workers' compensation",
          "Mergers & acquisitions",
          "Entertainment / sports",
          "Construction",
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
      {
        key: "legal_bottlenecks",
        label: "Biggest bottleneck",
        type: "multiselect",
        helper: "Select all that apply",
        options: ["Client intake and screening", "Document drafting", "Discovery and document review", "Deadline and docket tracking", "Billing and collections", "Client updates and status", "Conflict checks", "Referral follow-up"],
      },
      {
        key: "matter_sources",
        label: "Where new matters come from",
        type: "multiselect",
        options: ["Client referrals", "Attorney referrals", "Search and web", "Paid ads", "Directories (Avvo, FindLaw)", "Speaking and writing", "Existing clients", "Court appointments"],
      },
      {
        key: "billable_target",
        label: "Billable hour expectation",
        type: "dropdown",
        helper: "Tells the agent how much of your day is already spoken for.",
        options: ["No formal target", "Under 1,200 a year", "1,200 to 1,600", "1,600 to 1,900", "1,900 to 2,200", "Over 2,200"],
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
      {
        key: "re_team",
        label: "Team shape",
        type: "dropdown",
        required: true,
        options: ["Solo", "Solo with an assistant", "Small team (2 to 5)", "Large team (6 to 20)", "Brokerage with agents under me"],
      },
      {
        key: "re_lead_sources",
        label: "Where business comes from",
        type: "multiselect",
        options: ["Referrals and sphere", "Past clients", "Portals (Zillow, Realtor.com)", "Open houses", "Paid ads", "SEO and content", "Farming and mailers", "Investor network", "Builder relationships"],
      },
      {
        key: "re_stall_points",
        label: "Where deals stall",
        type: "multiselect",
        options: ["Lead response time", "Nurturing leads that are not ready", "Showing coordination", "Contract and paperwork", "Lender and title chasing", "Inspection and repair negotiation", "Post-close follow-up"],
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
      {
        key: "cpa_seasonality",
        label: "How seasonal is the work?",
        type: "radio",
        options: ["Heavily seasonal - it all lands at once", "Somewhat seasonal", "Steady year round"],
      },
      {
        key: "cpa_service_mix",
        label: "Services you sell",
        type: "multiselect",
        options: ["Individual tax", "Business tax", "Bookkeeping", "Payroll", "Audit and assurance", "Advisory / fractional CFO", "Tax planning", "Entity setup", "IRS representation"],
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
      {
        key: "ria_households",
        label: "Households or clients served",
        type: "dropdown",
        required: true,
        options: ["Under 50", "50 to 150", "150 to 400", "400 to 1,000", "1,000+"],
      },
      {
        key: "ria_segments",
        label: "Who you serve",
        type: "multiselect",
        options: ["Mass affluent", "High net worth", "Ultra high net worth", "Business owners", "Retirees and pre-retirees", "Physicians and dentists", "Executives with equity comp", "Institutions and endowments"],
      },
      {
        key: "ria_compliance",
        label: "How much time goes to compliance?",
        type: "radio",
        options: ["Very little", "A meaningful slice of every week", "It is a role of its own"],
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
      {
        key: "ecom_channels",
        label: "Where you sell",
        type: "multiselect",
        required: true,
        options: ["Own website", "Amazon", "Walmart", "Etsy", "eBay", "TikTok Shop", "Instagram / Facebook", "Physical store", "Wholesale / B2B", "Pop-ups and markets"],
      },
      {
        key: "ecom_fulfillment",
        label: "How orders ship",
        type: "dropdown",
        options: ["In-house", "3PL", "Dropship", "Print on demand", "Mixed"],
      },
      {
        key: "ecom_support_volume",
        label: "Customer messages per week",
        type: "dropdown",
        helper: "Support volume is usually the first thing an agent can take off you.",
        options: ["Under 25", "25 to 100", "100 to 400", "400+"],
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
      {
        key: "agency_revenue_mix",
        label: "How the work is sold",
        type: "radio",
        options: ["Mostly monthly retainer", "Mostly project", "Even split", "Performance or commission based"],
      },
      {
        key: "agency_services",
        label: "What you actually deliver",
        type: "multiselect",
        options: ["Paid media", "SEO", "Content and copy", "Social management", "Email and lifecycle", "Web design and build", "Brand and creative", "PR", "Analytics and reporting", "Strategy retainers"],
      },
    ],
  },

  "SaaS / Software": {
    stepTitle: "Your Product",
    stepSubtitle: "Your motion and stage so the agent fits how you grow and retain.",
    fields: [
      // "Not applicable" on both, at David's call. Both are REQUIRED, and both assume a
      // venture-shaped software company: an ARR band assumes revenue is how you measure
      // yourself, and a go-to-market motion assumes you are selling to strangers. A studio
      // building software for clients, an internal tool, or a business whose software sits
      // beside a service had to pick something untrue to get past the step.
      { key: "saas_stage", label: "Stage", type: "dropdown", required: true, options: ["Pre-revenue / MVP", "Early (under $1M ARR)", "Growth ($1M to $10M ARR)", "Scale ($10M+ ARR)", "Not applicable"] },
      { key: "saas_motion", label: "Go-to-market motion", type: "dropdown", required: true, options: ["Product-led / self-serve", "Sales-led", "Hybrid", "Not applicable"] },
      { key: "saas_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Onboarding and activation", "Support tickets", "Churn and retention", "Sales follow-up", "Lead qualification", "Billing and dunning", "Feature request triage"] },
      { key: "saas_tool", label: "Primary CRM / support tool", type: "dropdown", options: ["HubSpot", "Salesforce", "Intercom", "Zendesk", "Pipedrive", "Stripe Billing", "None", "Other"] },
      {
        key: "saas_support",
        label: "How customers reach you",
        type: "multiselect",
        options: ["In-app chat", "Email", "Help centre", "Community / Slack", "Phone", "Dedicated CSM"],
      },
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
      {
        key: "services_clients",
        label: "Active clients",
        type: "dropdown",
        options: ["Under 10", "10 to 30", "30 to 80", "80+"],
      },
      {
        key: "services_delivery",
        label: "Where delivery gets messy",
        type: "multiselect",
        options: ["Scoping and proposals", "Kickoff and onboarding", "Status reporting", "Scope creep", "Handoffs between people", "Invoicing and collections", "Renewals"],
      },
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
      {
        key: "hosp_locations",
        label: "Locations",
        type: "dropdown",
        required: true,
        options: ["One", "2 to 3", "4 to 10", "10+"],
      },
      {
        key: "hosp_staff",
        label: "Staff on payroll",
        type: "dropdown",
        options: ["Under 10", "10 to 30", "30 to 75", "75+"],
      },
      {
        key: "hosp_channels",
        label: "Where guests come from",
        type: "multiselect",
        options: ["Walk-in", "Reservations platform", "Delivery apps", "Direct phone", "Events and catering", "Corporate accounts", "Social media", "Hotel or venue partners"],
      },
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
      {
        key: "edu_delivery",
        label: "How you teach",
        type: "multiselect",
        required: true,
        options: ["Live one to one", "Live group", "Cohort based", "Self-paced course", "Membership community", "In person", "Hybrid"],
      },
      {
        key: "edu_revenue_model",
        label: "How you charge",
        type: "dropdown",
        options: ["One-time course fee", "Monthly membership", "Per session", "Package or program fee", "Institutional contract", "Free with upsell"],
      },
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
      {
        key: "mfg_customers",
        label: "Who you sell to",
        type: "multiselect",
        options: ["Distributors", "Retailers", "Direct to consumer", "OEMs", "Government", "Contractors"],
      },
      {
        key: "mfg_supply_pain",
        label: "Where the chain hurts",
        type: "multiselect",
        options: ["Supplier lead times", "Inventory accuracy", "Quoting and RFQs", "Production scheduling", "Quality and returns", "Freight and carrier coordination", "Compliance paperwork"],
      },
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
      {
        key: "trade_crew",
        label: "Crew size",
        type: "dropdown",
        required: true,
        options: ["Just me", "2 to 5", "6 to 20", "20 to 75", "75+"],
      },
      {
        key: "trade_job_size",
        label: "Typical job value",
        type: "dropdown",
        options: ["Under $5k", "$5k to $25k", "$25k to $100k", "$100k to $1M", "$1M+"],
      },
      {
        key: "trade_pipeline",
        label: "Where jobs get lost",
        type: "multiselect",
        options: ["Answering the phone", "Estimating and bidding", "Scheduling crews", "Material ordering", "Change orders", "Subcontractor coordination", "Invoicing and collections", "Permits and inspections"],
      },
    ],
  },

  // Deathcare. Written for a monument retailer, but wide enough to cover the funeral home
  // and the cemetery on either side of one, because those three refer work to each other
  // constantly and frequently sit under the same ownership.
  //
  // What makes this trade unlike anything else in this file: the gap between a signed order
  // and a finished memorial is months, not days. That silence is where families call to ask
  // what is happening, and it is the single largest piece of work an agent can actually take
  // off this business — hence the questions on lead time and bottlenecks below.
  //
  // The customer also buried someone last week, so how far the agent may speak for the
  // business matters more here than anywhere else. That is deliberately NOT asked on this
  // form: it is a conversation to have once, in person, not a radio button a grieving
  // owner picks between questions about foundations and lettering.
  "Funeral & Memorial Services": {
    stepTitle: "Your Memorial Business",
    stepSubtitle: "How you serve families so the agent handles the wait, not just the sale.",
    fields: [
      {
        key: "memorial_business_type",
        label: "Type of business",
        type: "dropdown",
        required: true,
        options: [
          "Monument / headstone retailer",
          "Monument manufacturer or wholesaler",
          "Cemetery lettering and restoration",
          "Funeral home",
          "Funeral home with cemetery",
          "Cemetery",
          "Crematory",
          "Memorial products (bronze, urns, keepsakes)",
          "Other",
        ],
      },
      {
        // What they actually make and sell, which the type dropdown above does not capture.
        // Two businesses can both answer "monument retailer" and share almost no work: one
        // sets uprights in twenty cemeteries, the other does bronze and cremation product out
        // of a showroom. Cleaning, added dates, and commercial stone are on the list because
        // each one is a separate line of work with its own rhythm, and a shop that does them
        // has repeat contact with families and trades the agent should know about.
        key: "product_mix",
        label: "What you make and sell",
        type: "multiselect",
        required: true,
        options: [
          "Upright monuments and headstones",
          "Flat and grass markers",
          "Slant markers",
          "Bronze plaques and markers",
          "Mausoleums and private estates",
          "Columbarium niches",
          "Memorial benches",
          "Cremation urns and keepsakes",
          "Pet memorials",
          "Veteran and civic markers",
          "Lettering and dates on existing memorials",
          "Cleaning and restoration",
          "Custom etching and portraits",
          "Signage, countertops, or other stone work",
          "Other",
        ],
      },
      {
        key: "annual_volume",
        label: "Families served in a year",
        type: "dropdown",
        required: true,
        helper: "Orders, calls, or interments, whichever number you actually track.",
        options: ["Under 50", "50 to 200", "200 to 500", "500 to 1,500", "1,500+"],
      },
      {
        key: "at_need_vs_pre_need",
        label: "At-need and pre-need split",
        type: "radio",
        required: true,
        helper: "These are two different businesses. One is a week, the other is years.",
        options: [
          "Almost all at-need",
          "Mostly at-need, some pre-need",
          "An even mix",
          "Pre-need is a major part of what we sell",
        ],
      },
      {
        key: "memorial_bottlenecks",
        label: "Biggest bottleneck",
        type: "multiselect",
        options: [
          "Answering the first call or inquiry",
          "Design proofs and revisions",
          "Cemetery rules, permits, and specifications",
          "Foundation and setting schedules",
          "Supplier and quarry lead times",
          "Deposits and final payment",
          "Keeping families updated between order and installation",
          "Added dates and lettering on existing memorials",
          "Reviews and reputation",
        ],
      },
      {
        key: "install_lead_time",
        label: "Weeks from signed order to memorial in place",
        type: "dropdown",
        helper: "The stretch where families go quiet and start wondering.",
        options: [
          "Under 4",
          "4 to 8",
          "8 to 16",
          "16 to 26",
          "More than 26",
          "It varies too much to say",
        ],
      },
      {
        key: "family_sources",
        label: "Where families come from",
        type: "multiselect",
        options: [
          "Funeral home referrals",
          "Cemetery referrals",
          "Walk-in or showroom",
          "Search and web",
          "Families we have served before",
          "Word of mouth",
          "Clergy and community groups",
          "Paid ads",
          "Pre-need seminars and events",
          "Trade or dealer referrals",
        ],
      },
      {
        key: "cemeteries_served",
        label: "Cemeteries you work with regularly",
        type: "dropdown",
        helper:
          "Each one has its own rules on size, material, and foundations. This tells the agent how many rulebooks it is holding at once.",
        options: ["1 to 5", "6 to 20", "21 to 50", "More than 50", "We are the cemetery"],
      },
      {
        // Every other branch names vendors. This one asks in plain language instead, because
        // the software in this trade is small and regional and a list of guessed product
        // names would put words in the customer's mouth that may not exist.
        key: "records_system",
        label: "What you run orders and family records on",
        type: "text",
        placeholder: "Software by name, spreadsheets, paper files, or a mix of all three",
      },
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
      {
        key: "np_staff",
        label: "Paid staff",
        type: "dropdown",
        required: true,
        options: ["All volunteer", "1 to 5", "6 to 20", "21 to 75", "75+"],
      },
      {
        key: "np_funding",
        label: "Where funding comes from",
        type: "multiselect",
        options: ["Individual donors", "Major gifts", "Grants", "Government contracts", "Corporate sponsorship", "Events", "Earned revenue", "Membership dues"],
      },
      {
        key: "np_reporting",
        label: "Reporting burden",
        type: "radio",
        options: ["Light", "Steady - regular grant and board reporting", "Heavy - multiple funders with different formats"],
      },
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
      {
        key: "consult_engagement",
        label: "Typical engagement length",
        type: "dropdown",
        options: ["Days", "Weeks", "A few months", "Six months or more", "Ongoing retainer"],
      },
      {
        key: "consult_pipeline",
        label: "Where the pipeline leaks",
        type: "multiselect",
        options: ["Finding qualified leads", "Proposals and SOWs", "Pricing the work", "Delivery capacity", "Following up after the pitch", "Turning a project into a retainer", "Case studies and proof"],
      },
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
      {
        key: "media_formats",
        label: "What you produce",
        type: "multiselect",
        required: true,
        options: ["Video", "Podcast", "Written / newsletter", "Live streaming", "Music", "Film and TV", "Events", "Photography"],
      },
      {
        key: "media_monetization",
        label: "How it pays",
        type: "multiselect",
        options: ["Advertising", "Sponsorship", "Subscriptions", "Licensing", "Live events and tickets", "Merchandise", "Client work for hire", "Platform revenue share"],
      },
      {
        key: "media_cadence",
        label: "Publishing cadence",
        type: "dropdown",
        options: ["Daily", "Several times a week", "Weekly", "A few times a month", "Project by project"],
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
