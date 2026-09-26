"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Code2,
  FileText,
  LayoutGrid,
  Megaphone,
  Search,
  Sparkles,
  SquareCheck,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { composioLogoUrl, INTEGRATION_CATEGORIES } from "@/lib/integration-catalog";
import type { IntegrationToolkit } from "@/lib/types";
import { TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// The public directory: every app in the curated catalog (lib/integration-catalog.ts), the
// same list the in-app Connections page (components/IntegrationsView.tsx) browses - just
// read-only. There is no agent to connect anything to here, so no Connect button and no
// connected/not-connected state, only what the tool is and which shelf it lives on.
//
// Same category icons as the dashboard's Connections page, keyed the same way (by the exact
// title strings in INTEGRATION_CATEGORIES) - duplicated rather than imported, since that file
// is a "use client" dashboard component this public page has no reason to pull in.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Google Workspace": Boxes,
  "Microsoft 365": LayoutGrid,
  "Files & docs": FileText,
  "Tasks & projects": SquareCheck,
  "Meetings & scheduling": Video,
  "Sales & marketing": Megaphone,
  "Design & code": Code2,
  "Research & agent tools": BarChart3,
};

const ALL_TOOLKITS: IntegrationToolkit[] = INTEGRATION_CATEGORIES.flatMap((c) => c.toolkits);

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
          placeholder={`Search ${ALL_TOOLKITS.length} apps (e.g. gmail, salesforce, notion)`}
          className="font-body h-14 w-full rounded-full pl-12 pr-5 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(215,43,43,0.18)]"
          style={{ border: `1px solid ${CARD_BORDER}`, background: "#fff", color: INK }}
        />
      </div>

      {q ? (
        <div className="mx-auto mt-12 max-w-6xl">
          <p className="font-mono mb-5 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: INK_MUTED }}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center" style={{ borderColor: CARD_BORDER }}>
              <p className="font-body text-base" style={{ color: INK_MUTED }}>
                Nothing here yet - that doesn&apos;t mean we can&apos;t connect it.{" "}
                <Link href="/contact" className="font-semibold underline underline-offset-2" style={{ color: INK }}>
                  Tell us what you need
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((t) => (
                <IntegrationCard key={t.slug} toolkit={t} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-16 max-w-6xl space-y-14">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.title] ?? Sparkles;
            return (
              <div key={cat.title}>
                <div className="mb-5 flex items-center gap-2">
                  <Icon className="size-4" style={{ color: INK_MUTED }} />
                  <h3 className="font-heading text-[15px] font-bold uppercase tracking-[0.08em]" style={{ color: INK }}>
                    {cat.title}
                  </h3>
                  <span className="font-body text-[13px]" style={{ color: INK_MUTED }}>
                    ({cat.toolkits.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {cat.toolkits.map((t) => (
                    <IntegrationCard key={t.slug} toolkit={t} />
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

function IntegrationCard({ toolkit: t }: { toolkit: IntegrationToolkit }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-black/20"
      style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.logo ?? composioLogoUrl(t.slug)}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-9 rounded-lg object-contain"
      />
      <div>
        <p className="font-heading text-[15px] font-bold leading-tight" style={{ color: INK }}>
          {t.name}
        </p>
        {t.description && (
          <p className="font-body mt-1 line-clamp-2 text-[13px] leading-snug" style={{ color: INK_MUTED }}>
            {t.description}
          </p>
        )}
      </div>
    </div>
  );
}
