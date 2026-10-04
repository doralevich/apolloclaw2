import type { Metadata } from "next";
import Link from "next/link";
import { ENTERPRISE, PLANS_ON_SALE, agentsLabel, dollars } from "@/config/agent-plans";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";
import { EnterpriseContactButton, EnterpriseForm } from "@/components/pricing/EnterpriseForm";
import { ClipboardList, Headphones, Layers, Network, Rocket, Users } from "lucide-react";
import { OG_IMAGES } from "@/lib/seo";

// THE PRICING PAGE (David, Oct 4 2026): the plans, priced in public, with real content under them.
//
// Layout: equal plan cards side by side with Team highlighted, then one wide Enterprise strip with
// "Contact us", then what every plan includes, how it works, FAQs, and a closing consultation
// button. The comparison table went (David's call: the cards already say it). The cards are
// whatever PLANS_ON_SALE holds (Solo, Team and Executive) and the grid follows.
//
// KEEP IT SIMPLE. No API keys, tokens, credits, caps, markup or "bring your own key" anywhere on
// this page: buyers found them confusing. Those rules live in the product and the checkout terms,
// and reach this page as one line of fine print and one plain phrase per card ("AI usage
// included"). Nothing about compliance, HIPAA or data residency either; we do not claim them.
//
// Every number is read from config/agent-plans.ts and lib/pricing/catalog.ts, the same source the
// checkout and the Stripe sync use. A page that quotes a price the till does not charge is the
// failure worth engineering against, so nothing here is typed by hand.
//
// White ground, the logo red, Bricolage headings and Inter body: the brand as the brief gives it.

const INK = "#1A1A1A";
const INK_MUTED = "rgba(26,26,26,0.68)";
const RED = "#E12E30";
// The logo red measures about 4.3:1 on white, short of AA for small text, so labels and links
// under 24px use it darkened 10%. The red itself stays wherever it clears: button grounds, borders,
// check glyphs.
const RED_INK = "#CB292B";
const RULE = "rgba(26,26,26,0.12)";
const SOFT = "#F7F6F3";

const featured = PLANS_ON_SALE.find((p) => p.featured);
const team = PLANS_ON_SALE.find((p) => p.id === "team");
const lowest = Math.min(...PLANS_ON_SALE.map((p) => p.monthlyCents ?? Infinity));

const summary = PLANS_ON_SALE.map((p) => `${p.label} ${dollars(p.monthlyCents ?? 0)}/month for ${agentsLabel(p.agents)}`).join(", ");

export const metadata: Metadata = {
  title: { absolute: "Pricing | Apollo[Claw]" },
  description: `Apollo[Claw] plans: ${summary}. No setup fee. Custom corporate builds on a call.`,
  alternates: { canonical: "https://apolloclaw.ai/pricing" },
  openGraph: {
    images: OG_IMAGES,
    title: "Pricing | Apollo[Claw]",
    description: `AI agents built around your business, from ${dollars(lowest)} a month. No setup fee.`,
    url: "https://apolloclaw.ai/pricing",
    type: "website",
  },
};

function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <span
      className="font-mono mb-3 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
      style={{ color: onDark ? "#FF8A8B" : RED_INK }}
    >
      {children}
    </span>
  );
}

function Check({ color = RED }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-[4px] shrink-0">
      <path d="M3 8.5l3.2 3.2L13 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BTN =
  "font-body inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-6 py-3 text-[14px] font-bold transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const ENTERPRISE_FEATURES = [
  { label: "Everything in Executive", Icon: Layers },
  { label: "Multiple users and roles", Icon: Users },
  { label: "Shared memory between agents", Icon: Network },
  { label: "Audit logs", Icon: ClipboardList },
  { label: "Dedicated support", Icon: Headphones },
  { label: "Onboarding with your team", Icon: Rocket },
];

const INCLUDED = [
  { title: "An agent built around your business", body: "Set up from what you tell us about how you work, not a generic bot." },
  { title: "Hosting and updates", body: "It runs on its own server, kept current and backed up. Nothing to install." },
  { title: "Your chat channel", body: "Talk to it where you already talk, starting with Telegram." },
  { title: "Your apps", body: "Email, calendar, CRM and documents, through about 1,000 integrations." },
  { title: "Email support", body: "A real person when you need a hand." },
];

const STEPS = [
  { title: "We set it up", body: "Answer a short questionnaire about your business. We build your agent from it and connect it to your chat app." },
  { title: "It learns your business", body: "It reads what you shared and the apps you connect, and keeps notes as it works." },
  { title: "It works for you", body: "Message it like a colleague. It drafts, follows up, schedules and reports back." },
];

