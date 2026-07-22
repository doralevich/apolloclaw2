import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: { absolute: "AI Data Security & Privacy | Apollo Claw" },
  description:
    "Your business data stays in your environment. Apollo Claw's AI implementation approach: no vendor lock-in, no data leaving your control. See how we protect your operation.",
  alternates: { canonical: "https://apolloclaw.ai/security" },
  openGraph: {
    title: "AI Data Security & Privacy | Apollo Claw",
    description:
      "Your business data stays in your environment. No vendor lock-in, no data leaving your control.",
    url: "https://apolloclaw.ai/security",
    type: "website",
  },
};

// Design: cream / near-black / red only, no dark sections. This intentionally
// does not use the sitewide <PageHero> (which renders a navy hero) since this
// page's brief explicitly calls for no dark backgrounds anywhere.

const CREAM = "#F2F0EB";
const WHITE = "#FFFFFF";
const INK = "#1A1A1A";
const RED = "#D72B2B";
const MUTED = "#555555";
const LABEL = "#888888";
const BORDER = "rgba(0,0,0,0.08)";
const CALENDLY = "https://calendly.com/therealdaveo/apolloai";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block font-mono uppercase mb-4"
      style={{ fontSize: 11, letterSpacing: "0.16em", color: LABEL }}
    >
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderTop: `3px solid ${RED}`,
        borderRadius: 10,
        padding: "28px 30px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display), Inter, sans-serif",
          fontSize: 19,
          fontWeight: 800,
          color: INK,
          margin: "0 0 12px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: MUTED }}>{children}</div>
    </div>
  );
}

function Button({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "outline";
}) {
  const isExternal = href.startsWith("http");
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "13px 26px",
    borderRadius: 4,
    textDecoration: "none",
  };
  const style: React.CSSProperties =
    variant === "primary"
      ? { ...base, background: RED, color: "#ffffff", boxShadow: "0 6px 18px rgba(215,43,43,0.28)" }
      : { ...base, background: "transparent", color: INK, border: `1px solid rgba(0,0,0,0.25)` };
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="transition-all hover:brightness-110"
      style={style}
    >
      {label}
    </a>
  );
}

const INFRA = [
  { name: "Vercel", role: "Application hosting and delivery" },
  { name: "Supabase", role: "Database, authentication, and storage" },
  { name: "Stripe", role: "Payment processing. Card data never touches our systems." },
  { name: "Anthropic (Claude)", role: "The AI model layer, enterprise-grade and privacy-respecting" },
];

