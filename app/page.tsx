import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Mail, Calendar, Search, Code, FileText, Plug, Briefcase, Heart, TrendingUp, Home, Scale, Wrench, User, Target, Wallet, Shield, Calculator, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import HeroAssistantInput from "@/components/HeroAssistantInput";
import LogoTicker from "@/components/LogoTicker";
import DayWithJohnEmbed from "@/components/DayWithJohnEmbed";
import GlobeSection from "@/components/GlobeSection";
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
              <HeroAssistantInput />
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
                Our <span style={{ color: "#D72B2B" }}>Agents</span>
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
            @media (min-width: 1024px) { #apollo-agents-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
            .apollo-agent-card { transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
            .apollo-agent-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); border-color: rgba(215,43,43,0.4); }
          `}</style>

          <div id="apollo-agents-grid">
            {[
              { icon: Briefcase, category: "Executive",    title: "The CEO Agent",          desc: "Faster decisions, fewer status calls.",                              href: "/use-cases/ceo" },
              { icon: TrendingUp, category: "Finance",     title: "The CFO Agent",          desc: "Cash forecasts, board prep, monthly close — drafted before you ask.", href: "/use-cases/cfo" },
              { icon: Heart,      category: "Healthcare",  title: "The Medical Agent",      desc: "Patient triage, intake summaries, faster charting.",                 href: "/use-cases/health" },
              { icon: Shield,     category: "Insurance",   title: "The Insurance Agent",    desc: "Quote requests, policy renewals, claims status — answered before clients ask.", href: "/use-cases/insurance" },
              { icon: Scale,      category: "Legal",       title: "The Law Agent",          desc: "Intake forms, case research, document summaries — answer-ready in minutes.", href: "/use-cases/legal" },
              { icon: Home,       category: "Real Estate", title: "The Real Estate Agent",  desc: "New leads sorted, listings written, follow-ups closed automatically.", href: "/use-cases/real-estate" },
            ].map((agent, i) => {
              const Icon = agent.icon;
              return (
                <ScrollReveal key={agent.title} delay={(i % 4) * 80}>
                  <Link
                    href={agent.href}
                    className="apollo-agent-card"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.07)",
                      borderRadius: 10,
                      padding: "20px 20px 22px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      textDecoration: "none",
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
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBE — Works with the tools you already use */}
      <GlobeSection />

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

      {/* LATEST FROM THE BLOG — Section 8 (cream, 2-col cards) */}
      {latestPosts.length > 0 && (
        <section style={{ background: "#F2F1ED", color: "#1A1A1A" }} className="relative overflow-hidden">
          <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
            <ScrollReveal>
              <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
                <span
                  className="inline-block font-mono uppercase mb-4"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    color: "#888888",
                  }}
                >
                  [ Research Hub ]
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
                  Latest from the <span style={{ color: "#D72B2B" }}>Blog</span>
                </h2>
                <p
                  className="font-body"
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    color: "#555555",
                    margin: "0 auto",
                    maxWidth: 520,
                  }}
                >
                  Expert insights on AI automation for business owners.
                </p>
              </div>
            </ScrollReveal>

            <style>{`
              #apollo-blog-grid {
                display: grid;
                gap: 18px;
                grid-template-columns: 1fr;
              }
              @media (min-width: 768px) {
                #apollo-blog-grid {
                  grid-template-columns: 1fr 1fr;
                  gap: 22px;
                }
              }
              .apollo-blog-card {
                transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
              }
              .apollo-blog-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(11,23,41,0.08);
                border-color: rgba(215,43,43,0.4);
              }
            `}</style>

            <div id="apollo-blog-grid">
              {latestPosts.map((post: any, i: number) => (
                <ScrollReveal key={post.slug} delay={i * 90}>
                  <div
                    className="apollo-blog-card"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.07)",
                      borderRadius: 10,
                      padding: "26px 28px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#888888",
                        marginBottom: 10,
                      }}
                    >
                      [ {post.category} ]
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-body), Inter, sans-serif",
                          fontSize: 19,
                          fontWeight: 800,
                          color: "#1A1A1A",
                          margin: "0 0 10px",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.3,
                        }}
                      >
                        {post.title}
                      </h3>
                    </Link>
                    <p
                      className="line-clamp-3"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: "#555555",
                        margin: "0 0 20px",
                        flex: 1,
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "auto",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 11,
                          color: "#888888",
                        }}
                      >
                        {post.date
                          ? new Date(post.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                        style={{
                          background: "#D72B2B",
                          color: "#ffffff",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          padding: "8px 18px",
                          borderRadius: 4,
                          textDecoration: "none",
                        }}
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={380}>
              <div style={{ textAlign: "center", marginTop: 44 }}>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center font-bold uppercase transition-all"
                  style={{
                    background: "transparent",
                    color: "#1A1A1A",
                    border: "1px solid rgba(0,0,0,0.25)",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    padding: "12px 28px",
                    borderRadius: 4,
                    textDecoration: "none",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  View All Posts →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* INTERNAL NAV LINKS — white strip for crawlability & UX */}
      <section style={{ background: "#FFFFFF", color: "#1A1A1A", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="container mx-auto px-5 md:px-8 py-8 max-w-7xl">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {[
              { label: "How It Works",      href: "/how-it-works" },
              { label: "Pricing",           href: "/pricing" },
              { label: "Get Started",       href: "/get-started" },
              { label: "FAQ",               href: "/faq" },
              { label: "Use Cases",         href: "/use-cases/ceo" },
              { label: "About Apollo Claw", href: "/about" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0B1729",
                  textDecoration: "none",
                  padding: "8px 18px",
                  borderRadius: 4,
                  border: "1px solid rgba(11,23,41,0.12)",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — dark navy banner */}
      <section style={{ background: "#0B1729", color: "#ffffff" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(215,43,43,0.16) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 text-center relative z-10 max-w-4xl">
          <ScrollReveal>
            <h2
              className="font-display leading-[1.1] tracking-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
              }}
            >
              Let&apos;s find out what <span style={{ color: "#D72B2B" }}>AI</span> can actually do for your business.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p
              className="font-body"
              style={{
                fontSize: "clamp(15px, 1.15vw, 17px)",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 520,
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

      {/* OUR AI AGENTS — white section, scrolling logo marquee */}
      <section style={{ background: "#FFFFFF", color: "#1A1A1A" }} className="relative overflow-hidden">
        <div className="py-16 md:py-20">
          <style>{`
            #apollo-agents-marquee {
              overflow: hidden;
              position: relative;
              -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
              mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
            }
            #apollo-agents-marquee .marquee-track {
              display: flex;
              align-items: center;
              gap: 72px;
              width: max-content;
              padding-right: 72px;
              animation: apollo-agents-scroll 80s linear infinite;
            }
            #apollo-agents-marquee:hover .marquee-track {
              animation-play-state: paused;
            }
            #apollo-agents-marquee img {
              width: 360px;
              height: auto;
              flex-shrink: 0;
            }
            @keyframes apollo-agents-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @media (prefers-reduced-motion: reduce) {
              #apollo-agents-marquee .marquee-track { animation: none; flex-wrap: wrap; justify-content: center; width: 100%; }
            }
          `}</style>

          <div id="apollo-agents-marquee" aria-label="Apollo Claw AI agent lineup">
            <div className="marquee-track">
              {[...Array(2)].map((_, copy) =>
                [
                  { src: "/agents/the-ceo-agent.png", alt: "The CEO [Agent]" },
                  { src: "/agents/the-cfo-agent.png", alt: "The CFO [Agent]" },
                  { src: "/agents/the-insurance-agent.png", alt: "The Insurance [Agent]" },
                  { src: "/agents/the-legal-agent.png", alt: "The Law [Agent]" },
                  { src: "/agents/the-medical-agent.png", alt: "The Medical [Agent]" },
                  { src: "/agents/the-real-estate-agent.png", alt: "The Real Estate [Agent]" },
                ].map((logo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${copy}-${logo.src}`}
                    src={logo.src}
                    alt={copy === 0 ? logo.alt : ""}
                    aria-hidden={copy === 1}
                    loading="lazy"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
