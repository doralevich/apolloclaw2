"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Boxes,
  Code2,
  CreditCard,
  FileText,
  Headset,
  LayoutGrid,
  Megaphone,
  Search,
  Sparkles,
  SquareCheck,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { composioLogoUrl, INTEGRATION_CATEGORIES, type IntegrationCategory } from "@/lib/integration-catalog";
import type { IntegrationToolkit } from "@/lib/types";
import { TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// The public directory: category shelves like the dashboard's Connections tab
// (components/IntegrationsView.tsx), but tighter and denser - David's call after looking at the
// reference site (lindy.ai/integrations): keep the categories, shrink the tiles, lose the
// whitespace. Read-only, no Connect button and no connected state, since there is no agent on
// this page to connect anything to. And no outbound link to Composio - visitors stay on this
// site; the partner is mentioned in copy on the page above, never as a click-through here.
//
// EXTRA_BY_CATEGORY below are real Composio toolkit slugs (verified: these logos already render
// live elsewhere in the app - components/GlobeSection.tsx, components/home/LogoStrip.tsx) that
// are not in lib/integration-catalog.ts's curated 36 - that file is the source of truth for the
// real in-app Connections tab and deliberately excludes chat apps (see its own note), which is
// why Slack is not repeated here. This page's own list, not added to the shared catalog: this
// is a "look how much we cover" wall, not a browse-and-connect surface, and the two lists are
// allowed to diverge. Titles that match an existing INTEGRATION_CATEGORIES shelf merge into it;
// the rest become new shelves of their own.
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

// Merge extras into the curated shelves (matching title) and append the rest as new shelves,
// in the order EXTRA_BY_CATEGORY declares them.
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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Google Workspace": Boxes,
  "Microsoft 365": LayoutGrid,
  "Files & docs": FileText,
  "Tasks & projects": SquareCheck,
  "Meetings & scheduling": Video,
  "Sales & marketing": Megaphone,
  "Design & code": Code2,
  "Research & agent tools": BarChart3,
  "Payments & commerce": CreditCard,
  Support: Headset,
  "Monitoring & analytics": Activity,
};

function matchesQuery(t: IntegrationToolkit, q: string): boolean {
  const needle = q.toLowerCase().replace(/[\s_]+/g, "");
  return (
    t.name.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    t.slug.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    (t.description ?? "").toLowerCase().replace(/[\s_]+/g, "").includes(needle)
  );
}

const CARD_BORDER = "rgba(11,23,41,0.12)";
const CARD_BG = "rgba(255,255,255,0.6)";
const INK = TAN_INK;
const INK_MUTED = TAN_INK_MUTED;

export function IntegrationsDirectory() {
  const [query, setQuery] = useState("");
  const q = query.trim();

  const filtered = useMemo(
    () => (q ? ALL_TOOLKITS.filter((t) => matchesQuery(t, q)) : []),
    [q]
  );

  return (
    <div>
      <div className="relative mx-auto max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
          style={{ color: INK_MUTED }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder={`Search ${ALL_TOOLKITS.length} apps shown here (e.g. gmail, salesforce, notion)`}
          className="font-body h-14 w-full rounded-full pl-12 pr-5 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(215,43,43,0.18)]"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff", color: INK }}
        />
      </div>

      {q ? (
        <div className="mx-auto mt-10 max-w-6xl">
          <p className="font-mono mb-4 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: INK_MUTED }}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center" style={{ borderColor: CARD_BORDER }}>
              <p className="font-body text-base" style={{ color: INK_MUTED }}>
                Not shown here doesn&apos;t mean we can&apos;t connect it.{" "}
                <Link href="/contact" className="font-semibold underline underline-offset-2" style={{ color: INK }}>
                  Tell us what you need
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {filtered.map((t) => (
                <IntegrationTile key={t.slug} toolkit={t} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-6xl space-y-9">
          {ALL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.title] ?? Sparkles;
            return (
              <div key={cat.title}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-3.5" style={{ color: INK_MUTED }} />
                  <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: INK }}>
                    {cat.title}
                  </h3>
                  <span className="font-body text-[12px]" style={{ color: INK_MUTED }}>
                    ({cat.toolkits.length})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {cat.toolkits.map((t) => (
                    <IntegrationTile key={t.slug} toolkit={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IntegrationTile({ toolkit: t }: { toolkit: IntegrationToolkit }) {
  return (
    <div
      title={t.description ?? t.name}
      className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:border-black/20"
      style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.logo ?? composioLogoUrl(t.slug)}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-7 rounded-md object-contain"
      />
      <p className="font-body line-clamp-1 text-[12px] font-semibold leading-tight" style={{ color: INK }}>
        {t.name}
      </p>
    </div>
  );
}
