import type { LucideIcon } from "lucide-react";
import {
  Briefcase, Building2, Calculator, GraduationCap, HeartHandshake, Home, Landmark,
  Phone, Scale, ShieldCheck, ShoppingCart, Stethoscope, TrendingUp, User, UserSearch, Users,
  Wallet,
} from "lucide-react";

// Single source of truth for the two navigation axes: which business you run (Industries) and
// which agent you want (Agents). Lives here rather than in Navbar.tsx
// because the homepage renders the same lists as cards, and the two must not drift apart.

export type NavItem = {
  label: string;
  description: string;
  to: string;
  Icon: LucideIcon;
  /** Keys agentBrand() in lib/agentBrand.ts, so a card or tile can take the agent's own colour
   *  instead of ApolloClaw red. Only set on AGENTS; an industry is not one agent. */
  agentTypeId?: string;
  /** `to` leaves ApolloClaw, so the link opens in a new tab.
   *
   *  One agent is sold on its own property rather than here (The College Agent), and a nav row
   *  that navigates away from the site you are browsing is a row that loses you the site. Set
   *  this and every renderer adds target and rel from `externalLinkProps` below. */
  external?: boolean;
  /** Overrides FleetGrid's footer text ("Explore →" / "Visit the site →"). Only
   *  /agent-invite sets this - "Explore" is the wrong verb for a card that provisions a live
   *  agent rather than reading a page about one. */
  cta?: string;
};

/** What an external nav row adds to its anchor. One object because AGENTS renders in three
 *  places - the navbar flyout, the mobile sheet and the home grid - and a new tab that only
 *  opens in two of them is worse than one that opens in none. */
export const externalLinkProps = { target: "_blank", rel: "noopener noreferrer" } as const;


// Industries: which business you run. Same icon-tile treatment as Agents (David's call)
// so the two flyouts read as one system. Academics points at the real, already-live education
// landing page rather than a /industries/* route.
export const INDUSTRIES: NavItem[] = [
  // LAW FIRMS, MEDICAL PRACTICES AND INSURANCE MOVED TO AGENTS, David's call, and the pages did
  // not move with them: /industries/law-firms, /industries/medical-practices and
  // /industries/insurance are unchanged and still where those three rows point from. Only which
  // menu carries them changed.
  //
  // It is the right menu for them. Each of those pages is titled as the agent - "Law Agent",
  // "Medical AI Agent", "AI Insurance Agent" - so they were the only Industries rows that were
  // really product pages, and the header note in Navbar.tsx had them staying out of Agents for a
  // reason that no longer holds.
  //
  // Real Estate went too. It used to sit in both lists deliberately, which the note on AGENTS
  // still explains; David's call that all the agents belong under Agents settles it the other
  // way. /industries/real-estate is unchanged and is still where the Agents row points.
  { label: "PE-Backed Portfolio Companies", Icon: Briefcase, to: "/industries/private-equity", description: "Standardized reporting and back-office automation across every portfolio company." },
  { label: "Accounting Firms", Icon: Calculator, to: "/industries/accounting-firms", description: "Client requests, document collection, and close support through every busy season." },
  { label: "E-commerce", Icon: ShoppingCart, to: "/industries/ecommerce", description: "Order questions, returns, and post-purchase follow-up handled at volume." },
  { label: "Nonprofit", Icon: HeartHandshake, to: "/industries/nonprofit", description: "Donor stewardship, grant deadlines, and volunteer coordination on a lean team." },
  { label: "Financial Services", Icon: Landmark, to: "/industries/financial-services", description: "Client onboarding, review prep, and compliance-aware follow-up." },
  { label: "Professional Services", Icon: Users, to: "/industries/professional-services", description: "Intake, project admin, and client follow-up, so billable people stay billable." },
  { label: "Academics", Icon: GraduationCap, to: "/ai-consulting-education", description: "Admissions, student services, and campus operations without adding headcount." },
  // Moved out of the agent list at David's call. Neither is a product with a site of its own,
  // and neither is a job title anybody hires for the way they hire a CFO - they are functions a
  // business needs covered, which is the question this axis answers. Destinations are unchanged.
  { label: "Reception & Front Desk", Icon: Phone, to: "/ai-agents/receptionist", description: "Answer calls, route messages, and book appointments, keep the front line covered." },
  { label: "Human Resources", Icon: Users, to: "/ai-agents/hr", description: "Handle PTO requests, onboarding, and policy questions, keep records straight." },
];

