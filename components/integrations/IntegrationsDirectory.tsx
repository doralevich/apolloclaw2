"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { composioLogoUrl, INTEGRATION_CATEGORIES } from "@/lib/integration-catalog";
import type { CatalogApp } from "@/lib/types";
import { RED, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// The public directory, laid out the way David's reference (lindy.ai/integrations) is: a category
// sidebar on the left, one paginated grid of cards on the right, each card a small logo chip beside
// the app's name and a one-line description. Read-only - no Connect button and no connected state,
// since there is no agent on this page to connect anything to.
//
// Two sources. The curated shelves (lib/integration-catalog.ts, the same list the dashboard's
// Connections tab leads with, plus EXTRA_BY_CATEGORY below) give the sidebar its categories. The
// full platform catalog, loaded from /api/integrations/catalog after first paint, supplies every
// other app; it has no categories of its own, so those apps sit under "More apps". If the full
// catalog can't be read, the page still works on the curated list alone.

type Category = { title: string; apps: CatalogApp[] };

function app(slug: string, name: string, description: string): CatalogApp {
  return { slug, name, description };
}

// Real toolkit slugs (their logos already render elsewhere on the site - components/GlobeSection.tsx,
// components/home/LogoStrip.tsx) that the curated catalog doesn't carry. Titles matching a curated
// category merge into it; the rest become categories of their own.
const EXTRA_BY_CATEGORY: Category[] = [
  {
    title: "Sales & marketing",
    apps: [
      app("mailchimp", "Mailchimp", "Mailchimp sends email campaigns and manages audiences."),
      app("klaviyo", "Klaviyo", "Klaviyo powers email and SMS marketing for ecommerce."),
    ],
  },
  { title: "Design & code", apps: [app("bitbucket", "Bitbucket", "Bitbucket hosts Git repositories and pull requests.")] },
  {
    title: "Payments & commerce",
    apps: [
      app("stripe", "Stripe", "Stripe processes payments and manages subscriptions."),
      app("shopify", "Shopify", "Shopify runs online stores and order management."),
      app("xero", "Xero", "Xero handles accounting, invoicing, and bookkeeping."),
      app("brex", "Brex", "Brex manages corporate cards and business spend."),
    ],
  },
  {
    title: "Support",
    apps: [
      app("zendesk", "Zendesk", "Zendesk manages customer support tickets and help desks."),
      app("intercom", "Intercom", "Intercom is a customer messaging and support platform."),
    ],
  },
  {
    title: "Monitoring & analytics",
    apps: [
      app("sentry", "Sentry", "Sentry monitors errors and application performance."),
      app("posthog", "PostHog", "PostHog tracks product analytics and feature flags."),
      app("datadog", "Datadog", "Datadog monitors infrastructure, logs, and performance."),
    ],
  },
];

const CURATED: Category[] = (() => {
  const merged: Category[] = INTEGRATION_CATEGORIES.map((c) => ({
    title: c.title,
    apps: c.toolkits.map((t) => app(t.slug, t.name, t.description ?? "")),
  }));
  for (const extra of EXTRA_BY_CATEGORY) {
    const existing = merged.find((c) => c.title === extra.title);
    if (existing) existing.apps.push(...extra.apps);
    else merged.push({ title: extra.title, apps: [...extra.apps] });
  }
  return merged;
})();

const ALL = "All";
const MORE = "More apps";
const PER_PAGE = 60;

function normalize(s: string) {
  return s.toLowerCase().replace(/[\s_-]+/g, "");
}

function matchesQuery(a: CatalogApp, needle: string): boolean {
  return normalize(a.name).includes(needle) || normalize(a.slug).includes(needle) || normalize(a.description).includes(needle);
}

// Page numbers with ellipses: always the first and last page, plus a window around the current.
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 4) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (current >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

const CARD_BORDER = "rgba(11,23,41,0.12)";
const INK = TAN_INK;
const INK_MUTED = TAN_INK_MUTED;

export function IntegrationsDirectory() {
  // The curated list renders at once; the full catalog (CDN-cached, see
  // app/api/integrations/catalog/route.ts) fills in behind it.
  const [catalog, setCatalog] = useState<CatalogApp[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { apps?: CatalogApp[] } | null) => {
        if (!cancelled && body?.apps?.length) setCatalog(body.apps);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const { categories, everything } = useMemo(() => {
    const curatedSlugs = new Set(CURATED.flatMap((c) => c.apps.map((a) => a.slug)));
    const more = (catalog ?? []).filter((a) => !curatedSlugs.has(a.slug));
    const cats = more.length ? [...CURATED, { title: MORE, apps: more }] : CURATED;
    return { categories: cats, everything: cats.flatMap((c) => c.apps) };
  }, [catalog]);

  const q = normalize(query.trim());
  const visible = useMemo(() => {
    if (q) return everything.filter((a) => matchesQuery(a, q));
    if (category === ALL) return everything;
    return categories.find((c) => c.title === category)?.apps ?? [];
  }, [q, category, categories, everything]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PER_PAGE;
  const shown = visible.slice(start, start + PER_PAGE);

  function goTo(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative mx-auto max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2" style={{ color: INK_MUTED }} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          type="text"
          aria-label="Search integrations"
          placeholder="Search apps (e.g. gmail, salesforce, notion)"
          className="font-body h-14 w-full rounded-full pl-12 pr-5 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(215,43,43,0.18)]"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff", color: INK }}
        />
      </div>

      <div ref={topRef} className="mt-12 flex scroll-mt-28 flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <nav
          aria-label="Integration categories"
          className="rounded-2xl p-4 md:sticky md:top-24 md:w-56 md:shrink-0"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff" }}
        >
          <p className="font-heading mb-3 px-2 text-[15px] font-bold" style={{ color: INK }}>
            Category
          </p>
          <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
            {[ALL, ...categories.map((c) => c.title)].map((c) => {
              const active = !q && c === category;
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setQuery("");
                      setPage(1);
                    }}
                    aria-pressed={active}
                    className="font-body w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                    style={active ? { background: "rgba(215,43,43,0.08)", color: RED, fontWeight: 600 } : { color: INK }}
                  >
                    {c}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          {visible.length > 0 && (
            <p className="font-body mb-3 text-right text-[12.5px]" style={{ color: INK_MUTED }}>
              {q ? <>Results for &ldquo;{query.trim()}&rdquo; &middot; </> : null}
              Showing {start + 1}&ndash;{start + shown.length} of {visible.length.toLocaleString()}
            </p>
          )}
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center" style={{ borderColor: CARD_BORDER }}>
              <p className="font-body text-base" style={{ color: INK_MUTED }}>
                Not listed here doesn&apos;t mean we can&apos;t connect it.{" "}
                <Link href="/contact" className="font-semibold underline underline-offset-2" style={{ color: INK }}>
                  Tell us what you need
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((a) => (
                <IntegrationCard key={a.slug} app={a} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
              <PageButton label="Previous page" disabled={current === 1} onClick={() => goTo(current - 1)}>
                <ChevronLeft className="size-4" />
              </PageButton>
              {pageList(current, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1.5 text-[13px]" style={{ color: INK_MUTED }}>
                    …
                  </span>
                ) : (
                  <PageButton key={p} label={`Page ${p}`} active={p === current} onClick={() => goTo(p)}>
                    {p}
                  </PageButton>
                )
              )}
              <PageButton label="Next page" disabled={current === pageCount} onClick={() => goTo(current + 1)}>
                <ChevronRight className="size-4" />
              </PageButton>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PageButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className="font-body flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-[13px] font-semibold transition-colors disabled:opacity-40 enabled:hover:bg-black/[0.04]"
      style={
        active
          ? { background: RED, color: "#fff", border: `1px solid ${RED}` }
          : { background: "#fff", color: INK, border: `1px solid ${CARD_BORDER}` }
      }
    >
      {children}
    </button>
  );
}

function IntegrationCard({ app: a }: { app: CatalogApp }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(11,23,41,0.08)]"
      style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff" }}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={composioLogoUrl(a.slug)} alt="" loading="lazy" decoding="async" className="size-6 object-contain" />
      </span>
      <div className="min-w-0">
        <p className="font-body truncate text-[14px] font-semibold leading-tight" style={{ color: INK }}>
          {a.name}
        </p>
        <p className="font-body mt-1 line-clamp-2 text-[12.5px] leading-snug" style={{ color: INK_MUTED }}>
          {a.description || `Connect ${a.name} to your agent.`}
        </p>
      </div>
    </div>
  );
}
