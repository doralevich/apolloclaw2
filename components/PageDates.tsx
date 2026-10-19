import { humanDate, webPageJsonLd } from "@/lib/seo";

// The page's real dates, in two places at once: a WebPage node with dateModified for crawlers,
// and (when `show` is set) a visible "Last updated" line for readers. Every page used to carry
// the build time or nothing (the SEO brief, Donna, Oct 9 2026), so Google had no way to tell a
// policy edited last week from one untouched since August.
//
// `dateModified` is the day the page's WORDS last changed, kept by hand beside the page like
// `changed` in app/sitemap.ts. A metadata or style edit leaves it alone.
export default function PageDates({
  url,
  name,
  description,
  datePublished,
  dateModified,
  type,
  show = false,
  label = "Last updated",
  tone = "light",
}: {
  url: string;
  name: string;
  description?: string;
  /** ISO day, YYYY-MM-DD. */
  datePublished?: string;
  /** ISO day, YYYY-MM-DD. */
  dateModified: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
  /** Render the visible line as well as the structured data. */
  show?: boolean;
  label?: string;
  /** Which ground the visible line sits on. */
  tone?: "light" | "dark";
}) {
  const node = { "@context": "https://schema.org", ...webPageJsonLd({ url, name, description, datePublished, dateModified, type }) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />
      {show && (
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: tone === "dark" ? "rgba(250,250,247,0.55)" : "rgba(11,23,41,0.45)" }}
        >
          <time dateTime={dateModified}>
            {label} {humanDate(dateModified)}
          </time>
        </p>
      )}
    </>
  );
}
