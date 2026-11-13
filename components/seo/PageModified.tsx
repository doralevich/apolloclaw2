"use client";

import { usePathname } from "next/navigation";
import { PAGE_DATES } from "@/lib/page-dates";
import { webPageJsonLd } from "@/lib/seo";

// A WebPage node with a real dateModified for the pages that build no WebPage node of their own
// (the audit of Nov 12 2026 found 56 pages with no date in the HTML). The dates live in
// lib/page-dates.ts, kept by hand beside `changed` in app/sitemap.ts. Structured data only, no
// visible line: a visible "Last updated" is a design decision for David. Pages that carry their
// own node through components/PageDates.tsx are not in the map, so a page never gets two.
export default function PageModified() {
  const pathname = usePathname() || "/";
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = PAGE_DATES[path];
  if (!page) return null;
  const node = {
    "@context": "https://schema.org",
    ...webPageJsonLd({
      url: `https://apolloclaw.ai${path}`,
      name: page.name,
      dateModified: page.modified,
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />;
}
