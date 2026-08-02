import { BracketLabel, H2, HAIRLINE, INK, INK_MUTED, NAVY_ELEVATED, Section, SoftLink } from "@/components/home/ui";

const DOORS = [
  {
    title: "By role.",
    body: "An agent for a job to be done, CEO, CFO, sales, recruiting, HR, receptionist, and more.",
    linkLabel: "Explore agents →",
    href: "/ai-agents",
  },
  {
    title: "By industry.",
    body: "Built around your world, law, medical, real estate, insurance, and more.",
    linkLabel: "Explore industries →",
    href: "/industries",
  },
  {
    title: "By size.",
    body: "Right-sized for where you are, startup to enterprise.",
    linkLabel: "Explore solutions →",
    href: "/solutions",
  },
];

export function ThreeWaysIn() {
  return (
    <Section bg={NAVY_ELEVATED}>
      <div className="mx-auto max-w-2xl text-center">
        <BracketLabel>Find Your Fit</BracketLabel>
        <H2>Three ways to start, depending on how you think about the work.</H2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {DOORS.map((door) => (
          <div
            key={door.title}
            className="rounded-2xl border p-8"
            style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.03)" }}
          >
            <h3 className="font-heading text-[1.375rem] font-semibold leading-[1.2]" style={{ color: INK }}>
              {door.title}
            </h3>
            <p className="font-body mt-3 text-[1rem] leading-[1.7]" style={{ color: INK_MUTED }}>
              {door.body}
            </p>
            <div className="mt-6">
              <SoftLink href={door.href}>{door.linkLabel}</SoftLink>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
