import { agentBrand } from "@/lib/agentBrand";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The hero the standalone agent sites use, brought back to apolloclaw.ai.
//
// Somebody reading /industries/law-firms and somebody reading thelawagent.ai are being sold the
// same product, and until now they saw two different things: the standalone site opened with the
// agent's own colour, its mascot and a Build My Agent button, while this one opened centred in
// ApolloClaw navy with a single Schedule a Consultation link. The missing button is the part that
// actually cost something - these pages had no self-serve path at all, only a call.
//
// Structure mirrors app/components/Hero.tsx in each agent site repo: badge, headline, a
// brand-coloured punch line, the sub, two CTAs, mascot on the right. Colour and mascot come from
// agentBrand(), which is the same source /build/<slug> already uses, so a page and the funnel it
// leads to can never disagree about what colour an agent is.
//
// Agents with no site of their own fall back to ApolloClaw red with no mascot, exactly as
// agentBrand() already does for the funnel. That path is deliberately supported: it means an
// industry page with no dedicated agent still gets the layout, just without the borrowed brand.

const NAVY = "#0B1729";

export default function AgentHero({
  agentTypeId,
  buildSlug,
  badge,
  title,
  punch,
  sub,
}: {
  /** Keys agentBrand(): "legal", "cfo", "medical"... Omit for the ApolloClaw-red fallback. */
  agentTypeId?: string;
  /** The /build/<slug> funnel. Omit when the agent is not sold self-serve; the Build button
   *  then drops out rather than pointing at a 404, and the consultation CTA carries the hero. */
  buildSlug?: string;
  badge: string;
  title: React.ReactNode;
  punch: string;
  sub: string;
}) {
  const brand = agentBrand(agentTypeId);
  const hasMascot = Boolean(brand.mascot);

  return (
    <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* The glow takes the agent's own colour rather than ApolloClaw red, which is most of why
          the page reads as the same product as the site the visitor just came from. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-25%",
          left: hasMascot ? "35%" : "50%",
          transform: "translateX(-50%)",
          width: "75%",
          height: "130%",
          background: `radial-gradient(ellipse at center, rgba(${brand.colorRgb},0.13) 0%, transparent 62%)`,
          pointerEvents: "none",
        }}
      />

      <div
        className={`container relative z-10 mx-auto grid items-center gap-10 px-5 py-16 md:px-8 md:py-24 ${
          hasMascot ? "max-w-6xl md:grid-cols-[1.15fr_0.85fr]" : "max-w-4xl text-center"
        }`}
      >
        <div className={hasMascot ? "" : "mx-auto"}>
          <div
            className="font-mono mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{
              color: brand.color,
              border: `1px solid rgba(${brand.colorRgb},0.42)`,
              background: `rgba(${brand.colorRgb},0.10)`,
            }}
          >
            <span aria-hidden="true">&#9670;</span>
            {badge}
          </div>

          <h1
            className="font-display tracking-tight"
            style={{
              fontSize: "clamp(36px, 4.6vw, 60px)",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {title}
          </h1>

          <p
            className="font-display"
            style={{
              fontSize: "clamp(18px, 1.7vw, 23px)",
              lineHeight: 1.35,
              fontWeight: 700,
              color: brand.color,
              margin: "20px 0 0",
            }}
          >
            {punch}
          </p>

          <p
            className="font-body"
            style={{
              fontSize: "clamp(15px, 1.15vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              margin: "18px 0 0",
              maxWidth: 620,
              marginInline: hasMascot ? undefined : "auto",
            }}
          >
            {sub}
          </p>

          <div
            className={`mt-9 flex flex-wrap gap-3 ${hasMascot ? "" : "justify-center"}`}
          >
            {buildSlug && (
              <a
                href={`/build/${buildSlug}`}
                className="font-mono inline-flex items-center justify-center rounded font-bold uppercase transition-all hover:brightness-110"
                style={{
                  background: brand.color,
                  color: "#ffffff",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  padding: "14px 30px",
                  textDecoration: "none",
                  boxShadow: `0 8px 24px rgba(${brand.colorRgb},0.35)`,
                }}
              >
                Build My Agent
              </a>
            )}
            <a
              href={SCHEDULE_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono inline-flex items-center justify-center rounded font-bold uppercase transition-all hover:bg-white/10"
              style={{
                background: "transparent",
                color: "#ffffff",
                fontSize: 13,
                letterSpacing: "0.1em",
                padding: "14px 30px",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              Schedule a Consultation
            </a>
          </div>
        </div>

        {brand.mascot && (
          <div className="hidden justify-self-center md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.mascot}
              alt=""
              aria-hidden="true"
              style={{ width: "100%", maxWidth: 330, height: "auto", display: "block" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
