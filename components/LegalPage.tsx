import PageHero from "@/components/PageHero";

const NAVY = "#0B1729";
const CREAM = "#FAFAF7";
const RED = "#D72B2B";

export type LegalBlock =
  | { kind: "prose"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "table"; head: [string, string]; rows: [string, string][] };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

// Shared shell for /privacy and /cookies: same PageHero as the rest of the site, then plain
// readable prose. Kept deliberately unstyled beyond legibility, since these are documents
// people skim for a specific answer rather than marketing pages.
export default function LegalPage({
  label,
  title,
  titleAccent,
  description,
  effective,
  sections,
}: {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  effective: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero label={label} title={title} titleAccent={titleAccent} description={description} />
      <div style={{ background: CREAM }} className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-5 md:px-8">
          <p className="font-mono mb-12 text-xs uppercase tracking-widest" style={{ color: "rgba(11,23,41,0.45)" }}>
            Effective {effective}
          </p>

          {sections.map((section) => (
            <section key={section.heading} className="mb-11">
              <h2 className="font-display mb-4 text-xl font-bold md:text-2xl" style={{ color: NAVY }}>
                {section.heading}
              </h2>
              {section.blocks.map((block, i) => {
                if (block.kind === "prose") {
                  return (
                    <p key={i} className="font-body mb-4 text-[15px] leading-[1.75]" style={{ color: "rgba(11,23,41,0.72)" }}>
                      {block.text}
                    </p>
                  );
                }
                if (block.kind === "bullets") {
                  return (
                    <ul key={i} className="mb-4 flex flex-col gap-2.5">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
                          <span className="font-body text-[15px] leading-[1.7]" style={{ color: "rgba(11,23,41,0.72)" }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <div key={i} className="mb-5 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-left">
                      <thead>
                        <tr>
                          {block.head.map((h) => (
                            <th
                              key={h}
                              className="font-mono border-b px-3 py-2.5 text-[11px] uppercase tracking-widest"
                              style={{ color: "rgba(11,23,41,0.45)", borderColor: "rgba(11,23,41,0.12)" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map(([a, b]) => (
                          <tr key={a}>
                            <td
                              className="font-body border-b px-3 py-3 align-top text-[14px] font-semibold"
                              style={{ color: NAVY, borderColor: "rgba(11,23,41,0.07)" }}
                            >
                              {a}
                            </td>
                            <td
                              className="font-body border-b px-3 py-3 align-top text-[14px] leading-[1.65]"
                              style={{ color: "rgba(11,23,41,0.7)", borderColor: "rgba(11,23,41,0.07)" }}
                            >
                              {b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
