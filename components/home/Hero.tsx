import HeroAssistantInput from "@/components/HeroAssistantInput";
import { CREAM, INK, PrimaryButton, SecondaryButton, TextureBackground } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

export function Hero() {
  return (
    <section style={{ background: CREAM }} className="relative overflow-hidden">
      <TextureBackground />
      <div className="container relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <style>{`#apolloclaw-hero-grid { display: grid; gap: 3rem; align-items: center; grid-template-columns: 1fr; } @media (min-width: 1024px) { #apolloclaw-hero-grid { gap: 4rem; grid-template-columns: 1.35fr 1fr; } }`}</style>
        <div id="apolloclaw-hero-grid">
          <div>
            <h1
              className="font-heading text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight"
              style={{ color: INK, textWrap: "balance" }}
            >
              AI employees that do real work in your business.
            </h1>
            <p
              className="font-body mt-7 text-[1.125rem] leading-[1.65]"
              style={{ color: "rgba(26,26,26,0.7)", maxWidth: 620 }}
            >
              Apollo[Claw] builds AI agents that connect to your tools, work in Slack, WhatsApp, and
              email, and get real work done with your approval. Run one yourself, or have us build
              it for you.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
              <SecondaryButton href={CONSULT_URL} external>
                Schedule a Consultation
              </SecondaryButton>
            </div>
          </div>

          {/* Donna, the existing hero chat widget/persona (components/HeroAssistantInput.tsx +
              components/ChatWidget.tsx) , reused as-is. Its dark panel styling is deliberate
              contrast against the new light cream hero (design direction: dark product/chat
              visuals are fine on the light site for depth, Cyndra-style). */}
          <div
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 20px 60px rgba(26,26,26,0.25)",
              display: "flex",
              flexDirection: "column",
              minHeight: 380,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#16a34a",
                    boxShadow: "0 0 8px rgba(22,163,74,0.6)",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
                  Donna, from Apollo<span style={{ color: "#E12E30" }}>[</span>Claw
                  <span style={{ color: "#E12E30" }}>]</span>
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Online
              </span>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "14px 16px",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Ask me anything about what an agent can do for your business.
            </div>
            <HeroAssistantInput />
          </div>
        </div>
      </div>
    </section>
  );
}
