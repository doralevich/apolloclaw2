import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Mail, Calendar, Search, Code, FileText, Plug, Briefcase, Heart, TrendingUp, Home, Scale, Wrench, User, Target, Wallet, Shield, Calculator, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import HeroInput from "@/components/HeroInput";
import LogoTicker from "@/components/LogoTicker";
import DayWithJohnEmbed from "@/components/DayWithJohnEmbed";
import { sanityClient } from "@/lib/sanity";
import { POSTS_QUERY } from "@/lib/sanity-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Apollo Claw | Enterprise AI Strategy & Implementation for Executives",
  description:
    "Apollo Claw partners with CEOs, CFOs, COOs, and Managing Partners to design and deploy organization-wide AI strategies. From roadmap to execution — we build what your business actually needs.",
};

async function getLatestPosts() {
  try {
    const data = await sanityClient.fetch(POSTS_QUERY);
    if (data && data.length > 0) {
      return data
        .slice(0, 4)
        .map((p: any) => ({
          slug: p.slug?.current || p.slug || "",
          title: p.title,
          excerpt: p.excerpt || "",
          category: p.category || "Uncategorized",
          date: p.publishedAt || "",
        }));
    }
  } catch {
    // Fall back to empty
  }
  return [];
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <>
      {/* HERO */}
      <section
        style={{ background: "#0B1729", color: "#ffffff" }}
        className="relative overflow-hidden"
      >
        {/* subtle red glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20%",
            left: "10%",
            width: "60%",
            height: "120%",
            background: "radial-gradient(ellipse at center, rgba(215,43,43,0.10) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-24 relative z-10 max-w-7xl">
          <style>{`#apollo-hero-grid { display: grid; gap: 3rem; align-items: center; grid-template-columns: 1fr; } @media (min-width: 1024px) { #apollo-hero-grid { gap: 4rem; grid-template-columns: 1.4fr 1fr; } }`}</style>
          <div id="apollo-hero-grid">
            {/* LEFT — copy + CTA */}
            <div>
              <span
                className="inline-block font-mono text-[11px] uppercase tracking-widest mb-7 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.16em",
                }}
              >
                AI Strategy &amp; Implementation
              </span>
              <h1
                className="font-display leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(36px, 5.4vw, 64px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Your Business Runs on Decisions. Make Every One Smarter with{" "}
                <span style={{ color: "#D72B2B" }}>AI</span>
              </h1>
              <p
                className="font-body mt-7"
                style={{
                  fontSize: "clamp(15px, 1.15vw, 17px)",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.72)",
                  maxWidth: 560,
                  margin: "28px 0 0 0",
                }}
              >
                Apollo Claw partners with executives and leadership teams to design, deploy, and manage AI across the entire organization — from strategy to execution.
              </p>
              <div className="mt-9">
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
                    boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
                  }}
                >
                  Schedule Today
                </a>
              </div>
            </div>

            {/* RIGHT — Apollo[Claw] Assistant card */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 22,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                display: "flex",
                flexDirection: "column",
                minHeight: 440,
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
                <div className="flex items-center gap-2.5">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#16a34a",
                      boxShadow: "0 0 8px rgba(22,163,74,0.6)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Apollo<span style={{ color: "#D72B2B" }}>[</span>Claw<span style={{ color: "#D72B2B" }}>]</span> Assistant
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Online
                </span>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Hi! How can I help you today? Tell me what you&apos;re looking to set up — I&apos;ll push you in the right direction.
              </div>
              <div
                style={{
                  background: "#070F1C",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: "auto",
                }}
              >
                <input
                  type="text"
                  placeholder="Type your message…"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  aria-label="Send"
                  style={{
                    background: "#D72B2B",
                    color: "#fff",
                    border: "none",
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* YOUR AI ASSISTANT — Section 3 (cream bg, 2-col, John video) */}
      <section style={{ background: "#FAFAF7", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
          <style>{`#apollo-ai-assistant-grid { display: grid; gap: 3rem; align-items: center; grid-template-columns: 1fr; } @media (min-width: 1024px) { #apollo-ai-assistant-grid { gap: 5rem; grid-template-columns: 1fr 1.05fr; } }`}</style>
          <div id="apollo-ai-assistant-grid">
            {/* LEFT — heading + body copy */}
            <ScrollReveal>
              <div>
                <span
                  className="inline-block font-mono uppercase mb-5"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    color: "#888888",
                  }}
                >
                  [ What Is an Agent ]
                </span>
                <h2
                  className="font-display leading-[1.05] tracking-tight"
                  style={{
                    fontSize: "clamp(32px, 4.4vw, 56px)",
                    fontWeight: 800,
                    color: "#1A1A1A",
                    margin: 0,
                  }}
                >
                  Your <span style={{ color: "#D72B2B" }}>AI Assistant</span>
                </h2>
                <p
                  className="font-body"
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    lineHeight: 1.7,
                    color: "#555555",
                    marginTop: 28,
                    maxWidth: 520,
                  }}
                >
                  Apollo[Claw] builds AI agents that work inside your existing business — not alongside it. The agent connects to the tools you already use and handles the repetitive, time-consuming work that keeps you buried in your inbox.
                </p>
                <p
                  className="font-body"
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    lineHeight: 1.7,
                    color: "#555555",
                    marginTop: 18,
                    maxWidth: 520,
                  }}
                >
                  The result: fewer hours on administrative tasks, faster response times, fewer things falling through the cracks. For many clients, an Apollo[Claw] agent replaces 10–20 hours per week of manual work within the first month.
                </p>
              </div>
            </ScrollReveal>

            {/* RIGHT — "A day with John" video placeholder */}
            <ScrollReveal delay={150}>
              <div
                style={{
                  background: "#0B1729",
                  borderRadius: 14,
                  overflow: "hidden",
                  aspectRatio: "16 / 10",
                  position: "relative",
                  boxShadow: "0 24px 60px rgba(11,23,41,0.18)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {/* subtle bg pattern */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 50% 60%, rgba(215,43,43,0.18) 0%, transparent 60%)",
                  }}
                />

                {/* Title overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "22px 26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#ffffff",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  <span>Apollo[Claw] · Case Study</span>
                  <span>1:24</span>
                </div>

                {/* Centered poster → swaps to embedded iframe on click */}
                <DayWithJohnEmbed />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* AI THAT ACTUALLY WORKS — Section 4 (cream, 12-agent grid) */}
      <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "#888888",
                }}
              >
                [ Real Use Cases ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(32px, 4.4vw, 56px)",
                  fontWeight: 800,
                  color: "#1A1A1A",
                  margin: "0 0 14px",
                }}
              >
                AI That <span style={{ color: "#D72B2B" }}>Actually Works</span>
              </h2>
              <p
                className="font-body"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  color: "#555555",
                  margin: "0 auto",
                  maxWidth: 560,
                }}
              >
                Here&apos;s what our clients are automating right now.
              </p>
            </div>
          </ScrollReveal>

          <style>{`
            #apollo-agents-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
            @media (min-width: 640px) { #apollo-agents-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1024px) { #apollo-agents-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }
            .apollo-agent-card { transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
            .apollo-agent-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); border-color: rgba(215,43,43,0.4); }
          `}</style>

          <div id="apollo-agents-grid">
            {[
              { icon: Briefcase, category: "Executive", title: "The CEO Agent", desc: "Faster decisions, fewer status calls." },
              { icon: Heart, category: "Healthcare", title: "The Medical Agent", desc: "Patient triage, intake summaries, faster charting." },
              { icon: TrendingUp, category: "Finance Operations", title: "The CFO Agent", desc: "Cash forecasts, board prep, monthly close — drafted before you ask." },
              { icon: Home, category: "Real Estate", title: "The Real Estate Agent", desc: "New leads sorted, listings written, follow-ups closed automatically." },
              { icon: Scale, category: "Legal", title: "The Legal Agent", desc: "Intake forms, case research, document summaries — answer-ready in minutes." },
              { icon: Wrench, category: "Construction", title: "The Contractors Agent", desc: "Estimates drafted, schedules juggled, change orders tracked — without the chaos." },
              { icon: User, category: "Productivity", title: "The Personal Assistant", desc: "Inbox, calendar, contacts, notes — handled while you focus on the real work." },
              { icon: Target, category: "Sales", title: "The Sales Agent", desc: "Cold-to-warm outreach, automated follow-ups, more closed deals — without burnout." },
              { icon: Wallet, category: "Finance", title: "The Finance Agent", desc: "Monthly close support, expense triage, board-ready reports — drafted on time." },
              { icon: Shield, category: "Insurance", title: "The Insurance Agent", desc: "Quote requests, policy renewals, claims status — answered before clients ask." },
              { icon: Calculator, category: "Accounting", title: "The Accounting Agent", desc: "Bookkeeping, reconciliations, tax prep flagged early — fewer surprises at year end." },
              { icon: Users, category: "Brokerage", title: "The Brokers Agent", desc: "Client requests, deal pipelines, KYC docs — kept moving without manual chase." },
            ].map((agent, i) => {
              const Icon = agent.icon;
              return (
                <ScrollReveal key={agent.title} delay={(i % 4) * 80}>
                  <div
                    className="apollo-agent-card"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.07)",
                      borderRadius: 10,
                      padding: "20px 20px 22px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(215,43,43,0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <Icon size={18} color="#D72B2B" strokeWidth={2} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#888888",
                        marginBottom: 6,
                      }}
                    >
                      {agent.category}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-body), Inter, sans-serif",
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#1A1A1A",
                        margin: "0 0 8px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {agent.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "#555555",
                        margin: 0,
                      }}
                    >
                      {agent.desc}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI AGENTS FEATURES — Section 5 (dark navy, hub & spoke) */}
      <section style={{ background: "#0B1729", color: "#ffffff" }} className="relative overflow-hidden">
        {/* subtle red glow center */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(215,43,43,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl relative z-10">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                className="inline-block font-mono uppercase mb-4"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                [ Working On You ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(32px, 4.4vw, 56px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  margin: "0 0 14px",
                }}
              >
                AI Agents <span style={{ color: "#D72B2B" }}>Features</span>
              </h2>
              <p
                className="font-body"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  color: "rgba(255,255,255,0.72)",
                  margin: "0 auto",
                  maxWidth: 560,
                }}
              >
                Everything your team would do by hand — done in the background, while you work on the rest.
              </p>
            </div>
          </ScrollReveal>

          <style>{`
            #apollo-features-grid {
              display: grid;
              gap: 20px;
              grid-template-columns: 1fr;
              align-items: stretch;
            }
            @media (min-width: 640px) {
              #apollo-features-grid { grid-template-columns: 1fr 1fr; }
            }
            @media (min-width: 1024px) {
              #apollo-features-grid {
                grid-template-columns: 1fr 1.1fr 1fr;
                gap: 28px;
                align-items: center;
              }
              .apollo-feature-col { display: flex; flex-direction: column; gap: 18px; }
            }
            .apollo-feature-card {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 12px;
              padding: 18px 20px;
              transition: border-color 0.18s, background 0.18s, transform 0.18s;
            }
            .apollo-feature-card:hover {
              border-color: rgba(215,43,43,0.45);
              background: rgba(255,255,255,0.05);
              transform: translateY(-2px);
            }
            .apollo-feature-hub {
              aspect-ratio: 1 / 1;
              max-width: 320px;
              margin: 0 auto;
              border-radius: 50%;
              background: radial-gradient(circle at 50% 40%, #152442 0%, #0B1729 70%);
              border: 1px solid rgba(255,255,255,0.12);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 30px;
              position: relative;
              box-shadow: 0 0 80px rgba(215,43,43,0.18), inset 0 0 40px rgba(215,43,43,0.06);
            }
            .apollo-feature-hub::before {
              content: "";
              position: absolute;
              inset: 14px;
              border-radius: 50%;
              border: 1px dashed rgba(255,255,255,0.08);
              pointer-events: none;
            }
          `}</style>

          <div id="apollo-features-grid">
            {/* LEFT column — 3 features */}
            <div className="apollo-feature-col">
              {[
                { icon: Mail, title: "Manage Your Inbox", desc: "Your AI reads, sorts, and replies so you don't have to." },
                { icon: Calendar, title: "Handle Scheduling", desc: "Checks availability, sends invites, updates your calendar." },
                { icon: Code, title: "Build & Automate", desc: "Writes scripts, sets up flows, kills the repetitive busywork." },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <ScrollReveal key={f.title} delay={i * 80}>
                    <div className="apollo-feature-card">
                      <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(215,43,43,0.16)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={16} color="#ffffff" strokeWidth={2} />
                        </span>
                        <h3
                          style={{
                            fontFamily: "var(--font-body), Inter, sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {f.title}
                        </h3>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.65)",
                          margin: 0,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* CENTER — the hub */}
            <ScrollReveal delay={120}>
              <div className="apollo-feature-hub">
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 12,
                  }}
                >
                  Working On You
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-body), Inter, sans-serif",
                    fontSize: "clamp(22px, 2.4vw, 30px)",
                    fontWeight: 800,
                    color: "#ffffff",
                    margin: 0,
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  AI Agents
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body), Inter, sans-serif",
                    fontSize: "clamp(22px, 2.4vw, 30px)",
                    fontWeight: 800,
                    color: "#D72B2B",
                    margin: 0,
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Features
                </p>
              </div>
            </ScrollReveal>

            {/* RIGHT column — 3 features */}
            <div className="apollo-feature-col">
              {[
                { icon: Search, title: "Research Anything", desc: "Searches, analyzes, and delivers a summary report on demand." },
                { icon: FileText, title: "Manage Documents", desc: "Reads docs, extracts key points, answers questions about them." },
                { icon: Plug, title: "Connect Your Tools", desc: "Talks to APIs and SaaS you already use — Stripe, HubSpot, Slack, more." },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <ScrollReveal key={f.title} delay={i * 80}>
                    <div className="apollo-feature-card">
                      <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(215,43,43,0.16)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={16} color="#ffffff" strokeWidth={2} />
                        </span>
                        <h3
                          style={{
                            fontFamily: "var(--font-body), Inter, sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {f.title}
                        </h3>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.65)",
                          margin: 0,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* AI AGENTS IN ACTION — Section 6 (cream, centered header + 2-col cases) */}
      <section style={{ background: "#FAFAF7", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
          <style>{`
            #apollo-cases-grid {
              display: grid;
              gap: 18px;
              grid-template-columns: 1fr;
            }
            @media (min-width: 1024px) {
              #apollo-cases-grid {
                grid-template-columns: 1fr 1fr;
                gap: 24px;
              }
            }
            .apollo-case-card {
              transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
              height: 100%;
            }
            .apollo-case-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 30px rgba(11,23,41,0.08);
              border-color: rgba(215,43,43,0.5);
            }
          `}</style>

          {/* CENTERED header block */}
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
              <span
                className="inline-block font-mono uppercase mb-5"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "#888888",
                }}
              >
                [ Case Study ]
              </span>
              <h2
                className="font-display leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(32px, 4.4vw, 56px)",
                  fontWeight: 800,
                  color: "#1A1A1A",
                  margin: 0,
                }}
              >
                AI Agents <span style={{ color: "#D72B2B" }}>in Action</span>
              </h2>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#D72B2B",
                  marginTop: 26,
                  marginBottom: 14,
                  fontWeight: 700,
                }}
              >
                The Consistent Outcome
              </p>
              <p
                className="font-body"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.7,
                  color: "#555555",
                  margin: "0 auto",
                  maxWidth: 620,
                }}
              >
                Across every deployment, the result is the same: executives get time back, 10–20 hours per week were spent recovering from administrative work and returned to judgment, strategy, and revenue. That&apos;s the Apollo[Claw] promise — and it&apos;s delivering.
              </p>
              <div style={{ marginTop: 32 }}>
                <a
                  href="/case-studies"
                  className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                  style={{
                    background: "#D72B2B",
                    color: "#ffffff",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    padding: "12px 26px",
                    borderRadius: 4,
                    textDecoration: "none",
                    boxShadow: "0 6px 18px rgba(215,43,43,0.28)",
                  }}
                >
                  Read More Case Studies →
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* 2-column case studies */}
          <div id="apollo-cases-grid">
            {[
              {
                title: "AI Chief of Staff Deployment",
                body: "A senior executive at a PE-backed operating company was managing an overwhelming volume of daily communications, internal coordination, and strategic follow-up with no dedicated support structure. Following Apollo[Claw]'s proprietary intake and 30-day onboarding, a tailored AI Chief of Staff was deployed. Within the first month, the executive recovered an estimated 12-to-15-hours per week previously consumed by administrative tasks — redirecting that time entirely toward revenue-generating activity and strategic decision-making.",
                accent: "#D72B2B",
              },
              {
                title: "HIPAA-Aware Clinical AI Assistant",
                body: "A concierge medical practice partner sought an AI solution that could operate within a healthcare context without compromising patient privacy or regulatory standing. Apollo[Claw] deployed a HIPAA-aware clinical agent configured for clinical workflow support — scheduling assistance, patient communication routing, and operational task automation — all clear of patient-facing surfaces. The practice owner reported immediate relief from administrative burden and expanded capacity to focus on patient care and practice growth.",
                accent: "#0B1729",
              },
            ].map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 100}>
                <div
                  className="apollo-case-card"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: `3px solid ${c.accent}`,
                    borderRadius: "10px",
                    padding: "26px 28px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-body), Inter, sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: c.accent,
                      margin: "0 0 14px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "#555555",
                      margin: 0,
                    }}
                  >
                    {c.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST FROM THE BLOG */}
      {latestPosts.length > 0 && (
        <section className="bg-surface-alt pt-[60px] pb-[60px] relative">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-5xl text-foreground">
                  Latest from the Blog
                </h2>
                <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
                  Expert insights on AI automation for business owners
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestPosts.map((post: any, i: number) => (
                <ScrollReveal key={post.slug} delay={i * 100}>
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden h-full hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col">
                      {post.image && (
                        <div className="w-full aspect-[16/9] overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <span className="inline-block text-xs font-mono border border-border rounded-full px-3 py-1 mb-3 text-foreground self-start">
                          {post.category}
                        </span>
                        <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors mb-3">
                          {post.title}
                        </h3>
                        <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-mono text-xs text-muted-subtle">
                            {post.date
                              ? new Date(post.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                          <span className="font-body text-sm text-primary group-hover:underline">
                            Read More
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={400}>
              <div className="text-center mt-12">
                <Link href="/blog">
                  <Button variant="cta-outline" size="lg">
                    View All Posts
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* REAL USE CASES */}
      <section className="bg-surface-alt pt-[60px] pb-[60px] relative">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">Real Use Cases</span>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mt-4">
                AI That <span className="text-primary">Actually Works</span>
              </h2>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                Here is what our clients are automating right now.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                industry: "Legal",
                title: "Contract Review",
                desc: "AI flags key clauses, summarizes agreements, and cuts review time in half. Built for law firms and legal teams.",
                result: "60% faster contract turnaround",
                href: "/use-cases/legal",
              },
              {
                industry: "Accounting",
                title: "Client Reporting",
                desc: "Client reports, engagement summaries, and billing narratives generated automatically. More output, less admin.",
                result: "10+ hours saved per month",
                href: "/use-cases/accounting",
              },
              {
                industry: "Healthcare",
                title: "Patient Communication",
                desc: "Automated appointment reminders, follow-up sequences, and intake workflows. HIPAA-aware and always on.",
                result: "Fewer no-shows, faster intake",
                href: "/use-cases/health",
              },
              {
                industry: "E-Commerce",
                title: "Customer Onboarding",
                desc: "Automated welcome flows, setup sequences, and post-purchase check-ins. From day one through repeat purchase.",
                result: "Higher LTV, less support load",
                href: "/use-cases/ecommerce",
              },
              {
                industry: "Real Estate",
                title: "Lead Nurturing",
                desc: "AI qualifies leads, follows up automatically, and keeps prospects warm until they are ready to move.",
                result: "3x faster lead response time",
                href: "/use-cases/real-estate",
              },
              {
                industry: "Restaurants",
                title: "Reservations and Reviews",
                desc: "Handle reservations, respond to reviews, and run promotions without touching your phone.",
                result: "Always responsive, zero manual work",
                href: "/use-cases/restaurants",
              },
            ].map((uc, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <a href={uc.href} className="block group">
                  <div className="bauhaus-card p-8 h-full flex flex-col border-l-2 border-l-primary/40 hover:border-l-primary transition-colors">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold mb-3">{uc.industry}</span>
                    <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {uc.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{uc.desc}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="font-mono text-xs text-primary font-semibold">{uc.result}</span>
                    </div>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>


        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative pt-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />
        <div className="container mx-auto px-4 md:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-foreground">
              Ready to stop doing work a machine can do?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="font-body text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
              Book a free 30-minute discovery call. Just a real conversation about your business.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-10"
            >
              <Button variant="cta" size="xl">
                Schedule Today
              </Button>
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