const FAQS = [
  {
    q: "What is an agent?",
    a: "One AI assistant with one job, on one chat channel, connected to the apps it needs. Your sales agent and your scheduling agent are two agents. Quick helper tasks an agent runs on its own do not count.",
  },
  {
    q: "Can I add more agents?",
    a: team?.addOn
      ? `Yes. On ${team.label}, add agents for ${dollars(team.addOn.monthlyCents)} a month each, right from your dashboard. Once you reach ${team.upgradeAt ?? 6}, Executive is usually the better fit.`
      : "Yes, from your dashboard, or move up a plan.",
  },
  { q: "Can I cancel?", a: "Any time. Plans are month to month, with no setup fee and no minimum term." },
  {
    q: "What if I need more?",
    a: "Executive includes ten agents. For more than that, several users, or agents that share one memory, we build it with you. Book a call.",
  },
  {
    q: "Do you build custom agents?",
    a: `Yes. Custom corporate builds start with a call, are scoped with you, and can run on your own private server, starting at ${ENTERPRISE.privateServersFrom}.`,
  },
  {
    q: "What happens after I sign up?",
    a: "You answer a short questionnaire about your business, we set your agent up from it, and it shows up in your chat app ready to work.",
  },
];

export default function PricingPage() {
  const cols = PLANS_ON_SALE.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  const width = PLANS_ON_SALE.length >= 3 ? "max-w-6xl" : "max-w-4xl";

  return (
    <div style={{ background: "#FFFFFF", color: INK }}>
      {/* ── Header ── */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 text-center md:px-8 md:pt-16">
        <Eyebrow>Pricing</Eyebrow>
        <h1
          className="font-heading mx-auto max-w-3xl text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight"
          style={{ textWrap: "balance" }}
        >
          AI agents that work for your business, priced by the month
        </h1>
        <p className="font-body mx-auto mt-5 max-w-2xl text-[1.125rem] leading-[1.6]" style={{ color: INK_MUTED }}>
          Pick how many agents you want working for you. No setup fee, and you can cancel any time.
        </p>
      </section>

      {/* ── The plans ── */}
      <section className={`mx-auto ${width} px-5 md:px-8`}>
        <div className={`grid items-stretch gap-6 ${cols}`}>
          {PLANS_ON_SALE.map((plan) => {
            const isFeatured = plan === featured;
            const lines = [...plan.features, plan.channelsText, plan.supportText];
            return (
              <article
                key={plan.id}
                className="relative flex flex-col rounded-2xl p-8"
                style={{
                  background: "#FFFFFF",
                  border: isFeatured ? `2px solid ${RED}` : `1px solid ${RULE}`,
                  boxShadow: isFeatured ? "0 18px 40px -24px rgba(225,46,48,0.45)" : "0 1px 2px rgba(26,26,26,0.04)",
                }}
                aria-label={`${plan.label} plan`}
              >
                {isFeatured && (
                  <span
                    className="font-mono absolute -top-3 left-8 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                    style={{ background: RED }}
                  >
                    Most popular
                  </span>
                )}
                <h2 className="font-heading text-[1.5rem] font-bold leading-tight">{plan.label}</h2>
                <p className="font-body mt-1.5 text-[15px] leading-[1.5]" style={{ color: INK_MUTED }}>
                  {plan.tagline}
                </p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-heading text-[3rem] font-extrabold leading-none tabular-nums">
                    {dollars(plan.monthlyCents ?? 0)}
                  </span>
                  <span className="font-body text-[15px]" style={{ color: INK_MUTED }}>
                    / month
                  </span>
                </p>
                {/* The plan at a glance, in its own box: who it is for and that usage is in. */}
                <div className="mt-6 rounded-xl border px-4 py-3" style={{ borderColor: RULE, background: SOFT }}>
                  <p className="font-body text-[15px] font-semibold">{plan.agentsText}</p>
                  <p className="font-body text-[14px]" style={{ color: INK_MUTED }}>
                    {plan.usageText}
                  </p>
                </div>
                <ul className="mt-6 grid flex-1 content-start gap-2.5 border-t pt-6" style={{ borderColor: RULE }}>
                  {lines.map((line) => (
                    <li key={line} className="font-body flex gap-2.5 text-[15px] leading-[1.5]">
                      <Check />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/onboard?plan=${plan.id}`}
                  className={`${BTN} mt-8 w-full`}
                  style={
                    isFeatured
                      ? { background: RED, color: "#FFFFFF" }
                      : { border: `1px solid ${INK}`, color: INK }
                  }
                >
                  Get started
                </Link>
              </article>
            );
          })}
        </div>

        {team?.addOn && (
          <p className="font-body mt-6 text-center text-[15px]" style={{ color: INK_MUTED }}>
            Need one more? Add agents to {team.label} for {dollars(team.addOn.monthlyCents)} a month each.
          </p>
        )}
        {/* Hands-on setup for any plan, quoted on a call (the old Custom Build's 30 days of
            onboarding lives here now). One line under all the cards, not on each, so the cards
            stay simple. */}
        <p className="font-body mt-2 text-center text-[15px]" style={{ color: INK_MUTED }}>
          Custom onboarding available on request.{" "}
          <a
            href={SCHEDULE_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4"
            style={{ color: RED_INK }}
          >
            Book a call
          </a>
        </p>
        <p className="font-body mt-2 text-center text-[13px]" style={{ color: INK_MUTED }}>
          Fair use applies. Heavy usage may need an upgrade or a custom plan.
        </p>
      </section>

      {/* ── Enterprise: a light strip in three columns, under the cards (David, Oct 4 2026: the
          dark version "gets lost"). Title and line on the left, what it adds in the middle, the
          two ways in on the right; Contact us opens the form in place. ── */}
      <section id="enterprise" className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-5 md:px-8">
        <div className="rounded-2xl border bg-white p-8 md:p-10" style={{ borderColor: RULE, boxShadow: "0 1px 2px rgba(26,26,26,0.04)" }}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr_auto] lg:items-start">
            <div>
              <h2 className="font-heading text-[1.75rem] font-extrabold leading-tight">{ENTERPRISE.label}</h2>
              <p className="font-body mt-2 text-[15px] leading-[1.55]" style={{ color: INK_MUTED }}>
                {ENTERPRISE.headline}
              </p>
              <p className="font-body mt-3 text-[13px]" style={{ color: INK_MUTED }}>
                Custom private servers starting at {ENTERPRISE.privateServersFrom}.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {ENTERPRISE_FEATURES.map(({ label, Icon }) => (
                <li key={label} className="font-body flex items-center gap-3 text-[15px]">
                  <Icon className="size-[18px] shrink-0" style={{ color: RED_INK }} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 lg:w-52">
              <a
                href={SCHEDULE_CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={BTN}
                style={{ background: RED, color: "#FFFFFF" }}
              >
                Book a call
              </a>
              <EnterpriseContactButton />
            </div>
          </div>
          <div id="enterprise-form" hidden className="mt-8 border-t pt-8" style={{ borderColor: RULE }}>
            <EnterpriseForm />
          </div>
        </div>
      </section>

      {/* ── What every plan includes ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="max-w-2xl">
          <Eyebrow>Every plan</Eyebrow>
          <h2 className="font-heading text-[clamp(1.6rem,2.6vw,2.25rem)] font-extrabold leading-[1.15]">What every plan includes</h2>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((item) => (
            <div key={item.title} className="border-t pt-5" style={{ borderColor: RULE }}>
              <h3 className="font-heading text-[1.125rem] font-bold">{item.title}</h3>
              <p className="font-body mt-2 text-[15px] leading-[1.6]" style={{ color: INK_MUTED }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works: a real sequence, so the steps are numbered ── */}
      <section style={{ background: SOFT }}>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-heading text-[clamp(1.6rem,2.6vw,2.25rem)] font-extrabold leading-[1.15]">Working in three steps</h2>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="font-mono text-[13px] font-bold" style={{ color: RED_INK }}>
                  Step {i + 1}
                </span>
                <h3 className="font-heading mt-2 text-[1.25rem] font-bold">{step.title}</h3>
                <p className="font-body mt-2 text-[15px] leading-[1.6]" style={{ color: INK_MUTED }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section style={{ background: SOFT }}>
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-heading text-[clamp(1.6rem,2.6vw,2.25rem)] font-extrabold leading-[1.15]">Common questions</h2>
          <div className="mt-8 divide-y rounded-xl border bg-white" style={{ borderColor: RULE }}>
            {FAQS.map((f) => (
              <details key={f.q} className="group px-5 py-4" style={{ borderColor: RULE }}>
                <summary className="font-heading flex cursor-pointer list-none items-center justify-between gap-4 text-[1.0625rem] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                  {f.q}
                  <span aria-hidden className="font-body text-[1.25rem] leading-none transition-transform group-open:rotate-45" style={{ color: RED_INK }}>
                    +
                  </span>
                </summary>
                <p className="font-body mt-3 text-[15px] leading-[1.65]" style={{ color: INK_MUTED }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <h2 className="font-heading text-[clamp(1.6rem,2.6vw,2.25rem)] font-extrabold leading-[1.15]" style={{ textWrap: "balance" }}>
          Not sure which plan?
        </h2>
        <p className="font-body mx-auto mt-3 max-w-xl text-[1.0625rem] leading-[1.6]" style={{ color: INK_MUTED }}>
          Tell us what you want your agents to handle and we will point you to the right one.
        </p>
        <a
          href={SCHEDULE_CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BTN} mt-7`}
          style={{ background: RED, color: "#FFFFFF" }}
        >
          Book a short consultation
        </a>
      </section>
    </div>
  );
}
