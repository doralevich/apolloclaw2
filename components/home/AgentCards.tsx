import { AGENTS } from "@/config/navigation";
import { agentBrand } from "@/lib/agentBrand";
import { NavCard } from "@/components/home/NavCard";
import { BodyLarge, BracketLabel, H2, NAVY_ELEVATED, Section } from "@/components/home/ui";

// Homepage card grid for the Agents axis, the counterpart to IndustryCards. The nav has had two
// axes since Departments became Agents, but the homepage only ever showed one of them - so a
// visitor who never opened the menu was never told the products have names.
//
// Each tile takes its agent's own colour through agentBrand(), the same source the agent pages
// and the /build/<slug> funnels read. Industries stay uniformly red, because an industry is not
// one agent and has no colour of its own.
//
// Sits on NAVY_ELEVATED rather than NAVY. Two navy bands in a row is the thing the ordering
// comment in app/page.tsx warns about, but these two belong together: a step in value reads as a
// deliberate pair, where the same navy twice reads as a mistake. The tan blog band still follows.
export function AgentCards() {
  return (
    <div style={{ background: NAVY_ELEVATED }} className="relative overflow-hidden">
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
            <BracketLabel>By Agent</BracketLabel>
            <H2>Or start with the job you need done</H2>
            <div className="mx-auto max-w-3xl">
              <BodyLarge>
                Each one is a product with a name, a scope, and a price. Pick the one covering the
                work that keeps landing on you.
              </BodyLarge>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((item, i) => {
              const brand = agentBrand(item.agentTypeId);
              // Seven agents in a three-up grid leaves the last one alone in its row, hard against
              // the left edge. Centering the orphan costs one class and keeps the grid from
              // reading as an unfinished row. Only when there is exactly one trailing card, so
              // adding an eighth agent needs no thought here.
              const orphan = i === AGENTS.length - 1 && AGENTS.length % 3 === 1;
              return (
                <NavCard
                  key={item.to}
                  item={item}
                  accent={brand.color}
                  accentRgb={brand.colorRgb}
                  className={orphan ? "lg:col-start-2" : undefined}
                />
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}
