import Link from "next/link";
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";

// Shared template for the SEO landing pages (small business, implementation,
// New York, enterprise). Driven by a plain data object so each page file stays
// thin and every page matches the existing site's design language exactly:
// navy #0B1729 hero, red #D72B2B accents, cream body sections, IBM Plex Mono
// kickers, Inter body. No em dashes in user-facing copy.

const NAVY = "#0B1729";
const RED = "#D72B2B";
const INK = "#1A1A1A";
const MUTED = "#555555";
const LABEL = "#888888";

export interface ColumnsSection {
  type: "columns";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  intro?: string;
  items: { title: string; desc: string }[];
}
export interface StepsSection {
  type: "steps";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  steps: { title: string; desc: string }[];
}
export interface BulletsSection {
  type: "bullets";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  intro?: string;
  bullets: string[];
}
export interface ProseSection {
  type: "prose";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  paragraphs: string[];
}
export interface CtaSection {
  type: "cta";
  heading: string;
  headingAccent?: string;
  sub?: string;
  button: { label: string; href: string };
}
// Two options side by side, one row per thing a buyer weighs. The comparison pages (Oct 19
// 2026) are built on this; a table reads faster than two columns of prose for "which one".
export interface CompareSection {
  type: "compare";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  intro?: string;
  columns: [string, string];
  rows: { label: string; a: string; b: string }[];
}
// Questions and answers rendered on the page. A page that uses this section is the only kind
// that may carry FAQPage structured data (DECISIONS.md: FAQPage only where FAQs render).
export interface FaqSection {
  type: "faq";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  items: { q: string; a: string }[];
}
// A hub's links to the pages beneath it, as cards. The pillar page uses it to point at the
// comparison pages, the agents and the industries it is the category page for.
export interface LinksSection {
  type: "links";
  kicker?: string;
  heading: string;
  headingAccent?: string;
  intro?: string;
  links: { label: string; desc: string; href: string }[];
}

export type Section =
  | ColumnsSection
  | StepsSection
  | BulletsSection
  | ProseSection
  | CtaSection
  | CompareSection
  | FaqSection
  | LinksSection;

export interface SeoLandingData {
  hero: {
    label?: string;
    title: string;
    titleAccent?: string;
    accentFirst?: boolean;
    description?: string;
    cta?: { label: string; href: string };
  };
  /** Rendered straight under the hero, on the first section's ground: the place for a page's
   *  "Last updated" line and byline (components/PageDates.tsx). */
  afterHero?: React.ReactNode;
  sections: Section[];
}

const CREAM = ["#FAFAF7", "#F2F1ED"];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block font-mono uppercase mb-4"
      style={{ fontSize: 11, letterSpacing: "0.16em", color: LABEL }}
    >
      {children}
    </span>
  );
}

function Heading({ text, accent }: { text: string; accent?: string }) {
  return (
    <h2
      className="font-display leading-[1.05] tracking-tight"
      style={{ fontSize: "clamp(30px, 4.2vw, 52px)", fontWeight: 800, color: INK, margin: 0 }}
    >
      {text}
      {accent ? (
        <>
          {" "}
          <span style={{ color: RED }}>{accent}</span>
        </>
      ) : null}
    </h2>
  );
}

