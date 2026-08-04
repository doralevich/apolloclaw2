import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "About Apollo Claw | Custom AI Agents Built by an Operator" },
  description:
    "Apollo[Claw] builds custom AI agents connected to your tools, running around the clock. Founded by an operator, not a vendor. Schedule a consultation.",
  alternates: {
    canonical: "https://apolloclaw.ai/about",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "About Apollo Claw | Custom AI Agents Built by an Operator",
    description:
      "Apollo[Claw] builds custom AI agents for your business: connected to your tools, running 24/7, without a salary. Founded by an operator, not a vendor. Schedule a consultation.",
    url: "https://apolloclaw.ai/about",
  },
};

const processSteps = [
  {
    title: "1. Understand the Business",
    desc: "Every engagement begins with understanding how your organization operates. We learn your workflows, systems, priorities, and the operational challenges that limit efficiency. The right AI solution starts with a clear understanding of the business.",
  },
  {
    title: "2. Build the Right Solution",
    desc: "No two organizations work the same way. Every AI agent is designed around your processes, your technology, and your goals, integrating with the way your business already operates rather than forcing you to adapt to a generic platform.",
  },
  {
    title: "3. Deliver Measurable Results",
    desc: "Technology only creates value when it's adopted and producing results. We stay involved through deployment and refinement, ensuring your AI becomes part of your daily operations and delivers measurable improvements over time.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO — dark navy */}
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
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20%",
            right: "5%",
            width: "55%",
            height: "120%",
            background:
              "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-24 md:py-32 max-w-5xl relative z-10 text-center">
          <span
            className="inline-block font-mono uppercase mb-7"
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            [ About Apollo Claw ]
          </span>
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
            Built by Someone Who&apos;s{" "}
            <span style={{ color: "#D72B2B" }}>Been in the Room</span>
          </h1>
          <div
            className="font-body"
            style={{
              fontSize: "clamp(15px, 1.15vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 940,
              margin: "28px auto 0",
            }}
          >
            <p style={{ marginBottom: 18 }}>
              Most businesses are using AI like a search engine. Apollo[Claw] builds something
              different: custom AI agents tailored to your operation, connected to your existing
              tools, and handling the work that&apos;s costing you time and money. Running 24/7,
              without a salary.
            </p>
            <p style={{ marginBottom: 18 }}>
              Most clients recover 10–20 hours a week within the first month; that translates into
              strategy, revenue, and growth.
            </p>
            <p>Built by an operator. Designed for real results.</p>
          </div>
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
              Schedule a Free Call →
            </a>
          </div>
        </div>
      </section>

      {/* LETS FIND OUT — cream */}
      <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-4xl text-center">
          <ScrollReveal>
            <span
              className="inline-block font-mono uppercase mb-5"
              style={{ fontSize: 11, letterSpacing: "0.16em", color: "#888888" }}
            >
              [ The First Step ]
            </span>
            <h2
              className="font-display leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 800, color: "#1A1A1A", margin: "0 0 22px" }}
            >
              Let&apos;s Find Out What an <span style={{ color: "#D72B2B" }}>AI Agent Can Do</span> for Your Business
            </h2>
            <div
              className="font-body"
              style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.7, color: "#555555", maxWidth: 640, margin: "0 auto 32px" }}
            >
              <p style={{ marginBottom: 18 }}>
                Every organization operates differently. That&apos;s why every AI implementation begins
                with understanding the business itself.
              </p>
              <p style={{ marginBottom: 18 }}>
                We take the time to learn how your organization works: your workflows, systems,
                decision-making, and the operational friction that slows your team down.
              </p>
              <p style={{ marginBottom: 18 }}>
                From those insights, we design and deploy an AI agent built specifically for your
                business, your people, and the way you work.
              </p>
              <p>
                No generic software. No one-size-fits-all implementation. Just AI designed to solve
                the problems that matter most.
              </p>
            </div>
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
                boxShadow: "0 8px 24px rgba(215,43,43,0.28)",
              }}
            >
              Schedule a Free Call
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* FOUNDER — cream, 2-col */}
      <section style={{ background: "#FAFAF7", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-6xl">
          <style>{`
            #about-founder-grid {
              display: grid;
              gap: 3rem;
              align-items: start;
              grid-template-columns: 1fr;
            }
            @media (min-width: 1024px) {
              #about-founder-grid {
                grid-template-columns: 360px 1fr;
                gap: 5rem;
              }
            }
          `}</style>
          <div id="about-founder-grid">
            {/* LEFT — photo + nameplate */}
            <ScrollReveal>
              <div>
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    aspectRatio: "1 / 1",
                    boxShadow: "0 24px 60px rgba(11,23,41,0.14)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/david-oralevich.png"
                    alt="David Oralevich"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                </div>
                <div style={{ marginTop: 22 }}>
                  <p
                    className="font-display"
                    style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}
                  >
                    David Oralevich
                  </p>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#D72B2B",
                      marginTop: 6,
                    }}
                  >
                    Founder, Apollo[Claw]
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* RIGHT — bio */}
            <ScrollReveal delay={120}>
              <div>
                <span
                  className="inline-block font-mono uppercase mb-5"
                  style={{ fontSize: 11, letterSpacing: "0.16em", color: "#888888" }}
                >
                  [ Founder ]
                </span>
                <h2
                  className="font-display leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, color: "#1A1A1A", margin: "0 0 28px" }}
                >
                  Thirty Years at the Edge of{" "}
                  <span style={{ color: "#D72B2B" }}>What&apos;s Next</span>
                </h2>

                <div
                  className="font-body"
                  style={{ fontSize: "clamp(15px, 1.05vw, 16.5px)", lineHeight: 1.75, color: "#555555" }}
                >
                  <p style={{ marginBottom: 18 }}>
                    David Oralevich has spent his career at the intersection of business and
                    technology. He launched his first digital agency in the late 1990s at the dawn
                    of e-commerce.
                  </p>
                  <p style={{ marginBottom: 18 }}>
                    Before ChatGPT became a household name, David worked directly alongside senior
                    engineers at leading AI startups. By the time the world caught on, he had
                    already built and deployed real systems.
                  </p>
                  <p>
                    Apollo[Claw] is the result. Not a software subscription. Not a chatbot. A
                    custom-built AI infrastructure designed for your business and the way it
                    actually runs.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WHAT WE BELIEVE — dark navy, 3-col */}
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
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-6xl relative z-10">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)" }}
              >
                [ Our Process ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, color: "#ffffff", margin: 0 }}
              >
                How We Work
              </h2>
            </div>
          </ScrollReveal>

          <style>{`
            #about-process-grid {
              display: grid;
              gap: 20px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 768px) {
              #about-process-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
            }
            .about-process-card {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              padding: 28px 26px;
              transition: border-color 0.18s, background 0.18s;
            }
            .about-process-card:hover {
              border-color: rgba(215,43,43,0.4);
              background: rgba(255,255,255,0.05);
            }
          `}</style>

          <div id="about-process-grid">
            {processSteps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 100}>
                <div className="about-process-card">
                  <div
                    style={{
                      width: 32,
                      height: 3,
                      background: "#D72B2B",
                      borderRadius: 2,
                      marginBottom: 20,
                    }}
                  />
                  <h3
                    className="font-display"
                    style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: "0 0 10px", letterSpacing: "-0.01em" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="font-body"
                    style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", margin: 0 }}
                  >
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
