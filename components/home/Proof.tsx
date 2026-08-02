import { BracketLabel, BodyLarge, H2, Section, SoftLink } from "@/components/home/ui";

// Real, anonymized case study (apolloclaw-proof.md, flagship instance). Do not invent or
// embellish; place as written. [CONFIRM]: report-turnaround "before" , days or hours? (currently
// implied "used to wait on staff", per the source doc's open item , flagged for David.)
export function Proof() {
  return (
    <Section bg="#F2F0EB">
      <div className="mx-auto max-w-3xl text-center">
        <BracketLabel>Proof</BracketLabel>
        <H2>Six executives. Seven to twelve hours back a week. Each.</H2>
        <div className="mt-6">
          <BodyLarge>
            A private-equity-backed national e-commerce accelerator rolled Apollo[Claw] out to its
            executive team. The agents connect across Google Workspace, Microsoft 365, Dropbox, and
            their HR and payroll systems. Executives pull the reports they need in minutes, on
            their own, and the rollout is expanding toward full staff.
          </BodyLarge>
        </div>
        <div className="mt-8">
          <SoftLink href="/case-studies">Read how they did it →</SoftLink>
        </div>
      </div>
    </Section>
  );
}
