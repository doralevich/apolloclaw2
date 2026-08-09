import { Cloud, Server } from "lucide-react";
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

const CONSULT_URL = "https://calendly.com/apolloclaw/30-minute-meeting-clone";

// Reframed around where the agent runs rather than who builds it, per David's call, and the
// per-agent price came off both cards: every path now routes to a consultation instead.
export function TwoFoldModel() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <BracketLabel>Two Ways to Deploy</BracketLabel>
        <H2>Self hosted and cloud hosted.</H2>
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
            <Cloud className="h-5 w-5" style={{ color: PAPER }} />
          </div>
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Run it yourself.
          </h3>
          <p className="font-body mt-3 text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: RED }}>
            Cloud hosted, on a virtual private server
          </p>
          <p className="font-body mt-3 flex-1 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            Your agent runs on its own virtual private server that we provision for you. Answer a
            few questions and it is ready, with a dashboard, integrations, and access from the web,
            WhatsApp, Telegram, or Slack.
          </p>
          <div className="mt-6">
            <PrimaryButton href={CONSULT_URL} external>
              Schedule a Consultation
            </PrimaryButton>
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
            <Server className="h-5 w-5" style={{ color: RED }} />
          </div>
          <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
            Have us build it.
          </h3>
          <p className="font-body mt-3 text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: RED }}>
            Self hosted, inside your own environment
          </p>
          <p className="font-body mt-3 flex-1 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
            We design, deploy, and run your agents inside your own infrastructure, with a 30-day
            onboarding and senior attention the whole way. This is where custom work lives,
            including custom voice.
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
