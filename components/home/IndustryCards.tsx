import Link from "next/link";
import { INDUSTRIES } from "@/config/navigation";
import { BodyLarge, BracketLabel, H2, NAVY, PAPER, PAPER_MUTED, RED, Section } from "@/components/home/ui";

// Homepage card grid for the Industries axis, reading the same list the nav flyout renders
// (config/navigation.ts) so the two can never disagree. Departments is the other axis and uses
// the identical card, so switching this section over is a one-line change.
export function IndustryCards() {
  return (
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
            <BracketLabel>By Industry</BracketLabel>
            <H2>Built around how your business actually runs</H2>
            <BodyLarge>
              The work an agent takes off your plate looks different in a law firm than it does
              in a medical practice. Start where you are.
            </BodyLarge>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map(({ label, description, to, Icon }) => (
              <Link
                key={to}
                href={to}
                className="group flex flex-col rounded-xl p-6 transition-colors"
                style={{
                  background: "rgba(245,246,248,0.04)",
                  border: "1px solid rgba(245,246,248,0.1)",
                  textDecoration: "none",
                }}
              >
                <span
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ background: "rgba(225,46,48,0.12)", border: "1px solid rgba(225,46,48,0.25)" }}
                >
                  <Icon size={19} style={{ color: RED }} />
                </span>
                <span className="font-heading text-[16px] font-bold leading-[1.3]" style={{ color: PAPER }}>
                  {label}
                </span>
                <span className="mt-2 flex-1 text-[13.5px] leading-[1.65]" style={{ color: PAPER_MUTED }}>
                  {description}
                </span>
                <span
                  className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-100"
                  style={{ color: RED, opacity: 0.75 }}
                >
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
