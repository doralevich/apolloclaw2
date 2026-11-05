// lib/industryConfig.ts
// Apollo[Claw] onboarding - industry branch definitions.
// One config object, keyed by the industry value chosen on Step 2.
// The dynamic Step 4 ("Industry Deep-Dive") renders whichever branch matches
// the PRIMARY company's industry. Answers save into the industry_details JSONB column.
//
// Each branch may also carry `stack`: the software that industry runs on, asked on the Tech
// Stack page beside the generic CRM / communication / documents tiles rather than on the
// deep-dive page (David, Nov 5 2026: "we have that in the next page under Tech Stack"). Those
// answers save into the same industry_details blob, and lib/agent-files.ts reads them into
// TOOLS.md the way it reads a role agent's tools.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import { LEGAL_STACK } from "@/lib/legalIntake";

/** One section on the Tech Stack page: a row of logo tiles, or a single type-in question.
 *  Shared with the role agents' own stack pages (lib/legalIntake.ts LEGAL_STACK). */
export type StackSection =
  | {
      key: string;
      label: string;
      options: readonly string[];
      /** Store one string rather than an array. */
      single?: boolean;
      /** Continue is refused until at least one tile is picked. */
      required?: boolean;
    }
  | { key: string; label: string; question: string; text: { placeholder?: string; helper?: string } };

export type FieldType =
  | "dropdown"
  | "multiselect"
  | "radio"
  | "scale"
  | "text"
  | "textarea"
  // Repeating rows of a name plus an age dropdown ("+ Add another"), stored as a string[] of
  // "Name (age)" entries. Built for the Personal Agent's kids question.
  | "people";

export interface IndustryField {
  key: string; // becomes the key inside industry_details JSONB
  label: string;
  type: FieldType;
  options?: string[]; // dropdown | multiselect | radio
  placeholder?: string; // text | textarea
  required?: boolean;
  helper?: string; // small grey subtext under the label
  ageOptions?: string[]; // people: the age dropdown on each row
  namePlaceholder?: string; // people: placeholder for each row's name box
  // Show this field only when an EARLIER multiselect on the same page has a given option
  // ticked. For the follow-up question that only makes sense once someone has asked for the
  // thing: "handle my showing scheduling" is the job, "which calendar" is how, and asking the
  // second of everyone would put two dead questions in front of the realtors who said no.
  //
  // Deliberately limited to one field. A general condition language here would be a small
  // rules engine nobody can read at a glance. `includes` may list several answers, any of which
  // shows the field: "Partner's name" follows Dating, In a relationship, Engaged and Married.
  showIf?: { key: string; includes: string | string[] };
}

/**
 * Whether a conditional field should render, given the answers so far.
 *
 * Shared by the renderer and by validation, because they have to agree: a required field that
 * is hidden must not block Continue, and that bug is invisible until somebody hits it - the
 * form simply stops advancing with no error pointing anywhere they can see.
 */
export function fieldVisible(
  f: IndustryField,
  values: Record<string, string | string[]>
): boolean {
  if (!f.showIf) return true;
  const v = values[f.showIf.key];
  const want = Array.isArray(f.showIf.includes) ? f.showIf.includes : [f.showIf.includes];
  return want.some((w) => (Array.isArray(v) ? v.includes(w) : v === w));
}

export interface IndustryBranch {
  stepTitle: string; // e.g. "Your Law Practice"
  stepSubtitle: string;
  // Short name for the progress rail. Only needed when a role's deep-dive is split across
  // several pages and each one wants its own label; a single-page branch falls back to the
  // role's stepLabel in ROLE_INTAKES.
  stepLabel?: string;
  // Show the agent's mascot beside this page's heading. For the page that is about the AGENT
  // rather than the business - one per flow, since a robot over every page stops being a
  // character and becomes wallpaper.
  art?: boolean;
  fields: IndustryField[];
  // The software this industry runs on, asked on the Tech Stack page (see the file header).
  // Answers save into industry_details under each section's key.
  stack?: readonly StackSection[];
  // Generic Tech Stack sections this industry's own `stack` already covers, hidden so nothing
  // is asked twice: a realtor's CRM, a CPA's accounting software.
  stackSkip?: readonly ("crm" | "comms" | "docs" | "pm" | "billing")[];
  // REPLACE the generic Tech Stack sections with `stack` entirely, for an industry whose stack
  // is its own world (a law firm runs Clio and Westlaw, and a page offering it Salesforce and
  // Asana asks nothing it can answer).
  stackReplaces?: boolean;
}

