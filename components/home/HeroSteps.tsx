// The process strip under the homepage hero: how an engagement runs, in David's four steps (Oct 4
// 2026: "We find your pain point, we come up with a solution, we implement the solution, we keep
// it running"), in short columns (two by two on tablets, stacked on phones). Cream ground continuing the hero, near-black ink, numbers in the
// brand red - David's brand rules for this section.

const INK = "#1A1A1A";
const INK_MUTED = "rgba(26,26,26,0.7)";
const RED = "#E12E30";

const STEPS = [
  { n: "01", title: "We Find Your Pain Point", body: "We learn how you work and where your time is going." },
  { n: "02", title: "We Design the Solution", body: "A custom agent, shaped around your business and the tools you already use." },
  { n: "03", title: "We Implement It", body: "Built on its own private server in about 15 minutes online, or as a custom build for your organization." },
  { n: "04", title: "We Keep It Running", body: "Our team is a Telegram message away, with hands-on training there when you want it." },
];

export function HeroSteps() {
  return (
    <section style={{ background: "#F2F0EB" }}>
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <ol
          className="grid gap-8 py-10 sm:grid-cols-2 md:gap-10 md:py-12 lg:grid-cols-4"
          style={{ borderTop: "1px solid rgba(26,26,26,0.1)" }}
        >
          {STEPS.map((s) => (
            <li key={s.n} className="min-w-0">
              <span className="font-heading block text-[2rem] font-extrabold leading-none" style={{ color: RED }}>
                {s.n}
              </span>
              <h2 className="font-heading mt-3 text-[1.25rem] font-bold leading-snug" style={{ color: INK }}>
                {s.title}
              </h2>
              <p className="font-body mt-2 text-[15px] leading-[1.6]" style={{ color: INK_MUTED }}>
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
