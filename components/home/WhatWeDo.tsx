import DayWithJohnEmbed from "@/components/DayWithJohnEmbed";
import { BracketLabel, BodyLarge, H2, NAVY_ELEVATED, Section, SoftLink } from "@/components/home/ui";

export function WhatWeDo() {
  return (
    <Section bg={NAVY_ELEVATED}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <BracketLabel>How It Works</BracketLabel>
          <H2>You tell us the job. We build the employee. It ships the work.</H2>
          <div className="mt-6">
            <BodyLarge>
              An Apollo[Claw] agent does the real work, research, follow-ups, intake, reports,
              scheduling, and it checks with you before anything that matters. It works where your
              team already works, and it connects to the tools you already use.
            </BodyLarge>
          </div>
          <div className="mt-8">
            <SoftLink href="/ai-agents">See how it works →</SoftLink>
          </div>
        </div>

        {/* Real demo, "A Day with John" (components/DayWithJohnEmbed.tsx), moved here from the
            old Services page per David's call. The demo's own content is a narrow portrait
            panel, so the box is sized to match instead of a wide 16:9 slot with dead black
            bars on either side. */}
        <div className="mx-auto w-full max-w-[380px] lg:mx-0 lg:ml-auto">
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{ borderColor: "rgba(245,246,248,0.12)", background: "#0B1729", aspectRatio: "3 / 4" }}
          >
            <DayWithJohnEmbed />
          </div>
        </div>
      </div>
    </Section>
  );
}
