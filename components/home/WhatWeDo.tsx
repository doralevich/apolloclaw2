import { Play } from "lucide-react";
import { BracketLabel, BodyLarge, H2, INK_SOFT, Section, SoftLink } from "@/components/home/ui";

export function WhatWeDo() {
  return (
    <Section bg="#ffffff">
      <div className="mx-auto max-w-3xl text-center">
        <BracketLabel>How It Works</BracketLabel>
        <H2>You tell us the job. We build the employee. It ships the work.</H2>
        <div className="mt-6">
          <BodyLarge>
            An Apollo[Claw] agent does the real work, research, follow-ups, intake, reports,
            scheduling, and it checks with you before anything that matters. It works where your
            team already works, and it connects to the tools you already use.
          </BodyLarge>
        </div>
      </div>

      {/* [ASSET] Video slot , explainer video placeholder until David provides the real one.
          Clearly labeled, not a fabricated product screenshot. */}
      <div
        className="mx-auto mt-12 flex aspect-video max-w-4xl items-center justify-center rounded-2xl border"
        style={{ borderColor: "rgba(26,26,26,0.12)", background: "#F2F0EB" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(26,26,26,0.06)" }}
          >
            <Play className="h-6 w-6" style={{ color: INK_SOFT }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: INK_SOFT }}>
            [ASSET] Explainer video placeholder
          </p>
          <p className="max-w-xs text-xs" style={{ color: INK_SOFT }}>
            Swap for the real product walkthrough when ready.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <SoftLink href="/ai-agents">See how it works →</SoftLink>
      </div>
    </Section>
  );
}
