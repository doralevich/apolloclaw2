import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About Apollo Claw | AI Consulting Firm Founded by Operators",
  description:
    "Apollo Claw was built by an operator, not a vendor. We serve businesses from SMBs to enterprise organizations and universities, staying through strategy, deployment, and beyond.",
  alternates: {
    canonical: "https://apolloclaw.ai/about",
  },
  openGraph: {
    title: "About Apollo Claw | AI Consulting Firm Founded by Operators",
    description:
      "Apollo Claw was built by an operator, not a vendor. We serve businesses from SMBs to enterprise organizations and universities, staying through strategy, deployment, and beyond.",
    url: "https://apolloclaw.ai/about",
  },
};

const values = [
  {
    title: "Plain English Always",
    desc: "If we can't explain it without jargon, we haven't understood it well enough. Every conversation starts with listening, not pitching.",
  },
  {
    title: "Your Data Stays Yours",
    desc: "We build on your infrastructure. Your business data never leaves your environment: not to a vendor, not to a cloud you don't control.",
  },
  {
    title: "Execution Over Advice",
    desc: "Anyone can hand you a strategy deck. We stay until it's running. The measure of success is what changed in your business, not what we recommended.",
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
            }}
          >
            Built by Someone Who&apos;s{" "}
            <span style={{ color: "#D72B2B" }}>Been in the Room</span>
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "clamp(15px, 1.15vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 600,
              margin: "28px auto 0",
            }}
          >
            Apollo[Claw] isn&apos;t a software company that stumbled into AI consulting.
            It was built by an operator who watched every major technology wave arrive.
            And learned, every time, that the advantage goes to whoever moves first.
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
              Schedule a Free Call
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
              Let&apos;s Find Out What <span style={{ color: "#D72B2B" }}>AI Can Do</span> For You
            </h2>
            <p
              className="font-body"
              style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.7, color: "#555555", maxWidth: 580, margin: "0 auto 32px" }}
            >
              Every business is different. The best way to know where AI fits in yours is a direct conversation — no pitch, no pressure. Just an honest look at your operation and what&apos;s possible right now.
            </p>
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
                    David Oralevich has spent his career at the intersection of business and technology, not as a spectator, but as a builder. He rode the first wave of the commercial Internet in the late 1990s, managing divisions and sourcing technology while most businesses were still learning to spell &quot;e-commerce.&quot;
                  </p>
                  <p style={{ marginBottom: 18 }}>
                    In 2007 he founded Designs By Dave O., a digital agency that has spent nearly two decades helping businesses compete, grow, and adapt online. He knows what it costs to build something from nothing, and what it takes to keep it running.
                  </p>
                  <p style={{ marginBottom: 18 }}>
                    Then came AI. Two years before the mainstream moment, David was already in the room, working directly alongside senior engineers at leading Israeli AI startups, watching the innovation happen before it hit the headlines. By the time ChatGPT became a household name, he had already built and deployed real systems.
                  </p>
                  <p style={{ marginBottom: 18 }}>
                    What he saw next changed the trajectory entirely: the personal AI agent. Not a chatbot. Not a productivity tool. A system that operates inside your business, learns your operation, and works autonomously on your behalf, 24 hours a day, without a salary.
                  </p>
                  <p>
                    That&apos;s why he co-founded Apollo[Claw]. Not to sell software subscriptions. To sit across from business owners and executives, understand exactly what is eating their time and costing them money, and build the AI infrastructure that solves it. For real. Right now.
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
                [ What We Believe ]
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
            #about-values-grid {
              display: grid;
              gap: 20px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 768px) {
              #about-values-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
            }
            .about-value-card {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              padding: 28px 26px;
              transition: border-color 0.18s, background 0.18s;
            }
            .about-value-card:hover {
              border-color: rgba(215,43,43,0.4);
              background: rgba(255,255,255,0.05);
            }
          `}</style>

          <div id="about-values-grid">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 100}>
                <div className="about-value-card">
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
                    {v.title}
                  </h3>
                  <p
                    className="font-body"
                    style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", margin: 0 }}
                  >
                    {v.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — cream */}
      <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 text-center max-w-4xl">
          <ScrollReveal>
            <h2
              className="font-display leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 800, color: "#1A1A1A", margin: 0 }}
            >
              Ready to find out what AI can{" "}
              <span style={{ color: "#D72B2B" }}>actually do</span> for your business?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p
              className="font-body"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#555555",
                maxWidth: 500,
                margin: "22px auto 0",
              }}
            >
              A free 30-minute conversation. No pitch deck. No jargon. Just an honest look at where AI fits in your business right now.
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
                  boxShadow: "0 8px 24px rgba(215,43,43,0.28)",
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
