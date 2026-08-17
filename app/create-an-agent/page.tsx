import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import PageHero from "@/components/PageHero";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The "Create an Agent" landing page — the destination for the mailer. It walks a prospect
// through what an ApolloClaw agent is, how getting one works, what it can do, and the details
// worth knowing, then converts on a HYBRID CTA: book a call (primary) or start setup yourself
// (secondary). Pricing is two boxes — a priced self-serve tier, and a white-glove tier that
// reads "contact us" and books a call instead of quoting the number.
//
// Full nav/footer chrome is added automatically by RootShell (this route is not standalone).
// Styling mirrors app/what-we-do/page.tsx: PageHero, ScrollReveal, bauhaus-card, the semantic
// Tailwind tokens (text-primary = brand red), and section-dividers between bands.

export const metadata: Metadata = {
  title: { absolute: "Create Your Agent | Apollo[Claw]" },
  description:
    "Get a private AI agent built around your business: your people, your stack, the work you keep meaning to hand off. See how it works, what it does, and how to start.",
};

const STEPS = [
  {
    n: "1",
    title: "Tell us about your business",
    desc: "A short questionnaire: who you serve, what you run on, and the work you want off your plate. This is where your agent comes from.",
  },
  {
    n: "2",
    title: "We build your agent from your answers",
    desc: "Your agent is generated from what you told us: your voice, your tools, your priorities. It is one business's agent, not a template with your name on it.",
  },
  {
    n: "3",
    title: "Connect your tools",
    desc: "One-click connections to the apps you already live in: email, calendar, CRM, files, Slack. It reads what you read.",
  },
  {
    n: "4",
    title: "Hand it your work",
    desc: "Talk to it the way you would talk to someone who works for you. It drafts, researches, updates records, and chases what is slipping.",
  },
];

const CAPABILITIES = [
  {
    title: "Running the business",
    desc: "The jobs that come round every week, done the same way each time.",
  },
  {
    title: "How it thinks",
    desc: "Method, not knowledge. This is what makes an answer feel like a colleague's.",
  },
  {
    title: "Mental models",
    desc: "Frames worth reaching for when a decision is genuinely hard.",
  },
  {
    title: "The C-suite you don't have",
    desc: "Finance, operations, people: the questions a bigger company has someone for.",
  },
  {
    title: "Winning work",
    desc: "Proposals, pricing, follow-up. Every one of these ends with you deciding.",
  },
  {
    title: "Writing as you",
    desc: "Your voice, from what you told us at setup.",
  },
];

const DETAILS = [
  {
    title: "Private to your business",
    desc: "One owner, one business. Nothing it learns about you goes anywhere else, and it is never a shared product with other users.",
  },
  {
    title: "Built on managed hosting",
    desc: "Your agent runs on its own managed instance. Hosting is $189/mo and includes $25/mo of token usage to cover everyday work.",
  },
  {
    title: "Wired into your real stack",
    desc: "Connect the apps you already use through one-click, secure OAuth. No new tools to learn, no data migration.",
  },
  {
    title: "You stay the decision-maker",
    desc: "It is a support and drafting tool, not a licensed professional. It says what it is about to do before anything leaves the building, and waits for your yes.",
  },
  {
    title: "Editable any time",
    desc: "Come back and change your answers whenever the business shifts. Your agent updates to match, no rebuild required.",
  },
  {
    title: "Talk to it anywhere",
    desc: "Use it in the dashboard, or connect it to Telegram, Slack, or WhatsApp and message it like a teammate.",
  },
];

const SELF_SERVE_INCLUDES = [
  "Your agent, built from your questionnaire answers",
  "Managed hosting, including $25/mo of token usage",
  "Connect your own apps and channels from the dashboard",
  "A guided setup checklist to get you live",
  "Email support",
];

