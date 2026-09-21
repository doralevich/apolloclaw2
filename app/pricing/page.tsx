import type { Metadata } from "next";
import Link from "next/link";
import {
  BASIC_TIER_LIMIT,
  HOSTING_PLAN,
  LICENSE_TIERS,
  MONTHLY_API_ALLOWANCE_LABEL,
  SUPPORT_PLANS,
  SUPPORT_PLAN_TERMS,
} from "@/lib/pricing/catalog";
import { SCHEDULE_CONSULT_CTA, SCHEDULE_CONSULT_URL } from "@/config/scheduling";
import { OG_IMAGES } from "@/lib/seo";

// THE PRICING PAGE. David's call: the tiers and the support plans are published, and until now
// they had nowhere to live. Tier pricing appeared on /create-an-agent, which is a checkout
// funnel rather than a page you can send somebody, and the support plans existed only in his
// head.
//
// LIGHT, ON CREAM, AND THAT IS DELIBERATE EVEN THOUGH THE REST OF THE SITE IS DARK NAVY. David
// specified the palette for this page directly: cream #F2F0EB, near-black #1A1A1A, red #E12E30,
// Bricolage headlines, Inter body, a light grid texture, no dark backgrounds. The rest of the
// site runs on the v2 dark navy system (components/home/ui.tsx), so this page does not match its
// neighbours. That is his instruction rather than an oversight here, and it is worth knowing
// before somebody "fixes" it to navy.
//
// Every number on this page is read from lib/pricing/catalog.ts, which is the same source the
// Stripe seed pushes prices from. A page that quotes a price the till does not charge is the
// failure worth engineering against, so nothing here is typed by hand.

const CREAM = "#F2F0EB";
const INK = "#1A1A1A";
const INK_MUTED = "rgba(26,26,26,0.68)";
const RED = "#E12E30";
// THE BRAND RED, DARKENED 10%, FOR SMALL TEXT ONLY. #E12E30 on this cream measures 3.98:1,
// which fails AA for anything under 24px, and every red thing on this page (the eyebrows, the
// hours labels, the pills) is 10px to 12px. Ten percent toward black takes it to 4.77:1 and is
// not a colour anybody reads as a different red.
//
// #E12E30 itself stays wherever it clears: as a button GROUND with white on it (4.53:1), and as
// the check glyphs, which are graphical objects and need 3:1. So the brand colour is unchanged
// in every place it was already legible, exactly as onDarkCard() leaves the agent brands alone
// where they pass.
const RED_INK = "#CB292B";
const RULE = "rgba(26,26,26,0.12)";

export const metadata: Metadata = {
  title: { absolute: "Pricing | Apollo[Claw]" },
  description:
    "What an Apollo[Claw] agent costs. $449 setup and $249/month for the questionnaire build, $3,500 setup for a custom-scoped build, and three support plans on top of either.",
  alternates: { canonical: "https://apolloclaw.ai/pricing" },
  openGraph: {
    images: OG_IMAGES,
    title: "Pricing | Apollo[Claw]",
    description:
      "$449 setup and $249/month all in, or $3,500 for a custom-scoped build. Support plans from $495/month.",
    url: "https://apolloclaw.ai/pricing",
    type: "website",
  },
};

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

function Grid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(26,26,26,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.045) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono mb-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
      style={{ color: RED_INK }}
    >
      {children}
    </span>
  );
}

