import { BracketLabel, BodyLarge, H2, Section, SoftLink } from "@/components/home/ui";

// Was the "Security First" block; replaced with the positioning statement per David's call.
// The security detail itself still lives on /security, reachable from the nav and the footer.
export function TrustStrip() {
  return (
    <Section>
      <div className="mx-auto max-w-4xl text-center">
        <BracketLabel>The Difference</BracketLabel>
        <H2>What Is an AI Implementation Partner?</H2>
        <div className="mt-6">
          <BodyLarge>
            Most businesses don&apos;t need a strategy deck. They need a working system. An AI
            implementation partner does what traditional consultants won&apos;t: we build the actual
            AI infrastructure inside your operation, connect it to the tools you already use, and
            stay on to make sure it keeps working. Apollo Claw is that partner, for small
            businesses, growing mid-market teams, and enterprise organizations ready to move from
            AI curiosity to AI operations.
          </BodyLarge>
        </div>
        <div className="mt-8">
          <SoftLink href="/how-it-works">See how implementation works →</SoftLink>
        </div>
      </div>
    </Section>
  );
}
