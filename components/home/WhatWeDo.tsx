import { BracketLabel, TAN, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// Directly under the hero: what Apollo[Claw] makes, in David's words from the Category Design
// document (Oct 4 2026), shortened for the home page and brought in line with the copy rules. The
// full statement is on the Company page. Cream, continuing into the three-step strip below it.
export function WhatWeDo() {
  return (
    <section style={{ background: TAN }}>
      <div className="container mx-auto max-w-7xl px-5 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <BracketLabel light>What We Do</BracketLabel>
          <p className="font-body text-[clamp(1.125rem,1.5vw,1.3rem)] leading-[1.65]" style={{ color: TAN_INK }}>
            Apollo[Claw] creates customized, private, persistent agents, built for one person, a division, or a
            whole company or firm on a controlled plan. Each one holds a compounding memory of your context and
            preferences, acts on its own across the tools you already use, and runs on a private server that can
            hold your real business data.
          </p>
          <p className="font-body mt-5 text-[1.0625rem] leading-[1.65]" style={{ color: TAN_INK_MUTED }}>
            Chat tools reset, automation platforms leave the logic to you, and assistant services scale with
            headcount. This is the first usable version of something different.
          </p>
        </div>
      </div>
    </section>
  );
}
