"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Briefcase, Heart, TrendingUp, Home, Scale, Shield, GraduationCap, UserSearch } from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

const agentLinks = [
  { label: "The CEO Agent",         desc: "Faster decisions, fewer status calls.",           icon: Briefcase,     to: "/use-cases/ceo" },
  { label: "The CFO Agent",         desc: "Cash forecasts, board prep, monthly close.",      icon: TrendingUp,    to: "/use-cases/cfo" },
  { label: "The Legal Agent",       desc: "Intake forms, research, document summaries.",     icon: Scale,         to: "/use-cases/legal" },
  { label: "The Medical Agent",     desc: "Patient triage, intake summaries, faster charting.", icon: Heart,      to: "/use-cases/health" },
  { label: "The College Agent",     desc: "Admissions, financial aid, and registrar support.", icon: GraduationCap, to: "/use-cases/college" },
  { label: "The Recruiting Agent",  desc: "Screening, scheduling, and candidate follow-up.", icon: UserSearch,    to: "/use-cases/recruiting" },
  { label: "The Real Estate Agent", desc: "Listings written, leads sorted, deals closed.",  icon: Home,          to: "/use-cases/real-estate" },
  { label: "The Insurance Agent",   desc: "Quotes, renewals, and follow-ups on autopilot.", icon: Shield,        to: "/use-cases/insurance" },
];

const NAVY = "#0B1729";
const RED = "#D72B2B";
const NAVY_MUTED = "rgba(11,23,41,0.75)";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setUseCasesOpen(false);
  }, [pathname]);

  const isUseCaseActive = pathname.startsWith("/use-cases");

  const navItemStyle = (active: boolean) => ({
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "Inter, sans-serif",
    color: active ? NAVY : NAVY_MUTED,
    textDecoration: "none",
    letterSpacing: "0.01em",
    transition: "color 0.15s",
  } as React.CSSProperties);

  const navLink = (label: string, to: string) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        href={to}
        className="relative pb-1 hover:text-navy transition-colors"
        style={navItemStyle(active)}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = NAVY}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = active ? NAVY : NAVY_MUTED}
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
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(11,23,41,0.08)", boxShadow: "0 1px 4px rgba(11,23,41,0.06)" }}
      >
        <div className="container mx-auto flex items-center justify-between h-[96px] px-5 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center" style={{ flexShrink: 0 }}>
            <ApolloClawLogo ink="#000000" height={92} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {navLink("About", "/about")}

            {/* Industries dropdown */}
            <div className="relative group">
              <button
                className="relative pb-1 flex items-center gap-1"
                style={navItemStyle(isUseCaseActive)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = NAVY}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isUseCaseActive ? NAVY : NAVY_MUTED}
              >
                Industries
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
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(11,23,41,0.1)",
                    boxShadow: "0 20px 60px rgba(11,23,41,0.12), 0 0 0 1px rgba(11,23,41,0.04)",
                    minWidth: 540,
                  }}
                >
                  <div className="grid grid-cols-2 p-2 gap-0.5">
                    {agentLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          href={link.to}
                          className="flex items-start gap-3 rounded-lg"
                          style={{ padding: "10px 14px", textDecoration: "none", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,23,41,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon size={14} color={isActive ? RED : "rgba(11,23,41,0.3)"} strokeWidth={2} style={{ marginTop: 3, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: isActive ? RED : NAVY, fontFamily: "Inter, sans-serif", marginBottom: 1 }}>
                              {link.label}
                            </div>
                            <div style={{ fontSize: 11, color: NAVY_MUTED, fontFamily: "Inter, sans-serif", lineHeight: 1.4 }}>
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

            {/* Solutions dropdown. New York dropped per the latest list; the
                /ai-consulting-new-york page still exists and is linked from
                the homepage. */}
            <div className="relative group">
              <button
                className="relative pb-1 flex items-center gap-1"
                style={navItemStyle(false)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = NAVY}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = NAVY_MUTED}
              >
                Solutions
                <ChevronDown size={11} className="transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(11,23,41,0.1)",
                    boxShadow: "0 20px 60px rgba(11,23,41,0.12), 0 0 0 1px rgba(11,23,41,0.04)",
                    minWidth: 220,
                  }}
                >
                  <div className="p-2 flex flex-col gap-0.5">
                    {[
                      { label: "AI Consultation & Implementation", to: "/ai-implementation" },
                      { label: "Enterprise",              to: "/ai-consulting-enterprise" },
                      { label: "Medium-Sized Businesses", to: "/ai-consulting-mid-market" },
                      { label: "Small Businesses",        to: "/ai-consulting-small-business" },
                      { label: "Education",               to: "/ai-consulting-education" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        href={item.to}
                        className="block rounded-lg"
                        style={{
                          padding: "9px 14px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          fontFamily: "Inter, sans-serif",
                          color: pathname === item.to ? RED : NAVY,
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,23,41,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {navLink("Case Studies", "/case-studies")}
            {navLink("Blog", "/blog")}
            {navLink("Contact", "/contact")}
          </div>

          {/* Right side: CTA */}
          <div className="hidden md:flex items-center gap-5" style={{ flexShrink: 0 }}>
            <Link href="/dashboard" style={navItemStyle(pathname.startsWith("/dashboard"))}>
              Log in
            </Link>
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
                boxShadow: "0 4px 14px rgba(215,43,43,0.25)",
                textDecoration: "none",
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
            style={{ color: NAVY }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-24 overflow-y-auto md:hidden"
          style={{ background: "#ffffff" }}
        >
          <div className="flex flex-col items-center gap-7 py-10">
            <Link href="/about" className="font-display text-2xl" style={{ color: NAVY }}>
              About
            </Link>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setUseCasesOpen(!useCasesOpen)}
                className="font-display text-2xl flex items-center gap-2"
                style={{ color: NAVY }}
              >
                Industries
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
                        style={{ color: NAVY_MUTED }}
                      >
                        <Icon size={14} color="rgba(11,23,41,0.3)" strokeWidth={2} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-display text-2xl" style={{ color: NAVY }}>Solutions</span>
              {[
                { label: "AI Consultation & Implementation", to: "/ai-implementation" },
                { label: "Enterprise",              to: "/ai-consulting-enterprise" },
                { label: "Medium-Sized Businesses", to: "/ai-consulting-mid-market" },
                { label: "Small Businesses",        to: "/ai-consulting-small-business" },
                { label: "Education",               to: "/ai-consulting-education" },
              ].map((item) => (
                <Link key={item.to} href={item.to} className="font-body text-base" style={{ color: NAVY_MUTED }}>
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/case-studies" className="font-display text-2xl" style={{ color: NAVY }}>
              Case Studies
            </Link>
            <Link href="/blog" className="font-display text-2xl" style={{ color: NAVY }}>
              Blog
            </Link>
            <Link href="/contact" className="font-display text-2xl" style={{ color: NAVY }}>
              Contact
            </Link>
            <Link href="/dashboard" className="font-display text-2xl" style={{ color: NAVY }}>
              Log in
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
                textDecoration: "none",
              }}
            >
              Schedule Today
            </a>
          </div>
        </div>
      )}
    </>
  );
}