// The top nav's "Case Studies" dropdown: every industry the site covers, David's call to fold
// the Industries menu into Case Studies. INDUSTRIES plus the five industry pages that live under
// Agents (law, personal injury, medical, insurance, real estate) - those are where most of the
// case studies are filed (config/caseStudies.ts), so leaving them out would hide the studies.
// INDUSTRIES itself is unchanged: the homepage cards and the footer still read it.
export const CASE_STUDY_INDUSTRIES: NavItem[] = [
  { label: "Insurance", Icon: ShieldCheck, to: "/industries/insurance", description: "Renewals, benefits enrollment, and month-end close for agencies and carriers." },
  { label: "Medical Practices", Icon: Stethoscope, to: "/industries/medical-practices", description: "Fewer no-shows, better reviews, and revenue reporting every morning." },
  { label: "Real Estate", Icon: Home, to: "/industries/real-estate", description: "Lead follow-up in minutes and one standard across every agent." },
  { label: "Law Firms", Icon: Scale, to: "/industries/law-firms", description: "Inbox, prep, and follow-up handled so partners bill more hours." },
  { label: "Personal Injury Law", Icon: Scale, to: "/industries/personal-injury-law", description: "Every intake screened and scheduled within minutes." },
  ...INDUSTRIES,
];

// Agents: the product family, named the way each one is actually sold. "The CFO Agent" is what
// the site, the funnel and the invoice all call it, so the nav calling it "CFO" made the menu
// read as a list of job titles rather than a list of things you can buy.
//
// Renamed from DEPARTMENTS at David's call, along with the flyout's label. The two axes are now
// Industries (which business you run) and Agents (which one you want).
//
// Real Estate is back after being dropped from the old Departments list for resolving to the
// same page as its Industries entry. That redundancy is real and is accepted here: it has a site
// of its own like the rest of the family, and leaving the flagship agent out of the agent menu
// to avoid a duplicate link was the worse trade. It still points at the Industries page, because
// there is no /ai-agents/real-estate.
export const AGENTS: NavItem[] = [
  { label: "The CEO Agent", agentTypeId: "ceo", Icon: Building2, to: "/ai-agents/ceo", description: "Pull reports, track KPIs, and prep board decks, brief you before every meeting." },
  { label: "The CFO Agent", agentTypeId: "cfo", Icon: Wallet, to: "/ai-agents/cfo", description: "Categorize expenses, reconcile payouts, and chase invoices, prep reports for close." },
  { label: "The Sales Agent", agentTypeId: "sales", Icon: TrendingUp, to: "/ai-agents/sales", description: "Qualify leads, draft follow-ups, and book meetings, keep the pipeline moving." },
  // THE MARKETING AGENT IS NOT HERE, David's call. /ai-agents/marketing is deleted, so this row
  // and the footer's would have led to a 404 - the one thing worse than no link.
  //
  // ONLY THE PAGE WENT. The marketing agent TYPE is untouched in config/agent-types.ts: still
  // available, still `internal` so only a platform admin sees its card, still with its persona
  // (config/personas.ts), its intake (lib/marketingIntake.ts and MARKETING_BRANCH in
  // OnboardingForm), its /build/marketing funnel and its /agent-invite/marketing route. Nothing
  // about selling or provisioning one changed; what went is the public page arguing for it.
  { label: "The Recruiting Agent", agentTypeId: "recruiting", Icon: UserSearch, to: "/ai-agents/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding." },
  // THESE THREE POINT AT THEIR INDUSTRIES PAGE, and that is not a shortcut - it is where each
  // agent's page already lives. /industries/law-firms is titled "Law Agent", /industries/insurance
  // is "AI Insurance Agent", /industries/medical-practices is "Medical AI Agent"; all three are
  // ~280-line AgentHero pages, the same shape as any /ai-agents/* one. Building an /ai-agents/
  // twin for each would have been a second page competing with the first for the same query.
  //
  // Same precedent as The Real Estate Agent below, which has pointed at its Industries page for
  // exactly this reason since there was no /ai-agents/real-estate.
  { label: "The Law Agent", agentTypeId: "legal", Icon: Scale, to: "/industries/law-firms", description: "Draft from your templates, redline what comes in, and never let a renewal date slip." },
  { label: "The Insurance Agent", agentTypeId: "insurance", Icon: ShieldCheck, to: "/industries/insurance", description: "Track renewals, chase quotes and claims, and compare policies side by side, stopping where a licensed professional takes over." },
  { label: "The Medical Agent", agentTypeId: "medical", Icon: Stethoscope, to: "/industries/medical-practices", description: "Keep the schedule full, chase referrals and authorizations, and answer what a front desk answers all day." },
  { label: "The Real Estate Agent", agentTypeId: "realestate", Icon: Home, to: "/industries/real-estate", description: "Lead follow-up in minutes, showings scheduled, and listings drafted for you." },
  { label: "The Personal Agent", agentTypeId: "personal", Icon: User, to: "/ai-agents/personal-assistant", description: "Run your inbox, calendar, research, and follow-ups, so your attention stays on the work only you can do." },
  // LAST, AND THE ONLY ONE THAT LEAVES. The College Agent is sold, built and provisioned on its
  // own property (agent-types.ts: externalUrl, and nothing in this app ever creates one), so the
  // row goes to the site that actually sells it rather than to a page here that would have to
  // hand people off anyway. New tab, because a dropdown row should not cost you the site you
  // were browsing.
  { label: "The College Agent", agentTypeId: "college", Icon: GraduationCap, to: "https://thecollegeagent.ai", external: true, description: "Essays, deadlines, applications and scholarships, kept straight through the whole of senior year." },
];
