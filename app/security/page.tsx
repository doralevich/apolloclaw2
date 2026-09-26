import type { Metadata } from "next";
import {
  Ban,
  Building2,
  CheckCircle2,
  Circle,
  CircleDot,
  Cloud,
  GraduationCap,
  KeyRound,
  Lock,
  Plug,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import PageHero from "@/components/PageHero";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Data Security & Privacy | Apollo Claw" },
  description:
    "Your business data stays in your environment. No vendor lock-in, no data leaving your control. See exactly how Apollo Claw protects your operation.",
  alternates: { canonical: "https://apolloclaw.ai/security" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Data Security & Privacy | Apollo Claw",
    description:
      "Your business data stays in your environment. No vendor lock-in, no data leaving your control.",
    url: "https://apolloclaw.ai/security",
    type: "website",
  },
};

// Design: sitewide navy <PageHero>, then cream / white body sections below it, matching the
// rest of the marketing site. Content grouped into square-ish grid boxes rather than long
// stacked full-width cards, so IT/procurement readers can scan it rather than read it -
// David's call after looking at the previous, all-horizontal-bars layout.

const CREAM = "#F2F0EB";
const WHITE = "#FFFFFF";
const INK = "#1A1A1A";
const RED = "#D72B2B";
const MUTED = "#555555";
const LABEL = "#888888";
const BORDER = "rgba(0,0,0,0.08)";
const GREEN = "#1E8E3E";
const AMBER = "#B8860B";
const CALENDLY = "https://cal.com/therealdaveo/dbdo-consultation";

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

function SectionIntro({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <ScrollReveal>
      <Kicker>{kicker}</Kicker>
      <h2
        className="font-display leading-[1.1] tracking-tight"
        style={{ fontSize: "clamp(24px, 3.2vw, 34px)", fontWeight: 800, color: INK, margin: "0 0 10px" }}
      >
        {title}
      </h2>
      {children && (
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: MUTED, maxWidth: 640, marginBottom: 32 }}>
          {children}
        </p>
      )}
    </ScrollReveal>
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

