import DayWithJohnEmbed from "@/components/DayWithJohnEmbed";
import { BracketLabel, BodyLarge, H2, RED, Section, SoftLink, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

const TILES = [
  { title: "It Knows Your Business", body: "Your clients, your processes, and your way of doing things, always at hand." },
  { title: "Everything Stays on Track", body: "Follow-through happens smoothly, even on your busiest weeks." },
  { title: "It Remembers Everything", body: "What your business learns stays with your business and grows with you." },
  { title: "It's Yours", body: "Privately deployed and built just for you. Your data stays in your hands." },
];

// Section 3 of the home page (David's spec, Sept 27 2026): copy and the four tiles on the left,
// the "A Day with John" demo on the right. The demo used to live in its own "Your AI Assistant"
// section, which is gone; on phones it drops below the tiles.
//
// Background is the light grid texture David sent, rebuilt in CSS rather than shipped as an
// image: white base, faint warm grid, and a soft red glow bleeding down from the top edge, with
// the grid masked so it fades out before the bottom. Sitting on white, the type needs the
// `light` variants.
export function BuiltForYou() {
  return (
    <div className="relative overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* faint grid, fading out toward the bottom and sides */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,23,41,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,23,41,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 90% at 50% 0%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 90% at 50% 0%, black 0%, transparent 75%)",
        }}
      />
      {/* warm glow bleeding down from the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% -5%, rgba(215,43,43,0.10) 0%, rgba(215,43,43,0.03) 40%, transparent 72%)",
        }}
      />
      {/* hairline along the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "rgba(11,23,41,0.10)" }}
      />

      <div className="relative z-10">
        <Section bg="transparent">
          <div className="grid items-center gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div className="min-w-0">
              <BracketLabel light>Built for You</BracketLabel>
              <H2 light>An Agent That Knows Your Business Inside and Out.</H2>
              <div className="mt-6 max-w-2xl">
                <BodyLarge light>
                  Your agent starts with you. It learns how your business runs, works inside the tools
                  you already use, and gets sharper every week it&apos;s with you. Solo founders, growing
                  teams, and established companies all get an agent built to fit the way they work.
                </BodyLarge>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5">
                {TILES.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl p-6"
                    style={{ background: "#F2F0EB", border: "1px solid rgba(26,26,26,0.08)" }}
                  >
                    <div className="mb-4 h-[3px] w-7 rounded-full" style={{ background: RED }} />
                    <h3 className="font-heading text-[1.15rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                      {t.title}
                    </h3>
                    <p className="font-body mt-2 text-[15px] leading-[1.6]" style={{ color: TAN_INK_MUTED }}>
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <SoftLink light href="/how-it-works">
                  See How It Works →
                </SoftLink>
              </div>
            </div>

            {/* "A Day with John" (components/DayWithJohnEmbed.tsx): a poster that opens the demo
                full screen. Phone-shaped box, so the poster fills it edge to edge. */}
            <div className="mx-auto w-full max-w-[320px] lg:mr-0">
              <div
                className="relative overflow-hidden rounded-2xl border"
                style={{
                  borderColor: "rgba(11,23,41,0.12)",
                  background: "#0B1729",
                  aspectRatio: "9 / 16",
                  boxShadow: "0 24px 60px rgba(26,26,26,0.10)",
                }}
              >
                <DayWithJohnEmbed />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
