"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Heart,
  Home,
  Menu,
  Phone,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserSearch,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// New site IA (rebuild Phase 1): Industries · Solutions · Resources · Company. Pricing dropped
// from the nav per David's call. Solutions is a "Built For" function-based mega-menu (David's
// reference: Composio's toolkits dropdown), not the old by-company-size list, it's the broad,
// industry-agnostic entry point Industries alone doesn't cover. Most of these destinations are
// built in later phases (2-5) and will 404 until then, the nav itself is a Phase 1 deliverable
// per the work order, applied sitewide immediately since it's shared chrome.
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

const INDUSTRIES = [
  { label: "Law Firms", to: "/industries/law-firms" },
  { label: "Medical Practices", to: "/industries/medical-practices" },
  { label: "PE-Backed Portfolio Companies", to: "/industries/private-equity" },
  { label: "Real Estate", to: "/industries/real-estate" },
  { label: "Insurance", to: "/industries/insurance" },
  { label: "Accounting & Finance", to: "/industries/accounting-finance" },
  { label: "E-commerce", to: "/industries/ecommerce" },
  { label: "Nonprofit", to: "/industries/nonprofit" },
  { label: "Financial Services", to: "/industries/financial-services" },
  { label: "Professional Services", to: "/industries/professional-services" },
  // Real, already-live page (built earlier this engagement), not a Phase 2+ stub like the rest.
  { label: "Academics", to: "/ai-consulting-education" },
];

// "Built For" grid (David's reference: Composio's toolkits mega-menu), function-first instead
// of the old by-company-size list, so the nav has one broadly-applicable entry point again
// (Industries stays vertical-specific for SEO keywords, this is the "it's not just for law
// firms and hospitals" counterweight). Reuses the real 10 agent types, same destinations as
// the Footer's AI Agents column, just a richer presentation up here.
const SOLUTIONS: { label: string; description: string; to: string; Icon: LucideIcon }[] = [
  { label: "Receptionist", Icon: Phone, to: "/ai-agents/receptionist", description: "Answer calls, route messages, and book appointments, keep the front line covered." },
  { label: "CEO", Icon: Building2, to: "/ai-agents/ceo", description: "Pull reports, track KPIs, and prep board decks, brief you before every meeting." },
  { label: "CFO", Icon: Wallet, to: "/ai-agents/cfo", description: "Categorize expenses, reconcile payouts, and chase invoices, prep reports for close." },
  { label: "Sales", Icon: TrendingUp, to: "/ai-agents/sales", description: "Qualify leads, draft follow-ups, and book meetings, keep the pipeline moving." },
  { label: "Recruiting", Icon: UserSearch, to: "/ai-agents/recruiting", description: "Screen candidates, schedule interviews, and send offers, run onboarding." },
  { label: "HR", Icon: Users, to: "/ai-agents/hr", description: "Handle PTO requests, onboarding, and policy questions, keep records straight." },
  { label: "Legal", Icon: Scale, to: "/ai-agents/legal", description: "Draft first-pass agreements, track deadlines, and flag what needs review." },
  { label: "Medical", Icon: Heart, to: "/ai-agents/medical", description: "Manage intake, scheduling, and follow-ups, HIPAA-aware from the ground up." },
  { label: "Real Estate", Icon: Home, to: "/ai-agents/real-estate", description: "Qualify leads, schedule showings, and draft listings, follow up on offers." },
  { label: "Insurance", Icon: ShieldCheck, to: "/ai-agents/insurance", description: "Handle intake, quote requests, and claims follow-up, policy renewals." },
];

const RESOURCES = [
  { label: "Blog", to: "/blog" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "AI 101", to: "/ai-101" },
  { label: "FAQ", to: "/faq" },
  { label: "The Weekly Claw", to: "/the-weekly-claw" },
];

const COMPANY = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

// TODO(GET_STARTED_URL): pointed at the live self-serve storefront (/agents -> checkout ->
// onboarding, confirmed working end to end today). Flagging for David to confirm this is the
// intended "Get Started" destination, or provide a different one.
const GET_STARTED_URL = "/agents";
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

interface NavGroup {
  label: string;
  active: (pathname: string) => boolean;
  render: () => React.ReactNode;
}

function DesktopDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = group.active(pathname);
  return (
    <div className="group relative">
      <button
        className="relative flex items-center gap-1 whitespace-nowrap pb-1 text-[14px] font-bold tracking-[0.01em] transition-colors"
        style={{ color: NAV_INK }}
      >
        {group.label}
        <ChevronDown size={11} className="transition-transform group-hover:rotate-180" />
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
        )}
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        {group.render()}
      </div>
    </div>
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

