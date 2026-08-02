import {
  BracketLabel,
  H2,
  HAIRLINE,
  INK,
  INK_MUTED,
  PrimaryButton,
  Section,
  SecondaryButton,
} from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

export function TwoFoldModel() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <BracketLabel>Two Ways to Build</BracketLabel>
        <H2>Build it yourself. Or have us build it.</H2>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        <div
          className="rounded-2xl border p-8"
          style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.03)" }}
        >
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Run it yourself.
          </h3>
          <p className="font-body mt-3 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            Answer a few questions, and your agent is ready, with a dashboard, integrations, and
            access from the web, WhatsApp, Telegram, or Slack. $2,500 per agent, $189 a month
            hosting, plus API credits as you use them.
          </p>
        </div>
        <div
          className="rounded-2xl border p-8"
          style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.03)" }}
        >
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Have us build it.
          </h3>
          <p className="font-body mt-3 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            We design, deploy, and run your agents for you, with a 30-day onboarding and senior
            attention the whole way. This is where custom work lives, including custom voice.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
        <SecondaryButton href={CONSULT_URL} external>
          Schedule a Consultation
        </SecondaryButton>
      </div>
    </Section>
  );
}
