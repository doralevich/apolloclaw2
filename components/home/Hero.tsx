import HeroAssistantInput from "@/components/HeroAssistantInput";
import { NAVY, PAPER, PAPER_MUTED, PrimaryButton, SecondaryButton, TextureBackground } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

export function Hero() {
  return (
    <section style={{ background: NAVY }} className="relative overflow-hidden">
      <TextureBackground />
      <div className="container relative z-20 mx-auto max-w-3xl px-5 pb-12 pt-14 text-center md:px-8 md:pb-16 md:pt-20">
        <h1
          className="font-heading text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight"
          style={{ color: PAPER, textWrap: "balance" }}
        >
          AI employees that do real work in your business.
        </h1>
        <p
          className="font-body mx-auto mt-6 text-[1.125rem] leading-[1.65]"
          style={{ color: PAPER_MUTED, maxWidth: 560 }}
        >
          Apollo[Claw] builds AI agents that connect to your tools, work in Slack, WhatsApp, and
          email, and get real work done with your approval. Run one yourself, or have us build it
          for you.
        </p>

        {/* Donna, the existing hero chat widget/persona (components/HeroAssistantInput.tsx +
            components/ChatWidget.tsx), reused as-is, now the hero's centered focal element
            (stackhaus.ai reference: the search bar as the visual centerpiece). */}
        <div className="mx-auto mt-8 max-w-xl">
          <p className="mb-3 text-[13px]" style={{ color: PAPER_MUTED }}>
            Ask me anything about what an agent can do for your business.
          </p>
          <div
            style={{
              background: "rgba(7,15,28,0.8)",
              border: "1px solid rgba(225,46,48,0.2)",
              borderRadius: 14,
              padding: 6,
              boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(225,46,48,0.05)",
              backdropFilter: "blur(16px)",
            }}
          >
            <HeroAssistantInput />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
          <SecondaryButton href={CONSULT_URL} external>
            Schedule a Consultation
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
