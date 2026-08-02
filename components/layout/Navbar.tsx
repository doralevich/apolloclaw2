"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// New site IA (rebuild Phase 1): AI Agents · Industries · Solutions · Pricing · Resources ·
// Company, plus the Get Started / Schedule a Consultation / Log in CTA cluster. Most of these
// destinations are built in later phases (2-5) and will 404 until then , the nav itself is a
// Phase 1 deliverable per the work order, applied sitewide immediately since it's shared chrome.

const INK = "#1A1A1A";
const INK_MUTED = "rgba(26,26,26,0.65)";
const RED = "#E12E30";

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
        style={{ color: active ? INK : INK_MUTED }}
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
    background: "#ffffff",
    border: "1px solid rgba(26,26,26,0.1)",
    boxShadow: "0 20px 60px rgba(26,26,26,0.12), 0 0 0 1px rgba(26,26,26,0.04)",
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
      style={{ color: active ? RED : INK }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,26,26,0.04)")}
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
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 border-t p-2" style={{ borderColor: "rgba(26,26,26,0.08)" }}>
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
      <nav
        className="fixed left-0 right-0 top-0 z-50"
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(26,26,26,0.08)" }}
      >
        <div className="container mx-auto flex h-[84px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <ApolloClawLogo ink={INK} height={40} />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
            {groups.map((group) => (
              <DesktopDropdown key={group.label} group={group} pathname={pathname} />
            ))}
            <Link
              href="/pricing"
              className="relative pb-1 text-[13px] font-bold tracking-[0.01em] transition-colors"
              style={{ color: pathname === "/pricing" ? INK : INK_MUTED }}
            >
              Pricing
              {pathname === "/pricing" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
              )}
            </Link>
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-[13px] font-bold tracking-[0.01em] transition-colors"
              style={{ color: pathname.startsWith("/login") || pathname.startsWith("/dashboard") ? INK : INK_MUTED }}
            >
              Log in
            </Link>
            <a
              href={CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border text-[12px] font-bold tracking-[0.04em] transition-colors"
              style={{ borderColor: INK, color: INK, padding: "9px 18px" }}
            >
              Schedule a Consultation
            </a>
            <Link
              href={GET_STARTED_URL}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[12px] font-bold tracking-[0.04em] transition-opacity hover:opacity-90"
              style={{ background: INK, color: "#ffffff", padding: "10px 20px" }}
            >
              Get Started
            </Link>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{ color: INK }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto pt-24 md:hidden"
          style={{ background: "#ffffff" }}
        >
          <div className="flex flex-col gap-1 px-6 py-8">
            {groups.map((group) => (
              <div key={group.label} className="border-b" style={{ borderColor: "rgba(26,26,26,0.08)" }}>
                <button
                  onClick={() => setOpenSection((s) => (s === group.label ? null : group.label))}
                  className="font-heading flex w-full items-center justify-between py-4 text-xl font-semibold"
                  style={{ color: INK }}
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
                      <Link key={item.to} href={item.to} className="py-2 text-base" style={{ color: INK_MUTED }}>
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
              style={{ color: INK, borderColor: "rgba(26,26,26,0.08)" }}
            >
              Pricing
            </Link>
            <Link href="/login" className="py-4 text-lg font-semibold" style={{ color: INK }}>
              Log in
            </Link>
            <div className="mt-2 flex flex-col gap-3">
              <a
                href={CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[8px] border text-[13px] font-bold tracking-[0.04em]"
                style={{ borderColor: INK, color: INK, padding: "13px 20px" }}
              >
                Schedule a Consultation
              </a>
              <Link
                href={GET_STARTED_URL}
                className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-bold tracking-[0.04em]"
                style={{ background: INK, color: "#ffffff", padding: "14px 20px" }}
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