const WHITE_GLOVE_INCLUDES = [
  "Everything in Standard Setup",
  "Setup calls where we connect your apps and channels with you",
  "Configured around how your business actually runs",
  "We stay on it until it is doing real work",
  "Direct access to David after launch",
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-0.5 shrink-0" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CreateAnAgentPage() {
  return (
    <>
      <PageHero
        title="Create Your"
        titleAccent="Agent"
        description="Not a chatbot, and not a generic assistant. A private agent built from your answers: your people, your stack, the work you keep meaning to hand off. Here is how you get one."
      />

      {/* Both CTAs together, side by side, right under the hero: book a call, or set it up yourself. */}
      <section className="bg-background py-8">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={SCHEDULE_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
              style={{ background: "#D72B2B", color: "#fff", fontSize: 13, letterSpacing: "0.1em", padding: "14px 30px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.28)" }}
            >
              Schedule a Consultation
            </a>
            <Link
              href="/onboard"
              className="inline-flex items-center justify-center font-bold uppercase transition-all hover:bg-foreground/5"
              style={{ background: "transparent", color: "#1A1A1A", fontSize: 13, letterSpacing: "0.1em", padding: "14px 30px", borderRadius: 4, textDecoration: "none", border: "1px solid rgba(26,26,26,0.25)" }}
            >
              Start now
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* HOW IT WORKS */}
      <section className="bg-surface-alt py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[3px] bg-primary rounded-full" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">How it works</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 max-w-2xl" style={{ textWrap: "balance" }}>
              From your business to a working agent, in four steps.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Steps, stacked down the left */}
            <div className="flex flex-col gap-5">
              {STEPS.map((step, i) => (
                <ScrollReveal key={step.n} delay={i * 80}>
                  <div className="bauhaus-card p-7 flex gap-5">
                    <span className="font-display text-3xl font-extrabold text-primary leading-none">{step.n}</span>
                    <div>
                      <h3 className="font-display text-xl text-foreground mb-2">{step.title}</h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            {/* Visual on the right — sticks alongside the steps as you scroll */}
            <ScrollReveal delay={120}>
              <div className="lg:sticky lg:top-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://mcusercontent.com/0c9dc301e682518434131678a/images/393abb6e-6cd5-0c23-be28-5e1e247e60f3.png"
                  alt="How your Apollo[Claw] agent is built"
                  className="w-full lg:w-1/2 lg:mx-auto h-auto rounded-2xl border border-border"
                  loading="lazy"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* WHAT IT CAN DO */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[3px] bg-primary rounded-full" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">What it can do</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 max-w-2xl" style={{ textWrap: "balance" }}>
              Every agent ships with the skills of a team you have not hired yet.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CAPABILITIES.map((c, i) => (
              <ScrollReveal key={c.title} delay={(i % 3) * 100}>
                <div className="bauhaus-card p-8 h-full flex flex-col">
                  <h3 className="font-display text-xl text-foreground mb-3">{c.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* DETAILS TO KNOW */}
      <section className="bg-surface-alt py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[3px] bg-primary rounded-full" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">Worth knowing</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 max-w-2xl" style={{ textWrap: "balance" }}>
              The details before you decide.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DETAILS.map((d, i) => (
              <ScrollReveal key={d.title} delay={(i % 2) * 100}>
                <div className="bauhaus-card p-7 h-full">
                  <h3 className="font-display text-lg text-foreground mb-2">{d.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* PRICING — two boxes: priced self-serve, contact-us white-glove */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[3px] bg-primary rounded-full" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">Two ways to start</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 max-w-2xl" style={{ textWrap: "balance" }}>
              Set it up yourself, or have us do it with you.
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Same agent, same infrastructure either way. The difference is how much of the setup you want off your plate.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Self-Serve */}
            <ScrollReveal>
              <div className="bauhaus-card p-9 h-full flex flex-col">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-bold">Standard Setup</span>
                <p className="font-display text-2xl text-foreground mt-3">You set it up, in your own time.</p>
                <div className="mt-6">
                  <span className="font-display text-4xl font-extrabold text-foreground">$449</span>
                  <span className="font-body text-base text-muted-foreground"> once</span>
                  <span className="font-body text-base text-muted-foreground"> + $189/mo hosting</span>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">Hosting includes $25/mo of token usage.</p>
                <ul className="mt-7 flex flex-col gap-3 flex-1">
                  {SELF_SERVE_INCLUDES.map((item) => (
                    <li key={item} className="flex gap-3 font-body text-sm text-foreground/90">
                      <Check /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboard"
                  className="mt-8 flex w-full items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                  style={{ background: "#D72B2B", color: "#fff", fontSize: 13, letterSpacing: "0.08em", padding: "14px 28px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.28)" }}
                >
                  Start now
                </Link>
              </div>
            </ScrollReveal>

            {/* White-Glove — recommended, contact us */}
            <ScrollReveal delay={100}>
              <div className="bauhaus-card p-9 h-full flex flex-col relative" style={{ borderColor: "#D72B2B", borderWidth: 2 }}>
                <span
                  className="absolute -top-3 left-9 font-mono text-[10px] uppercase tracking-widest font-bold"
                  style={{ background: "#D72B2B", color: "#fff", padding: "4px 10px", borderRadius: 4 }}
                >
                  Recommended
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-bold">Custom Setup</span>
                <p className="font-display text-2xl text-foreground mt-3">We set it up with you, on a call.</p>
                <div className="mt-6">
                  <span className="font-display text-2xl font-extrabold text-foreground">Contact us for custom setup.</span>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">Priced to your business. Book a call and we will scope it with you.</p>
                <ul className="mt-7 flex flex-col gap-3 flex-1">
                  {WHITE_GLOVE_INCLUDES.map((item) => (
                    <li key={item} className="flex gap-3 font-body text-sm text-foreground/90">
                      <Check /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={SCHEDULE_CONSULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex w-full items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                  style={{ background: "#D72B2B", color: "#fff", fontSize: 13, letterSpacing: "0.08em", padding: "14px 28px", borderRadius: 4, textDecoration: "none", boxShadow: "0 8px 24px rgba(215,43,43,0.28)" }}
                >
                  Schedule a Call
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </>
  );
}
