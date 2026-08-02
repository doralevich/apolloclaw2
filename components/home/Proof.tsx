import { BracketLabel, BodyLarge, H2, HAIRLINE, PAPER, Section, SoftLink } from "@/components/home/ui";

const STATS = [
  { value: "6", label: "Executives running agents" },
  { value: "7-12", label: "Hours back a week, each" },
  { value: "4", label: "Systems connected end to end" },
];

// Real, anonymized case study (apolloclaw-proof.md, flagship instance). Do not invent or
// embellish; place as written. [CONFIRM]: report-turnaround "before" , days or hours? (currently
// implied "used to wait on staff", per the source doc's open item , flagged for David.)
export function Proof() {
  return (
    <Section>
      <div className="mx-auto max-w-4xl text-center">
        <BracketLabel>Proof</BracketLabel>
        <H2>Six executives. Seven to twelve hours back a week. Each.</H2>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="px-2 text-center sm:px-6"
            style={{ borderLeft: i > 0 ? `1px solid ${HAIRLINE}` : undefined }}
          >
            <div
              className="font-heading text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none tracking-tight"
              style={{ color: PAPER }}
            >
              {stat.value}
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase leading-tight tracking-[0.1em]" style={{ color: PAPER }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl text-center">
        <BodyLarge>
          A private-equity-backed national e-commerce accelerator rolled Apollo[Claw] out to its
          executive team. The agents connect across Google Workspace, Microsoft 365, Dropbox, and
          their HR and payroll systems. Executives pull the reports they need in minutes, on their
          own, and the rollout is expanding toward full staff.
        </BodyLarge>
        <div className="mt-8">
          <SoftLink href="/case-studies">Read how they did it →</SoftLink>
        </div>
      </div>
    </Section>
  );
}
