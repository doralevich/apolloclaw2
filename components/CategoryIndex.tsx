import Link from "next/link";
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";

// Shared section landing page for /industries, /ai-agents, and /solutions. These three are
// linked from the homepage "three ways to start" block and from the nav category triggers,
// and every one of them used to 404. Same design language as the rest of the marketing site:
// navy PageHero, cream body, white cards with a red top rule.

const CREAM = "#F2F0EB";
const INK = "#1A1A1A";
const RED = "#D72B2B";
const MUTED = "#555555";
const BORDER = "rgba(0,0,0,0.08)";

export interface CategoryIndexItem {
  label: string;
  description: string;
  to: string;
}

export interface CategoryIndexData {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  items: CategoryIndexItem[];
  closing: { heading: string; headingAccent: string; sub: string; button: { label: string; href: string } };
}

export default function CategoryIndex({ data }: { data: CategoryIndexData }) {
  return (
    <>
      <PageHero
        label={data.label}
        title={data.title}
        titleAccent={data.titleAccent}
        description={data.description}
      />

      <section style={{ background: CREAM }}>
        <div className="container mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {data.items.map((item, i) => (
              <ScrollReveal key={item.to} delay={i * 40}>
                <Link
                  href={item.to}
                  className="block h-full transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${BORDER}`,
                    borderTop: `3px solid ${RED}`,
                    borderRadius: 10,
                    padding: "24px 26px",
                    textDecoration: "none",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display), Inter, sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: INK,
                      margin: "0 0 8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </h2>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED, margin: 0 }}>
                    {item.description}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#0B1729" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container relative z-10 mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-20">
          <h2
            className="font-display text-3xl font-bold text-white md:text-4xl"
            style={{ margin: "0 0 14px" }}
          >
            {data.closing.heading} <span style={{ color: RED }}>{data.closing.headingAccent}</span>
          </h2>
          <p
            className="font-body"
            style={{ fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", margin: "0 0 30px" }}
          >
            {data.closing.sub}
          </p>
          <Link
            href={data.closing.button.href}
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
            {data.closing.button.label}
          </Link>
        </div>
      </section>
    </>
  );
}
