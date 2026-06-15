"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone, Briefcase, Heart, TrendingUp, Home, Scale, User, Target, Shield } from "lucide-react";

const useCaseLinks = [
  { label: "Healthcare", to: "/use-cases/health" },
  { label: "Accounting", to: "/use-cases/accounting" },
  { label: "Legal", to: "/use-cases/legal" },
  { label: "Real Estate", to: "/use-cases/real-estate" },
  { label: "Construction", to: "/use-cases/construction" },
  { label: "Restaurants", to: "/use-cases/restaurants" },
  { label: "E-Commerce", to: "/use-cases/ecommerce" },
  { label: "Finance", to: "/use-cases/finance" },
  { label: "Insurance", to: "/use-cases/insurance" },
  { label: "Nonprofit", to: "/use-cases/nonprofit" },
];

const agentLinks = [
  { label: "The CEO Agent",         desc: "Faster decisions, fewer status calls.",           icon: Briefcase,  to: "/use-cases/ceo" },
  { label: "The CFO Agent",         desc: "Cash forecasts, board prep, monthly close.",      icon: TrendingUp, to: "/use-cases/cfo" },
  { label: "The Medical Agent",     desc: "Patient triage, intake summaries, faster charting.", icon: Heart,   to: "/use-cases/health" },
  { label: "The Insurance Agent",   desc: "Quotes, renewals, and follow-ups on autopilot.", icon: Shield,     to: "/use-cases/insurance" },
  { label: "The Law Agent",         desc: "Intake forms, research, document summaries.",     icon: Scale,      to: "/use-cases/legal" },
  { label: "The Real Estate Agent", desc: "Listings written, leads sorted, deals closed.",  icon: Home,       to: "/use-cases/real-estate" },
  { label: "The Sales Agent",       desc: "Cold-to-warm outreach, more closed deals.",      icon: Target,     to: "/use-cases/sales" },
  { label: "The Sales Assistant",   desc: "Inbox, calendar, contacts — handled.",           icon: User,       to: "/use-cases/personal" },
];

const NAVY = "#0B1729";
const NAVY_HOVER = "#152442";
const RED = "#D72B2B";
const WHITE_MUTED = "rgba(255,255,255,0.72)";

const ApolloclawLogo = () => (
  <svg viewBox="0 0 480 80" xmlns="http://www.w3.org/2000/svg" style={{ height: "32px", width: "auto" }} aria-label="Apollo[Claw]">
    <text
      y="62"
      fontFamily="'IBM Plex Mono', 'Courier New', monospace"
      fontSize="48"
      fontWeight="700"
      letterSpacing="-1.5"
      fill="#ffffff"
    >
      Apollo
      <tspan fill={RED}>[</tspan>
      Claw
      <tspan fill={RED}>]</tspan>
    </text>
  </svg>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setUseCasesOpen(false);
  }, [pathname]);

  const isUseCaseActive = pathname.startsWith("/use-cases");

  const navItemClass = (active: boolean) =>
    `text-[13px] font-medium transition-colors hover:text-white relative pb-1 font-mono ${active ? "text-white" : ""}`;

  const navLink = (label: string, to: string) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        href={to}
        className={navItemClass(active)}
        style={{ color: active ? "#ffffff" : WHITE_MUTED }}
      >
        {label}
        {active && (
          <span
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
            style={{ background: RED }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: NAVY, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="container mx-auto flex items-center justify-between h-[72px] px-5 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center" style={{ flexShrink: 0 }}>
            <ApolloclawLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {navLink("About", "/about")}

            {/* Services dropdown */}
            <div className="relative group">
              <button
                className={navItemClass(isUseCaseActive) + " flex items-center gap-1"}
                style={{ color: isUseCaseActive ? "#ffffff" : WHITE_MUTED }}
              >
                Services
                <ChevronDown size={11} className="transition-transform group-hover:rotate-180" />
                {isUseCaseActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: RED }}
                  />
                )}
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div
                  className="rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    background: "#0F1E33",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 560,
                  }}
                >
                  <div className="grid grid-cols-2">
                    {agentLinks.map((link, i) => {
                      const Icon = link.icon;
                      const isLeft = i % 2 === 0;
                      const isActive = pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          href={link.to}
                          className="flex items-start gap-3 group/item"
                          style={{
                            padding: "14px 20px",
                            borderRight: isLeft ? "1px solid rgba(255,255,255,0.06)" : "none",
                            borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon size={15} color={isActive ? RED : "rgba(255,255,255,0.4)"} strokeWidth={2} style={{ marginTop: 3, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? RED : "#ffffff", fontFamily: "Inter, sans-serif", marginBottom: 2 }}>
                              {link.label}
                            </div>
                            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif", lineHeight: 1.4 }}>
                              {link.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {navLink("Blog", "/blog")}
            {navLink("Contact", "/contact")}
          </div>

          {/* Right side: phone + CTA */}
          <div className="hidden md:flex items-center gap-5" style={{ flexShrink: 0 }}>
            <a
              href="tel:+19173635487"
              className="flex items-center gap-1.5 text-[12px] font-mono transition-colors hover:text-white"
              style={{ color: WHITE_MUTED }}
            >
              <Phone size={12} />
              (917) 363-5487
            </a>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-[12px] font-bold tracking-wider uppercase transition-all hover:brightness-110"
              style={{
                background: RED,
                color: "#ffffff",
                padding: "10px 22px",
                borderRadius: 4,
                letterSpacing: "0.08em",
                boxShadow: "0 4px 14px rgba(215,43,43,0.35)",
              }}
            >
              Schedule Today
            </a>
          </div>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ color: "#ffffff" }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-24 overflow-y-auto md:hidden"
          style={{ background: NAVY }}
        >
          <div className="flex flex-col items-center gap-7 py-10">
            <Link href="/about" className="font-display text-2xl text-white">
              About
            </Link>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setUseCasesOpen(!useCasesOpen)}
                className="font-display text-2xl text-white flex items-center gap-2"
              >
                Services
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${useCasesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {useCasesOpen && (
                <div className="flex flex-col items-center gap-2">
                  {agentLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        href={link.to}
                        className="flex items-center gap-2 font-body text-base"
                        style={{ color: WHITE_MUTED }}
                      >
                        <Icon size={14} color={ICON_BLUE} strokeWidth={2} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <Link href="/blog" className="font-display text-2xl text-white">
              Blog
            </Link>
            <Link href="/contact" className="font-display text-2xl text-white">
              Contact
            </Link>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-[13px] font-bold tracking-wider uppercase"
              style={{
                background: RED,
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: 4,
                letterSpacing: "0.08em",
              }}
            >
              Schedule Today
            </a>
            <a
              href="tel:+19173635487"
              className="flex items-center gap-1.5 text-sm font-mono mt-2"
              style={{ color: WHITE_MUTED }}
            >
              <Phone size={14} />
              (917) 363-5487
            </a>
          </div>
        </div>
      )}
    </>
  );
}
