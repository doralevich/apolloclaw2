// The social-share image, in one place.
//
// WHY THIS EXISTS. Next does not deep-merge `openGraph`: a page that declares its own
// `openGraph` block REPLACES the layout's entirely, images and all. Every page here that set an
// og:title also silently dropped the og:image, so 23 of 41 pages shipped with no share image at
// all — and a scraper with no og:image falls back to whatever picture it finds on the page. The
// homepage's was the phone mockup from the product demo, which is how a link to apolloclaw.ai
// came out looking like a screenshot of somebody's chat.
//
// Nothing warns you about this. The build passes, the page looks right, and you only find out
// when someone shares a link. So the rule is: any page that declares `openGraph` spreads
// OG_IMAGES into it. Adding a page without it is the one mistake worth guarding against here,
// and the audit in the PR that introduced this file is how to check.

export const OG_IMAGE_URL = "/og-image.png";

// The one Organization node, declared once in app/layout.tsx and referenced by @id everywhere
// else. Twelve pages used to carry their own inline `provider: { "@type": "Organization", ... }`
// alongside three separate business blocks in the root layout, so a crawler saw a dozen
// near-duplicate organizations with three different names and had to guess which was the real
// one (the SEO brief, Donna, Oct 9 2026). A page that needs to name the business as provider or
// publisher spreads ORG_REF; the facts live in one place.
export const ORG_ID = "https://apolloclaw.ai/#organization";
export const ORG_REF = { "@id": ORG_ID } as const;

// David, once, as his own Person node beside the business in app/layout.tsx. The founder used
// to be an inline Person inside the Organization; a blog post's author and /company's subject
// could only restate him. Now both point here.
export const PERSON_ID = "https://apolloclaw.ai/company#david";
export const PERSON_REF = { "@id": PERSON_ID } as const;

/** One crumb of a BreadcrumbList: the visible name and the absolute URL. */
export type Crumb = { name: string; url: string };

/** BreadcrumbList structured data for a page. The last item is the page itself. */
export function breadcrumbJsonLd(crumbs: readonly Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/**
 * A WebPage node with real dates. `dateModified` is the day the page's words last changed,
 * kept by hand beside the page the same way app/sitemap.ts keeps `changed`; a metadata or
 * style edit leaves it alone. ISO dates (YYYY-MM-DD) only.
 */
export function webPageJsonLd(page: {
  url: string;
  name: string;
  description?: string;
  datePublished?: string;
  dateModified: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  return {
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#page`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    ...(page.datePublished ? { datePublished: page.datePublished } : {}),
    dateModified: page.dateModified,
    isPartOf: { "@id": "https://apolloclaw.ai/#website" },
    publisher: ORG_REF,
    inLanguage: "en-US",
  };
}

/** "October 4, 2026" from "2026-10-04", read as a calendar day rather than a UTC instant. */
export function humanDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const OG_IMAGES = [
  {
    url: OG_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: "Apollo Claw | Your AI Chief of Staff",
  },
];

// Per-agent share cards, ported from each agent's standalone site so a link to
// apolloclaw.ai/ai-agents/cfo shows The CFO Agent card rather than generic ApolloClaw art. Same
// image the .ai site shares, so the two properties look like one product in a feed.
//
// Keyed by agent type id, the same key agentBrand() and the /build/<slug> funnels use, and the
// file is /og/<id>.jpg for every one of them - so an agent that has a card needs no entry
// anywhere else. The values are alt text: what the card actually shows is the wordmark and
// "Apollo Claw", not the tagline, so that is what it says.
const AGENT_OG_ALT: Record<string, string> = {
  legal: "The Law Agent | Apollo Claw",
  cfo: "The CFO Agent | Apollo Claw",
  ceo: "The CEO Agent | Apollo Claw",
  insurance: "The Insurance Agent | Apollo Claw",
  medical: "The Medical Agent | Apollo Claw",
  realestate: "The Real Estate Agent | Apollo Claw",
  sales: "The Sales Agent | Apollo Claw",
  recruiting: "The Recruiting Agent | Apollo Claw",
  marketing: "The Marketing Agent | Apollo Claw",
  personal: "The Personal Agent | Apollo Claw",
};

/**
 * The share card for an agent, falling back to the ApolloClaw one for anything with no card of
 * its own. Spread this into `openGraph` exactly as OG_IMAGES is spread, for the same reason:
 * declaring `openGraph` on a page replaces the layout's block entirely.
 */
export function agentOgImages(agentTypeId?: string) {
  const alt = agentTypeId ? AGENT_OG_ALT[agentTypeId] : undefined;
  if (!alt) return OG_IMAGES;
  return [{ url: `/og/${agentTypeId}.jpg`, width: 1200, height: 630, alt }];
}
