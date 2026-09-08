import { INDUSTRIES } from "@/config/navigation";
import { NavCard } from "@/components/home/NavCard";
import { BodyLarge, BracketLabel, H2, NAVY, Section } from "@/components/home/ui";

// Homepage card grid for the Industries axis, reading the same list the nav flyout renders
// (config/navigation.ts) so the two can never disagree. AgentCards is the other axis and
// renders the same NavCard directly below this one.
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
          <div className="text-center">
            <BracketLabel>By Industry</BracketLabel>
            {/* The heading is deliberately NOT inside the max-w-3xl wrapper the body copy uses:
                at the top of the H2 clamp it needs more than 768px to stay on one line, and a
                narrower parent would force the wrap this is meant to prevent. nowrap only from
                md up, so the phone still wraps normally instead of overflowing the viewport. */}
            <div className="md:whitespace-nowrap">
              <H2>Built around how your business runs</H2>
            </div>
            <div className="mx-auto max-w-3xl">
              <BodyLarge>
                The work an agent takes off your plate looks different in a law firm than it does
                in a medical practice. Start where you are.
              </BodyLarge>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((item) => (
              <NavCard key={item.to} item={item} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
