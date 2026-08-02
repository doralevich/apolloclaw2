"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calculator,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  Megaphone,
  Menu,
  Phone,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  User,
  UserSearch,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// Site IA, current top-level order per David's direct call: Company · Industries · Departments ·
// Case Studies · Contact. Industries (which business you run) and Departments (which role you're
// hiring) are two separate triggers, briefly merged into one two-column "Solutions" mega-menu and
// then split back out as too dense. The two lists are now strictly non-overlapping: Legal,
// Medical, Real Estate, and Insurance were dropped from Departments because each resolves to the
// same page as its Industries counterpart. Company is a small dropdown (About, Security).
// Resources (Blog, AI 101, FAQ) stays dropped from the nav, those pages stay live, just not
// linked from here.
//
// Every destination in both dropdowns is a real page. The old /use-cases/* tree was retired and
// split along these same two axes, with 301s from every old path (see next.config.ts).
//
// Layout history (David's direct feedback, several rounds): tried a slim utility bar above the
// main nav, merged it into one row, then split back into two tiers, this is that two-tier
// layout, dark navy utility bar on top (email, Log in, Get Started), main nav in white
// underneath (category dropdowns, Schedule a Consultation). The AI Agents mega-menu was dropped
// from the top nav entirely per David's call that it's not needed here, moved into the Footer
// instead (components/layout/Footer.tsx). Pricing dropped from the nav entirely too.

const NAVY = "#0B1729";
const NAVY_DEEP = "#070F1C";
const PAPER = "#F5F6F8";
const PAPER_MUTED = "rgba(245,246,248,0.6)";
const RED = "#E12E30";
const HAIRLINE = "rgba(245,246,248,0.1)";

// Main nav row is white now (David wanted to try it), separate ink tokens since PAPER/HAIRLINE
// above are tuned for the dark utility bar, mobile drawer, and dropdown flyout panels. Link
// text is solid black per David's direct feedback (no muted/active distinction anymore, the
// red underline alone marks the active page).
const NAV_WHITE = "#FFFFFF";
const NAV_INK = "#000000";
const NAV_HAIRLINE = "rgba(26,26,26,0.12)";

const CONTACT_EMAIL = "hello@apolloclaw.ai";

// Industries: which business you run. Same icon-tile treatment as Departments (David's call)
// so the two flyouts read as one system. Academics points at the real, already-live education
// landing page rather than a /industries/* route.
const INDUSTRIES: { label: string; description: string; to: string; Icon: LucideIcon }[] = [
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
const DEPARTMENTS: { label: string; description: string; to: string; Icon: LucideIcon }[] = [
  { label: "Receptionist", Icon: Phone, to: "/ai-agents/receptionist", description: "Answer calls, route messages, and book appointments, keep the front line covered." },
  { label: "CEO", Icon: Building2, to: "/ai-agents/ceo", description: "Pull reports, track KPIs, and prep board decks, brief you before every meeting." },
  { label: "CFO", Icon: Wallet, to: "/ai-agents/cfo", description: "Categorize expenses, reconcile payouts, and chase invoices, prep reports for close." },
  { label: "Sales", Icon: TrendingUp, to: "/ai-agents/sales", description: "Qualify leads, draft follow-ups, and book meetings, keep the pipeline moving." },
  { label: "Marketing", Icon: Megaphone, to: "/ai-agents/marketing", description: "Draft content, run the campaign calendar, and nurture leads, keep reporting current." },
  { label: "Recruiting", Icon: UserSearch, to: "/ai-agents/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding." },
  { label: "Human Resources", Icon: Users, to: "/ai-agents/hr", description: "Handle PTO requests, onboarding, and policy questions, keep records straight." },
  { label: "Personal", Icon: User, to: "/ai-agents/personal", description: "Run your inbox, calendar, research, and follow-ups, so your attention stays on the work only you can do." },
];

const COMPANY = [
  { label: "About", to: "/about" },
  { label: "Security", to: "/security" },
];

// TODO(GET_STARTED_URL): pointed at the live self-serve storefront (/agents -> checkout ->
// onboarding, confirmed working end to end today). Flagging for David to confirm this is the
// intended "Get Started" destination, or provide a different one.
const GET_STARTED_URL = "/agents";
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

interface NavGroup {
  kind: "group";
  label: string;
  active: (pathname: string) => boolean;
  render: () => React.ReactNode;
  // What the mobile drawer lists when this group is expanded. Carried on the group itself so
  // the drawer never has to branch on the label string to find the right array.
  mobileItems: { label: string; to: string; Icon?: LucideIcon }[];
}

// Plain top-level links (Case Studies, Contact), no dropdown, just an active-state underline
// like the group triggers, per David's call to promote them out of the Resources/Company
// dropdowns and into the top nav directly.
interface NavLink {
  kind: "link";
  label: string;
  to: string;
  active: (pathname: string) => boolean;
}

type NavEntry = NavGroup | NavLink;

function DesktopDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = group.active(pathname);
  // The flyout opens on CSS hover, which on its own leaves it stuck open after you click
  // through to a page: the cursor is still sitting on the trigger when the new page renders.
  // Clicking anything inside dismisses it, and it re-arms once the cursor leaves the trigger.
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="group relative" onMouseLeave={() => setDismissed(false)}>
      <button
        className="relative flex items-center gap-1 whitespace-nowrap pb-1 text-[14px] font-bold tracking-[0.01em] transition-colors"
        style={{ color: NAV_INK }}
      >
        {group.label}
        <ChevronDown
          size={11}
          className={`transition-transform ${dismissed ? "" : "group-hover:rotate-180"}`}
        />
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
        )}
      </button>
      <div
        onClick={() => setDismissed(true)}
        className={`invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 ${
          dismissed ? "" : "group-hover:visible group-hover:opacity-100"
        }`}
      >
        {group.render()}
      </div>
    </div>
  );
}

