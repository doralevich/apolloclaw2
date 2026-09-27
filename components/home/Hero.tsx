import HeroAssistantInput from "@/components/HeroAssistantInput";
import { HeroAssistantDemo } from "@/components/home/HeroAssistantDemo";
import { NAVY, PAPER, PAPER_MUTED, PAPER_SOFT, PrimaryButton, RED, TextureBackground } from "@/components/home/ui";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The dark navy hero with the grid texture and red glow, back at David's call (Sept 27 2026: "I
// liked the dark home page banner"), carrying the Chief of Staff copy. It was cream for one
// release under the brief's "no dark backgrounds" rule; the sections below it stay light.
const INK = PAPER;
const INK_MUTED = PAPER_MUTED;
const INK_SOFT = PAPER_SOFT;

export function Hero() {
  return (
    <section style={{ background: NAVY }} className="relative overflow-hidden">
      <TextureBackground />
      <div className="container relative z-20 mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <span
              className="font-mono mb-5 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{ color: RED }}
            >
              Your AI Chief of Staff
            </span>
            <h1
              className="font-heading text-[clamp(2rem,3.8vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight"
              style={{ color: INK, textWrap: "balance" }}
            >
              Meet the Chief of Staff You&apos;ve Always Wanted.
            </h1>
            <p className="font-body mt-6 text-[1.125rem] leading-[1.65]" style={{ color: INK_MUTED, maxWidth: 580 }}>
              A custom AI agent built around how you work. It knows your business, keeps everything
              moving, and gives you back the hours you&apos;ve been missing.
            </p>
            <p className="font-body mt-4 text-[14px]" style={{ color: INK_SOFT }}>
              Already running for founders, physicians, and company leaders.
            </p>
            <div className="mt-8">
              <PrimaryButton href={SCHEDULE_CONSULT_URL} external>
                Book a Discovery Call
              </PrimaryButton>
              <p className="font-body mt-3 text-[13px]" style={{ color: INK_SOFT }}>
                30 relaxed minutes. You&apos;ll walk away with real ideas either way.
              </p>
            </div>
          </div>

          {/* Donna, the hero chat persona (components/HeroAssistantInput.tsx +
              components/ChatWidget.tsx), shown as a dark glass card to the right of the copy. */}
          <div
            className="flex flex-col rounded-2xl border p-5"
            style={{
              background: "rgba(7,15,28,0.8)",
              borderColor: "rgba(225,46,48,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(225,46,48,0.05)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative inline-flex" style={{ width: 8, height: 8 }}>
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: "#16a34a" }}
                  />
                  <span className="relative inline-flex h-full w-full rounded-full" style={{ background: "#16a34a" }} />
                </span>
                <span className="font-mono text-xs font-bold" style={{ color: INK }}>
                  Apollo<span style={{ color: RED }}>[</span>Claw<span style={{ color: RED }}>]</span> Assistant
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: INK_SOFT }}>
                Online
              </span>
            </div>
            <HeroAssistantDemo />
            <div className="mt-3">
              <HeroAssistantInput placeholder="Or ask your own question…" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