// "Built For" mega-menu, icon tile + bold title + truncated description, per David's reference
// (a competitor's nicer-looking dropdown), spacious rather than dense-with-dividers. Naming is
// still open, David isn't sure "Built For" is right, kept as-is until he settles on something,
// but the persona-based content (real agent types) stays, not the competitor's skills taxonomy.
// The CTA card on the right mirrors the reference's purple "Browse all" card, in brand red, and
// points at /agents, the real live storefront, not a placeholder.
function solutionsPanel(pathname: string) {
  return (
    <div className="overflow-hidden rounded-xl p-5" style={panelStyle(820)}>
      <div
        className="font-mono mb-4 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: PAPER_MUTED }}
      >
        Built For
      </div>
      <div className="flex gap-6">
        <div className="grid flex-1 grid-cols-3 gap-x-6 gap-y-4">
          {SOLUTIONS.map((item) => {
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

        <Link
          href={GET_STARTED_URL}
          className="flex w-[190px] shrink-0 flex-col rounded-2xl p-5 transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(160deg, ${RED}, #8f1517)` }}
        >
          <div
            className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Sparkles size={18} color="#ffffff" />
          </div>
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Built for every team
          </span>
          <span className="font-heading mt-1 text-[17px] font-bold leading-tight text-white">
            Browse all agents
          </span>
          <p className="mt-2 text-[12px] leading-[1.45]" style={{ color: "rgba(255,255,255,0.8)" }}>
            Ten agent types, one storefront. Live and ready to deploy.
          </p>
          <span className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-bold text-white">
            Browse all <ArrowRight size={14} />
          </span>
        </Link>
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

  const groups: NavGroup[] = [
    {
      label: "Industries",
      active: (p) => p.startsWith("/industries"),
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(520)}>
          <div className="grid grid-cols-2 gap-0.5 p-2">
            {INDUSTRIES.map((item) => simpleLink(item, pathname))}
          </div>
        </div>
      ),
    },
    {
      label: "Solutions",
      active: (p) => p.startsWith("/ai-agents"),
      render: () => solutionsPanel(pathname),
    },
    {
      label: "Resources",
      active: (p) =>
        ["/blog", "/case-studies", "/ai-101", "/faq", "/the-weekly-claw"].some((p2) => p.startsWith(p2)),
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(220)}>
          <div className="flex flex-col gap-0.5 p-2">{RESOURCES.map((item) => simpleLink(item, pathname))}</div>
        </div>
      ),
    },
    {
      label: "Company",
      active: (p) => ["/about", "/services", "/contact"].some((p2) => p.startsWith(p2)),
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(180)}>
          <div className="flex flex-col gap-0.5 p-2">{COMPANY.map((item) => simpleLink(item, pathname))}</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        {/* Utility bar: email + account actions, the "blue bar" from the stackhaus.ai reference.
            Uses the same .container as the main nav below so email/Log in/Get Started line up
            exactly with the logo and right edge underneath, instead of the ad-hoc px-5/px-8
            this used to carry on its own. */}
        <div className="hidden h-9 md:flex" style={{ background: NAVY_DEEP }}>
          <div className="container mx-auto flex w-full items-center justify-between">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[12px]" style={{ color: PAPER_MUTED }}>
              {CONTACT_EMAIL}
            </a>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[12px] font-semibold" style={{ color: PAPER_MUTED }}>
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
              {groups.map((group) => (
                <DesktopDropdown key={group.label} group={group} pathname={pathname} />
              ))}
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
            {groups.map((group) => (
              <div key={group.label} className="border-b" style={{ borderColor: HAIRLINE }}>
                <button
                  onClick={() => setOpenSection((s) => (s === group.label ? null : group.label))}
                  className="font-heading flex w-full items-center justify-between py-4 text-xl font-semibold"
                  style={{ color: PAPER }}
                >
                  {group.label}
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${openSection === group.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === group.label && (
                  <div className="flex flex-col gap-1 pb-4 pl-2">
                    {(
                      (group.label === "Industries" ? INDUSTRIES
                        : group.label === "Solutions" ? SOLUTIONS
                        : group.label === "Resources" ? RESOURCES
                        : COMPANY) as { label: string; to: string; Icon?: LucideIcon }[]
                    ).map((item) => {
                      const Icon = item.Icon ?? null;
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
            ))}
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
