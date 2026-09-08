import type { LucideIcon } from "lucide-react";
import {
  Briefcase, Building2, Calculator, GraduationCap, HeartHandshake, Home, Landmark, Megaphone,
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
};


// Industries: which business you run. Same icon-tile treatment as Agents (David's call)
// so the two flyouts read as one system. Academics points at the real, already-live education
// landing page rather than a /industries/* route.
export const INDUSTRIES: NavItem[] = [
  { label: "Law Firms", Icon: Scale, to: "/industries/law-firms", description: "Client intake, deadline tracking, and billing follow-up, so attorneys stay on billable work." },
  { label: "Medical Practices", Icon: Stethoscope, to: "/industries/medical-practices", description: "Scheduling, reminders, and patient follow-up, HIPAA-aware from the ground up." },
  { label: "PE-Backed Portfolio Companies", Icon: Briefcase, to: "/industries/private-equity", description: "Standardized reporting and back-office automation across every portfolio company." },
  { label: "Real Estate", Icon: Home, to: "/industries/real-estate", description: "Lead follow-up in minutes, showings scheduled, and listings drafted for you." },
  { label: "Insurance", Icon: ShieldCheck, to: "/industries/insurance", description: "Quote follow-up, renewals, and claims chasing that runs without a producer on it." },
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
  { label: "The Marketing Agent", agentTypeId: "marketing", Icon: Megaphone, to: "/ai-agents/marketing", description: "Draft content, run the campaign calendar, and nurture leads, keep reporting current." },
  { label: "The Recruiting Agent", agentTypeId: "recruiting", Icon: UserSearch, to: "/ai-agents/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding." },
  { label: "The Real Estate Agent", agentTypeId: "realestate", Icon: Home, to: "/industries/real-estate", description: "Lead follow-up in minutes, showings scheduled, and listings drafted for you." },
  { label: "The Personal Agent", agentTypeId: "personal", Icon: User, to: "/ai-agents/personal-assistant", description: "Run your inbox, calendar, research, and follow-ups, so your attention stays on the work only you can do." },
];
