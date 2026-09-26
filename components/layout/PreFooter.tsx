import { H2, RED, Section, TAN, TAN_INK_MUTED } from "@/components/home/ui";

const CONSULT_URL = "https://cal.com/therealdaveo/dbdo-consultation";

// The standing CTA above the footer on every marketing page, per David's call that pages should
// end consistently sitewide. Rendered once from RootShell, so pages that previously closed with
// their own bespoke discovery-call section had that section removed to avoid stacking two CTAs.
//
// Cream, not navy - David's call: a navy band straight into the navy footer read as one blue
// block. The Weekly Claw signup that used to sit below this lives in the footer now.
export function PreFooter() {
  return (
    <Section bg={TAN}>
      <div className="mx-auto max-w-3xl text-center">
        {/* Hard break before "AI Implemented?" is deliberate (David's call), so the two halves of
            the line always split at the same place rather than wherever the viewport puts them. */}
        <H2 light>
          Ready to move from AI curiosity to<br />AI <span style={{ color: RED }}>Implemented?</span>
        </H2>
        <p className="font-body mx-auto mt-5 text-[1.0625rem] leading-[1.7]" style={{ color: TAN_INK_MUTED, maxWidth: 560 }}>
          Schedule a free 30-minute consultation. You bring the bottlenecks, we bring the build.
        </p>
        <div className="mt-9">
          <a
            href={CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono inline-flex items-center justify-center text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:brightness-110"
            style={{
              background: RED,
              padding: "16px 34px",
              borderRadius: 4,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
            }}
          >
            Book a Discovery Call
          </a>
        </div>
      </div>
    </Section>
  );
}
