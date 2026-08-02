"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// New site IA (rebuild Phase 1): AI Agents · Industries · Solutions · Pricing · Resources ·
// Company. Most of these destinations are built in later phases (2-5) and will 404 until then,
// the nav itself is a Phase 1 deliverable per the work order, applied sitewide immediately
// since it's shared chrome.
//
// Layout pivoted mid-Phase-1 (David's call, stackhaus.ai reference): tried a slim utility bar
// above the main nav for account/contact actions, then merged back into a single nav row per
// David's direct follow-up request. Schedule a Consultation is a persistent nav CTA (goes to
// Calendly, same link used everywhere else on the site).

const NAVY = "#0B1729";
const NAVY_DEEP = "#070F1C";
const PAPER = "#F5F6F8";
const PAPER_MUTED = "rgba(245,246,248,0.6)";
const RED = "#E12E30";
const HAIRLINE = "rgba(245,246,248,0.1)";

const CONTACT_EMAIL = "hello@apolloclaw.ai";

const AGENTS = [
  { label: "AI Receptionist", to: "/ai-agents/receptionist" },
  { label: "CEO Agent", to: "/ai-agents/ceo" },
  { label: "CFO Agent", to: "/ai-agents/cfo" },
  { label: "Sales Agent", to: "/ai-agents/sales" },
  { label: "Recruiting Agent", to: "/ai-agents/recruiting" },
  { label: "HR Agent", to: "/ai-agents/hr" },
  { label: "Legal Agent", to: "/ai-agents/legal" },
  { label: "Medical Agent", to: "/ai-agents/medical" },
  { label: "Real Estate Agent", to: "/ai-agents/real-estate" },
  { label: "Insurance Agent", to: "/ai-agents/insurance" },
];
const AGENTS_SECONDARY = [
  { label: "How It Works", to: "/ai-agents/how-it-works" },
  { label: "Self-Serve", to: "/ai-agents/self-serve" },
  { label: "Enterprise", to: "/ai-agents/enterprise" },
  { label: "Integrations", to: "/ai-agents/integrations" },
  { label: "Trust Center", to: "/ai-agents/security" },
];

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
];

const SOLUTIONS = [
  { label: "Startups", to: "/solutions/startups" },
  { label: "Small Business", to: "/solutions/small-business" },
  { label: "Mid-Market", to: "/solutions/mid-market" },
  { label: "Enterprise", to: "/solutions/enterprise" },
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
        className="relative flex items-center gap-1 pb-1 text-[13px] font-bold tracking-[0.01em] transition-colors"
        style={{ color: active ? PAPER : PAPER_MUTED }}
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
      label: "AI Agents",
      active: (p) => p.startsWith("/ai-agents"),
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(560)}>
          <div className="grid grid-cols-2 gap-0.5 p-2">
            {AGENTS.map((item) => simpleLink(item, pathname))}
          </div>
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 border-t p-2" style={{ borderColor: HAIRLINE }}>
            {AGENTS_SECONDARY.map((item) => simpleLink(item, pathname))}
          </div>
        </div>
      ),
    },
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
      active: (p) => p.startsWith("/solutions"),
      render: () => (
        <div className="overflow-hidden rounded-xl" style={panelStyle(220)}>
          <div className="flex flex-col gap-0.5 p-2">{SOLUTIONS.map((item) => simpleLink(item, pathname))}</div>
        </div>
      ),
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
        <nav style={{ background: NAVY, borderBottom: `1px solid ${HAIRLINE}` }}>
          <div className="container mx-auto flex h-[72px] items-center gap-4 px-5 md:px-8">
            <Link href="/" className="flex shrink-0 items-center">
              <ApolloClawLogo ink={PAPER} height={36} />
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-5 md:flex">
              {groups.map((group) => (
                <DesktopDropdown key={group.label} group={group} pathname={pathname} />
              ))}
              <Link
                href="/pricing"
                className="relative whitespace-nowrap pb-1 text-[13px] font-bold tracking-[0.01em] transition-colors"
                style={{ color: pathname === "/pricing" ? PAPER : PAPER_MUTED }}
              >
                Pricing
                {pathname === "/pricing" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
                )}
              </Link>
            </div>

            <div className="hidden shrink-0 items-center gap-2.5 md:flex">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hidden whitespace-nowrap text-[12px] xl:inline"
                style={{ color: PAPER_MUTED }}
              >
                {CONTACT_EMAIL}
              </a>
              <Link href="/login" className="whitespace-nowrap text-[12px] font-semibold" style={{ color: PAPER_MUTED }}>
                Log in
              </Link>
              <a
                href={CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden whitespace-nowrap rounded-[6px] border text-[11px] font-bold tracking-[0.03em] transition-colors hover:bg-white/[0.06] xl:inline-flex xl:items-center xl:justify-center"
                style={{ borderColor: HAIRLINE, color: PAPER, padding: "6px 12px" }}
              >
                Schedule a Consultation
              </a>
              <Link
                href={GET_STARTED_URL}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-[11px] font-bold tracking-[0.03em] transition-opacity hover:opacity-90"
                style={{ background: RED, color: "#ffffff", padding: "6px 14px" }}
              >
                Get Started
              </Link>
            </div>

            <button
              className="p-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ color: PAPER }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto pt-[72px] md:hidden" style={{ background: NAVY }}>
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
                    {(group.label === "AI Agents" ? [...AGENTS, ...AGENTS_SECONDARY]
                      : group.label === "Industries" ? INDUSTRIES
                      : group.label === "Solutions" ? SOLUTIONS
                      : group.label === "Resources" ? RESOURCES
                      : COMPANY
                    ).map((item) => (
                      <Link key={item.to} href={item.to} className="py-2 text-base" style={{ color: PAPER_MUTED }}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/pricing"
              className="font-heading border-b py-4 text-xl font-semibold"
              style={{ color: PAPER, borderColor: HAIRLINE }}
            >
              Pricing
            </Link>
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
