import { FOUNDER_BYLINE, PERSON_REF, humanDate, webPageJsonLd } from "@/lib/seo";

// The page's real dates, in two places at once: a WebPage node with dateModified for crawlers,
// and (when `show` is set) a visible "Last updated:" line for readers. Every page used to carry
// the build time or nothing (the SEO brief, Donna, Oct 9 2026), so Google had no way to tell a
// policy edited last week from one untouched since August.
//
// `dateModified` is the day the page's WORDS last changed, kept by hand beside the page like
// `changed` in app/sitemap.ts. A metadata or style edit leaves it alone.
//
// One prop drives both the structured date and the visible one, so they can never disagree
// (David, Oct 27 2026). `byline` adds "By David Oralevich, Founder" under the date and names him
// as the page's author in the WebPage node.
export default function PageDates({
  url,
  name,
  description,
  datePublished,
  dateModified,
  type,
  mainEntity,
  show = false,
  byline = false,
  label = "Last updated:",
  tone = "light",
  align = "left",
}: {
  url: string;
  name: string;
  description?: string;
  /** ISO day, YYYY-MM-DD. */
  datePublished?: string;
  /** ISO day, YYYY-MM-DD. */
  dateModified: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
  mainEntity?: { "@id": string };
  /** Render the visible line as well as the structured data. */
  show?: boolean;
  /** Render the founder byline under the date, and set him as the page's author. */
  byline?: boolean;
  label?: string;
  /** Which ground the visible line sits on. */
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const node = {
    "@context": "https://schema.org",
    ...webPageJsonLd({
      url,
      name,
      description,
      datePublished,
      dateModified,
      type,
      mainEntity,
      author: byline ? PERSON_REF : undefined,
    }),
  };
  const color = tone === "dark" ? "rgba(250,250,247,0.55)" : "rgba(11,23,41,0.45)";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />
      {show && (
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color, textAlign: align }}>
          <p style={{ margin: 0 }}>
            <time dateTime={dateModified}>
              {label} {humanDate(dateModified)}
            </time>
          </p>
          {byline && <p style={{ margin: "6px 0 0" }}>{FOUNDER_BYLINE}</p>}
        </div>
      )}
    </>
  );
}
