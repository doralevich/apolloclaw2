"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { composioLogoUrl, INTEGRATION_CATEGORIES } from "@/lib/integration-catalog";
import type { IntegrationToolkit } from "@/lib/types";
import { TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// The public directory: one flat, dense wall of logos rather than the dashboard's
// category-by-category shelves (components/IntegrationsView.tsx) - David's call, "tighter and
// full," and a visitor here is scanning for their own tools, not browsing a store by
// department. No Connect button and no connected state, since there is no agent on this page
// to connect anything to.
//
// EXTRA_TOOLKITS below are real Composio toolkit slugs (verified: these logos already render
// live elsewhere in the app - components/GlobeSection.tsx, components/home/LogoStrip.tsx) that
// are not in lib/integration-catalog.ts's curated 36 - that file is the source of truth for the
// real in-app Connections tab and deliberately excludes chat apps (see its own note), which is
// why Slack is not repeated here. This page's own list, not added to the shared catalog: this
// is a "look how much we cover" wall, not a browse-and-connect surface, and the two lists are
// allowed to diverge.
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

const EXTRA_TOOLKITS: IntegrationToolkit[] = [
  extra("stripe", "Stripe", "Stripe processes payments and manages subscriptions."),
  extra("shopify", "Shopify", "Shopify runs online stores and order management."),
  extra("zendesk", "Zendesk", "Zendesk manages customer support tickets and help desks."),
  extra("intercom", "Intercom", "Intercom is a customer messaging and support platform."),
  extra("mailchimp", "Mailchimp", "Mailchimp sends email campaigns and manages audiences."),
  extra("klaviyo", "Klaviyo", "Klaviyo powers email and SMS marketing for ecommerce."),
  extra("xero", "Xero", "Xero handles accounting, invoicing, and bookkeeping."),
  extra("brex", "Brex", "Brex manages corporate cards and business spend."),
  extra("bitbucket", "Bitbucket", "Bitbucket hosts Git repositories and pull requests."),
  extra("sentry", "Sentry", "Sentry monitors errors and application performance."),
  extra("posthog", "PostHog", "PostHog tracks product analytics and feature flags."),
  extra("datadog", "Datadog", "Datadog monitors infrastructure, logs, and performance."),
];

export const ALL_TOOLKITS: IntegrationToolkit[] = [
  ...INTEGRATION_CATEGORIES.flatMap((c) => c.toolkits),
  ...EXTRA_TOOLKITS,
];

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

  const shown = useMemo(
    () => (q ? ALL_TOOLKITS.filter((t) => matchesQuery(t, q)) : ALL_TOOLKITS),
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

      {/* Composio, our integration partner, is where the real ceiling is - not this page.
          Naming the number here rather than baking it into a card count keeps the claim
          honest: we render what we can show, and say plainly where the rest lives. */}
      <p className="mx-auto mt-5 max-w-xl text-center text-[13px]" style={{ color: INK_MUTED }}>
        {ALL_TOOLKITS.length} shown here. If it&apos;s on{" "}
        <a
          href="https://composio.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
          style={{ color: INK }}
        >
          Composio
        </a>
        , our integration partner and 1,000+ apps deep, we can connect it.
      </p>

      <div className="mx-auto mt-10 max-w-6xl">
        {q && (
          <p className="font-mono mb-4 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: INK_MUTED }}>
            {shown.length} {shown.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
        )}
        {shown.length === 0 ? (
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
            {shown.map((t) => (
              <IntegrationTile key={t.slug} toolkit={t} />
            ))}
          </div>
        )}
      </div>
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
