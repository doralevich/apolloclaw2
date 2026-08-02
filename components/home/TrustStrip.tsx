import { BracketLabel, BodyLarge, H2, Section, SoftLink } from "@/components/home/ui";

// Was the "Security First" block; replaced with the positioning statement per David's call.
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
            <BracketLabel light>The Difference</BracketLabel>
            <H2 light>What Is an AI Implementation Partner?</H2>
            <div className="mt-6">
              <BodyLarge light>
                Most businesses don&apos;t need a strategy deck. They need a working system. An AI
                implementation partner does what traditional consultants won&apos;t: we build the
                actual AI infrastructure inside your operation, connect it to the tools you already
                use, and stay on to make sure it keeps working. Apollo Claw is that partner, for
                small businesses, growing mid-market teams, and enterprise organizations ready to
                move from AI curiosity to AI operations.
              </BodyLarge>
            </div>
            <div className="mt-8">
              <SoftLink light href="/how-it-works">
                See how implementation works →
              </SoftLink>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