// Step 2 industry dropdown, alphabetical with "Other" last (David, Nov 5 2026; it used to be in
// the order the branches were written, which read as random to anyone scanning for their own).
// Note the Finance/Accounting/Legal split into three.
//
// Not every row has a deep-dive branch below. An option without one just skips the industry
// step and runs the generic fallback, which is the right answer for a dealership or a salon:
// a real industry with no dedicated agent and nowhere better to send them.
//
// INSURANCE IS DELIBERATELY NOT HERE. It sat in this list with no branch behind it, so an
// agency owner picking it was asked nothing whatsoever about insurance - while The Insurance
// Agent exists as its own product, with its own site and its own twelve-question intake that
// asks about lines written, carriers, renewals and the licensed handoff. Sending that buyer
// down the generic business track was the worst of both: too general to be useful, and it
// hid the thing they should have been sold. They belong at /onboard?agent=insurance.
//
// Staffing is here because the site sells a recruiting agent on its own use-case page while
// the questionnaire once had no way to say you run a staffing firm. The two athletics rows
// each have a deep-dive branch below, so picking either makes the questionnaire go athletic.
export const INDUSTRY_OPTIONS: string[] = [
  "Accounting / CPA",
  "Automotive / Dealership",
  "Beauty / Personal Care",
  "College Athletics",
  "Construction / Trades",
  "Consulting",
  "E-commerce / Retail",
  "Education / Coaching",
  "Financial Services / RIA",
  "Fitness / Wellness",
  "Funeral & Memorial Services",
  "Healthcare / Medical",
  "Home Services",
  "Hospitality / Food & Beverage",
  "IT Services / MSP",
  "Legal",
  "Manufacturing / Logistics",
  "Marketing / Ad Agency",
  "Media / Entertainment",
  "Non-profit",
  "Professional Athletics",
  "Professional Services",
  "Real Estate",
  "SaaS / Software",
  "Staffing / Recruiting",
  "Travel / Tourism",
  "Other",
];

