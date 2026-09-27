import HeroAssistantInput from "@/components/HeroAssistantInput";
import { HeroAssistantDemo } from "@/components/home/HeroAssistantDemo";
import { PrimaryButton } from "@/components/home/ui";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// Brand palette for the hero: cream ground, near-black ink, brand red. David's rule for this
// section is no dark backgrounds, so the hero and the Apollo[Claw] Assistant card beside it are
// light; the side-by-side layout is unchanged.
const CREAM = "#F2F0EB";
const INK = "#1A1A1A";
const INK_MUTED = "rgba(26,26,26,0.7)";
const INK_SOFT = "rgba(26,26,26,0.55)";
const RED = "#E12E30";

export function Hero() {
  return (
    <section style={{ background: CREAM }} className="relative overflow-hidden">
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
              components/ChatWidget.tsx), shown as a light card to the right of the copy. */}
          <div
            className="flex flex-col rounded-2xl border bg-white p-5"
            style={{
              borderColor: "rgba(26,26,26,0.08)",
              boxShadow: "0 20px 50px rgba(26,26,26,0.08)",
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
