import { BodyLarge, BracketLabel, H2, HAIRLINE, NAVY, PAPER, PAPER_MUTED, RED, Section, SoftLink } from "@/components/home/ui";

// Section 4 of the home page, Proven Results (David's spec, Sept 27 2026). Four deployments, each
// a short story with the outcome pulled out as a bold line at the foot of the card.
const CASES = [
  {
    title: "AI Chief of Staff",
    story:
      "A senior executive at a PE-backed operating company wanted more time for the work only they could do. After a focused intake and a two-week onboarding, Apollo Claw deployed a Chief of Staff agent tailored to how they lead.",
    result: "12 to 15 hours a week redirected to revenue and strategy within the first month.",
  },
  {
    title: "Clinical Operations Agent",
    story:
      "A concierge medical practice wanted to expand its capacity while protecting patient privacy. Apollo Claw deployed a HIPAA-aware agent to handle scheduling support, patient communication routing, and operational tasks behind the scenes.",
    result: "Immediate capacity for patient care and practice growth.",
  },
  {
    title: "Board-Ready Financial Forecasting",
    story:
      "A multi-location professional services firm wanted its CFO focused on strategy. Apollo Claw deployed a CFO agent trained on the firm's chart of accounts and financial history. It produces weekly cash-flow forecasts, spots trends early, and drafts the board deck days ahead of each meeting.",
    result: "Month-end close in two days.",
  },
  {
    title: "Recruiting Pipeline Acceleration",
    story:
      "A boutique staffing agency wanted to reach top candidates first. Apollo Claw deployed a recruiting agent that matches each resume to the role, coordinates interviews with hiring managers, and keeps every candidate moving at each stage.",
    result: "Time to interview cut by more than half in the first month.",
  },
];

// Navy with the graph-paper grid overlay (the same treatment as the page heroes), per David's
// call for "the blue check background" here.
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
          <div className="mx-auto max-w-7xl text-center">
            <BracketLabel>Proven Results</BracketLabel>
            <H2>10 to 20 Hours a Week, Back in Your Hands.</H2>
            <div className="mt-6">
              <BodyLarge>
                Across every deployment, leaders reinvest that time in strategy, relationships, and
                growth.
              </BodyLarge>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2">
            {CASES.map((c) => (
              <div
                key={c.title}
                className="flex flex-col rounded-xl p-7 md:p-8"
                style={{ background: "rgba(245,246,248,0.04)", border: `1px solid ${HAIRLINE}` }}
              >
                <span aria-hidden className="mb-5 block h-[2px] w-10 rounded-full" style={{ background: RED }} />
                <h3 className="font-heading text-[19px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                  {c.title}
                </h3>
                <p className="mt-4 flex-1 text-[15px] leading-[1.7]" style={{ color: PAPER_MUTED }}>
                  {c.story}
                </p>
                <p
                  className="font-heading mt-6 pt-5 text-[15px] font-bold leading-[1.5]"
                  style={{ color: PAPER, borderTop: `1px solid ${HAIRLINE}` }}
                >
                  {c.result}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <SoftLink href="/use-cases#results">Read More Case Studies →</SoftLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