function DesktopNavLink({ item, pathname }: { item: NavLink; pathname: string }) {
  const active = item.active(pathname);
  return (
    <Link
      href={item.to}
      className="relative whitespace-nowrap pb-1 text-[14px] font-bold tracking-[0.01em] transition-colors"
      style={{ color: NAV_INK }}
    >
      {item.label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
      )}
    </Link>
  );
}

function panelStyle(minWidth: number): React.CSSProperties {
  return {
    background: NAVY_DEEP,
    border: `1px solid ${HAIRLINE}`,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    minWidth,
  };
}

function simpleLink(item: { label: string; to: string }, pathname: string) {
  const active = pathname === item.to;
  return (
    <Link
      key={item.to}
      href={item.to}
      className="block whitespace-nowrap rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors"
      style={{ color: active ? RED : PAPER }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,246,248,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {item.label}
    </Link>
  );
}

// Industries and Departments are two separate flyouts again (David: "let's do by Industry and
// By Departments, that's too much, should be separated"). They were briefly merged into one
// 820px-wide two-column mega-menu, which read as too dense. Industries stays a plain text list
// (vertical keywords, SEO-important), Departments keeps the icon-tile treatment.
// Both category flyouts render the same way: a two-column grid of icon tiles. Shared so
// Industries and Departments cannot drift apart visually.
function tilePanel(
  items: { label: string; description: string; to: string; Icon: LucideIcon }[],
  pathname: string,
  minWidth: number,
) {
  return (
    <div className="overflow-hidden rounded-xl p-5" style={panelStyle(minWidth)}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item) => {
          const Icon = item.Icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className="-m-1.5 flex items-start gap-3 rounded-lg p-1.5 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,246,248,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(245,246,248,0.07)" }}
              >
                <Icon size={18} style={{ color: active ? RED : PAPER }} />
              </div>
              <div className="min-w-0">
                <div className="font-heading text-[14px] font-bold" style={{ color: active ? RED : PAPER }}>
                  {item.label}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-[1.35]" style={{ color: PAPER_MUTED }}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
  }, [pathname]);

  // Top-level order per David's direct call: Company (About, Security), Industries, Departments,
  // Case Studies, Contact. Industries and Departments are two separate triggers again after a
  // brief run as one merged "Solutions" mega-menu. Resources (Blog, AI 101, FAQ) stays dropped
  // from the nav, those pages stay live, just not linked from here.
  const navEntries: NavEntry[] = [
    {
      kind: "group",
      label: "Company",
      active: (p) => ["/about", "/security"].some((p2) => p.startsWith(p2)),
      mobileItems: COMPANY,
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(180)}>
          <div className="flex flex-col gap-0.5 p-2">{COMPANY.map((item) => simpleLink(item, pathname))}</div>
        </div>
      ),
    },
    {
      kind: "group",
      label: "Industries",
      active: (p) => p.startsWith("/industries") || p === "/ai-consulting-education",
      mobileItems: INDUSTRIES,
      render: () => tilePanel(INDUSTRIES, pathname, 640),
    },
    {
      kind: "group",
      label: "Departments",
      active: (p) => p.startsWith("/ai-agents"),
      mobileItems: DEPARTMENTS,
      render: () => tilePanel(DEPARTMENTS, pathname, 560),
    },
    {
      kind: "link",
      label: "Case Studies",
      to: "/case-studies",
      active: (p) => p.startsWith("/case-studies"),
    },
    {
      kind: "link",
      label: "Contact",
      to: "/contact",
      active: (p) => p.startsWith("/contact"),
    },
  ];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        {/* Utility bar: email + account actions, the "blue bar" from the stackhaus.ai reference.
            Uses the same .container as the main nav below so email/Log in/Get Started line up
            exactly with the logo and right edge underneath, instead of the ad-hoc px-5/px-8
            this used to carry on its own. */}
        <div className="hidden py-[5px] md:flex" style={{ background: NAVY_DEEP }}>
          <div className="container mx-auto flex w-full items-center justify-between">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px]"
              style={{ color: "#ffffff" }}
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[12px] font-semibold" style={{ color: "#ffffff" }}>
                Log in
              </Link>
              <Link
                href={GET_STARTED_URL}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-[11px] font-bold tracking-[0.03em] transition-opacity hover:opacity-90"
                style={{ background: RED, color: "#ffffff", padding: "5px 14px" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Main nav: white, category dropdowns centered, Schedule a Consultation flush right. */}
        <nav style={{ background: NAV_WHITE, borderBottom: `1px solid ${NAV_HAIRLINE}` }}>
          <div className="container mx-auto flex h-[88px] items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center">
              <ApolloClawLogo ink={NAV_INK} height={36} />
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-5 md:flex">
              {navEntries.map((entry) =>
                entry.kind === "group" ? (
                  <DesktopDropdown key={entry.label} group={entry} pathname={pathname} />
                ) : (
                  <DesktopNavLink key={entry.label} item={entry} pathname={pathname} />
                )
              )}
            </div>

            <a
              href={CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-90 md:inline-flex"
              style={{ background: RED, color: "#ffffff", padding: "10px 18px" }}
            >
              Schedule a Consultation
            </a>

            <button
              className="ml-auto p-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ color: NAV_INK }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto pt-[88px] md:hidden" style={{ background: NAVY }}>
          <div className="flex flex-col gap-1 px-6 py-8">
            {navEntries.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.label}
                  href={entry.to}
                  className="font-heading border-b py-4 text-xl font-semibold"
                  style={{ color: PAPER, borderColor: HAIRLINE }}
                >
                  {entry.label}
                </Link>
              ) : (
              <div key={entry.label} className="border-b" style={{ borderColor: HAIRLINE }}>
                <button
                  onClick={() => setOpenSection((s) => (s === entry.label ? null : entry.label))}
                  className="font-heading flex w-full items-center justify-between py-4 text-xl font-semibold"
                  style={{ color: PAPER }}
                >
                  {entry.label}
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${openSection === entry.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === entry.label && (
                  <div className="flex flex-col gap-1 pb-4 pl-2">
                    {entry.mobileItems.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <Link
                          key={item.to}
                          href={item.to}
                          className="flex items-center gap-2.5 py-2 text-base"
                          style={{ color: PAPER_MUTED }}
                        >
                          {Icon && <Icon size={16} />}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              )
            )}
            <Link href="/login" className="py-4 text-lg font-semibold" style={{ color: PAPER }}>
              Log in
            </Link>
            <div className="mt-2 flex flex-col gap-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-center text-sm" style={{ color: PAPER_MUTED }}>
                {CONTACT_EMAIL}
              </a>
              <a
                href={CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[8px] border text-[13px] font-bold tracking-[0.04em]"
                style={{ borderColor: HAIRLINE, color: PAPER, padding: "14px 20px" }}
              >
                Schedule a Consultation
              </a>
              <Link
                href={GET_STARTED_URL}
                className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-bold tracking-[0.04em]"
                style={{ background: RED, color: "#ffffff", padding: "14px 20px" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
