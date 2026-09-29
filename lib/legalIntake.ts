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

// About five structured questions per area (dropdown or multiselect, never another essay box),
// David's call (Sept 29, 2026): "the one that's really important and should be really detailed
// and specific based on cases or practices." Each area asks the splits an agent cannot infer
// without being told: which side the customer acts for, which matters inside a broad area come up,
// what the agent should draft, and which dates it must track, in that area's own vocabulary.
// Field keys are prefixed per area (cc_, emp_, ma_, ...) because every area's fields land in the
// same flat legalDetails blob as the other pages' fields, and a collision would silently overwrite
// an unrelated answer. The original two or three keys per area are kept so saved answers still
// load on an edit.
// Same alphabetical order as PRACTICE_AREA_OPTIONS - not load-bearing (each block is gated on
// its own showIf, so order here never changes what shows), but a customer who ticks several
// areas sees their follow-ups in the same order they ticked the options in, not a random one.
const PRACTICE_AREA_FOLLOWUPS: IndustryField[] = [
  ...areaFollowups("Bankruptcy", [
    { key: "bk_side", label: "Bankruptcy: which side do you represent?", type: "dropdown", options: ["Debtor side, consumers", "Debtor side, businesses", "Creditor side", "Trustee or examiner", "Mixed"] },
    { key: "bk_types", label: "Bankruptcy: which chapters and matters come up most?", type: "multiselect", options: ["Chapter 7", "Chapter 11", "Subchapter V (small business)", "Chapter 13", "Chapter 12 (family farmers)", "Adversary proceedings", "Preference and fraudulent transfer actions", "Workouts outside bankruptcy", "Other"] },
    { key: "bk_docs", label: "Bankruptcy: what should the agent help prepare?", type: "multiselect", options: ["Petitions and schedules", "Means test worksheets", "Plans and disclosure statements", "Proofs of claim", "Motions for relief from stay", "Client document checklists", "Creditor and client correspondence", "Other"] },
    { key: "bk_deadlines", label: "Bankruptcy: which dates should it track?", type: "multiselect", options: ["341 meeting dates", "Claims bar dates", "Confirmation hearings", "Objection deadlines", "Plan payment schedules", "Discharge dates", "Other"] },
  ]),
  ...areaFollowups("Civil rights", [
    { key: "cr_side", label: "Civil rights: which side?", type: "dropdown", options: ["Plaintiff / complainant side", "Defense (government / institutional)", "Both"] },
    { key: "cr_types", label: "Civil rights: which claims come up most?", type: "multiselect", options: ["Employment discrimination", "Police misconduct and excessive force", "Prisoner rights", "Housing / fair housing", "Disability access (ADA)", "Education and Title IX", "Free speech and First Amendment", "Voting rights", "Other"] },
    { key: "cr_docs", label: "Civil rights: what should the agent help prepare?", type: "multiselect", options: ["Agency charges (EEOC, HUD, state)", "Notices of claim", "Complaints and Section 1983 pleadings", "Discovery requests", "Demand letters", "Settlement agreements", "Client updates", "Other"] },
    { key: "cr_deadlines", label: "Civil rights: which dates should it track?", type: "multiselect", options: ["Agency filing windows (180 / 300 days)", "Right-to-sue deadlines", "Notice-of-claim deadlines for government defendants", "Statutes of limitations", "Court deadlines", "Other"] },
    { key: "cr_fees", label: "Civil rights: how are cases usually funded?", type: "dropdown", options: ["Contingency", "Fee-shifting statutes", "Hourly", "Pro bono", "Mixed"] },
  ]),
  ...areaFollowups("Commercial contracts", [
    { key: "cc_side", label: "Commercial contracts: which side do you typically sit on?", type: "dropdown", options: ["Drafting party", "Reviewing / negotiating the other side's paper", "Both, evenly"] },
    { key: "cc_types", label: "Commercial contracts: which agreements come up most?", type: "multiselect", options: ["SaaS / vendor agreements", "NDAs", "MSAs and SOWs", "Licensing", "Distribution / reseller", "Supply agreements", "Data processing agreements", "Consulting and services agreements", "Purchase orders and terms of sale", "Partnership and referral agreements", "Other"] },
    { key: "cc_volume", label: "Commercial contracts: how many do you handle in a month?", type: "dropdown", options: ["Under 10", "10-25", "25-50", "50-100", "More than 100"] },
    { key: "cc_counterparties", label: "Commercial contracts: who is usually across the table?", type: "dropdown", options: ["Larger companies with their own paper", "Companies about our size", "Smaller vendors and customers", "Mixed"] },
    { key: "cc_help", label: "Commercial contracts: what should the agent handle?", type: "multiselect", options: ["First-pass review against your playbook", "Redlines", "Issues lists and plain-English summaries", "Clause library upkeep", "Signature and execution tracking", "Renewal and termination date tracking", "Other"] },
  ]),
  ...areaFollowups("Construction", [
    { key: "con_side", label: "Construction: which side of the table?", type: "dropdown", options: ["Owner / developer side", "General contractor side", "Subcontractor and supplier side", "Architect / engineer side", "Mixed"] },
    { key: "con_types", label: "Construction: what comes up most?", type: "multiselect", options: ["Contract drafting & negotiation", "Payment / lien disputes", "Change order disputes", "Delay & defect claims", "Surety and bond claims", "Bid protests", "Safety and OSHA", "Other"] },
    { key: "con_contracts", label: "Construction: which contract forms do you work with?", type: "multiselect", options: ["AIA", "ConsensusDocs", "EJCDC", "Government contract forms", "Our own custom forms", "Other"] },
    { key: "con_deadlines", label: "Construction: which dates should it track?", type: "multiselect", options: ["Preliminary notice deadlines", "Mechanic's lien filing deadlines", "Bond claim deadlines", "Change order notice periods", "Retainage release", "Warranty periods", "Other"] },
    { key: "con_projects", label: "Construction: typical project type?", type: "dropdown", options: ["Residential", "Commercial", "Public works", "Industrial and infrastructure", "Mixed"] },
  ]),
  ...areaFollowups("Corporate / M&A", [
    { key: "ma_side", label: "Corporate / M&A: typical deal side?", type: "dropdown", options: ["Buy-side", "Sell-side", "Both", "Formation / governance only"] },
    { key: "ma_types", label: "Corporate / M&A: what comes up most?", type: "multiselect", options: ["Entity formation & governance", "Venture financings", "Debt financings", "Asset purchases", "Stock purchases and mergers", "Private equity deals", "Joint ventures", "Shareholder / operating agreements", "Other"] },
    { key: "ma_size", label: "Corporate / M&A: typical deal size?", type: "dropdown", options: ["Under $5M", "$5M-$50M", "$50M-$250M", "Over $250M", "Varies"] },
    { key: "ma_docs", label: "Corporate / M&A: what should the agent help prepare?", type: "multiselect", options: ["LOIs and term sheets", "Purchase agreements", "Disclosure schedules", "Due diligence checklists and memos", "Closing checklists", "Board and shareholder consents", "Cap table updates", "Other"] },
    { key: "ma_clients", label: "Corporate / M&A: who are the clients?", type: "dropdown", options: ["Startups and founders", "Private companies", "Private equity and funds", "Public companies", "Mixed"] },
  ]),
  ...areaFollowups("Criminal defense", [
    { key: "crim_level", label: "Criminal defense: level?", type: "dropdown", options: ["Misdemeanor", "Felony", "Both", "White-collar / regulatory"] },
    { key: "crim_types", label: "Criminal defense: which charges come up most?", type: "multiselect", options: ["DUI / DWI", "Drug offenses", "Violent crimes", "Theft and property crimes", "Sex offenses", "White-collar and fraud", "Juvenile matters", "Traffic", "Federal offenses", "Other"] },
    { key: "crim_stage", label: "Criminal defense: which stages come up most?", type: "multiselect", options: ["Pre-charge / investigation", "Arraignment & pretrial", "Plea negotiations", "Trial", "Sentencing", "Appeals & post-conviction", "Expungement and record sealing", "Other"] },
    { key: "crim_courts", label: "Criminal defense: which courts?", type: "dropdown", options: ["State court", "Federal court", "Both"] },
    { key: "crim_help", label: "Criminal defense: what should the agent help with?", type: "multiselect", options: ["Client intake and family updates", "Court date tracking", "Discovery organization", "Motion first drafts", "Sentencing and plea research", "Expungement petitions", "Other"] },
  ]),
  ...areaFollowups("Employment", [
    { key: "emp_side", label: "Employment: which side do you represent?", type: "dropdown", options: ["Employer side only", "Employee side only", "Both"] },
    { key: "emp_types", label: "Employment: what comes up most?", type: "multiselect", options: ["Offer letters & separation agreements", "Handbooks & policies", "Non-competes / restrictive covenants", "Wage & hour compliance", "Discrimination / harassment claims", "Retaliation and whistleblower claims", "Leave and accommodation (FMLA, ADA)", "Workplace investigations", "Union / labor relations", "Other"] },
    { key: "emp_forums", label: "Employment: where do disputes land?", type: "multiselect", options: ["EEOC and state agencies", "Department of Labor", "NLRB", "State court", "Federal court", "Arbitration", "Other"] },
    { key: "emp_docs", label: "Employment: what should the agent help prepare?", type: "multiselect", options: ["Offer letters", "Separation and release agreements", "Handbooks and policies", "Restrictive covenant agreements", "Agency position statements", "Demand letters", "Investigation reports", "Other"] },
    { key: "emp_clients", label: "Employment: who are the clients?", type: "dropdown", options: ["Small businesses", "Mid-size companies", "Large employers", "Individual employees", "Executives", "Mixed"] },
  ]),
  ...areaFollowups("Environmental", [
    { key: "env_types", label: "Environmental: what comes up most?", type: "multiselect", options: ["Permitting & compliance", "Remediation / contamination", "Enforcement & citizen suits", "Transactional due diligence", "Land use and development", "Other"] },
    { key: "env_clients", label: "Environmental: client type?", type: "dropdown", options: ["Businesses / developers", "Government agencies", "Community / advocacy groups", "Other"] },
    { key: "env_regimes", label: "Environmental: which laws come up most?", type: "multiselect", options: ["Clean Air Act", "Clean Water Act", "CERCLA / Superfund", "RCRA", "NEPA", "State equivalents", "Other"] },
    { key: "env_help", label: "Environmental: what should the agent help with?", type: "multiselect", options: ["Permit applications and renewals", "Compliance calendars and reporting deadlines", "Due diligence reviews", "Agency correspondence", "Enforcement responses", "Other"] },
  ]),
  ...areaFollowups("Family", [
    { key: "fam_types", label: "Family: what comes up most?", type: "multiselect", options: ["Divorce & separation", "Custody & parenting plans", "Child / spousal support", "Modifications and enforcement", "Protective orders", "Paternity", "Adoption", "Prenuptial / postnuptial agreements", "Other"] },
    { key: "fam_posture", label: "Family: posture?", type: "dropdown", options: ["Amicable / collaborative, mostly", "Contested / litigated, mostly", "Mixed"] },
    { key: "fam_assets", label: "Family: typical client situation?", type: "dropdown", options: ["Modest income and assets", "Middle income", "High net worth or business owners", "Mixed"] },
    { key: "fam_docs", label: "Family: what should the agent help prepare?", type: "multiselect", options: ["Petitions and responses", "Financial disclosures", "Parenting plans", "Settlement agreements", "Discovery requests", "Client updates", "Other"] },
    { key: "fam_deadlines", label: "Family: which dates should it track?", type: "multiselect", options: ["Hearing and mediation dates", "Disclosure deadlines", "Response deadlines", "Custody schedule changes", "Support review dates", "Other"] },
  ]),
  ...areaFollowups("Healthcare", [
    { key: "hc_types", label: "Healthcare: what comes up most?", type: "multiselect", options: ["Regulatory compliance (HIPAA, licensing)", "Provider contracts", "Fraud and abuse (Stark, Anti-Kickback)", "Medical malpractice defense", "Credentialing and medical staff issues", "Reimbursement / payer disputes", "Telehealth", "Practice sales and formations", "Other"] },
    { key: "hc_clients", label: "Healthcare: client type?", type: "dropdown", options: ["Hospitals / health systems", "Individual practitioners / practices", "Payers / insurers", "Digital health companies", "Other"] },
    { key: "hc_regimes", label: "Healthcare: which rules matter most?", type: "multiselect", options: ["HIPAA", "Stark Law", "Anti-Kickback Statute", "Medicare and Medicaid rules", "State licensing boards", "Corporate practice of medicine", "Other"] },
    { key: "hc_docs", label: "Healthcare: what should the agent help prepare?", type: "multiselect", options: ["Provider and employment agreements", "Business associate agreements", "Compliance policies", "Payer contracts", "Licensing and credentialing applications", "Other"] },
  ]),
  ...areaFollowups("Immigration", [
    { key: "imm_focus", label: "Immigration: primary focus?", type: "dropdown", options: ["Employment-based", "Family-based", "Asylum / humanitarian", "Business / investor visas", "Removal defense", "Mixed"] },
    { key: "imm_types", label: "Immigration: what comes up most?", type: "multiselect", options: ["H-1B", "L-1", "O-1", "PERM labor certification", "EB-5 and investor visas", "Family petitions", "Green card applications", "Naturalization", "Asylum", "DACA and TPS", "Compliance / I-9 audits", "Other"] },
    { key: "imm_clients", label: "Immigration: who are the clients?", type: "dropdown", options: ["Individuals and families", "Employers", "Investors", "Mixed"] },
    { key: "imm_deadlines", label: "Immigration: which dates should it track?", type: "multiselect", options: ["Visa and status expirations", "RFE response deadlines", "Priority dates and the visa bulletin", "H-1B cap season", "Hearing dates", "I-9 reverification", "Other"] },
    { key: "imm_help", label: "Immigration: what should the agent help with?", type: "multiselect", options: ["USCIS form preparation", "Client document checklists", "Case status tracking", "RFE response first drafts", "Support letters", "Client updates in plain English", "Other"] },
  ]),
  ...areaFollowups("Insurance defense", [
    { key: "insd_role", label: "Insurance defense: typical role?", type: "dropdown", options: ["Defending insureds on behalf of carriers", "Coverage / bad-faith disputes", "Both"] },
    { key: "insd_types", label: "Insurance defense: which claims come up most?", type: "multiselect", options: ["Auto", "Trucking", "Premises liability", "Products liability", "Construction defect", "Professional liability", "Employment practices", "Cyber", "Other"] },
    { key: "insd_carriers", label: "Insurance defense: how strict are carrier guidelines?", type: "dropdown", options: ["Detailed billing and reporting guidelines on most files", "Some carriers have guidelines", "Rarely an issue"] },
    { key: "insd_reports", label: "Insurance defense: which reports should it help write?", type: "multiselect", options: ["Initial case evaluations", "Status reports", "Pre-trial reports", "Budgets", "Deposition summaries", "Medical record summaries", "Other"] },
    { key: "insd_deadlines", label: "Insurance defense: which dates should it track?", type: "multiselect", options: ["Carrier reporting deadlines", "Discovery deadlines", "Expert disclosure deadlines", "Mediation dates", "Trial dates", "Other"] },
  ]),
  ...areaFollowups("Intellectual property", [
    { key: "ip_focus", label: "IP: main focus?", type: "dropdown", options: ["Prosecution / filing", "Licensing & transactions", "Enforcement / litigation", "Mixed"] },
    { key: "ip_types", label: "IP: which kinds?", type: "multiselect", options: ["Patents", "Trademarks", "Copyright", "Trade secrets", "Domain names", "Other"] },
    { key: "ip_tech", label: "IP: main industries or technologies?", type: "multiselect", options: ["Software", "Life sciences", "Medical devices", "Consumer products", "Electrical and hardware", "Entertainment and media", "Other"] },
    { key: "ip_docs", label: "IP: what should the agent help prepare?", type: "multiselect", options: ["Applications", "Office action responses", "Clearance searches and summaries", "License agreements", "Cease-and-desist letters", "Docketing reports", "Other"] },
    { key: "ip_deadlines", label: "IP: which dates should it track?", type: "multiselect", options: ["Office action response dates", "Patent maintenance fees", "Trademark renewals and Section 8 / 15 filings", "Opposition windows", "Litigation deadlines", "Other"] },
  ]),
  ...areaFollowups("Litigation support", [
    { key: "lit_side", label: "Litigation: which side do you typically represent?", type: "dropdown", options: ["Plaintiff", "Defense", "Both"] },
    { key: "lit_matters", label: "Litigation: which disputes come up most?", type: "multiselect", options: ["Commercial and contract", "Business torts", "Real estate", "Employment", "Product liability", "Class actions", "Appeals", "Other"] },
    { key: "lit_courts", label: "Litigation: court level?", type: "multiselect", options: ["State trial courts", "Federal district courts", "Appellate", "Administrative / agency", "Arbitration / ADR", "Other"] },
    { key: "lit_types", label: "Litigation: which stages take the most time?", type: "multiselect", options: ["Written discovery", "Document review", "Depositions", "Motion practice", "Expert work", "Trial prep", "Settlement negotiation", "Other"] },
    { key: "lit_help", label: "Litigation: what should the agent help prepare?", type: "multiselect", options: ["Deposition summaries", "Chronologies and timelines", "Discovery requests and responses", "Privilege logs", "Motion first drafts", "Exhibit and witness lists", "Other"] },
    { key: "lit_deadlines", label: "Litigation: which dates should it track?", type: "multiselect", options: ["Pleading deadlines", "Discovery cutoffs", "Expert deadlines", "Motion schedules", "Trial dates", "Appeal deadlines", "Other"] },
  ]),
  // Personal injury: David's own example of what this whole section is for. What the agent needs
  // to track (liens, deadlines, treatment, policy limits) is not something "plaintiff vs. defense"
  // or "case type" alone tells it.
  ...areaFollowups("Personal injury", [
    { key: "pi_side", label: "Personal injury: which side?", type: "dropdown", options: ["Plaintiff", "Defense", "Both"] },
    { key: "pi_types", label: "Personal injury: which cases come up most?", type: "multiselect", options: ["Auto accidents", "Trucking accidents", "Motorcycle accidents", "Slip and fall / premises liability", "Medical malpractice", "Nursing home abuse", "Product liability", "Workplace injuries", "Dog bites", "Brain and spinal cord injuries", "Wrongful death", "Other"] },
    { key: "pi_volume", label: "Personal injury: how many cases do you sign in a month?", type: "dropdown", options: ["Under 5", "5-15", "15-30", "30-50", "More than 50"] },
    { key: "pi_resolution", label: "Personal injury: where do most cases resolve?", type: "dropdown", options: ["Pre-suit settlement", "After filing, before trial", "At trial", "Mixed"] },
    { key: "pi_track", label: "Personal injury: what should the agent keep on top of?", type: "multiselect", options: ["Statute of limitations deadlines", "Medical records and bills requests", "Client treatment status", "Medical liens & subrogation", "Insurance policy limits", "Settlement negotiations", "Trial prep", "Other"] },
    { key: "pi_docs", label: "Personal injury: what should the agent help prepare?", type: "multiselect", options: ["Intake summaries", "Letters of representation", "Medical chronologies", "Demand letters", "Complaints", "Settlement statements", "Client status updates", "Other"] },
  ]),
  ...areaFollowups("Privacy & data protection", [
    { key: "priv_focus", label: "Privacy: primary focus?", type: "dropdown", options: ["Compliance & policy drafting", "Incident response / breach", "Vendor & data-sharing agreements", "Regulatory defense", "Mixed"] },
    { key: "priv_regimes", label: "Privacy: which regimes matter most?", type: "multiselect", options: ["GDPR", "CCPA / CPRA", "Other US state privacy laws", "HIPAA", "GLBA", "COPPA", "BIPA and biometrics", "Other"] },
    { key: "priv_clients", label: "Privacy: who are the clients?", type: "dropdown", options: ["Tech and SaaS", "Healthcare", "Financial services", "Retail and consumer brands", "Mixed"] },
    { key: "priv_docs", label: "Privacy: what should the agent help prepare?", type: "multiselect", options: ["Privacy policies and notices", "Data processing agreements", "Data maps and records of processing", "Impact assessments (DPIAs)", "Breach notification letters", "Vendor security questionnaires", "Other"] },
  ]),
  ...areaFollowups("Real estate", [
    { key: "re_side", label: "Real estate: which side of the table?", type: "dropdown", options: ["Landlord / seller side", "Tenant / buyer side", "Lender side", "Both"] },
    { key: "re_types", label: "Real estate: what comes up most?", type: "multiselect", options: ["Commercial leasing", "Residential leasing", "Purchase & sale agreements", "Title and closings", "Financing / liens", "1031 exchanges", "Zoning & land use", "Landlord-tenant disputes and evictions", "Construction contracts", "Other"] },
    { key: "re_clients", label: "Real estate: who are the clients?", type: "dropdown", options: ["Individuals and families", "Investors", "Developers", "Lenders", "Commercial landlords or tenants", "Mixed"] },
    { key: "re_docs", label: "Real estate: what should the agent help prepare?", type: "multiselect", options: ["Leases and amendments", "Purchase agreements", "Title and survey review notes", "Closing checklists", "Estoppels and SNDAs", "Loan document review", "Other"] },
    { key: "re_deadlines", label: "Real estate: which dates should it track?", type: "multiselect", options: ["Due diligence periods", "Financing contingencies", "Closing dates", "Lease renewal and option dates", "Rent escalations", "1031 identification and exchange windows", "Other"] },
  ]),
  ...areaFollowups("Regulatory & compliance", [
    { key: "reg_types", label: "Regulatory: what comes up most?", type: "multiselect", options: ["Licensing & filings", "Investigations & audits", "Policy / compliance program design", "Government inquiries / enforcement", "Regulatory change monitoring", "Other"] },
    { key: "reg_posture", label: "Regulatory: posture?", type: "dropdown", options: ["Proactive compliance / advisory", "Responding to an active inquiry or investigation", "Both"] },
    { key: "reg_industries", label: "Regulatory: which industries?", type: "multiselect", options: ["Financial services", "Healthcare", "Energy", "Telecommunications", "Food and drug", "Transportation", "Cannabis", "Gaming", "Other"] },
    { key: "reg_agencies", label: "Regulatory: which regulators come up most?", type: "multiselect", options: ["SEC", "FTC", "FDA", "CFPB", "EPA", "FCC", "State regulators", "Other"] },
    { key: "reg_help", label: "Regulatory: what should the agent help with?", type: "multiselect", options: ["Filing and renewal calendars", "Policy drafting", "Tracking rule changes", "Agency correspondence", "Audit prep", "Other"] },
  ]),
  ...areaFollowups("Securities", [
    { key: "sec_types", label: "Securities: what comes up most?", type: "multiselect", options: ["Public offerings & disclosure", "Private placements", "Regulatory filings & compliance", "Investment adviser and fund regulation", "Enforcement / investigations", "Other"] },
    { key: "sec_clients", label: "Securities: client type?", type: "dropdown", options: ["Public companies", "Private companies / startups", "Investment funds", "Broker-dealers and advisers", "Other"] },
    { key: "sec_filings", label: "Securities: which filings come up most?", type: "multiselect", options: ["10-K and 10-Q", "8-K", "Proxy statements", "S-1 and registration statements", "Form D", "Section 16 filings", "Form ADV", "Other"] },
    { key: "sec_deadlines", label: "Securities: which dates should it track?", type: "multiselect", options: ["Periodic filing deadlines", "Insider trading windows", "Annual meeting timeline", "Form D filing windows", "Other"] },
  ]),
  ...areaFollowups("Tax", [
    { key: "tax_focus", label: "Tax: primary focus?", type: "dropdown", options: ["Planning & structuring", "Controversy / audit defense", "Transactional (deal-related)", "Compliance & filings"] },
    { key: "tax_clients", label: "Tax: client type?", type: "dropdown", options: ["Individuals", "Businesses", "Both"] },
    { key: "tax_types", label: "Tax: which areas come up most?", type: "multiselect", options: ["Federal income tax", "State and local tax", "International tax", "Estate and gift tax", "Payroll tax", "Sales and use tax", "Tax-exempt organizations", "Other"] },
    { key: "tax_forums", label: "Tax: where do disputes land?", type: "multiselect", options: ["IRS audits and appeals", "Tax Court", "State tax agencies", "Collections and offers in compromise", "Other"] },
    { key: "tax_deadlines", label: "Tax: which dates should it track?", type: "multiselect", options: ["Filing deadlines and extensions", "IRS notice response windows", "Estimated payments", "Assessment statute of limitations", "Other"] },
  ]),
  ...areaFollowups("Trusts & estates", [
    { key: "tre_types", label: "Trusts & estates: what comes up most?", type: "multiselect", options: ["Wills & trusts drafting", "Probate & estate administration", "Trust administration", "Estate and trust disputes", "Guardianship / conservatorship", "Special needs planning", "Tax planning", "Other"] },
    { key: "tre_clients", label: "Trusts & estates: typical client?", type: "dropdown", options: ["High-net-worth individuals", "General / middle-market families", "Business succession planning", "Mixed"] },
    { key: "tre_docs", label: "Trusts & estates: what should the agent help prepare?", type: "multiselect", options: ["Wills", "Revocable trusts", "Irrevocable trusts", "Powers of attorney", "Healthcare directives", "Probate filings", "Inventories and accountings", "Other"] },
    { key: "tre_deadlines", label: "Trusts & estates: which dates should it track?", type: "multiselect", options: ["Probate court deadlines", "Estate tax return deadlines", "Creditor claim periods", "Trust distributions", "Plan review reminders for clients", "Other"] },
  ]),
  ...areaFollowups("Workers' compensation", [
    { key: "wc_side", label: "Workers' comp: which side?", type: "dropdown", options: ["Claimant / employee side", "Employer / carrier defense", "Both"] },
    { key: "wc_types", label: "Workers' comp: what comes up most?", type: "multiselect", options: ["Initial claims & benefits disputes", "Medical treatment disputes", "Return-to-work / settlement negotiations", "Appeals / hearings", "Third-party claims", "Other"] },
    { key: "wc_injuries", label: "Workers' comp: which injuries come up most?", type: "multiselect", options: ["Back and spine", "Repetitive stress", "Occupational disease", "Catastrophic injury", "Psychological injury", "Other"] },
    { key: "wc_help", label: "Workers' comp: what should the agent help prepare?", type: "multiselect", options: ["Claim forms", "Medical record summaries", "Client updates", "Hearing prep", "Settlement documents", "Other"] },
    { key: "wc_deadlines", label: "Workers' comp: which dates should it track?", type: "multiselect", options: ["Claim filing deadlines", "Hearing dates", "Medical and IME appointments", "Benefit reviews", "Appeal windows", "Other"] },
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
      helper: "Select what you practice. Each one opens a few quick questions specific to that area.",
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
    // Firm-wide, and read by name by the Law Agent's skills (config/skills/legal.ts): research
    // memos and contract review refuse to guess governing law, and plain-English summaries write
    // for whoever the client is. Both had gone unasked; back Sept 29, 2026.
    {
      key: "jurisdictions",
      label: "Which states and courts do you practice in?",
      type: "text",
      placeholder: "e.g. New York state courts, S.D.N.Y. and E.D.N.Y., New Jersey",
      helper: "Your agent researches and reviews against this law, and asks when a matter falls outside it.",
    },
    {
      key: "clientele",
      label: "Who are your clients?",
      type: "multiselect",
      options: ["Individuals and families", "Startups", "Small businesses", "Mid-size companies", "Large enterprises", "Nonprofits", "Government entities", "Insurers", "Other"],
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
    "How paper moves through your practice. The more specific you are here, the more your agent works your way.",
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
        "Starting from scratch",
      ],
      helper: "If you have them, upload them later in the form and your agent will work from yours.",
    },
    // The next four are what the contract, redline, drafting and correspondence skills read first
    // (**Key Clauses**, **Negotiation Posture**, **Redline Style**, **Drafting Voice**).
    {
      key: "key_clauses",
      label: "Which clauses do you check first on every document?",
      type: "multiselect",
      options: ["Indemnification", "Limitation of liability", "IP ownership", "Confidentiality", "Term and termination", "Auto-renewal", "Payment terms", "Warranties", "Insurance requirements", "Assignment and change of control", "Non-compete and non-solicit", "Data protection", "Governing law and venue", "Dispute resolution and arbitration", "Other"],
      helper: "Your agent reads these on every document, and flags it when one is missing.",
    },
    {
      key: "negotiation_posture",
      label: "How do you usually negotiate?",
      type: "dropdown",
      options: ["Firm on the key terms, flexible on the rest", "Push hard on every point", "Collaborative, aim to close fast", "Depends on the client and the deal"],
    },
    {
      key: "redline_style",
      label: "How do you want redlines delivered?",
      type: "dropdown",
      options: ["Tracked changes plus a short issues list", "Tracked changes only", "An issues list only, I'll mark it up", "Margin comments with suggested language"],
    },
    {
      key: "drafting_voice",
      label: "How should letters and emails to clients read?",
      type: "dropdown",
      options: ["Plain English, warm", "Plain English, direct", "Formal and traditional", "Match the tone of whoever wrote to us"],
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
  stepSubtitle: "What your agent connects to first: the platform, rather than a specific address.",
  stepLabel: "Email & Calendar",
  fields: [
    {
      key: "email_platform",
      label: "What email and calendar software does the firm run on?",
      type: "radio",
      options: ["Microsoft 365 / Outlook", "Google Workspace", "Other", "Still deciding"],
      helper: "This is what your agent's inbox and calendar connections point at during setup.",
    },
    {
      key: "scheduling_tool",
      label: "Does your calendar sync with a client-facing scheduling tool?",
      type: "dropdown",
      options: ["Yes, Calendly or similar", "No, scheduling is handled manually", "Unsure"],
    },
  ],
};

const TECH_DOCKETING: IndustryBranch = {
  stepTitle: "Intake, Deadlines & Conflicts",
  stepSubtitle: "How work reaches you and how dates and conflicts are tracked today, so your agent fits the process you already trust.",
  stepLabel: "Deadlines & Conflicts",
  fields: [
    // **Matter Intake** and **Turnaround**, read by the intake-triage skill.
    {
      key: "matter_intake",
      label: "How does work reach you?",
      type: "multiselect",
      options: ["Referrals", "Existing clients", "Website form", "Phone calls", "Email", "Requests from colleagues in-house", "Legal marketplaces and directories", "Other"],
    },
    {
      key: "turnaround",
      label: "How fast do you usually turn around a first draft or review?",
      type: "dropdown",
      options: ["Same day", "1-2 business days", "Within a week", "Depends on the matter"],
    },
    {
      key: "docketing",
      label: "How do you track deadlines and conflicts today?",
      type: "dropdown",
      options: [
        "A dedicated docketing / conflicts system",
        "Built into our practice management software",
        "Calendar and spreadsheets",
        "Informally, case by case",
      ],
    },
    {
      key: "docketing_help",
      label: "What would you want the agent to help with here?",
      type: "multiselect",
      options: [
        "Flagging upcoming deadlines before they're close",
        "Running conflict checks on incoming matters",
        "Sending renewal or statute-of-limitations reminders",
        "Still deciding",
      ],
    },
  ],
};

// ─── Page 6: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page, and the most important one. What you want handed over, and how client confidences are handled.",
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
        "Conflict checks on incoming matters",
        "Client intake and correspondence (non-privileged)",
        "Legal research memos and case law summaries",
        "Discovery review and document organization",
        "Billing narratives and time entry cleanup",
      ],
      helper: "Specific beats broad. The more of these you tick, the better your agent knows where it helps most.",
    },
    // review_authority and handoff_line used to sit here - a dropdown on how the agent's drafts
    // get reviewed, and a required essay on where a licensed attorney must take over. Both are
    // gone, David's call: the boundary they asked about is not a per-firm preference, it is the
    // same standard for every Law Agent, so it is no longer a question - see ROLE_INTAKES.legal's
    // `standardGuard` in OnboardingForm.tsx, which writes that line into every build directly.
    // **Confidentiality**, read by every Law Agent skill that touches matter content. Privilege
    // is always protected (standardGuard); this adds the firm's own rules on top.
    {
      key: "confidentiality",
      label: "Any confidentiality rules on top of standard privilege?",
      type: "multiselect",
      options: ["Keep matter content inside our own systems", "Use initials in place of client names in summaries", "Ethical walls between certain matters", "Client consent before AI touches their files", "Standard privilege handling is enough", "Other"],
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: ["Clearing the contract review queue", "Staying ahead of every deadline", "Faster first drafts from our templates", "Client updates and correspondence", "Intake and conflict checks", "Research memos", "Other"],
    },
  ],
};

/** Six pages, one blob. The onboarding form renders these in order. */
export const LEGAL_BRANCH: IndustryBranch[] = [PRACTICE, DOCUMENTS, TECH_RESEARCH, TECH_COMMS, TECH_DOCKETING, AGENT];
