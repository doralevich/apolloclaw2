import { BodyLarge, BracketLabel, H2, NAVY, PAPER_MUTED, RED, Section, TAN } from "@/components/home/ui";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

const CONSULT_URL = "https://calendly.com/apolloclaw/30-minute-meeting-clone";

// The two standing bands that sit above the footer on every marketing page, per David's call
// that they should be consistent sitewide rather than each page ending differently. Rendered
// once from RootShell, so pages that previously closed with their own bespoke discovery-call
// section had that section removed to avoid stacking two CTAs.
export function PreFooter() {
  return (
    <>
      <div style={{ background: NAVY }} className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10">
          <Section bg="transparent">
            <div className="mx-auto max-w-3xl text-center">
              {/* Hard break before "AI Implemented?" is deliberate (David's call), so the two
                  halves of the line always split at the same place rather than wherever the
                  viewport happens to put them. */}
              <H2>
                Ready to move from AI curiosity to<br />AI <span style={{ color: RED }}>Implemented?</span>
              </H2>
              <p className="font-body mx-auto mt-5 text-[1.0625rem] leading-[1.7]" style={{ color: PAPER_MUTED, maxWidth: 560 }}>
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
                  Schedule a Consultation
                </a>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Section bg={TAN}>
        <div className="mx-auto max-w-2xl text-center">
          <BracketLabel light>Weekly Intelligence</BracketLabel>
          <H2 light>The Weekly Claw</H2>
          <BodyLarge light>
            What happened in AI last week and what to watch this week. Every Monday.
          </BodyLarge>
          <div className="mt-9">
            <NewsletterForm />
          </div>
        </div>
      </Section>
    </>
  );
}