export const industryConfig: Record<string, IndustryBranch> = {
  "Healthcare / Medical": {
    stepTitle: "Your Practice",
    stepSubtitle: "A few specifics so your agent speaks your clinical world fluently.",
    stack: [
      { key: "ehr_system", label: "EHR / Practice Management", options: ["Epic", "Athenahealth", "eClinicalWorks", "Tebra / Kareo", "DrChrono", "SimplePractice", "RxNT", "None", "Other"] },
    ],
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
    // The same law-firm stack the Law Agent asks, in place of the generic tiles: a firm that
    // picked Legal as its industry runs Clio and Westlaw whichever agent it is buying.
    stack: LEGAL_STACK,
    stackReplaces: true,
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
    stack: [
      { key: "re_platform", label: "Real Estate CRM / Platform", options: ["Follow Up Boss", "kvCORE", "BoomTown", "Chime", "kw Command", "AppFolio / Buildium", "None", "Other"] },
    ],
    stackSkip: ["crm"],
    fields: [
      {
        key: "re_focus",
        label: "Primary focus",
        type: "dropdown",
        required: true,
        // "Property management" STAYS, unlike Insurance in INDUSTRY_OPTIONS above, and the
        // difference is that there is nowhere better to send this person yet. The Property
        // Management Agent now exists as a type (config/agent-types.ts) with its own persona and
        // intake, but it is white-glove only: no planKey, no /build slug, so there is no funnel
        // to route them to the way insurance routes to /build/insurance. When one exists, this
        // option should send them there and come out of this list.
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
    stack: [
      { key: "cpa_software", label: "Tax & Accounting Software", options: ["QuickBooks", "Xero", "UltraTax", "Lacerte", "ProConnect", "Drake", "Karbon", "Canopy", "Other"] },
    ],
    stackSkip: ["billing"],
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
    stack: [
      { key: "ria_platform", label: "Advisor CRM / Platform", options: ["Redtail", "Wealthbox", "Salesforce FSC", "Orion", "Black Diamond", "None", "Other"] },
    ],
    stackSkip: ["crm"],
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
    stack: [
      // Still required, as it was on the deep-dive page: the store platform is the one tool an
      // e-commerce agent cannot work without knowing.
      { key: "ecom_platform", label: "Store Platform", required: true, options: ["Shopify", "WooCommerce", "BigCommerce", "Amazon", "Etsy", "Physical / POS", "Other"] },
    ],
    fields: [
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
    stack: [
      { key: "agency_tool", label: "Agency Platform", options: ["HubSpot", "Monday.com", "Asana", "ClickUp", "Airtable", "GoHighLevel", "AgencyAnalytics", "None", "Other"] },
    ],
    stackSkip: ["pm"],
    fields: [
      { key: "agency_type", label: "Agency type", type: "dropdown", required: true, options: ["Full-service", "Digital / performance", "Branding / creative", "PR / communications", "Social media", "SEO / content", "Web / dev shop", "Media buying"] },
      { key: "client_load", label: "Active clients", type: "dropdown", required: true, options: ["Under 10", "10 to 25", "25 to 60", "60+"] },
      { key: "agency_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["New business and pitching", "Client reporting", "Content production", "Campaign management", "Scope creep and billing", "Team capacity", "Lead follow-up"] },
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
    stack: [
      { key: "saas_tool", label: "CRM / Support Tool", options: ["HubSpot", "Salesforce", "Intercom", "Zendesk", "Pipedrive", "Stripe Billing", "None", "Other"] },
    ],
    stackSkip: ["crm"],
    fields: [
      // "Not applicable" on both, at David's call. Both are REQUIRED, and both assume a
      // venture-shaped software company: an ARR band assumes revenue is how you measure
      // yourself, and a go-to-market motion assumes you are selling to strangers. A studio
      // building software for clients, an internal tool, or a business whose software sits
      // beside a service had to pick something untrue to get past the step.
      { key: "saas_stage", label: "Stage", type: "dropdown", required: true, options: ["Pre-revenue / MVP", "Early (under $1M ARR)", "Growth ($1M to $10M ARR)", "Scale ($10M+ ARR)", "Not applicable"] },
      { key: "saas_motion", label: "Go-to-market motion", type: "dropdown", required: true, options: ["Product-led / self-serve", "Sales-led", "Hybrid", "Not applicable"] },
      { key: "saas_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Onboarding and activation", "Support tickets", "Churn and retention", "Sales follow-up", "Lead qualification", "Billing and dunning", "Feature request triage"] },
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
    stack: [
      { key: "services_tool", label: "Practice Management", options: ["HubSpot", "Monday.com", "Asana", "ClickUp", "Notion", "Dubsado / HoneyBook", "None", "Other"] },
    ],
    stackSkip: ["pm"],
    fields: [
      { key: "services_type", label: "Type of practice", type: "dropdown", required: true, options: ["Consulting", "Design / creative", "Engineering / architecture", "Coaching", "Recruiting / staffing", "Other services"] },
      { key: "engagement_model", label: "Primary engagement model", type: "dropdown", required: true, options: ["Retainer", "Project-based", "Hourly", "Performance-based", "Mix"] },
      { key: "services_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Proposals and scoping", "Client onboarding", "Project delivery", "Time tracking and billing", "Lead follow-up", "Scheduling"] },
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
    stack: [
      { key: "hosp_tool", label: "POS & Reservations", options: ["Toast", "Square", "Resy / OpenTable", "Clover", "7shifts", "None", "Other"] },
    ],
    fields: [
      { key: "hosp_type", label: "Type", type: "dropdown", required: true, options: ["Restaurant", "Bar / cafe", "Hotel / lodging", "Catering / events", "Franchise", "Multi-location group"] },
      { key: "covers_volume", label: "Weekly covers / guests", type: "dropdown", required: true, options: ["Under 500", "500 to 2000", "2000 to 5000", "5000+"] },
      { key: "hosp_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Reservations and no-shows", "Staffing and scheduling", "Reviews and reputation", "Ordering and inventory", "Guest messaging", "Loyalty and marketing"] },
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
    stack: [
      { key: "edu_tool", label: "Course & Community Platform", options: ["Kajabi", "Teachable", "Thinkific", "Circle", "Skool", "Calendly", "None", "Other"] },
    ],
    fields: [
      { key: "edu_type", label: "Format", type: "dropdown", required: true, options: ["1:1 coaching", "Group coaching", "Online courses", "Tutoring", "Membership / community", "Corporate training"] },
      { key: "student_volume", label: "Active students / members", type: "dropdown", required: true, options: ["Under 25", "25 to 100", "100 to 500", "500+"] },
      { key: "edu_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Enrollment and sales", "Student onboarding", "Content delivery", "Scheduling", "Support and questions", "Retention and renewals"] },
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
    stack: [
      { key: "mfg_tool", label: "ERP & Inventory", options: ["NetSuite", "SAP", "QuickBooks", "Fishbowl", "ShipStation", "None", "Other"] },
    ],
    fields: [
      { key: "mfg_type", label: "Type", type: "dropdown", required: true, options: ["Manufacturing", "Distribution / wholesale", "Logistics / 3PL", "Warehousing", "Import / export"] },
      { key: "mfg_volume", label: "Monthly order volume", type: "dropdown", required: true, options: ["Under 100", "100 to 1000", "1000 to 5000", "5000+"] },
      { key: "mfg_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Order processing", "Inventory management", "Quoting and RFQs", "Supplier coordination", "Shipping and tracking", "Customer service"] },
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
    stack: [
      { key: "trade_tool", label: "Field Service & Job Management", options: ["ServiceTitan", "Jobber", "Housecall Pro", "Procore", "Buildertrend", "QuickBooks", "None", "Other"] },
    ],
    fields: [
      { key: "trade_type", label: "Type", type: "dropdown", required: true, options: ["General contractor", "Specialty trade (HVAC / plumbing / electrical)", "Remodeling", "Roofing", "Landscaping", "Commercial construction"] },
      { key: "job_volume", label: "Jobs per month", type: "dropdown", required: true, options: ["Under 10", "10 to 30", "30 to 100", "100+"] },
      { key: "trade_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Lead follow-up and estimates", "Scheduling and dispatch", "Quoting and bids", "Invoicing and collections", "Client updates", "Crew coordination"] },
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
    stack: [
      {
        // Every other industry names vendors. This one asks in plain language instead, because
        // the software in this trade is small and regional and a list of guessed product
        // names would put words in the customer's mouth that may not exist.
        key: "records_system",
        label: "Orders & Family Records",
        question: "What you run orders and family records on",
        text: { placeholder: "Software by name, spreadsheets, paper files, or a mix of all three" },
      },
    ],
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
    ],
  },

  "Non-profit": {
    stepTitle: "Your Organization",
    stepSubtitle: "How you operate so the agent supports donors and programs.",
    stack: [
      { key: "np_tool", label: "Donor CRM", options: ["Salesforce NPSP", "Bloomerang", "DonorPerfect", "Little Green Light", "Kindful", "None", "Other"] },
    ],
    stackSkip: ["crm"],
    fields: [
      { key: "np_type", label: "Type", type: "dropdown", required: true, options: ["Charity / direct service", "Foundation / grantmaking", "Advocacy", "Faith-based", "Arts / culture", "Education"] },
      { key: "np_size", label: "Annual budget", type: "dropdown", required: true, options: ["Under $250k", "$250k to $1M", "$1M to $5M", "$5M+"] },
      { key: "np_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Donor outreach and follow-up", "Grant writing and reporting", "Volunteer coordination", "Event management", "Donor data and CRM", "Communications"] },
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
    stack: [
      { key: "consult_tool", label: "Practice Management", options: ["HubSpot", "Monday.com", "Notion", "Asana", "Dubsado", "None", "Other"] },
    ],
    stackSkip: ["pm"],
    fields: [
      { key: "consult_type", label: "Focus", type: "dropdown", required: true, options: ["Management / strategy", "IT / technical", "Financial / advisory", "Marketing", "HR / operations", "Boutique / solo"] },
      { key: "consult_load", label: "Active clients", type: "dropdown", required: true, options: ["1 to 3", "4 to 10", "10 to 25", "25+"] },
      { key: "consult_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Proposals and pitching", "Client onboarding", "Deliverable production", "Scheduling", "Billing and time tracking", "Lead follow-up"] },
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
    stack: [
      { key: "media_tool", label: "Publishing & Audience Tools", options: ["Notion", "Airtable", "Later / Buffer", "Patreon", "ConvertKit", "None", "Other"] },
    ],
    fields: [
      { key: "media_type", label: "Type", type: "dropdown", required: true, options: ["Creator / influencer", "Production company", "Publishing / media outlet", "Podcast / audio", "Agency / talent", "Events / live"] },
      { key: "audience_volume", label: "Audience size", type: "dropdown", required: true, options: ["Under 10k", "10k to 100k", "100k to 1M", "1M+"] },
      { key: "media_bottlenecks", label: "Biggest bottleneck", type: "multiselect", options: ["Content production", "Scheduling and publishing", "Audience and community", "Sponsor and brand deals", "Monetization", "Analytics and reporting"] },
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

  // College programs (GW basketball, Michigan football). This world runs on recruiting, roster
  // operations, travel, and NCAA compliance, none of which the generic branch would ever ask about.
  "College Athletics": {
    stepTitle: "Your Program",
    stepSubtitle: "A few specifics so your agent speaks college sports fluently, recruiting, roster, and compliance included.",
    stack: [
      {
        key: "program_tools",
        label: "Program Software",
        question: "Software the program runs on",
        text: { placeholder: "Recruiting CRM (Teamworks, ARMS, Front Rush), film (Hudl, Synergy), etc.", helper: "Recruiting, film, compliance, communications, whatever you use." },
      },
    ],
    fields: [
      {
        key: "sport",
        label: "Sport",
        type: "dropdown",
        required: true,
        options: [
          "Football",
          "Men's Basketball",
          "Women's Basketball",
          "Baseball",
          "Softball",
          "Men's Soccer",
          "Women's Soccer",
          "Volleyball",
          "Beach Volleyball",
          "Men's Ice Hockey",
          "Women's Ice Hockey",
          "Field Hockey",
          "Men's Lacrosse",
          "Women's Lacrosse",
          "Wrestling",
          "Track & Field",
          "Cross Country",
          "Swimming & Diving",
          "Tennis",
          "Golf",
          "Gymnastics",
          "Rowing",
          "Water Polo",
          "Fencing",
          "Rifle",
          "Skiing",
          "Bowling",
          "Other",
        ],
      },
      {
        key: "division",
        label: "Division / level",
        type: "dropdown",
        required: true,
        options: ["NCAA Division I", "NCAA Division II", "NCAA Division III", "NAIA", "JUCO", "Other"],
      },
      {
        key: "program_role",
        label: "What part of the program is this agent for?",
        type: "dropdown",
        options: [
          "Head coaching staff",
          "Recruiting / operations",
          "Player development",
          "Compliance",
          "Communications / media",
          "Business / marketing",
          "Academics / player services",
          "Other",
        ],
      },
      {
        key: "agent_focus",
        label: "What should the agent take off your plate?",
        type: "multiselect",
        options: [
          "Recruiting and prospect tracking",
          "Recruit communications (texts, emails, DMs)",
          "Roster and player operations",
          "Scheduling and travel logistics",
          "Scouting and opponent prep",
          "NIL and player branding",
          "NCAA compliance",
          "Academics and eligibility",
          "Fan, media, and comms",
          "Fundraising and boosters",
        ],
      },
      {
        key: "recruiting_centrality",
        label: "How central is recruiting to this role?",
        type: "radio",
        options: ["It is the main thing", "A big part", "Some", "Not really"],
      },
      {
        key: "transfer_portal",
        label: "Do you work the transfer portal?",
        type: "radio",
        options: ["Yes, it is central", "Sometimes", "No"],
      },
      {
        key: "recruit_channels",
        label: "How do you communicate with recruits?",
        type: "multiselect",
        options: ["Text message", "Instagram / DMs", "Email", "Phone calls", "In-person visits"],
      },
      {
        key: "nil",
        label: "How involved are you with NIL?",
        type: "radio",
        options: ["We run or work with a collective", "We facilitate deals", "We advise athletes", "Not involved"],
      },
      {
        key: "biggest_headache",
        label: "Biggest time drain right now",
        type: "textarea",
        placeholder: "Where does the staff lose the most hours, and what falls through the cracks?",
      },
    ],
  },

  // Pro teams, individual pro athletes, and the agencies around them.
  "Professional Athletics": {
    stepTitle: "Your Athletics Operation",
    stepSubtitle: "A few specifics so your agent works the world of pro sports, not a generic one.",
    fields: [
      {
        key: "org_type",
        label: "What are you?",
        type: "dropdown",
        required: true,
        options: [
          "Pro team or franchise",
          "Individual professional athlete",
          "Agency / athlete representation",
          "League or governing body",
          "Training / performance group",
          "Other",
        ],
      },
      {
        key: "sport",
        label: "Sport or sports",
        type: "text",
        required: true,
        placeholder: "e.g. Basketball, Football, Soccer, Golf",
      },
      {
        key: "league",
        label: "League / level",
        type: "dropdown",
        options: ["NFL", "NBA", "WNBA", "MLB", "NHL", "MLS", "Minor league / developmental", "International", "Other"],
      },
      {
        key: "department",
        label: "Which department?",
        type: "dropdown",
        options: [
          "Front office",
          "Coaching",
          "Scouting & player personnel",
          "Analytics",
          "Operations",
          "Communications & PR",
          "Marketing & partnerships",
          "Other",
        ],
      },
      {
        key: "agent_focus",
        label: "What should the agent take off your plate?",
        type: "multiselect",
        options: [
          "Scheduling and travel logistics",
          "Communications and inbox",
          "Scouting and player evaluation",
          "Contracts and salary cap",
          "Analytics and reporting",
          "Brand, sponsorship, and endorsements",
          "Media and public relations",
          "Contracts and deal logistics",
          "Fan and community engagement",
          "Content and social media",
          "Business and finances",
        ],
      },
      {
        key: "who_served",
        label: "Who does the agent report to?",
        type: "text",
        placeholder: "e.g. the athlete, the front office, the agency team",
      },
      {
        key: "biggest_headache",
        label: "Biggest time drain right now",
        type: "textarea",
        placeholder: "Where do you lose the most hours, and what falls through the cracks?",
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

/**
 * The question each industry_details key answers, for the readers that print those answers
 * back (USER.md, the intake email and PDF). Without this they printed the key with its
 * underscores swapped for spaces, so a Law Agent read "Ehr System: Epic" where its owner had
 * answered "EHR / Practice Management". Covers every branch's fields and stack sections; a key
 * from a question that has since been removed falls back to that same prettified key.
 */
export function industryFieldLabel(key: string): string {
  if (!INDUSTRY_LABELS) {
    INDUSTRY_LABELS = new Map();
    for (const branch of [...Object.values(industryConfig), genericBranch]) {
      for (const f of branch.fields) INDUSTRY_LABELS.set(f.key, f.label);
      for (const s of branch.stack ?? []) INDUSTRY_LABELS.set(s.key, "question" in s ? s.question : s.label);
    }
  }
  const known = INDUSTRY_LABELS.get(key);
  if (known) return known;
  // A "<key>_other" write-in reads as the question it belongs to, marked as the write-in.
  if (key.endsWith("_other")) {
    const base = INDUSTRY_LABELS.get(key.slice(0, -"_other".length));
    if (base) return `${base} (Other)`;
  }
  return key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}
let INDUSTRY_LABELS: Map<string, string> | null = null;

/**
 * The one question on an industry page that asks what the agent should take on: every branch's
 * "Biggest bottleneck" (and the athletics branches' "What should the agent take off your
 * plate?"). Since Nov 5 2026 it is not asked on the industry page at all: its options join the
 * generic "What should I take off your plate first?" list, so the question is asked once, in
 * the industry's own words, and the picks that came from this list are still saved under this
 * key so USER.md's industry section reads as before (David: "could be updated with industry
 * specific tasks"). Recognized by key, so a branch opts in by naming its field that way.
 */
export function takeOnField(branch: IndustryBranch | null | undefined): IndustryField | null {
  if (!branch) return null;
  return branch.fields.find((f) => f.type === "multiselect" && (/_bottlenecks$/.test(f.key) || f.key === "agent_focus")) ?? null;
}
