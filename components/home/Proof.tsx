import { BracketLabel, H2, HAIRLINE, NAVY, PAPER, PAPER_MUTED, RED, Section, SoftLink } from "@/components/home/ui";

// Replaced the old "six executives, seven to twelve hours back" stat block per David's call.
// These are three of the real case studies already published on /case-studies, quoted from that
// page rather than written fresh, so the homepage and that page cannot drift apart.
const CASES = [
  {
    industry: "Personal Injury",
    result: "Retained cases up 40%.",
    quote:
      "We get 200 intake inquiries a month. Before, half of them fell through because we couldn't follow up fast enough. The agent screens every inquiry within minutes, collects the basic facts, and schedules a consultation with the right attorney.",
    role: "Founding Partner",
    detail: "Personal injury practice, Long Island",
  },
  {
    industry: "Primary Care",
    result: "No-shows dropped from 18% to under 6%.",
    quote:
      "We were losing 18% of our appointments to no-shows. The Medical Agent sends a reminder 72 hours out, 24 hours out, and the morning of. That is revenue we were leaving on the table every single day.",
    role: "Practice Manager",
    detail: "Multi-provider primary care practice, Long Island",
  },
  {
    industry: "Finance",
    result: "Close cycle cut from 11 days to 6.",
    quote:
      "Our month-end close used to take eleven days. We are at six now. The CFO Agent pulls the data, flags the variances, and drafts the narrative. My team reviews instead of produces.",
    role: "CFO, Regional Insurance Group",
    detail: "Multi-line carrier, $180M in premiums",
  },
];

// Navy with the graph-paper grid overlay (the same treatment as the page heroes), per David's
// call for "the blue check background" here, so this reads as a deliberate break from the tan
// block above it.
export function Proof() {
  return (
    <div style={{ background: NAVY }} className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,46,48,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">
        <Section bg="transparent">
          <div className="mx-auto max-w-3xl text-center">
            <BracketLabel>Client Results</BracketLabel>
            <H2>Real businesses. Real results.</H2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CASES.map((c) => (
              <div
                key={c.result}
                className="flex flex-col rounded-xl p-7"
                style={{ background: "rgba(245,246,248,0.04)", border: `1px solid ${HAIRLINE}` }}
              >
                <span
                  className="font-mono mb-4 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: RED }}
                >
                  {c.industry}
                </span>
                <p className="font-heading text-[17px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                  {c.result}
                </p>
                <p className="mt-4 flex-1 text-[14px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
                  &ldquo;{c.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                  <p className="font-mono text-[12px] font-bold" style={{ color: PAPER }}>
                    {c.role}
                  </p>
                  <p className="font-mono mt-0.5 text-[12px]" style={{ color: PAPER_MUTED }}>
                    {c.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <SoftLink href="/case-studies">See all case studies →</SoftLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
