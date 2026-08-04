import { BodyLarge, BracketLabel, H2, HAIRLINE, NAVY, PAPER, PAPER_MUTED, RED, Section, SoftLink } from "@/components/home/ui";

// The four narrative deployments from the live site's "AI Agents in Action" section, per
// David's call to use these here. They replace the three short pull-quotes this section
// carried before (which were excerpted from /case-studies).
//
// Note these are a different shape from /case-studies: full write-ups of a single engagement
// rather than a client quote with attribution, so the card is title + body with no byline.
const CASES = [
  {
    title: "AI Chief of Staff Deployment",
    body:
      "A senior executive at a PE-backed operating company was managing an overwhelming volume of daily communications, internal coordination, and strategic follow-up with no dedicated support structure. Following Apollo[Claw]'s intake and two-week onboarding, a tailored AI Chief of Staff was deployed. Within the first month, the executive recovered an estimated 12 to 15 hours per week previously consumed by administrative tasks; that time was redirected entirely toward revenue-generating activity and strategic decision-making.",
  },
  {
    title: "HIPAA-Aware Clinical AI Assistant",
    body:
      "A concierge medical practice partner sought an AI solution that could operate within a healthcare context without compromising patient privacy or regulatory standing. Apollo[Claw] deployed a HIPAA-aware clinical agent configured for clinical workflow support: scheduling assistance, patient communication routing, and operational task automation, all clear of patient-facing surfaces. The practice owner reported immediate relief from administrative burden and expanded capacity to focus on patient care and practice growth.",
  },
  {
    title: "Board-Ready Financial Forecasting",
    body:
      "A multi-location professional services firm was closing its books by hand every month, with the CFO spending entire weekends reconciling spreadsheets before each board meeting. Apollo[Claw] deployed a dedicated CFO agent trained on the firm's chart of accounts and historical financials; it now produces weekly cash-flow forecasts, flags anomalies before they reach the P&L, and drafts the board deck days ahead of each meeting. The month-end close now takes two days instead of two weeks.",
  },
  {
    title: "Recruiting Pipeline Acceleration",
    body:
      "A boutique staffing agency was losing strong candidates to slower-moving competitors while recruiters manually screened resumes and chased down interview times across overlapping calendars. Apollo[Claw] deployed a Recruiting agent that screens every incoming resume against each role's requirements, coordinates interviews directly with candidates and hiring managers, and follows up automatically at every stage of the pipeline. Time-to-interview dropped by more than half in the first month; recruiters now spend their time interviewing qualified candidates instead of sorting through applications.",
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
            <BracketLabel>The Consistent Outcome</BracketLabel>
            <H2>AI Agents in Action</H2>
            <BodyLarge>
              Across every deployment the result is the same: 10 to 20 hours a week recovered
              from administrative work and returned to judgment, strategy, and revenue.
            </BodyLarge>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CASES.map((c) => (
              <div
                key={c.title}
                className="flex flex-col rounded-xl p-7"
                style={{ background: "rgba(245,246,248,0.04)", border: `1px solid ${HAIRLINE}` }}
              >
                <span
                  aria-hidden
                  className="mb-5 block h-[2px] w-10 rounded-full"
                  style={{ background: RED }}
                />
                <p className="font-heading text-[18px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                  {c.title}
                </p>
                <p className="mt-4 flex-1 text-[14px] leading-[1.7]" style={{ color: PAPER_MUTED }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <SoftLink href="/case-studies">Read more case studies →</SoftLink>
          </div>
        </Section>
      </div>
    </div>
  );
}
