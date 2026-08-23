"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  LayoutGrid,
  Loader2,
  Megaphone,
  Plug,
  Plus,
  Search,
  Sparkles,
  Star,
  SquareCheck,
  Unplug,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { HelpFooter } from "@/components/HelpFooter";
import {
  categoryForSlug,
  composioLogoUrl,
  DEFAULT_INTEGRATION_TOOLKITS,
  ESSENTIAL_INTEGRATION_SLUGS,
  INTEGRATION_CATEGORIES,
} from "@/lib/integration-catalog";
import { cn } from "@/lib/utils";
import type {
  IntegrationConnection,
  IntegrationConnectionsResult,
  IntegrationToolkit,
  IntegrationToolkitsResult,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useActiveAgent } from "@/components/ActiveAgentProvider";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH = 3; // the v1 toolkits route 400s a non-empty query shorter than this
const BROWSE_LIMIT = 24; // the v1 route clamps to 24; ask for a full page so Browse feels real
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 22; // give up polling for the connect to land after ~45s

// How many apps a category shows on the landing view before it hands off to "View all".
// Two rows at the widest breakpoint: enough to see what a category is about, few enough
// that the whole page stays scannable instead of being one long wall of cards.
const SECTION_PREVIEW = 6;

type SubTab = "browse" | "connected";
type StatusFilter = "all" | "connected" | "available";

// "all" and "essentials" are pseudo-categories; everything else is a category title from
// INTEGRATION_CATEGORIES.
const ALL = "all";
const ESSENTIALS = "essentials";

// One icon per curated category, keyed by the exact title in INTEGRATION_CATEGORIES.
//
// A plain list of seven text rows gives the eye nothing to land on, and these are scanned far
// more often than they are read. Keyed by title rather than carried on the category objects so
// lib/integration-catalog.ts stays JSX-free and server-safe — the same split config/agent-types
// makes with its icon names.
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

function toolkitKey(slug: string): string {
  return slug.toLowerCase();
}

function connectRedirectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}

function connToolkitSlug(c: IntegrationConnection): string {
  return (c.toolkitSlug || "").toLowerCase();
}

function isActive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE";
}

function isToolkitConnected(conns: IntegrationConnection[], slug: string): boolean {
  return conns.some((c) => connToolkitSlug(c) === slug.toLowerCase() && isActive(c));
}

// Case/underscore/space-insensitive match against a toolkit's name, slug, or description,
// so "one drive", "onedrive", and "OneDrive" all find the one_drive toolkit.
function matchesQuery(t: IntegrationToolkit, q: string): boolean {
  const needle = q.toLowerCase().replace(/[\s_]+/g, "");
  return (
    t.name.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    t.slug.toLowerCase().replace(/[\s_]+/g, "").includes(needle) ||
    (t.description ?? "").toLowerCase().replace(/[\s_]+/g, "").includes(needle)
  );
}

// The pinned Essentials shelf, in ESSENTIAL_INTEGRATION_SLUGS order. These also appear in
// their own category below (like an app store's featured shelf) — the shelf is where to
// start, the categories are the organised catalogue.
const ESSENTIAL_TOOLKITS: IntegrationToolkit[] = ESSENTIAL_INTEGRATION_SLUGS.map((slug) =>
  DEFAULT_INTEGRATION_TOOLKITS.find((t) => toolkitKey(t.slug) === toolkitKey(slug))
).filter((t): t is IntegrationToolkit => !!t);

