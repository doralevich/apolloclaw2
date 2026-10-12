import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  // The SEO brief's copy (Donna, Oct 9 2026). /about redirects here permanently.
  title: { absolute: "About Apollo Claw | AI Consulting & Implementation" },
  description:
    "Meet David Oralevich and Apollo Claw: AI consulting and implementation from Roslyn, NY. Private agents, hands-on setup and 30 days of support.",
  alternates: {
    canonical: "https://apolloclaw.ai/company",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "About Apollo Claw | AI Consulting & Implementation",
    description:
      "Meet David Oralevich and Apollo Claw: AI consulting and implementation from Roslyn, NY. Private agents, hands-on setup and 30 days of support.",
    url: "https://apolloclaw.ai/company",
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

export default function CompanyPage() {
  return (
    <>
      {/* HERO - dark navy */}
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
        <div className="container mx-auto px-5 md:px-8 py-10 md:py-14 max-w-7xl relative z-10 text-center">
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
              fontSize: "clamp(32px, 4.4vw, 56px)",
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
              margin: "28px auto 0",
            }}
          >
            <p style={{ marginBottom: 18 }}>
              Most businesses are using AI like a search engine. Apollo[Claw] builds something
              different: custom AI agents tailored to your operation, connected to your existing
              tools, and handling the work that&apos;s costing you time and money. Running around
              the clock, at a flat monthly rate.
            </p>
            <p style={{ marginBottom: 18 }}>
              The hours your agent hands back go to strategy, revenue, and growth.
            </p>
            <p>Built by an operator. Designed for real results.</p>
          </div>
          <div style={{ marginTop: 36 }}>
            <a
              href="https://cal.com/therealdaveo/dbdo-consultation"
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

      {/* WHAT WE MAKE - white. David's statement of the product type, from the Category Design
          document (Oct 4 2026), written to the site's copy rules. The home page carries the short
          form (components/home/WhatWeDo.tsx). */}
      <section style={{ background: "#FFFFFF", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-7xl">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <span
                className="inline-block font-mono uppercase mb-5"
                style={{ fontSize: 11, letterSpacing: "0.16em", color: "#888888" }}
              >
                [ What We Make ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 800, color: "#1A1A1A", margin: "0 0 22px" }}
              >
                Customized, Private, <span style={{ color: "#D72B2B" }}>Persistent Agents</span>
              </h2>
              <div
                className="font-body"
                style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.7, color: "#555555" }}
              >
                <p style={{ marginBottom: 18 }}>
                  Apollo[Claw] creates customized, private, persistent agents: a category of product that
                  first became usable with us. Each agent is built for one person, one division, or a whole
                  company or firm on a customized, controlled plan. It holds a compounding memory of that
                  person&apos;s or team&apos;s context and preferences, acts on its own across the tools they
                  already use, and runs on a private server built to hold real business data. It is a
                  different thing from a chat tool, an automation platform or an assistant service staffed by
                  people. It is software that knows who you are, acts before you ask, and works inside a
                  private environment that can handle your real business data.
                </p>
                <p>
                  Anyone looking for this before would have wanted one thing, already configured, that holds
                  their context permanently, runs overnight unsupervised, works inside their actual stack, and
                  keeps their data where their industry needs it kept. Chat tools reset. Automation platforms
                  leave the logic to you. Assistant services scale with headcount. Apollo[Claw] is the first
                  usable version of this product type.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LETS FIND OUT - cream */}
      <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 max-w-7xl text-center">
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
              style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.7, color: "#555555", margin: "0 auto 32px" }}
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
              href="https://cal.com/therealdaveo/dbdo-consultation"
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

      {/* FOUNDER - cream, 2-col */}
      <section style={{ background: "#FAFAF7", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
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
            {/* LEFT - photo + nameplate */}
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

            {/* RIGHT - bio */}
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

      {/* WHAT WE BELIEVE - dark navy, 3-col */}
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
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl relative z-10">
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