// A square-ish tile: icon, short title, short body. Used for the core-principles grid, which
// used to be five long full-width Cards stacked on top of each other.
function IconBox({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex h-full flex-col"
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${RED}`, borderRadius: 10, padding: "24px 22px" }}
    >
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(215,43,43,0.08)" }}>
        <Icon size={18} style={{ color: RED }} />
      </span>
      <h3
        style={{
          fontFamily: "var(--font-display), Inter, sans-serif",
          fontSize: 16,
          fontWeight: 800,
          color: INK,
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: MUTED, margin: 0 }}>{children}</p>
    </div>
  );
}

// The two deployment models, side by side as equal-width boxes rather than the two full-width
// Cards this used to be - "Cloud Hosted / Self Hosted" next to each other, David's call.
function DeployBox({
  icon: Icon,
  eyebrow,
  title,
  points,
  footer,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  points: string[];
  footer: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col"
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `4px solid ${RED}`, borderRadius: 14, padding: "28px 26px" }}
    >
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(215,43,43,0.1)" }}>
        <Icon size={20} style={{ color: RED }} />
      </span>
      <p className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: "0.12em", color: RED, fontWeight: 700, margin: "0 0 6px" }}>
        {eyebrow}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display), Inter, sans-serif",
          fontSize: 19,
          fontWeight: 800,
          color: INK,
          margin: "0 0 16px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <ul className="flex-1 space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <CheckCircle2 size={16} style={{ color: RED, flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13.5, lineHeight: 1.6, color: MUTED }}>{point}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: LABEL, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
        {footer}
      </p>
    </div>
  );
}

function StatusIcon({ done }: { done: boolean | "partial" }) {
  if (done === true) return <CheckCircle2 size={16} style={{ color: GREEN, flexShrink: 0 }} />;
  if (done === "partial") return <CircleDot size={16} style={{ color: AMBER, flexShrink: 0 }} />;
  return <Circle size={16} style={{ color: LABEL, flexShrink: 0 }} />;
}

// A checkbox-style chip: status icon + label, no explanatory paragraph. The vendor-readiness
// section used to spell out a note under every item; this is the same information as an
// actual checklist reads, which is what IT reviewers scan for first.
function CheckChip({ label, done, bg = CREAM }: { label: string; done: boolean | "partial"; bg?: string }) {
  return (
    <div className="flex items-center gap-2.5" style={{ background: bg, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
      <StatusIcon done={done} />
      <span style={{ fontSize: 13, color: INK, fontWeight: 500, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

// A slightly larger square box for compliance frameworks, which each need one short line of
// context a bare checkbox can't carry (who attests, and where the report lives).
function ComplianceBox({ label, done, note }: { label: string; done: boolean | "partial"; note: string }) {
  return (
    <div className="flex h-full flex-col gap-2" style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
      <div className="flex items-center gap-2">
        <StatusIcon done={done} />
        <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{label}</span>
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, color: MUTED, margin: 0 }}>{note}</p>
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

const POLICIES = [
  "Information Security Policy",
  "Access Control Policy",
  "Incident Management Procedure",
  "Data Protection Policy",
  "Data Classification Policy",
  "Risk Assessment & Management Policy",
  "Communications & Network Security Policy",
  "Operations Security Policy",
  "Compliance Policy",
  "Vendor Management Procedure",
  "HR Security Policy",
  "Physical & Environmental Security Policy",
];

// Vendor-readiness checklist, the same shape IT and procurement teams see in our vendor
// security packet, just surfaced directly on the page instead of gated behind a request.
const READINESS: { label: string; done: boolean | "partial" }[] = [
  { label: "Written security policies (12, InfoSec to vendor management)", done: true },
  { label: "Incident response plan + breach-notification commitment", done: true },
  { label: "Data deletion (written runbook) + export on request", done: true },
  { label: "Encryption in transit and at rest, on both deployment layers", done: true },
  { label: "Per-user data isolation (Postgres RLS) — verified live", done: true },
  { label: "Security headers, CSP, and per-IP rate limiting", done: true },
  { label: "Payment security — Stripe, PCI DSS SAQ-A scope", done: true },
  { label: "MFA on every admin and infrastructure account", done: true },
  { label: "Enforced in-app admin second factor (TOTP / AAL2 step-up)", done: true },
  { label: "Secrets management + automated dependency & secret scanning", done: true },
  { label: "Audit logging of sensitive admin actions", done: true },
  { label: "Published privacy policy + consent-gated analytics", done: true },
  { label: "HECVAT questionnaire — pre-filled, ready to submit", done: true },
  { label: "FERPA data-processing agreement, for education clients", done: true },
  { label: "Apollo[Claw]'s own SOC 2 attestation", done: "partial" },
  { label: "Third-party penetration test", done: false },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        label="Security & Privacy"
        title="Security"
        titleAccent="You Can Verify"
        description="Enterprise-grade protection, in plain language. Here is exactly how we protect your business."
      />

      {/* DEPLOYMENT MODELS - the two ways an agent actually runs, cream bg, side by side.
          First section after the hero, on purpose: this is the concrete, specific answer, and
          it belongs before the general principles below restate the same posture in policy
          language. */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <SectionIntro kicker="[ Deployment ]" title="How Your Agent Actually Runs">
            Every Apollo[Claw] agent lands on one of two infrastructures. Which one is a decision
            you make at setup, not a black box you have to take our word for.
          </SectionIntro>
          <div className="grid gap-6 md:grid-cols-2">
            <ScrollReveal delay={0}>
              <DeployBox
                icon={Cloud}
                eyebrow="Cloud-Hosted"
                title="Your Own Dedicated VPS"
                points={[
                  "One VPS per agent — never shared, multi-tenant compute",
                  "Full-volume LUKS2 disk encryption",
                  "Key-based SSH only; password authentication disabled",
                  "Firewall restricts inbound traffic to required ports only",
                  "Public-facing only — webhooks and hosted assets. No client credentials live here",
                  "Canceling stops the VPS first — nothing is destroyed until the retention window closes",
                ]}
                footer="Our runtime infrastructure is ISO 27001-certified, with a SOC 2 Type I report available on request."
              />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <DeployBox
                icon={Server}
                eyebrow="Self-Hosted"
                title="A Dedicated Mac Mini in Your Building"
                points={[
                  "One Mac mini, client-owned, assigned to you and no one else",
                  "Full-disk encryption — FileVault, AES-128-XTS",
                  "Key-based SSH only; password authentication disabled",
                  "Firewall in stealth mode — invisible to network probes",
                  "Credentials isolated on-device; never transmitted to the cloud",
                  "No inbound access or VPN — outbound HTTPS only, to a named allowlist",
                ]}
                footer="We hold physical access only during setup. After that, the device is entirely yours."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES - icon-box grid, white bg */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal delay={0}>
              <IconBox icon={Lock} title="Your Data, Your Infrastructure">
                Client runtime data lives on your VPS or your Mac mini, never a shared,
                multi-tenant cloud. See the deployment models above.
              </IconBox>
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <IconBox icon={Ban} title="No Data Resale. Ever.">
                We do not sell, share, or monetize your data. Full stop. Your business
                information belongs to you.
              </IconBox>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <IconBox icon={KeyRound} title="Encrypted Everywhere">
                TLS with HSTS in transit. AES-256-GCM, LUKS2, and FileVault at rest, each with
                its key held apart from the data it protects.
              </IconBox>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <IconBox icon={ShieldCheck} title="Least-Privilege Access">
                Row-level security isolates every account&apos;s data. MFA plus an enforced
                second-factor step-up gates every admin action.
              </IconBox>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <IconBox icon={Plug} title="Reviewed Integrations">
                Official APIs, minimum required scopes, documented and approved by you before
                anything connects.
              </IconBox>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECURITY POLICIES - cream */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <SectionIntro kicker="[ Written Policies ]" title="Formal Security Policies">
            A documented security policy framework, versioned and reviewed, available to
            enterprise clients and procurement teams on request.
          </SectionIntro>
          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            }}
          >
            {POLICIES.map((policy, i) => (
              <ScrollReveal key={policy} delay={i * 40}>
                <div
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${RED}`,
                    borderRadius: 6,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <CheckCircle2 size={15} style={{ color: RED, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: INK, fontWeight: 500 }}>{policy}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT ON TRUSTED INFRASTRUCTURE - white, logo row */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <SectionIntro kicker="[ Infrastructure ]" title="Built on Trusted Infrastructure">
            This is the infrastructure behind the Apollo[Claw] dashboard, billing, and account
            data, not where your agent itself runs — see &ldquo;How Your Agent Actually
            Runs&rdquo; above for that. Where we do host or manage a component, we build on
            providers the enterprise already trusts, each with its own mature security program
            and independent attestations.
          </SectionIntro>
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            }}
          >
            {INFRA.map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 70}>
                <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "18px 20px", height: "100%" }}>
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

      {/* COMPLIANCE & PRIVACY - cream, square boxes */}
      <section style={{ background: CREAM }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <SectionIntro kicker="[ Compliance ]" title="Compliance Posture">
            Where we hold a certification directly and where we lean on a sub-processor&apos;s,
            named plainly rather than blurred together.
          </SectionIntro>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal delay={0}>
              <ComplianceBox
                label="SOC 2"
                done="partial"
                note="Our runtime infrastructure is undergoing SOC 2 - a Type I report is available on request. Apollo[Claw]'s own attestation is on our roadmap."
              />
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <ComplianceBox label="ISO 27001" done={true} note="Our runtime infrastructure holds ISO 27001 certification." />
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <ComplianceBox label="PCI DSS" done={true} note="SAQ-A scope. Card data is handled entirely by Stripe and never touches our systems." />
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <ComplianceBox label="GDPR / CCPA" done={true} note="Published privacy policy, consent-gated analytics, and deletion on request." />
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <ComplianceBox label="FERPA" done={true} note="We act as a school official under the institution's direct control and will execute a data-processing agreement." />
            </ScrollReveal>
            <ScrollReveal delay={250}>
              <ComplianceBox label="HECVAT" done={true} note="Pre-filled questionnaire responses, ready to submit to your institution." />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FOR IT & PROCUREMENT - white, checkbox grid + contact */}
      <section style={{ background: WHITE }}>
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20 max-w-5xl">
          <SectionIntro kicker="[ Vendor Readiness ]" title="What Institutional Buyers Check For">
            The same checklist your IT and procurement team will run through. Where something is
            still in progress, we say so, plainly.
          </SectionIntro>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              marginBottom: 48,
            }}
          >
            {READINESS.map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 25}>
                <CheckChip label={item.label} done={item.done} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <Card title="For IT & Procurement">
              <p style={{ margin: "0 0 20px" }}>
                Reviewing us as a vendor? We will share our vendor security packet, written
                policies, and a data-processing agreement for your counsel to review. Same
                region, same time zone, real answers.
              </p>
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, color: MUTED }}>
                  <Building2 size={14} style={{ color: RED }} /> Enterprise-ready
                </span>
                <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, color: MUTED }}>
                  <GraduationCap size={14} style={{ color: RED }} /> FERPA / HECVAT-ready
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Button href="mailto:security@apolloclaw.ai" label="Email security@apolloclaw.ai" variant="outline" />
                <Button href={CALENDLY} label="Book a Security Call" variant="primary" />
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* QUESTIONS - cream, closing */}
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