// The Integrations tab, scoped to the sidebar's active agent. Handles the no-agent empty
// state and the "agent isn't running" hint; the panel itself is keyed by agent id so all
// catalog/connection state resets when the user switches agents.
export function IntegrationsView() {
  const { active, loading, error, refresh } = useActiveAgent();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  // The agent-list fetch failed and nothing is cached — don't claim the workspace is empty.
  if (!active && error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
        </p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Plug className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You don&apos;t have an agent yet. Create one to start connecting apps.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/settings/agent">Go to My Agent</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.live_status !== "running" && (
        <p className="max-w-6xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {active.name || "This agent"} isn&apos;t running right now ({active.live_status ?? "unknown"}).
          You can still manage its app connections here, but the agent can&apos;t use them until it&apos;s
          started from Settings → My Agent.
        </p>
      )}
      <IntegrationsPanel key={active.agent37_id} agentId={active.agent37_id} />
      <HelpFooter className="max-w-6xl" />
    </div>
  );
}

// Connect third-party apps (Gmail, GitHub, Slack…) to the agent. Browse searches the catalog
// (popular apps by default); Connected manages the linked accounts. Connecting opens a
// same-origin redirect route in a new tab; that route starts OAuth server-side.
function IntegrationsPanel({ agentId }: { agentId: string }) {
  const [tab, setTab] = useState<SubTab>("browse");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [toolkits, setToolkits] = useState<IntegrationToolkit[]>([]);
  const [loadingToolkits, setLoadingToolkits] = useState(false);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  // How many apps exist upstream. Null until the first page lands, and the rail falls back to
  // the curated count rather than showing a zero or a guess.
  const [catalogTotal, setCatalogTotal] = useState<number | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<IntegrationConnection | null>(null);

  // "Show more apps": pages through the full remote catalog (popularity-ranked) below the
  // curated categories. Fetched on demand, deduped against everything already on screen;
  // the button hides once the upstream cursor is exhausted (or a page adds nothing new).
  const [extraApps, setExtraApps] = useState<IntegrationToolkit[]>([]);
  const [extraCursor, setExtraCursor] = useState<string | null>(null);
  const [extraLoaded, setExtraLoaded] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConnections = useCallback(async () => {
    const { connections: conns } = await apiFetch<IntegrationConnectionsResult>(
      `/api/agents/${agentId}/integrations/connections`
    );
    setConnections(conns);
    return conns;
  }, [agentId]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setPendingSlug(null);
  }, []);

  // Load connections on mount; stop any poll on unmount (the tab unmounts on switch away). Every
  // setState lands in a promise callback, so the effect body does no synchronous state update.
  useEffect(() => {
    let cancelled = false;
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => {
        if (!cancelled) setConnections(res.connections);
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => {
        if (!cancelled) setLoadingConns(false);
      });
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [agentId, stopPolling]);

  // One call on mount for the catalogue's size. Deliberately not blocking anything: the curated
  // shelf paints immediately, and this only replaces a number in the rail once it lands.
  useEffect(() => {
    let cancelled = false;
    apiFetch<IntegrationToolkitsResult>(`/api/agents/${agentId}/integrations/toolkits?limit=1`)
      .then((res) => {
        if (!cancelled && Number.isFinite(res.totalItems)) setCatalogTotal(res.totalItems);
      })
      .catch(() => {
        // The rail keeps the curated count. A missing total is not worth a toast on a page the
        // customer opened to connect something.
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Debounced live search. Empty query uses the static default catalog above so Browse does not
  // wait on Agent37/Composio; a query of 3+ chars searches live; 1-2 chars wait (the server 400s).
  useEffect(() => {
    const q = search.trim();
    if (q.length < MIN_SEARCH) return;
    let cancelled = false;

    const handle = setTimeout(() => {
      setLoadingToolkits(true);
      const qs = `?search=${encodeURIComponent(q)}&limit=${BROWSE_LIMIT}`;
      apiFetch<IntegrationToolkitsResult>(`/api/agents/${agentId}/integrations/toolkits${qs}`)
        .then((res) => {
          if (!cancelled) setToolkits(res.items);
        })
        .catch((e) => {
          if (!cancelled) toast.error((e as Error).message);
        })
        .finally(() => {
          if (!cancelled) setLoadingToolkits(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, agentId]);

  // Called from the connect handler (not render): poll connections until the toolkit shows ACTIVE
  // or we give up after POLL_MAX_ATTEMPTS. Stored lowercased so the per-card pending check matches
  // even if the catalog returns a mixed-case slug.
  function startPolling(slug: string) {
    setPendingSlug(toolkitKey(slug));
    let attempts = 0;
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(async () => {
      attempts += 1;
      try {
        const conns = await fetchConnections();
        if (isToolkitConnected(conns, slug)) {
          stopPolling();
          toast.success("Connected");
          return;
        }
      } catch {
        // transient; keep polling until the attempt cap
      }
      if (attempts >= POLL_MAX_ATTEMPTS) stopPolling();
    }, POLL_INTERVAL_MS);
  }

  async function loadMoreApps() {
    setLoadingExtra(true);
    try {
      const params = new URLSearchParams({ limit: String(BROWSE_LIMIT) });
      if (extraCursor) params.set("cursor", extraCursor);
      const res = await apiFetch<IntegrationToolkitsResult>(
        `/api/agents/${agentId}/integrations/toolkits?${params}`
      );
      const seen = new Set(
        [...DEFAULT_INTEGRATION_TOOLKITS, ...extraApps].map((t) => toolkitKey(t.slug))
      );
      const fresh = res.items.filter((t) => !seen.has(toolkitKey(t.slug)));
      setExtraApps((prev) => [...prev, ...fresh]);
      // Stop offering "load more" when the catalog is exhausted, or when paging isn't
      // actually advancing (a whole page of already-seen apps).
      setExtraCursor(res.items.length > 0 && fresh.length > 0 ? (res.nextCursor ?? null) : null);
      setExtraLoaded(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingExtra(false);
    }
  }

  // Errors propagate to the ConfirmDialog's useAsyncAction, which toasts them and keeps
  // the dialog open so the user can retry.
  async function disconnect(connectedAccountId: string) {
    setDisconnecting(connectedAccountId);
    try {
      await apiFetch(`/api/agents/${agentId}/integrations/connections/${connectedAccountId}`, {
        method: "DELETE",
      });
      toast.success("Disconnected");
      await fetchConnections();
    } finally {
      setDisconnecting(null);
    }
  }

  // Counts for the filter rail. The mockup shows "1,024" against All Apps — that is Composio's
  // whole catalogue, which we only ever reach through search, so it isn't a number we can stand
  // behind on a resting page. These are the curated catalogue and the customer's real
  // connections; the search box is where the other thousand live, and it says so.
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of INTEGRATION_CATEGORIES) map.set(cat.title, cat.toolkits.length);
    return map;
  }, []);
  const activeConnections = connections.filter((c) => !c.isDisabled);
  const q = search.trim();
  const connectedCount = activeConnections.length;

  // Filtering is instant and local over the curated catalog from the first character; a 3+ char
  // query ALSO searches the full remote catalog (1,000+ apps) and appends whatever the curated
  // list doesn't already show once the live results land.
  const localMatches = useMemo(
    () => (q ? DEFAULT_INTEGRATION_TOOLKITS.filter((t) => matchesQuery(t, q)) : []),
    [q]
  );
  const remoteExtras = useMemo(() => {
    if (q.length < MIN_SEARCH || loadingToolkits) return [];
    const shown = new Set(localMatches.map((t) => toolkitKey(t.slug)));
    return toolkits.filter((t) => !shown.has(toolkitKey(t.slug)));
  }, [q, localMatches, toolkits, loadingToolkits]);
  const searchingRemote = q.length >= MIN_SEARCH && loadingToolkits;

  const byStatus = useCallback(
    (list: IntegrationToolkit[]) => {
      if (status === "all") return list;
      const want = status === "connected";
      return list.filter((t) => isToolkitConnected(connections, t.slug) === want);
    },
    [status, connections]
  );

  // The set of cards a narrowed view shows. Search wins over the category pills for anything
  // the remote catalog turned up, because those apps have no curated category to filter by —
  // picking "Files & docs" and typing "notion" should still find Notion.
  // Split in two so the Status rail can count the same set the grid is about to render.
  // `base` is everything the category and query select; `filtered` is that after the status
  // filter. Counting off `base` is what makes "Connected 3" mean three of the cards below.
  const base = useMemo(() => {
    if (q) {
      const curated = category === ALL ? localMatches
        : category === ESSENTIALS ? localMatches.filter((t) => ESSENTIAL_INTEGRATION_SLUGS.includes(t.slug))
        : localMatches.filter((t) => categoryForSlug(t.slug) === category);
      return category === ALL ? [...curated, ...remoteExtras] : curated;
    }
    if (category === ESSENTIALS) return ESSENTIAL_TOOLKITS;
    if (category === ALL) return [...DEFAULT_INTEGRATION_TOOLKITS, ...extraApps];
    return INTEGRATION_CATEGORIES.find((c) => c.title === category)?.toolkits ?? [];
  }, [q, category, localMatches, remoteExtras, extraApps]);

  const filtered = useMemo(() => byStatus(base), [base, byStatus]);

  // Counts for the Status rail, over `base` rather than over the whole account. "Connected"
  // here answers "how many of these" — the account-wide number already has a home on the
  // Connected tab, and repeating it beside a filtered grid made it read as a subset of what
  // is on screen when it wasn't.
  const baseConnected = useMemo(
    () => base.filter((t) => isToolkitConnected(connections, t.slug)).length,
    [base, connections]
  );

  // What "All apps" actually yields when clicked: the curated shelf plus whatever "Show more
  // apps" has paged in so far. It grows as you page, which is the honest behaviour — the
  // number goes up because the list did.
  const browsableCount = DEFAULT_INTEGRATION_TOOLKITS.length + extraApps.length;

  // The landing view: every category as its own shelf. Any filter or query at all collapses
  // it into a single flat grid, so there is only ever one place to look for results.
  const showSections = !q && category === ALL && status === "all";
  const filtersActive = category !== ALL || status !== "all" || q.length > 0;

  function clearFilters() {
    setCategory(ALL);
    setStatus("all");
    setSearch("");
  }

  const renderCard = (t: IntegrationToolkit) => (
    <IntegrationCard
      key={t.slug}
      toolkit={t}
      agentId={agentId}
      connected={isToolkitConnected(connections, t.slug)}
      pending={pendingSlug === toolkitKey(t.slug)}
      onConnect={() => startPolling(t.slug)}
      onManage={() => setTab("connected")}
    />
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
          <div className="inline-flex rounded-full border bg-card p-0.5 text-sm">
            <SubTabButton active={tab === "browse"} onClick={() => setTab("browse")}>
              Browse
            </SubTabButton>
            <SubTabButton active={tab === "connected"} onClick={() => setTab("connected")}>
              Connected
              {connectedCount > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">{connectedCount}</span>
              )}
            </SubTabButton>
          </div>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          Connect an app and your agent can work in it for you - reading your mail, adding to
          your calendar, finding a file.
        </p>
      </div>

      {tab === "browse" ? (
        /* Filters live in a rail on the left rather than a bar across the top. As a bar they
           pushed the apps below the fold and read as a row of buttons; as a rail they read as
           what they are — a table of contents you can sit in while the grid changes beside
           you. Below lg the rail becomes a wrapping row above the content, because a 208px
           column on a phone is most of the screen. */
        <div className="space-y-5">
          {/* Full width, above the split. It searches everything, so scoping it to the column
              beside the filters said otherwise — and it left the rail starting level with a
              search box rather than with the cards it filters. */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // The catalogue total lives here rather than on a filter row, because this is the
              // one control that actually reaches all of it. On a filter it was a promise the
              // click could not keep; on the search box it is a description of what typing does.
              // Before the count lands, no number — "1,000+" was a guess that happened to be right.
              placeholder={
                catalogTotal
                  ? `Search ${catalogTotal.toLocaleString()} apps (e.g. github, gmail, calendar)`
                  : "Search the app store (e.g. github, gmail, calendar)"
              }
              className="h-11 pl-9"
            />
          </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="shrink-0 space-y-3 lg:w-64">
            {/* Panels rather than a bare column of pills. The rail carries two different
                questions — what kind of app, and whether it's on — and without the frames they
                read as one long list of eleven equal things. */}
            <div className="rounded-xl border bg-card p-2">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="text-sm font-semibold">Categories</span>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex cursor-pointer items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
                <FilterRow
                  active={category === ALL}
                  onClick={() => setCategory(ALL)}
                  count={browsableCount}
                >
                  All apps
                </FilterRow>
                <FilterRow
                  active={category === ESSENTIALS}
                  onClick={() => setCategory(ESSENTIALS)}
                  count={ESSENTIAL_TOOLKITS.length}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      category === ESSENTIALS ? "fill-amber-400 text-amber-400" : "text-amber-400"
                    )}
                  />
                  Essentials
                </FilterRow>
                {INTEGRATION_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.title] ?? Sparkles;
                  return (
                    <FilterRow
                      key={cat.title}
                      active={category === cat.title}
                      onClick={() => setCategory(cat.title)}
                      count={categoryCounts.get(cat.title) ?? 0}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {cat.title}
                    </FilterRow>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-2">
              <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
              <div className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
                <FilterRow
                  active={status === "all"}
                  onClick={() => setStatus("all")}
                  count={base.length}
                >
                  All
                </FilterRow>
                <FilterRow
                  active={status === "connected"}
                  onClick={() => setStatus("connected")}
                  count={baseConnected}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  Connected
                </FilterRow>
                <FilterRow
                  active={status === "available"}
                  onClick={() => setStatus("available")}
                  count={base.length - baseConnected}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
                  Not connected
                </FilterRow>
              </div>
            </div>

            {/* From the mockup, and it earns its place: the catalogue is long enough that "it
                isn't here" is a real outcome, and without this the page just ends. */}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-medium">Can&apos;t find an app?</p>
              <Link
                href="/contact"
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Request an integration
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-5">
          {showSections ? (
            <div className="space-y-7">
              {/* Shown in full, not previewed. Every other shelf caps at SECTION_PREVIEW and
                  hands off to "View all", which is right for a category of 8 you're browsing —
                  and wrong here. The whole point of pinning eleven apps is that you see the
                  eleven; hiding five behind a click would undo it. */}
              <Section
                title="Essentials"
                icon={<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                total={ESSENTIAL_TOOLKITS.length}
              >
                {ESSENTIAL_TOOLKITS.map(renderCard)}
              </Section>

              {INTEGRATION_CATEGORIES.map((cat) => (
                <Section
                  key={cat.title}
                  title={cat.title}
                  total={cat.toolkits.length}
                  onViewAll={() => setCategory(cat.title)}
                >
                  {cat.toolkits.slice(0, SECTION_PREVIEW).map(renderCard)}
                </Section>
              ))}

              <div className="space-y-3">
                {extraApps.length > 0 && (
                  <Section title="More from the app store" total={extraApps.length}>
                    {extraApps.map(renderCard)}
                  </Section>
                )}
                <LoadMore
                  exhausted={extraLoaded && !extraCursor}
                  loading={loadingExtra}
                  loaded={extraLoaded}
                  onClick={loadMoreApps}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {q ? `Results for “${q}”` : category === ALL ? "All apps" : category}
                  {status !== "all" && (
                    <span className="ml-1.5 font-normal">
                      · {status === "connected" ? "connected only" : "not connected"}
                    </span>
                  )}
                  <span className="ml-1.5 font-normal">
                    ({filtered.length}
                    {searchingRemote ? "+" : ""})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  Back to all categories
                </Button>
              </div>

              {filtered.length === 0 && !searchingRemote ? (
                <div className="rounded-xl border border-dashed px-6 py-12 text-center">
                  <Search className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {q ? (
                      <>
                        No apps found for &ldquo;{q}&rdquo;.
                        {q.length < MIN_SEARCH && " Keep typing to search the full catalog."}
                      </>
                    ) : status === "connected" ? (
                      "Nothing connected in this category yet."
                    ) : (
                      "Nothing left to connect in this category - you've got them all."
                    )}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(renderCard)}
                </div>
              )}

              {searchingRemote && (
                <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching the full catalog…
                </p>
              )}

              {/* The full catalog is only pageable when nothing narrows it - the remote list
                  is popularity-ranked, not category-tagged, so paging it inside a category
                  would append apps that don't belong to that category. */}
              {!q && category === ALL && (
                <LoadMore
                  exhausted={extraLoaded && !extraCursor}
                  loading={loadingExtra}
                  loaded={extraLoaded}
                  onClick={loadMoreApps}
                />
              )}
            </div>
          )}

          {pendingSlug && (
            <p className="px-1 text-xs text-muted-foreground">
              Waiting for you to finish connecting in the other tab…
            </p>
          )}
          </div>
        </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loadingConns ? (
            <p className="py-2 text-sm text-muted-foreground">Loading…</p>
          ) : activeConnections.length === 0 ? (
            <div className="rounded-xl border border-dashed px-6 py-12 text-center">
              <Plug className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No apps connected yet.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setTab("browse")}>
                Browse apps
              </Button>
            </div>
          ) : (
            /* A grid, the same three columns Browse uses. This was a stacked list in one
               bordered container, so switching tabs changed the shape of the page as well as
               its contents — and the row form gave a connected app less presence than an
               unconnected one two clicks away, which is backwards. */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeConnections.map((c) => {
                const slug = connToolkitSlug(c);
                const isPending = pendingSlug === slug;
                const name = c.toolkitName || c.toolkitSlug || slug || "Unknown app";
                const connCategory = slug ? categoryForSlug(slug) : undefined;

                return (
                  <div
                    key={c.id}
                    className="flex h-full flex-col rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/25"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <ToolkitLogo logo={slug ? composioLogoUrl(slug) : null} name={name} />
                      {isActive(c) ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Badge variant="warning">{c.status || "Pending"}</Badge>
                      )}
                    </div>

                    <div className="mt-2 min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{name}</div>
                      {connCategory && (
                        <div className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                          {connCategory}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      {isPending ? (
                        <Button variant="ghost" size="sm" className="h-8 flex-1 gap-1 px-2 text-xs" disabled>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Waiting
                        </Button>
                      ) : slug ? (
                        <Button asChild variant="ghost" size="sm" className="h-8 flex-1 gap-1 px-2 text-xs">
                          <a
                            href={connectRedirectHref(agentId, slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => startPolling(slug)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add another
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 flex-1 gap-1 px-2 text-xs" disabled>
                          <Plus className="h-3.5 w-3.5" />
                          Add another
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                        disabled={disconnecting === c.id}
                        onClick={() => setConfirmDisconnect(c)}
                        aria-label={`Disconnect ${name}`}
                      >
                        {disconnecting === c.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Unplug className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDisconnect}
        onOpenChange={(open) => {
          if (!open) setConfirmDisconnect(null);
        }}
        title={`Disconnect ${confirmDisconnect?.toolkitName || confirmDisconnect?.toolkitSlug || "this app"}?`}
        description="Your agent will lose access to this account until you connect it again."
        confirmText="Disconnect"
        destructive
        onConfirm={async () => {
          if (confirmDisconnect) await disconnect(confirmDisconnect.id);
        }}
      />
    </div>
  );
}

// One shelf on the landing view: a heading, up to SECTION_PREVIEW cards, and a "View all"
// that hands off to the category filter rather than expanding in place — so there is only
// ever one grid on screen showing one thing.
function Section({
  title,
  icon,
  total,
  onViewAll,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  total: number;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  const hidden = total - SECTION_PREVIEW;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {icon}
          {title}
          <span className="font-normal normal-case tracking-normal">({total})</span>
        </div>
        {onViewAll && hidden > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex cursor-pointer items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all {total}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

// The box. Logo, name, what the app is, and exactly one action — sized so a row of three
// reads as three things rather than a striped list.
function IntegrationCard({
  toolkit: t,
  agentId,
  connected,
  pending,
  onConnect,
  onManage,
}: {
  toolkit: IntegrationToolkit;
  agentId: string;
  connected: boolean;
  pending: boolean;
  onConnect: () => void;
  onManage: () => void;
}) {
  const category = categoryForSlug(t.slug);
  return (
    // A compact row: logo, name and status on the left, the one action on the right, and a single
    // line of description under them. It WAS a tall stacked card - logo, name, a two-line blurb,
    // then the button on its own row - which David found too big for a grid he scans more than
    // reads. The blurb was most of that height and, for the Essentials, is a sentence nobody needs
    // about software they use every day. Kept to ONE clamped line, because "More from the app
    // store" reaches a thousand-odd Composio toolkits nobody has heard of and there the line is
    // the only thing separating one unfamiliar logo from the next - a sentence, not a paragraph.
    <div
      className={cn(
        "rounded-xl border bg-card p-3 transition-colors hover:border-foreground/20",
        connected && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/25"
      )}
    >
      <div className="flex items-center gap-2.5">
        <ToolkitLogo logo={t.logo} name={t.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight">{t.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
            {connected ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground/40" aria-hidden />
                Not connected
              </span>
            )}
            {/* Undefined for anything from the remote catalogue, which has no curated category -
                omitted rather than printed as "Other", which would claim a classification we
                never made. */}
            {category && <span className="text-muted-foreground/70">{category}</span>}
          </div>
        </div>

        {/* The one action, beside the name rather than on its own row below. */}
        <div className="shrink-0">
          {connected ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
              onClick={onManage}
            >
              <Check className="h-3.5 w-3.5" />
              Manage
            </Button>
          ) : pending ? (
            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" disabled>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs">
              <a
                href={connectRedirectHref(agentId, t.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onConnect}
              >
                Connect
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* One line, clamped. Composio's descriptions run from four words to a paragraph; a single
          line keeps every card the same short height whatever the copy does. */}
      {t.description && (
        <p className="mt-1.5 line-clamp-1 text-xs leading-snug text-muted-foreground">
          {t.description}
        </p>
      )}
    </div>
  );
}

function LoadMore({
  exhausted,
  loading,
  loaded,
  onClick,
}: {
  exhausted: boolean;
  loading: boolean;
  loaded: boolean;
  onClick: () => void;
}) {
  if (exhausted) {
    return (
      <p className="px-1 pt-1 text-center text-xs text-muted-foreground">
        That&apos;s everything we can list here. Search above to find any of 1,000+ apps.
      </p>
    );
  }
  return (
    <Button variant="outline" className="w-full" disabled={loading} onClick={onClick}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {loaded ? "Load more apps" : "Show more apps"}
    </Button>
  );
}

// One row in the filter rail: label on the left, how many on the right.
//
// A row rather than a pill, because the count needs somewhere to sit that isn't inside the
// label — and because eleven pills wrapping in a narrow column is a shape nobody can scan. On
// small screens they still wrap into a row, where the count rides along inside each one.
function FilterRow({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-secondary font-medium text-secondary-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 truncate">{children}</span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">{count}</span>
    </button>
  );
}

function SubTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ToolkitLogo({
  logo,
  name,
  size = "sm",
}: {
  logo: string | null;
  name: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "h-9 w-9" : "h-8 w-8";
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(box, "shrink-0 rounded-lg object-contain")}
      />
    );
  }
  return (
    <div
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
