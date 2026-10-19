"use client";

import { usePathname } from "next/navigation";
import { USE_CASES } from "@/config/useCases";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

// BreadcrumbList structured data for every nested marketing page, from the path alone. The
// agent, industry and use-case pages each build their own JSON-LD by hand, and adding a crumb
// trail to twenty-odd files by hand is how the trail drifts from the nav. One component in the
// shell, one label map, and a page gets its crumbs the day it is added under one of these
// prefixes. Rendered on the server like the rest of the shell, so the script is in the HTML
// a crawler fetches.
//
// Structured data only, no visible trail: the pages' heroes already say where the visitor is,
// and a visible breadcrumb is a design decision for David. Blog posts carry their own
// BreadcrumbList (app/blog/[slug]/page.tsx) because the post title lives on the server.

const SITE = "https://apolloclaw.ai";

const AGENTS: Record<string, string> = {
  ceo: "The CEO Agent",
  cfo: "The CFO Agent",
  hr: "The HR Agent",
  legal: "The Law Agent",
  "personal-assistant": "The Personal Agent",
  receptionist: "The Receptionist Agent",
  recruiting: "The Recruiting Agent",
  sales: "The Sales Agent",
};

const INDUSTRIES: Record<string, string> = {
  "accounting-firms": "Accounting Firms",
  ecommerce: "E-Commerce",
  "financial-services": "Financial Services",
  insurance: "Insurance",
  "law-firms": "Law Firms",
  "medical-practices": "Medical Practices",
  nonprofit: "Nonprofits",
  "personal-injury-law": "Personal Injury Law",
  "private-equity": "Private Equity",
  "professional-services": "Professional Services",
  "real-estate": "Real Estate",
};

const HOME: Crumb = { name: "Home", url: `${SITE}/` };

export function crumbsFor(pathname: string): Crumb[] | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  const [section, slug] = parts;
  const here = `${SITE}/${section}/${slug}`;
  if (section === "ai-agents" && AGENTS[slug]) {
    return [HOME, { name: "AI Agents", url: `${SITE}/ai-agents` }, { name: AGENTS[slug], url: here }];
  }
  if (section === "industries" && INDUSTRIES[slug]) {
    // There is no /industries index; the hub that lists them is /use-cases.
    return [HOME, { name: "Industries", url: `${SITE}/use-cases` }, { name: INDUSTRIES[slug], url: here }];
  }
  if (section === "use-cases") {
    const uc = USE_CASES.find((u) => u.slug === slug);
    if (uc) return [HOME, { name: "Use Cases", url: `${SITE}/use-cases` }, { name: uc.label, url: here }];
  }
  return null;
}

export default function Breadcrumbs() {
  const crumbs = crumbsFor(usePathname());
  if (!crumbs) return null;
  const node = { "@context": "https://schema.org", ...breadcrumbJsonLd(crumbs) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />;
}