const COMPLIANCE = [
  {
    label: "Privacy (GDPR / CCPA)",
    body: "Consent-based analytics and deletion on request. A formal privacy policy is in development, available on request in the meantime.",
  },
  {
    label: "Payments (PCI DSS)",
    body: "All card data is handled by Stripe under PCI DSS and never reaches our systems.",
  },
  {
    label: "SOC 2",
    body: "The infrastructure we build on is SOC 2 attested. Our own SOC 2 program is underway.",
  },
  {
    label: "Education clients (FERPA / HECVAT)",
    body: "For universities and student-facing programs, Apollo[Claw] is FERPA-aware and will execute a data-processing agreement, with completed HECVAT responses available.",
  },
  {
    label: "Documentation on request",
    body: "Written security policies, a data-processing agreement, and a vendor security packet are available to IT and procurement teams.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* HERO — cream, no dark background */}
      <section style={{ background: CREAM, color: INK }}>
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-3xl text-center">
          <ScrollReveal>
            <Kicker>[ Security &amp; Privacy ]</Kicker>
            <h1
              className="font-display leading-[1.08] tracking-tight"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: INK, margin: 0 }}
            >
              Your Data <span style={{ color: RED }}>Stays Yours</span>
            </h1>
            <p
              className="font-body"
              style={{ fontSize: "clamp(15px, 1.15vw, 17px)", lineHeight: 1.7, color: MUTED, maxWidth: 620, margin: "22px auto 0" }}
            >
              Enterprise-grade protection, in plain language. Here is exactly how we protect your business.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CORE PRINCIPLES — 5 cards, white bg */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-3xl">
          <div className="space-y-6">
            <ScrollReveal delay={0}>
              <Card title="Your Data, Your Infrastructure">
                Apollo[Claw] agents are built on your infrastructure wherever possible. Your data does not
                pass through servers we own or control unless it is a requirement of a specific integration
                you have approved.
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <Card title="No Data Resale. Ever.">
                We do not sell, share, or monetize your data. Full stop. Your business information, client
                data, and operational details belong to you.
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <Card title="Encrypted in Transit and at Rest">
                All data in transit is encrypted using TLS 1.3 with HSTS. Data at rest is encrypted using
                AES-256 where applicable. Credentials and API keys are stored in encrypted vaults using
                AES-256-GCM, with the key held separately from the data it protects, never in plaintext.
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <Card title="Access Controls">
                Apollo[Claw] operates on a least-privilege model. Your agent only has access to the specific
                tools and data it needs to perform its defined tasks, and access is reviewed when scope
                changes. Every administrative and infrastructure account requires multi-factor authentication,
                with a second factor enforced before privileged actions.
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <Card title="Third-Party Integrations">
                When your AI agent connects to third-party tools (Gmail, CRMs, calendars), those connections
                are made using official API protocols with the minimum required permissions. We document
                every integration and require your explicit approval.
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* GOVERNANCE — cream */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-3xl">
          <ScrollReveal>
            <Card title="Governance & Operational Security">
              Security is not just architecture, it is discipline. Apollo[Claw] operates under written
              policies covering information security, access control, incident response, and data retention.
              We maintain an incident-response plan with a breach-notification commitment, log sensitive
              administrative actions, and continuously scan our code for vulnerabilities and exposed secrets.
              Where we host or manage components, backups run with point-in-time recovery and are encrypted
              at rest.
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* BUILT ON TRUSTED INFRASTRUCTURE — white, logo row */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-3xl">
          <ScrollReveal>
            <Kicker>[ Infrastructure ]</Kicker>
            <h2
              className="font-display leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(24px, 3.2vw, 34px)", fontWeight: 800, color: INK, margin: "0 0 10px" }}
            >
              Built on Trusted Infrastructure
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: MUTED, maxWidth: 640, marginBottom: 32 }}>
              Where a deployment includes components we host or manage, we build on providers the enterprise
              already trusts, each with its own mature security program and independent attestations.
            </p>
          </ScrollReveal>
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            }}
          >
            {INFRA.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 70}>
                <div
                  style={{
                    background: CREAM,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "18px 20px",
                    height: "100%",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: INK,
                      margin: "0 0 6px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.name}
                  </p>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: MUTED, margin: 0 }}>{item.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE & PRIVACY — cream */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-3xl">
          <ScrollReveal>
            <Card title="Compliance & Privacy">
              <div style={{ display: "grid", gap: 16, marginTop: 4 }}>
                {COMPLIANCE.map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ color: RED, fontWeight: 800, fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>
                      &#8594;
                    </span>
                    <span>
                      <strong style={{ color: INK }}>{item.label}:</strong> {item.body}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* FOR IT & PROCUREMENT — white */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-3xl">
          <ScrollReveal>
            <Card title="For IT & Procurement">
              <p style={{ margin: "0 0 20px" }}>
                Reviewing us as a vendor? We will share our vendor security packet, written policies, and a
                data-processing agreement for your counsel to review. Same region, same time zone, real
                answers.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Button href="mailto:security@apolloclaw.ai" label="Email security@apolloclaw.ai" variant="outline" />
                <Button href={CALENDLY} label="Book a Security Call" variant="primary" />
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* QUESTIONS — cream, closing */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-24 max-w-2xl text-center">
          <ScrollReveal>
            <h2
              className="font-display"
              style={{ fontSize: "clamp(22px, 2.6vw, 28px)", fontWeight: 800, color: INK, margin: "0 0 12px" }}
            >
              Questions?
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: MUTED, margin: 0 }}>
              Email us at{" "}
              <a href="mailto:security@apolloclaw.ai" style={{ color: RED, textDecoration: "underline" }}>
                security@apolloclaw.ai
              </a>{" "}
              with any security questions. We respond to security inquiries within one business day.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