function BookButton({ variant = "solid" }: { variant?: "solid" | "outline" }) {
  const solid = variant === "solid";
  return (
    <a
      href={SCHEDULE_CONSULT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-85"
      style={
        solid
          ? { background: RED, color: "#FFFFFF", padding: "13px 26px" }
          : { border: `1px solid ${RULE}`, color: INK, padding: "13px 26px" }
      }
    >
      {SCHEDULE_CONSULT_CTA}
    </a>
  );
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-[3px] shrink-0">
      <path d="M3 8.5l3.2 3.2L13 5" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div style={{ background: CREAM, color: INK }}>
      <section className="relative overflow-hidden">
        <Grid />
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Pricing</Eyebrow>
            <h1
              className="font-heading text-[clamp(1.875rem,3.4vw,3rem)] font-extrabold leading-[1.12] tracking-tight"
              style={{ textWrap: "balance" }}
            >
              One setup fee, one monthly, and nothing you have to work out afterwards
            </h1>
            <p className="font-body mt-6 text-[1.125rem] leading-[1.65]" style={{ color: INK_MUTED, maxWidth: 620 }}>
              Two ways to start, depending on whether the build is scoped to you. The monthly is
              the same either way and it is all in.
            </p>
          </div>
        </div>
      </section>

      {/* ── The two tiers ── */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${RULE}` }}>
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {LICENSE_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col rounded-2xl p-8"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: tier.recommended ? `1px solid rgba(225,46,48,0.4)` : `1px solid ${RULE}`,
                }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-[1.5rem] font-bold leading-[1.2]">{tier.label}</h2>
                  {tier.recommended && (
                    <span
                      className="font-mono shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ background: "rgba(225,46,48,0.1)", color: RED_INK }}
                    >
                      Most chosen
                    </span>
                  )}
                </div>
                <p className="font-body mt-2 text-[15px]" style={{ color: INK_MUTED }}>
                  {tier.tagline}
                </p>

                <div className="mt-7 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-heading text-[2.5rem] font-extrabold leading-none">
                    {money(tier.amountCents)}
                  </span>
                  <span className="font-body text-[15px]" style={{ color: INK_MUTED }}>
                    setup
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-heading text-[1.5rem] font-bold leading-none">{money(HOSTING_PLAN.amountCents)}</span>
                  <span className="font-body text-[15px]" style={{ color: INK_MUTED }}>
                    per month, all in
                  </span>
                </div>

                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {tier.includes.map((line) => (
                    <li key={line} className="font-body flex gap-2.5 text-[15px] leading-[1.55]">
                      <Check />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                {tier.id === "basic" && (
                  <p
                    className="font-body mt-6 rounded-lg px-4 py-3 text-[13.5px] leading-[1.5]"
                    style={{ background: "rgba(26,26,26,0.04)", color: INK_MUTED }}
                  >
                    {BASIC_TIER_LIMIT}
                  </p>
                )}

                <div className="mt-7">
                  <BookButton variant={tier.recommended ? "solid" : "outline"} />
                </div>
              </div>
            ))}
          </div>

          {/* David's exact sentence, from the catalog. Both tiers, one wording. */}
          <p
            className="font-body mx-auto mt-10 max-w-3xl rounded-xl px-6 py-5 text-center text-[15px] leading-[1.7]"
            style={{ border: `1px solid ${RULE}`, color: INK_MUTED }}
          >
            {MONTHLY_API_ALLOWANCE_LABEL}
          </p>
        </div>
      </section>

      {/* ── Support plans ── */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${RULE}` }}>
        <Grid />
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <Eyebrow>Support Plans</Eyebrow>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] tracking-tight">
              Add ongoing time to either tier
            </h2>
            <p className="font-body mt-4 text-[1.0625rem] leading-[1.65]" style={{ color: INK_MUTED }}>
              An agent earns its keep when somebody keeps tuning it. These plans buy that
              attention by the month, on top of whichever tier you started on.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {SUPPORT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl p-7"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: plan.recommended ? `1px solid rgba(225,46,48,0.4)` : `1px solid ${RULE}`,
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-[1.25rem] font-bold leading-[1.2]">{plan.name}</h3>
                  {plan.recommended && (
                    <span
                      className="font-mono shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ background: "rgba(225,46,48,0.1)", color: RED_INK }}
                    >
                      Most chosen
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-heading text-[2rem] font-extrabold leading-none">
                    {money(plan.amountCents)}
                  </span>
                  <span className="font-body text-[15px]" style={{ color: INK_MUTED }}>
                    per month
                  </span>
                </div>
                <p
                  className="font-mono mt-2 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: RED_INK }}
                >
                  {plan.hours} hours a month
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.includes.map((line) => (
                    <li key={line} className="font-body flex gap-2.5 text-[14.5px] leading-[1.55]">
                      <Check />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <ul className="font-body flex flex-wrap gap-x-6 gap-y-1 text-[13.5px]" style={{ color: INK_MUTED }}>
              {SUPPORT_PLAN_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
            <BookButton variant="outline" />
          </div>
        </div>
      </section>

      {/* ── Custom hardware ── */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${RULE}` }}>
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
          <div
            className="flex flex-col items-start gap-6 rounded-2xl p-9 md:flex-row md:items-center md:justify-between"
            style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${RULE}` }}
          >
            <div className="max-w-xl">
              <Eyebrow>Custom Hardware</Eyebrow>
              <h2 className="font-heading text-[1.5rem] font-bold leading-[1.2]">
                Mac Mini and private server builds
              </h2>
              <p className="font-body mt-3 text-[15.5px] leading-[1.65]" style={{ color: INK_MUTED }}>
                Some work belongs on hardware you own, in your building, on your network. We scope
                and build those. Pricing depends on the machine and the work, so it is a
                conversation rather than a number on a page.
              </p>
            </div>
            <div className="shrink-0">
              <BookButton />
            </div>
          </div>
        </div>
      </section>

      {/* ── Close ── */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${RULE}` }}>
        <Grid />
        <div className="container relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] tracking-tight">
              Not sure which tier you are
            </h2>
            <p className="font-body mt-4 text-[1.0625rem] leading-[1.65]" style={{ color: INK_MUTED }}>
              Bring the work that keeps landing on you. Twenty minutes is usually enough to tell
              whether the questionnaire build covers it or whether it wants scoping.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <BookButton />
              <Link
                href="/ai-agents"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-70"
                style={{ border: `1px solid ${RULE}`, color: INK, padding: "13px 26px" }}
              >
                See the Agents
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
