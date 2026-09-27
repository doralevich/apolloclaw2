import { BracketLabel, BodyLarge, H2, RED, Section, SoftLink, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

const TILES = [
  { title: "It Knows Your Business", body: "Your clients, your processes, and your way of doing things, always at hand." },
  { title: "Everything Stays on Track", body: "Follow-through happens smoothly, even on your busiest weeks." },
  { title: "It Remembers Everything", body: "What your business learns stays with your business and grows with you." },
  { title: "It's Yours", body: "Privately deployed and built just for you. Your data stays in your hands." },
];

// Was the "Security First" block; now the Built for You section (David's copy, Sept 27 2026):
// an intro paragraph and four tiles, 2x2 on desktop and stacked on phones.
// The security detail itself still lives on /security, reachable from the nav and the footer.
//
// Background is the light grid texture David sent, rebuilt in CSS rather than shipped as an
// image: white base, faint warm grid, and a soft red glow bleeding down from the top edge, with
// the grid masked so it fades out before the bottom. Doing it in CSS means no extra request and
// it stays crisp at any width. Sitting on white, the type needs the `light` variants.
export function TrustStrip() {
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
      {/* hairline along the top, as in the reference */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "rgba(11,23,41,0.10)" }}
      />

      <div className="relative z-10">
        <Section bg="transparent">
          <div className="mx-auto max-w-4xl text-center">
            <BracketLabel light>Built for You</BracketLabel>
            <H2 light>An Agent That Knows Your Business Inside and Out.</H2>
            <div className="mt-6">
              <BodyLarge light>
                Your agent starts with you. It learns how your business runs, works inside the tools
                you already use, and gets sharper every week it&apos;s with you. Solo founders, growing
                teams, and established companies all get an agent built to fit the way they work.
              </BodyLarge>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2 md:gap-5">
            {TILES.map((t) => (
              <div
                key={t.title}
                className="rounded-xl p-6 text-left"
                style={{ background: "#F2F0EB", border: "1px solid rgba(26,26,26,0.08)" }}
              >
                <div className="mb-4 h-[3px] w-7 rounded-full" style={{ background: RED }} />
                <h3 className="font-heading text-[1.2rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                  {t.title}
                </h3>
                <p className="font-body mt-2 text-[15px] leading-[1.6]" style={{ color: TAN_INK_MUTED }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <SoftLink light href="/how-it-works">
              See How It Works →
            </SoftLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
