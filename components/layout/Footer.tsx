"use client";

import Link from "next/link";
import ApolloClawLogo from "@/components/ApolloClawLogo";

const NAVY = "#0B1729";
const RED = "#D72B2B";
const WHITE_MUTED = "rgba(255,255,255,0.72)";
const WHITE_SUBTLE = "rgba(255,255,255,0.45)";

const navLinks = [
  { label: "About", to: "/about" },
  { label: "What We Do", to: "/what-we-do" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Insights", to: "/blog" },
  { label: "Case Studies", to: "/case-studies" },
];

// Moved here from the top nav (Navbar.tsx), David's call that a 10-item mega-menu isn't
// needed up top for a site this size. Roles only: the verticals moved to industryLinks above
// once the footer gained an Industries column, so the two lists no longer repeat each other.
const agentLinks = [
  { label: "AI Receptionist", to: "/ai-agents/receptionist" },
  { label: "CEO Agent", to: "/ai-agents/ceo" },
  { label: "CFO Agent", to: "/ai-agents/cfo" },
  { label: "Sales Agent", to: "/ai-agents/sales" },
  { label: "Marketing Agent", to: "/ai-agents/marketing" },
  { label: "Recruiting Agent", to: "/ai-agents/recruiting" },
  { label: "Human Resources Agent", to: "/ai-agents/hr" },
  { label: "Personal Agent", to: "/ai-agents/personal" },
];

const industryLinks = [
  { label: "Law Firms", to: "/industries/law-firms" },
  { label: "Medical Practices", to: "/industries/medical-practices" },
  { label: "Real Estate", to: "/industries/real-estate" },
  { label: "Insurance", to: "/industries/insurance" },
  { label: "Accounting Firms", to: "/industries/accounting-firms" },
  { label: "Financial Services", to: "/industries/financial-services" },
  { label: "Professional Services", to: "/industries/professional-services" },
  { label: "Private Equity", to: "/industries/private-equity" },
];

const resourceLinks = [
  { label: "AI 101", to: "/ai-101" },
  { label: "FAQ", to: "/faq" },
  { label: "Security", to: "/security" },
  { label: "Contact", to: "/contact" },
  {
    label: "Get Started",
    to: "https://calendly.com/therealdaveo/apolloai",
    external: true,
  },
];
export default function Footer() {
  return (
    <footer>
      <div style={{ background: NAVY, color: "#FFFFFF" }} className="relative overflow-hidden">
        {/* The wordmark is a watermark now rather than a footer column, which frees that column
            up for the Industries links (David's call). aria-hidden: it is pure decoration and
            the brand is already announced by the nav. */}
        <div
          aria-hidden
          className="pointer-events-none absolute select-none"
          style={{
            left: "50%",
            bottom: "-4%",
            transform: "translateX(-50%)",
            opacity: 0.04,
            width: "min(1500px, 130%)",
          }}
        >
          <ApolloClawLogo ink="#FFFFFF" height={260} />
        </div>

        <div className="container relative z-10 mx-auto px-5 md:px-8 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <div>
              <h4
                className="font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: RED, fontWeight: 700 }}
              >
                Industries
              </h4>
              <div className="flex flex-col gap-2">
                {industryLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="font-body text-[14px] transition-colors hover:text-white"
                    style={{ color: WHITE_MUTED }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: RED, fontWeight: 700 }}
              >
                AI Agents
              </h4>
              <div className="flex flex-col gap-2">
                {agentLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="font-body text-[14px] transition-colors hover:text-white"
                    style={{ color: WHITE_MUTED }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: RED, fontWeight: 700 }}
              >
                Navigate
              </h4>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="font-body text-[14px] transition-colors hover:text-white"
                    style={{ color: WHITE_MUTED }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: RED, fontWeight: 700 }}
              >
                Resources
              </h4>
              <div className="flex flex-col gap-2">
                {resourceLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[14px] transition-colors hover:text-white"
                      style={{ color: WHITE_MUTED }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.to}
                      href={link.to}
                      className="font-body text-[14px] transition-colors hover:text-white"
                      style={{ color: WHITE_MUTED }}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4
                className="font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: RED, fontWeight: 700 }}
              >
                Let&apos;s Talk
              </h4>
              <a
                href="mailto:hello@apolloclaw.ai"
                className="font-body text-sm transition-colors hover:text-white"
                style={{ color: WHITE_MUTED, display: "inline-block", marginBottom: 6 }}
              >
                hello@apolloclaw.ai
              </a>
              <br />
              <a
                href="tel:+19173635487"
                className="font-body text-sm transition-colors hover:text-white"
                style={{ color: WHITE_MUTED }}
              >
                (917) 363-5487
              </a>
              <div className="mt-4" />
              <a
                href="https://www.linkedin.com/company/apolloclaw/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
                aria-label="LinkedIn"
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs font-mono"
                  style={{ background: RED, color: "#FFFFFF" }}
                >
                  in
                </span>
              </a>
              <div className="mt-5">
                <a
                  href="https://calendly.com/therealdaveo/apolloai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                  style={{
                    background: RED,
                    color: "#FFFFFF",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    padding: "12px 24px",
                    borderRadius: 4,
                    textDecoration: "none",
                    boxShadow: "0 6px 18px rgba(215,43,43,0.3)",
                  }}
                >
                  Schedule Today
                </a>
              </div>
            </div>
          </div>

          <div
            className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
          >
            <p className="font-body text-xs" style={{ color: WHITE_SUBTLE }}>
              &copy; 2026 Apollo[Claw]
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                href="/accessibility"
                className="font-body text-xs transition-colors hover:text-white"
                style={{ color: WHITE_MUTED }}
              >
                Accessibility
              </Link>
              <Link
                href="/security"
                className="font-body text-xs transition-colors hover:text-white"
                style={{ color: WHITE_MUTED }}
              >
                Security
              </Link>
              <Link
                href="/privacy"
                className="font-body text-xs transition-colors hover:text-white"
                style={{ color: WHITE_MUTED }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="font-body text-xs transition-colors hover:text-white"
                style={{ color: WHITE_MUTED }}
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
