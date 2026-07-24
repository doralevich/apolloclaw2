import ScrollReveal from "@/components/ScrollReveal";
import AgentWordmark from "@/components/AgentWordmark";
import { CheckCircle } from "lucide-react";

interface UseCase {
  label: string;
  title: string;
  subtitle: string;
  description: string;
  challenges: string[];
  solutions: { title: string; desc: string }[];
  results: string[];
  /** Optional sub-brand wordmark shown above the hero heading, e.g. { name: "College", accent: "#2E8B57" }. */
  logo?: { name: string; accent: string };
}

export default function UseCaseTemplate({ uc }: { uc: UseCase }) {
  return (
    <>
      {/* HERO — dark navy + grid */}
      <section
        style={{ background: "#0B1729", color: "#ffffff" }}
        className="relative overflow-hidden"
      >
        {/* grid overlay */}
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
        {/* red glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "120%",
            background:
              "radial-gradient(ellipse at center, rgba(215,43,43,0.10) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-24 md:py-32 text-center max-w-5xl relative z-10">
          <span
            className="inline-block font-mono uppercase mb-6"
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "6px 14px",
              borderRadius: 999,
            }}
          >
            {uc.label}
          </span>
          {uc.logo && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <AgentWordmark name={uc.logo.name} accent={uc.logo.accent} ink="#ffffff" size={30} />
            </div>
          )}
          <h1
            className="font-display leading-[1.05] tracking-tight"
            style={{
              fontSize: "clamp(38px, 5.6vw, 72px)",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              textWrap: "balance",
            }}
          >
            {uc.title}{" "}
            <span style={{ color: "#D72B2B" }}>{uc.subtitle}</span>
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "clamp(15px, 1.15vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 940,
              margin: "24px auto 0",
            }}
          >
            {uc.description}
          </p>
          <div style={{ marginTop: 36 }}>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
              style={{
                background: "#D72B2B",
                color: "#ffffff",
                fontSize: 13,
                letterSpacing: "0.1em",
                padding: "14px 30px",
                borderRadius: 4,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
              }}
            >
              Schedule Today
            </a>
          </div>
        </div>
      </section>

      {/* CHALLENGES — cream */}
      <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-5xl">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: "#888888" }}
              >
                [ The Problem ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, color: "#1A1A1A", margin: 0 }}
              >
                The Daily <span style={{ color: "#D72B2B" }}>Challenges</span>
              </h2>
            </div>
          </ScrollReveal>

          <style>{`
            #uc-challenges-grid {
              display: grid;
              gap: 14px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 768px) {
              #uc-challenges-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
            }
            .uc-challenge-card {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.07);
              border-radius: 10px;
              padding: 18px 20px;
              display: flex;
              align-items: flex-start;
              gap: 12px;
              transition: border-color 0.18s;
            }
            .uc-challenge-card:hover { border-color: rgba(215,43,43,0.3); }
          `}</style>

          <div id="uc-challenges-grid">
            {uc.challenges.map((c, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="uc-challenge-card">
                  <span
                    style={{
                      color: "#D72B2B",
                      fontWeight: 700,
                      fontSize: 16,
                      lineHeight: 1,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                  <p className="font-body" style={{ fontSize: 14.5, lineHeight: 1.6, color: "#333333", margin: 0 }}>
                    {c}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS — dark navy */}
      <section style={{ background: "#0B1729", color: "#ffffff" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(215,43,43,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-5xl relative z-10">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)" }}
              >
                [ The Solution ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, color: "#ffffff", margin: 0 }}
              >
                How Apollo[Claw] <span style={{ color: "#D72B2B" }}>Helps</span>
              </h2>
            </div>
          </ScrollReveal>

          <style>{`
            #uc-solutions-grid {
              display: grid;
              gap: 20px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 768px) {
              #uc-solutions-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
            }
            .uc-solution-card {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              padding: 24px 22px;
              transition: border-color 0.18s, background 0.18s;
            }
            .uc-solution-card:hover {
              border-color: rgba(215,43,43,0.4);
              background: rgba(255,255,255,0.05);
            }
          `}</style>

          <div id="uc-solutions-grid">
            {uc.solutions.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="uc-solution-card">
                  <div style={{ width: 28, height: 3, background: "#D72B2B", borderRadius: 2, marginBottom: 16 }} />
                  <h3
                    className="font-display"
                    style={{ fontSize: 17, fontWeight: 800, color: "#ffffff", margin: "0 0 10px", letterSpacing: "-0.01em" }}
                  >
                    {s.title}
                  </h3>
                  <p className="font-body" style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS — cream */}
      <section style={{ background: "#FAFAF7", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-4xl">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: "#888888" }}
              >
                [ The Outcome ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, color: "#1A1A1A", margin: 0 }}
              >
                What You <span style={{ color: "#D72B2B" }}>Get Back</span>
              </h2>
            </div>
          </ScrollReveal>

          <style>{`
            #uc-results-grid {
              display: grid;
              gap: 14px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 768px) {
              #uc-results-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
            }
          `}</style>

          <div id="uc-results-grid">
            {uc.results.map((r, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: 10,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <CheckCircle size={18} color="#D72B2B" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p className="font-body" style={{ fontSize: 14.5, lineHeight: 1.6, color: "#333333", margin: 0 }}>
                    {r}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark navy */}
      <section style={{ background: "#0B1729", color: "#ffffff" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(215,43,43,0.16) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 text-center max-w-4xl relative z-10">
          <ScrollReveal>
            <h2
              className="font-display leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", margin: 0 }}
            >
              Ready to find out what AI can do{" "}
              <span style={{ color: "#D72B2B" }}>for your business?</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p
              className="font-body"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 500,
                margin: "22px auto 0",
              }}
            >
              A free 30-minute conversation. You bring the bottlenecks, we&apos;ll bring the answers.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div style={{ marginTop: 36 }}>
              <a
                href="https://calendly.com/therealdaveo/apolloai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                style={{
                  background: "#D72B2B",
                  color: "#ffffff",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  padding: "14px 32px",
                  borderRadius: 4,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
                }}
              >
                Schedule Today
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
