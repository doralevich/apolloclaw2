import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Cloud,
  GraduationCap,
  Layers,
  Rocket,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { BodyLarge, BracketLabel, H2, RED, Section, SoftLink, TAN, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";
import { OG_IMAGES } from "@/lib/seo";

// Enterprise (David, Sept 27 2026): a lean page for leadership teams, portfolio companies, and
// institutions, linked from the top nav. Every fact here is already stated on /security or in the
// vendor security packet; the page gathers the parts an enterprise buyer asks about first and
// points to /security for the full detail. The sitewide PreFooter closes the page with the
// discovery-call CTA.

const TITLE = "Enterprise AI Agents | Apollo Claw";
const DESCRIPTION =
  "Private, dedicated AI agents for leadership teams, portfolio companies, and institutions, with the security documentation your review team expects.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "https://apolloclaw.ai/enterprise" },
  openGraph: {
    images: OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    url: "https://apolloclaw.ai/enterprise",
    type: "website",
  },
};

const BORDER = "1px solid rgba(11,23,41,0.1)";

const ROLLOUT: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Rocket,
    title: "Start With a Focused Pilot",
    body: "One team, one workflow, and clear measures of success, live in about two weeks.",
  },
  {
    Icon: Layers,
    title: "Expand Team by Team",
    body: "Each agent is tailored to the people it serves, on shared standards for security and access.",
  },
  {
    Icon: Users,
    title: "Support at Every Stage",
    body: "Thirty days of hands-on training for every build, then ongoing support as your organization grows.",
  },
];

const DEPLOY: { Icon: LucideIcon; eyebrow: string; title: string; points: string[] }[] = [
  {
    Icon: Cloud,
    eyebrow: "Cloud-Hosted",
    title: "A Dedicated Private Server",
    points: [
      "One server per agent, reserved for your organization",
      "Full-volume disk encryption",
      "Key-based access with a locked-down firewall",
    ],
  },
  {
    Icon: Server,
    eyebrow: "Self-Hosted",
    title: "A Mac Mini in Your Building",
    points: [
      "Client-owned hardware, assigned to you alone",
      "FileVault full-disk encryption",
      "Credentials stay on the device, with outbound traffic limited to an approved list",
    ],
  },
];

const READINESS = [
  "Vendor security packet, available on request",
  "Twelve written security policies",
  "Incident response plan and breach notification commitment",
  "Encryption in transit and at rest",
  "MFA on every admin and infrastructure account",
  "Data export and deletion on request",
  "Runtime infrastructure certified to ISO 27001",
  "SOC 2 Type I report for our runtime infrastructure, on request",
  "HECVAT responses, pre-filled and ready to submit",
  "FERPA data-processing agreement for education clients",
];

const AUDIENCES: { Icon: LucideIcon; title: string; body: string; to: string }[] = [
  {
    Icon: Briefcase,
    title: "Executive Teams",
    body: "A Chief of Staff agent for each leader, with briefs, follow-through, and reporting handled.",
    to: "/ai-agents/ceo",
  },
  {
    Icon: Building2,
    title: "PE-Backed Portfolio Companies",
    body: "Consistent reporting and back-office support across every company in the portfolio.",
    to: "/industries/private-equity",
  },
  {
    Icon: GraduationCap,
    title: "Universities and Colleges",
    body: "Admissions, student services, and campus operations, with FERPA and HECVAT covered.",
    to: "/ai-consulting-education",
  },
  {
    Icon: Users,
    title: "Professional Services Firms",
    body: "Intake, project administration, and client follow-up, so your experts stay focused on clients.",
    to: "/industries/professional-services",
  },
];

export default function EnterprisePage() {
  return (
    <>
      <PageHero
        title="AI Agents Built for"
        titleAccent="Enterprise and Education"
        description="Private, dedicated agents for leadership teams, portfolio companies, and institutions, with the documentation your review team expects."
      />

      {/* ROLLOUT - cream */}
      <Section bg={TAN}>
        <div className="mx-auto max-w-3xl text-center">
          <BracketLabel light>Built to Scale</BracketLabel>
          <H2 light>One Partner From Your First Agent to Every Team.</H2>
          <div className="mt-6">
            <BodyLarge light>
              We start where the impact is clearest, prove it, and expand at the pace your
              organization sets.
            </BodyLarge>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
          {ROLLOUT.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-xl bg-white p-7" style={{ border: BORDER }}>
              <Icon size={26} strokeWidth={1.5} aria-hidden style={{ color: RED }} />
              <h3 className="font-heading mt-5 text-[1.15rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                {title}
              </h3>
              <p className="font-body mt-2 text-[15px] leading-[1.65]" style={{ color: TAN_INK_MUTED }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* DEPLOYMENT - white */}
      <Section bg="#FFFFFF">
        <div className="mx-auto max-w-3xl text-center">
          <BracketLabel light>Deployment</BracketLabel>
          <H2 light>Dedicated Infrastructure, Your Choice.</H2>
          <div className="mt-6">
            <BodyLarge light>Every agent runs privately for one client, in the environment you choose at setup.</BodyLarge>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {DEPLOY.map(({ Icon, eyebrow, title, points }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl p-8"
              style={{ background: TAN, border: BORDER, borderTop: `3px solid ${RED}` }}
            >
              <Icon size={26} strokeWidth={1.5} aria-hidden style={{ color: RED }} />
              <p className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: RED }}>
                {eyebrow}
              </p>
              <h3 className="font-heading mt-1 text-[1.25rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                {title}
              </h3>
              <ul className="mt-5 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 size={17} aria-hidden className="mt-0.5 shrink-0" style={{ color: RED }} />
                    <span className="font-body text-[15px] leading-[1.6]" style={{ color: TAN_INK_MUTED }}>
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* PROCUREMENT - cream */}
      <Section bg={TAN}>
        <div className="mx-auto max-w-3xl text-center">
          <BracketLabel light>Procurement Ready</BracketLabel>
          <H2 light>The Documentation Your Review Team Expects.</H2>
          <div className="mt-6">
            <BodyLarge light>Ready for IT, security, and procurement review from the first conversation.</BodyLarge>
          </div>
        </div>
        <ul className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2">
          {READINESS.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-lg bg-white px-5 py-4" style={{ border: BORDER }}>
              <ShieldCheck size={18} aria-hidden className="shrink-0" style={{ color: RED }} />
              <span className="font-body text-[14.5px] font-medium leading-[1.45]" style={{ color: TAN_INK }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <SoftLink light href="/security">
            See Our Full Security Posture →
          </SoftLink>
        </div>
      </Section>

      {/* AUDIENCES - white */}
      <Section bg="#FFFFFF">
        <div className="mx-auto max-w-3xl text-center">
          <BracketLabel light>Who We Serve</BracketLabel>
          <H2 light>Trusted Across Leadership, Portfolios, and Campuses.</H2>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2">
          {AUDIENCES.map(({ Icon, title, body, to }) => (
            <Link
              key={title}
              href={to}
              className="group flex items-start gap-5 rounded-xl p-7 transition-shadow hover:shadow-[0_10px_30px_rgba(11,23,41,0.08)]"
              style={{ background: TAN, border: BORDER, textDecoration: "none" }}
            >
              <Icon size={26} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" style={{ color: RED }} />
              <span className="min-w-0">
                <span className="font-heading block text-[1.15rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                  {title}
                </span>
                <span className="font-body mt-2 block text-[15px] leading-[1.65]" style={{ color: TAN_INK_MUTED }}>
                  {body}
                </span>
                <span className="font-mono mt-4 block text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: TAN_INK }}>
                  Explore &rarr;
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
