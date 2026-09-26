"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { composioLogoUrl, INTEGRATION_CATEGORIES, type IntegrationCategory } from "@/lib/integration-catalog";
import type { IntegrationToolkit } from "@/lib/types";
import { RED, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// The public directory, laid out the way David's reference (lindy.ai/integrations) is: a category
// sidebar on the left, one flat grid of cards on the right, each card a small logo chip beside the
// app's name and a one-line description. Read-only - no Connect button and no connected state,
// since there is no agent on this page to connect anything to.
//
// EXTRA_BY_CATEGORY below are real toolkit slugs (their logos already render live elsewhere in the
// app - components/GlobeSection.tsx, components/home/LogoStrip.tsx) that are not in
// lib/integration-catalog.ts's curated list. That file is the source of truth for the real in-app
// Connections tab and deliberately excludes chat apps (see its own note). This page's list is
// allowed to diverge: it is a "look how much we cover" directory, not a browse-and-connect
// surface. Titles that match an existing category merge into it; the rest become new categories.
function extra(slug: string, name: string, description: string): IntegrationToolkit {
  return {
    slug,
    name,
    description,
    logo: composioLogoUrl(slug),
    enabled: true,
    isNoAuth: false,
    authSchemes: ["OAUTH2"],
  };
}

const EXTRA_BY_CATEGORY: IntegrationCategory[] = [
  {
    title: "Sales & marketing",
    toolkits: [
      extra("mailchimp", "Mailchimp", "Mailchimp sends email campaigns and manages audiences."),
      extra("klaviyo", "Klaviyo", "Klaviyo powers email and SMS marketing for ecommerce."),
    ],
  },
  {
    title: "Design & code",
    toolkits: [extra("bitbucket", "Bitbucket", "Bitbucket hosts Git repositories and pull requests.")],
  },
  {
    title: "Payments & commerce",
    toolkits: [
      extra("stripe", "Stripe", "Stripe processes payments and manages subscriptions."),
      extra("shopify", "Shopify", "Shopify runs online stores and order management."),
      extra("xero", "Xero", "Xero handles accounting, invoicing, and bookkeeping."),
      extra("brex", "Brex", "Brex manages corporate cards and business spend."),
    ],
  },
  {
    title: "Support",
    toolkits: [
      extra("zendesk", "Zendesk", "Zendesk manages customer support tickets and help desks."),
      extra("intercom", "Intercom", "Intercom is a customer messaging and support platform."),
    ],
  },
  {
    title: "Monitoring & analytics",
    toolkits: [
      extra("sentry", "Sentry", "Sentry monitors errors and application performance."),
      extra("posthog", "PostHog", "PostHog tracks product analytics and feature flags."),
      extra("datadog", "Datadog", "Datadog monitors infrastructure, logs, and performance."),
    ],
  },
];

const ALL_CATEGORIES: IntegrationCategory[] = (() => {
  const merged = INTEGRATION_CATEGORIES.map((cat) => ({ ...cat, toolkits: [...cat.toolkits] }));
  for (const extraCat of EXTRA_BY_CATEGORY) {
    const existing = merged.find((c) => c.title === extraCat.title);
    if (existing) existing.toolkits.push(...extraCat.toolkits);
    else merged.push(extraCat);
  }
  return merged;
})();

export const ALL_TOOLKITS: IntegrationToolkit[] = ALL_CATEGORIES.flatMap((c) => c.toolkits);

const ALL = "All";

function matchesQuery(t: IntegrationToolkit, q: string): boolean {
  const needle = q.toLowerCase().replace(/[\s_]+/g, "");
  return (
    t.name.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    t.slug.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    (t.description ?? "").toLowerCase().replace(/[\s_]+/g, "").includes(needle)
  );
}

const CARD_BORDER = "rgba(11,23,41,0.12)";
const INK = TAN_INK;
const INK_MUTED = TAN_INK_MUTED;

export function IntegrationsDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const q = query.trim();

  // A search spans every category, so the sidebar selection steps aside while one is typed.
  const visible = useMemo(() => {
    if (q) return ALL_TOOLKITS.filter((t) => matchesQuery(t, q));
    if (category === ALL) return ALL_TOOLKITS;
    return ALL_CATEGORIES.find((c) => c.title === category)?.toolkits ?? [];
  }, [q, category]);

  const categories = [ALL, ...ALL_CATEGORIES.map((c) => c.title)];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative mx-auto max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
          style={{ color: INK_MUTED }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          aria-label="Search integrations"
          placeholder="Search apps (e.g. gmail, salesforce, notion)"
          className="font-body h-14 w-full rounded-full pl-12 pr-5 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(215,43,43,0.18)]"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff", color: INK }}
        />
      </div>

      <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <nav
          aria-label="Integration categories"
          className="rounded-2xl p-4 md:sticky md:top-24 md:w-56 md:shrink-0"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff" }}
        >
          <p className="font-heading mb-3 px-2 text-[15px] font-bold" style={{ color: INK }}>
            Category
          </p>
          <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
            {categories.map((c) => {
              const active = !q && c === category;
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setQuery("");
                    }}
                    aria-pressed={active}
                    className="font-body w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.04]"
                    style={
                      active
                        ? { background: "rgba(215,43,43,0.08)", color: RED, fontWeight: 600 }
                        : { color: INK }
                    }
                  >
                    {c}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          {q && (
            <p className="font-body mb-4 text-[13px]" style={{ color: INK_MUTED }}>
              Results for &ldquo;{q}&rdquo;
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
              {visible.map((t) => (
                <IntegrationCard key={t.slug} toolkit={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ toolkit: t }: { toolkit: IntegrationToolkit }) {
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
        <img
          src={t.logo ?? composioLogoUrl(t.slug)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-6 object-contain"
        />
      </span>
      <div className="min-w-0">
        <p className="font-body text-[14px] font-semibold leading-tight" style={{ color: INK }}>
          {t.name}
        </p>
        <p className="font-body mt-1 line-clamp-2 text-[12.5px] leading-snug" style={{ color: INK_MUTED }}>
          {t.description}
        </p>
      </div>
    </div>
  );
}
