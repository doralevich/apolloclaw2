import type { LucideIcon } from "lucide-react";
import {
  Briefcase, Building2, Calculator, GraduationCap, HeartHandshake, Home, Landmark, Megaphone,
  Phone, Scale, ShieldCheck, ShoppingCart, Stethoscope, TrendingUp, User, UserSearch, Users,
  Wallet,
} from "lucide-react";

// Single source of truth for the two navigation axes: which business you run (Industries) and
// which job you are hiring the agent into (Departments). Lives here rather than in Navbar.tsx
// because the homepage renders the same lists as cards, and the two must not drift apart.

export type NavItem = { label: string; description: string; to: string; Icon: LucideIcon };


// Industries: which business you run. Same icon-tile treatment as Departments (David's call)
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
];

// Departments: the role you're hiring the agent into, purely functional. Deliberately holds no
// vertical names. Legal, Medical, Real Estate, and Insurance used to sit here too, but each one
// resolves to the same page as its Industries entry (David caught this: "I see a law firms and a
// Legal page, is that redundant?"), so the verticals live under Industries only and this list
// stays the "which job" axis. Same destinations as the Footer's AI Agents column.
export const DEPARTMENTS: NavItem[] = [
  { label: "Receptionist", Icon: Phone, to: "/ai-agents/receptionist", description: "Answer calls, route messages, and book appointments, keep the front line covered." },
  { label: "CEO", Icon: Building2, to: "/ai-agents/ceo", description: "Pull reports, track KPIs, and prep board decks, brief you before every meeting." },
  { label: "CFO", Icon: Wallet, to: "/ai-agents/cfo", description: "Categorize expenses, reconcile payouts, and chase invoices, prep reports for close." },
  { label: "Sales", Icon: TrendingUp, to: "/ai-agents/sales", description: "Qualify leads, draft follow-ups, and book meetings, keep the pipeline moving." },
  { label: "Marketing", Icon: Megaphone, to: "/ai-agents/marketing", description: "Draft content, run the campaign calendar, and nurture leads, keep reporting current." },
  { label: "Recruiting", Icon: UserSearch, to: "/ai-agents/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding." },
  { label: "Human Resources", Icon: Users, to: "/ai-agents/hr", description: "Handle PTO requests, onboarding, and policy questions, keep records straight." },
  { label: "Personal", Icon: User, to: "/ai-agents/personal-assistant", description: "Run your inbox, calendar, research, and follow-ups, so your attention stays on the work only you can do." },
];