export default function SeoLanding({ data }: { data: SeoLandingData }) {
  let creamIdx = 0;
  const bg = () => CREAM[creamIdx++ % 2];

  return (
    <>
      <PageHero
        label={data.hero.label}
        title={data.hero.title}
        titleAccent={data.hero.titleAccent}
        accentFirst={data.hero.accentFirst}
        description={data.hero.description}
        cta={data.hero.cta}
      />

      {data.afterHero ? (
        <div style={{ background: CREAM[0] }}>
          <div className="container mx-auto px-5 md:px-8 max-w-7xl" style={{ paddingTop: 28 }}>
            {data.afterHero}
          </div>
        </div>
      ) : null}

      {data.sections.map((section, i) => {
        if (section.type === "cta") {
          return (
            <section key={i} style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
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
              <div className="container mx-auto px-5 md:px-8 py-20 md:py-24 text-center relative z-10 max-w-7xl">
                <ScrollReveal>
                  <h2
                    className="font-display leading-[1.1] tracking-tight"
                    style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", margin: 0 }}
                  >
                    {section.heading}
                    {section.headingAccent ? (
                      <>
                        {" "}
                        <span style={{ color: RED }}>{section.headingAccent}</span>
                      </>
                    ) : null}
                  </h2>
                </ScrollReveal>
                {section.sub && (
                  <ScrollReveal delay={150}>
                    <p
                      className="font-body"
                      style={{
                        fontSize: "clamp(15px, 1.15vw, 17px)",
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.72)",
                        margin: "22px auto 0",
                      }}
                    >
                      {section.sub}
                    </p>
                  </ScrollReveal>
                )}
                <ScrollReveal delay={300}>
                  <div style={{ marginTop: 36 }}>
                    <a
                      href={section.button.href}
                      target={section.button.href.startsWith("http") ? "_blank" : undefined}
                      rel={section.button.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
                      style={{
                        background: RED,
                        color: "#ffffff",
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        padding: "14px 32px",
                        borderRadius: 4,
                        textDecoration: "none",
                        boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
                      }}
                    >
                      {section.button.label}
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          );
        }

        const background = bg();
        return (
          <section key={i} style={{ background, color: INK }} className="relative overflow-hidden">
            <div className="container mx-auto px-5 md:px-8 py-20 md:py-28 max-w-7xl">
              <ScrollReveal>
                <div>
                  {section.kicker && <Kicker>[ {section.kicker} ]</Kicker>}
                  <Heading text={section.heading} accent={section.headingAccent} />
                  {"intro" in section && section.intro && (
                    <p
                      className="font-body"
                      style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.7, color: MUTED, marginTop: 22 }}
                    >
                      {section.intro}
                    </p>
                  )}
                </div>
              </ScrollReveal>

              {section.type === "prose" && (
                <div style={{ marginTop: 24 }}>
                  {section.paragraphs.map((p, j) => (
                    <ScrollReveal key={j} delay={j * 80}>
                      <p
                        className="font-body"
                        style={{ fontSize: "clamp(15px, 1.1vw, 17px)", lineHeight: 1.75, color: MUTED, marginTop: 18 }}
                      >
                        {p}
                      </p>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {section.type === "columns" && (
                <div
                  style={{ marginTop: 48, display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}
                >
                  {section.items.map((it, j) => (
                    <ScrollReveal key={j} delay={(j % 3) * 90}>
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderTop: `3px solid ${RED}`,
                          borderRadius: 10,
                          padding: "24px 26px",
                          height: "100%",
                        }}
                      >
                        <h3 style={{ fontFamily: "var(--font-body), Inter, sans-serif", fontSize: 18, fontWeight: 800, color: NAVY, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                          {it.title}
                        </h3>
                        <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED, margin: 0 }}>{it.desc}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {section.type === "steps" && (
                <div
                  style={{ marginTop: 48, display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}
                >
                  {section.steps.map((st, j) => (
                    <ScrollReveal key={j} delay={(j % 4) * 80}>
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 10,
                          padding: "24px 26px",
                          height: "100%",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: "rgba(215,43,43,0.08)",
                            color: RED,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontWeight: 700,
                            fontSize: 15,
                            marginBottom: 14,
                          }}
                        >
                          {j + 1}
                        </span>
                        <h3 style={{ fontFamily: "var(--font-body), Inter, sans-serif", fontSize: 17, fontWeight: 700, color: INK, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                          {st.title}
                        </h3>
                        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: MUTED, margin: 0 }}>{st.desc}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {section.type === "bullets" && (
                <div style={{ marginTop: 40, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}>
                  {section.bullets.map((b, j) => (
                    <ScrollReveal key={j} delay={(j % 4) * 70}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span style={{ color: RED, fontWeight: 800, fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 15, lineHeight: 1.55, color: "#333333" }}>{b}</span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {section.type === "compare" && (
                <ScrollReveal delay={120}>
                  <div
                    style={{ marginTop: 40, overflowX: "auto", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10 }}
                  >
                    <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: "22%", padding: "16px 20px", textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: LABEL, borderBottom: "1px solid rgba(0,0,0,0.1)" }} />
                          {section.columns.map((c) => (
                            <th
                              key={c}
                              scope="col"
                              style={{ padding: "16px 20px", textAlign: "left", fontFamily: "var(--font-body), Inter, sans-serif", fontSize: 17, fontWeight: 800, color: NAVY, borderBottom: `3px solid ${RED}` }}
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((r) => (
                          <tr key={r.label}>
                            <th scope="row" style={{ padding: "16px 20px", textAlign: "left", verticalAlign: "top", fontSize: 14, fontWeight: 700, color: INK, borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                              {r.label}
                            </th>
                            <td style={{ padding: "16px 20px", verticalAlign: "top", fontSize: 14.5, lineHeight: 1.6, color: MUTED, borderBottom: "1px solid rgba(0,0,0,0.07)" }}>{r.a}</td>
                            <td style={{ padding: "16px 20px", verticalAlign: "top", fontSize: 14.5, lineHeight: 1.6, color: MUTED, borderBottom: "1px solid rgba(0,0,0,0.07)" }}>{r.b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollReveal>
              )}

              {section.type === "faq" && (
                <div style={{ marginTop: 36, display: "grid", gap: 12 }}>
                  {section.items.map((f, j) => (
                    <ScrollReveal key={f.q} delay={(j % 4) * 70}>
                      <details style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "6px 22px" }}>
                        <summary
                          className="font-display"
                          style={{ cursor: "pointer", padding: "14px 0", fontSize: 17, fontWeight: 700, color: NAVY, listStyle: "none" }}
                        >
                          {f.q}
                        </summary>
                        <p className="font-body" style={{ fontSize: 15, lineHeight: 1.7, color: MUTED, margin: "0 0 16px" }}>{f.a}</p>
                      </details>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {section.type === "links" && (
                <div
                  style={{ marginTop: 44, display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}
                >
                  {section.links.map((l, j) => (
                    <ScrollReveal key={l.href} delay={(j % 3) * 90}>
                      <Link
                        href={l.href}
                        className="block transition-transform hover:-translate-y-0.5"
                        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "22px 24px", height: "100%", textDecoration: "none" }}
                      >
                        <span style={{ display: "block", fontFamily: "var(--font-body), Inter, sans-serif", fontSize: 17, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{l.label}</span>
                        <span style={{ display: "block", fontSize: 14, lineHeight: 1.6, color: MUTED }}>{l.desc}</span>
                        <span style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 700, color: RED }}>Read more →</span>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
