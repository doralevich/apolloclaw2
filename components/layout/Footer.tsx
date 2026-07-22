"use client";

import Link from "next/link";
import { useState } from "react";

const NAVY = "#0B1729";
const RED = "#D72B2B";
const WHITE_MUTED = "rgba(255,255,255,0.72)";
const WHITE_SUBTLE = "rgba(255,255,255,0.45)";

const navLinks = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Insights", to: "/blog" },
  { label: "Case Studies", to: "/case-studies" },
];

const resourceLinks = [
  { label: "AI 101", to: "/ai-101" },
  { label: "Cost Estimator", to: "/cost-estimator" },
  { label: "FAQ", to: "/faq" },
  { label: "Security", to: "/security" },
  { label: "Membership", to: "/membership" },
  { label: "Contact", to: "/contact" },
  {
    label: "Get Started",
    to: "https://calendly.com/therealdaveo/apolloai",
    external: true,
  },
];

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F7F6F2",
        padding: "72px 32px",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            fontSize: "13px",
            letterSpacing: "0.08em",
            color: "#1A1A1A",
            marginBottom: "14px",
            fontWeight: 600,
          }}
        >
          <span style={{ color: RED, fontWeight: 700 }}>[</span> Weekly Intelligence{" "}
          <span style={{ color: RED, fontWeight: 700 }}>]</span>
        </p>
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            fontSize: "clamp(22px, 3.4vw, 30px)",
            fontWeight: 700,
            color: "#1A1A1A",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
          }}
        >
          The Weekly Claw
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body, Inter, sans-serif)",
            fontSize: "15px",
            color: "#555555",
            marginBottom: "30px",
            lineHeight: "1.6",
          }}
        >
          What happened in AI last week and what to watch this week. Every Monday.
        </p>

        {status === "success" ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(215,43,43,0.08)",
              border: `1px solid ${RED}`,
              borderRadius: "999px",
              padding: "12px 28px",
              color: RED,
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <span>✓</span> You&apos;re in!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              maxWidth: "520px",
              margin: "0 auto",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              style={{
                flex: "1 1 240px",
                padding: "14px 22px",
                borderRadius: "999px",
                border: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "#FFFFFF",
                color: "#1A1A1A",
                fontFamily: "var(--font-body, Inter, sans-serif)",
                fontSize: "14px",
                outline: "none",
                minWidth: "220px",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = RED;
                e.target.style.boxShadow = "0 0 0 3px rgba(215,43,43,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0,0,0,0.12)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              style={{
                flex: "0 0 auto",
                padding: "14px 28px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: RED,
                color: "#FFFFFF",
                fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                fontSize: "12px",
                fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: status === "loading" ? 0.7 : 1,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                boxShadow: "0 6px 18px rgba(215,43,43,0.28)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {status === "loading" ? "..." : (
                <>
                  Subscribe <span aria-hidden>→</span>
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p
            style={{
              marginTop: "12px",
              color: RED,
              fontSize: "13px",
              fontFamily: "var(--font-body, Inter, sans-serif)",
            }}
          >
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer>
      <NewsletterSignup />
      <div style={{ background: NAVY, color: "#FFFFFF" }}>
        <div className="container mx-auto px-5 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <svg
                viewBox="0 0 480 80"
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: "40px", width: "auto" }}
                aria-label="Apollo[Claw]"
              >
                <text
                  y="62"
                  fontFamily="'IBM Plex Mono', 'Courier New', monospace"
                  fontSize="48"
                  fontWeight="700"
                  letterSpacing="-1.5"
                  fill="#FFFFFF"
                >
                  Apollo
                  <tspan fill={RED}>[</tspan>
                  Claw
                  <tspan fill={RED}>]</tspan>
                </text>
              </svg>
              <p
                className="font-body mt-4 text-sm leading-relaxed"
                style={{ color: WHITE_MUTED }}
              >
                Your Business.
                <br />
                Your Data.
                <br />
                <span style={{ color: RED }}>Your AI.</span>
              </p>
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
            <div className="flex gap-6">
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
