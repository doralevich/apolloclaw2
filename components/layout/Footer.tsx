"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Insights", to: "/blog" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "AI 101", to: "/ai-101" },
  { label: "Cost Estimator", to: "/cost-estimator" },
];

const supportLinks = [
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
        backgroundColor: "#E8342A",
        borderRadius: "0px",
        padding: "40px 32px",
        marginBottom: "0",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "8px",
          }}
        >
          Weekly Intelligence
        </p>
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          Get The Weekly Claw
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body, Inter, sans-serif)",
            fontSize: "14px",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "24px",
            lineHeight: "1.5",
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
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "999px",
              padding: "12px 28px",
              color: "#ffffff",
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
              gap: "8px",
              maxWidth: "480px",
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
                flex: "1 1 220px",
                padding: "12px 18px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                fontFamily: "var(--font-body, Inter, sans-serif)",
                fontSize: "14px",
                outline: "none",
                caretColor: "#ffffff",
                minWidth: "200px",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.25)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
              }}
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              style={{
                flex: "0 0 auto",
                padding: "12px 24px",
                borderRadius: "999px",
                border: "2px solid #ffffff",
                backgroundColor: "#ffffff",
                color: "#E8342A",
                fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                fontSize: "13px",
                fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                letterSpacing: "0.05em",
                opacity: status === "loading" ? 0.7 : 1,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p
            style={{
              marginTop: "10px",
              color: "rgba(255,255,255,0.85)",
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
    <footer className="bg-background border-t border-border/30">
      <NewsletterSignup />
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <svg
              viewBox="0 0 480 80"
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: "48px", width: "auto" }}
            >
              <text
                y="62"
                fontFamily="'IBM Plex Mono', 'Courier New', monospace"
                fontSize="48"
                fontWeight="700"
                letterSpacing="-1.5"
                fill="currentColor"
                className="text-foreground"
              >
                Apollo
                <tspan fill="#D72B2B">[</tspan>
                Claw
                <tspan fill="#D72B2B">]</tspan>
              </text>
            </svg>
            <p className="font-body text-foreground mt-4 text-sm leading-relaxed">
              Your Business.
              <br />
              Your Data.
              <br />
              <span className="text-primary">Your AI.</span>
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-foreground mb-4">
              Navigate
            </h4>
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className="font-body text-[14px] text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-foreground mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-1.5">
              {supportLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[14px] text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    href={link.to}
                    className="font-body text-[14px] text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-foreground mb-4">
              Let&apos;s Talk
            </h4>
            <a
              href="mailto:hello@apolloclaw.ai"
              className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
            >
              hello@apolloclaw.ai
            </a>
            <br />
            <a
              href="tel:+19173635487"
              className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
            >
              (917) 363-5487
            </a>
            <div className="mt-3" />
            <a
              href="https://www.linkedin.com/company/apolloclaw/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
              aria-label="LinkedIn"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs font-mono">
                in
              </span>
            </a>
            <div className="mt-4">
              <a
                href="https://calendly.com/therealdaveo/apolloai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="font-body text-sm font-medium text-primary-foreground bg-primary border border-primary rounded-full px-6 py-3 hover:bg-primary/85 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25">
                  Schedule Today
                </button>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-subtle">
            &copy; 2026 Apollo[Claw]
          </p>
          <div className="flex gap-6">
            <Link
              href="/accessibility"
              className="font-body text-xs text-foreground hover:text-primary transition-colors"
            >
              Accessibility
            </Link>
            <Link
              href="/security"
              className="font-body text-xs text-foreground hover:text-primary transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
