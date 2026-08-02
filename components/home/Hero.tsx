import HeroAssistantInput from "@/components/HeroAssistantInput";
import { HAIRLINE, NAVY, PAPER, PAPER_MUTED, PrimaryButton, RED, SecondaryButton, TextureBackground } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

// Side-by-side layout matching the structure of the current live hero (copy widened on the
// left, the Apollo[Claw] Assistant card on the right), per David's direct request, still the
// new Phase 1 copy/CTAs, not a revert of content.
export function Hero() {
  return (
    <section style={{ background: NAVY }} className="relative overflow-hidden">
      <TextureBackground />
      <div className="container relative z-20 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h1
              className="font-heading text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight"
              style={{ color: PAPER, textWrap: "balance" }}
            >
              AI employees that do real work in your business.
            </h1>
            <p
              className="font-body mt-6 text-[1.125rem] leading-[1.65]"
              style={{ color: PAPER_MUTED, maxWidth: 560 }}
            >
              Apollo[Claw] builds AI agents that connect to your tools, work in Slack, WhatsApp,
              and email, and get real work done with your approval. Run one yourself, or have us
              build it for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
              <SecondaryButton href={CONSULT_URL} external>
                Schedule a Consultation
              </SecondaryButton>
            </div>
          </div>

          {/* Donna, the existing hero chat widget/persona (components/HeroAssistantInput.tsx +
              components/ChatWidget.tsx), reused as-is, styled as a standalone card to the right
              of the header, matching the live site's current "Apollo[Claw] Assistant" card. */}
          <div
            className="flex flex-col rounded-2xl border p-5"
            style={{
              background: "rgba(7,15,28,0.8)",
              borderColor: "rgba(225,46,48,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(225,46,48,0.05)",
              backdropFilter: "blur(16px)",
              minHeight: 420,
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
                <span className="font-mono text-xs font-bold" style={{ color: PAPER }}>
                  Apollo<span style={{ color: RED }}>[</span>Claw<span style={{ color: RED }}>]</span> Assistant
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: PAPER_MUTED }}>
                Online
              </span>
            </div>
            <div
              className="rounded-[10px] border px-4 py-3.5 text-[13.5px] leading-[1.6]"
              style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.04)", color: PAPER_MUTED }}
            >
              Hi! Ask me anything about what an agent can do for your business, I&apos;ll point
              you in the right direction.
            </div>
            <div className="flex flex-1 flex-col justify-end">
              <HeroAssistantInput />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
