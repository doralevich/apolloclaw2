import { Rocket, Users } from "lucide-react";
import {
  BracketLabel,
  H2,
  HAIRLINE,
  INK,
  INK_MUTED,
  PAPER,
  PrimaryButton,
  RED,
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
          className="flex flex-col rounded-2xl border p-8"
          style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.03)" }}
        >
          <div
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(245,246,248,0.08)" }}
          >
            <Rocket className="h-5 w-5" style={{ color: PAPER }} />
          </div>
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Run it yourself.
          </h3>
          <p className="font-body mt-3 flex-1 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            Answer a few questions, and your agent is ready, with a dashboard, integrations, and
            access from the web, WhatsApp, Telegram, or Slack.
          </p>
          <p className="font-heading mt-6 text-[1.5rem] font-extrabold" style={{ color: PAPER }}>
            $2,500 <span className="text-[0.9rem] font-semibold" style={{ color: INK_MUTED }}>per agent</span>
          </p>
          <p className="text-[13px]" style={{ color: INK_MUTED }}>
            + $189/mo hosting, plus API credits as you use them.
          </p>
          <div className="mt-6">
            <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
          </div>
        </div>

        <div
          className="flex flex-col rounded-2xl border p-8"
          style={{ borderColor: "rgba(225,46,48,0.35)", background: "rgba(225,46,48,0.06)" }}
        >
          <div
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(225,46,48,0.15)" }}
          >
            <Users className="h-5 w-5" style={{ color: RED }} />
          </div>
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Have us build it.
          </h3>
          <p className="font-body mt-3 flex-1 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            We design, deploy, and run your agents for you, with a 30-day onboarding and senior
            attention the whole way. This is where custom work lives, including custom voice.
          </p>
          <p className="font-heading mt-6 text-[1.5rem] font-extrabold" style={{ color: PAPER }}>
            Book a call
          </p>
          <p className="text-[13px]" style={{ color: INK_MUTED }}>
            30 minutes, we scope it together, no pressure.
          </p>
          <div className="mt-6">
            <SecondaryButton href={CONSULT_URL} external>
              Schedule a Consultation
            </SecondaryButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
