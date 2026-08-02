import DayWithJohnEmbed from "@/components/DayWithJohnEmbed";
import { BracketLabel, BodyLarge, H2, Section, SoftLink, TAN } from "@/components/home/ui";

// Tan/cream contrast section (David's call: the 2nd homepage section against the otherwise
// all-dark page), so BracketLabel/H2/BodyLarge/SoftLink all use their `light` variant here.
// Text column widened and the gap to the demo tightened per direct feedback (was too much
// dead space between the copy and the video).
export function WhatWeDo() {
  return (
    <Section bg={TAN}>
      <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="max-w-2xl">
          <BracketLabel light>What Is an Agent</BracketLabel>
          <H2 light>Your AI Assistant</H2>
          <div className="mt-6">
            <BodyLarge light>
              Apollo[Claw] builds AI agents that work inside your existing business, not alongside
              it. The agent connects to the tools you already use and handles the repetitive,
              time-consuming work that keeps you buried in your inbox.
            </BodyLarge>
          </div>
          <div className="mt-5">
            <BodyLarge light>
              The result: fewer hours on administrative tasks, faster response times, fewer things
              falling through the cracks. For many clients, an Apollo[Claw] agent replaces 10-20
              hours per week of manual work within the first month.
            </BodyLarge>
          </div>
          <div className="mt-8">
            <SoftLink light href="/how-it-works">See How Implementation Works →</SoftLink>
          </div>
        </div>

        {/* Real demo, "A Day with John" (components/DayWithJohnEmbed.tsx -> public/demo.html),
            moved here from the old Services page per David's call. A realistic phone-chat
            mockup, so the box matches a phone's aspect ratio instead of a wide 16:9 slot with
            dead black bars on either side. */}
        <div className="mx-auto w-full max-w-[320px] lg:mx-0 lg:ml-auto">
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{ borderColor: "rgba(11,23,41,0.12)", background: "#0B1729", aspectRatio: "9 / 16" }}
          >
            <DayWithJohnEmbed />
          </div>
        </div>
      </div>
    </Section>
  );
}
