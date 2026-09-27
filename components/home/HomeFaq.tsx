import { ChevronDown } from "lucide-react";
import { BracketLabel, H2, Section, SoftLink, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";
import { HOME_FAQS } from "@/config/faqs";

// Section 6 of the home page, Questions, Answered (David's spec, Sept 27 2026). Native
// <details> rather than a client component: keyboard and screen-reader behaviour for free, and
// it works before hydration. The first item starts open. The questions live in config/faqs.ts
// (HOME_FAQS) with every other FAQ on the site, and /faq shows them all.
// Three a side (David's call), so the columns match.
const FAQ_SPLIT = Math.ceil(HOME_FAQS.length / 2);

export function HomeFaq() {
  return (
    <Section bg="#FFFFFF">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <BracketLabel light>Questions, Answered</BracketLabel>
          <H2 light>Everything You&apos;ll Want to Know.</H2>
        </div>

        {/* Two columns on desktop (David's call), one on phones. Each column is its own stack so
            opening a question only moves the items below it in that column. First half left,
            second half right, so stacked on phones they still read in order. */}
        <div className="mt-12 grid gap-x-12 md:grid-cols-2">
          {[HOME_FAQS.slice(0, FAQ_SPLIT), HOME_FAQS.slice(FAQ_SPLIT)].map((col, c) => (
            <div
              key={c}
              // The right column's top rule shows only side by side; stacked on phones it would
              // sit under the left column's last rule as a double line.
              className={c === 0 ? "border-t" : "md:border-t"}
              style={{ borderColor: "rgba(11,23,41,0.12)" }}
            >
              {col.map((f) => (
                <details
                  key={f.q}
                  open={f === HOME_FAQS[0]}
                  className="group"
                  style={{ borderBottom: "1px solid rgba(11,23,41,0.12)" }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <span className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: TAN_INK }}>
                      {f.q}
                    </span>
                    <ChevronDown
                      size={20}
                      aria-hidden
                      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                      style={{ color: "#E12E30" }}
                    />
                  </summary>
                  <p className="font-body -mt-1 pb-6 pr-10 text-[16px] leading-[1.7]" style={{ color: TAN_INK_MUTED }}>
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <SoftLink light href="/faq">
            See All FAQs →
          </SoftLink>
        </div>
      </div>
    </Section>
  );
}
