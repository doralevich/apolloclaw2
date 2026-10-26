import { H2, PrimaryButton, Section, TAN, TAN_INK_MUTED } from "@/components/home/ui";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// Section 8 of the home page, the closing call to action (David's spec, Sept 27 2026). The
// sitewide PreFooter CTA is skipped on "/" (components/layout/RootShell.tsx) so the page ends
// on this one instead of two in a row. Cream band like the PreFooter, with the hero's button.
export function FinalCta() {
  return (
    <Section bg={TAN}>
      <div className="mx-auto max-w-7xl text-center">
        <div className="py-4 md:py-6">
          <H2 light>Your Chief of Staff Is Ready When You Are.</H2>
          <p className="font-body mx-auto mt-5 text-[1.125rem] leading-[1.7]" style={{ color: TAN_INK_MUTED }}>
            Let&apos;s map out what your agent could do for you.
          </p>
          <div className="mt-9">
            <PrimaryButton href={SCHEDULE_CONSULT_URL} external>
              Book a Discovery Call
            </PrimaryButton>
            <p className="font-body mt-4 text-[13px]" style={{ color: TAN_INK_MUTED }}>
              30 relaxed minutes. You&apos;ll walk away with real ideas either way.
            </p>
          </div>
          {/* The "See Plans and Pricing" link came off on Oct 26 2026 with the pricing page
              hidden (David). It returns with the page. */}
        </div>
      </div>
    </Section>
  );
}
