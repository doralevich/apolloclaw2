"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Check,
  ChevronLeft,
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
import { pageList } from "@/lib/pagination";
import type {
  CatalogApp,
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

// Browse is one paginated grid with a category sidebar, the same layout as the public
// /integrations directory (David's call, Sept 28 2026). 24 a page, as there.
const PER_PAGE = 24;
const MAX_CATALOG_ATTEMPTS = 8;

type SubTab = "browse" | "connected";
type StatusFilter = "all" | "connected" | "available";

// "all" and "essentials" are pseudo-categories; everything else is a category title from
// INTEGRATION_CATEGORIES.
const ALL = "all";
const ESSENTIALS = "essentials";
// Everything in the full catalog that no curated category carries.
const MORE = "more";

// The public catalog (app/api/integrations/catalog, CDN-cached) lists every app with just a
// slug, name and description. The card needs a toolkit, so fill in the rest; the connect
// redirect resolves the app's auth scheme itself.
function catalogToolkit(a: CatalogApp): IntegrationToolkit {
  return {
    slug: a.slug,
    name: a.name,
    description: a.description || null,
    logo: composioLogoUrl(a.slug),
    enabled: true,
    isNoAuth: false,
    authSchemes: [],
  };
}

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

  // The full app catalog, loaded once after first paint from the same cached endpoint the public
  // directory uses. The curated categories render at once; everything else fills in behind them
  // under "More apps". A partial answer (complete: false) is kept and asked for again.
  const [catalog, setCatalog] = useState<CatalogApp[] | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [page, setPage] = useState(1);
  const gridTop = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    let cancelled = false;
    async function load(attempt: number) {
      try {
        const r = await fetch("/api/integrations/catalog");
        const body = (r.ok ? await r.json() : null) as { apps?: CatalogApp[]; complete?: boolean } | null;
        if (cancelled) return;
        if (body?.apps?.length) setCatalog((prev) => (prev && prev.length > body.apps!.length ? prev : body.apps!));
        if (!body?.complete && attempt < MAX_CATALOG_ATTEMPTS) {
          setTimeout(() => !cancelled && load(attempt + 1), 3000);
          return;
        }
      } catch {
        if (!cancelled && attempt < MAX_CATALOG_ATTEMPTS) {
          setTimeout(() => !cancelled && load(attempt + 1), 3000);
          return;
        }
      }
      if (!cancelled) setLoadingCatalog(false);
    }
    load(1);
    return () => {
      cancelled = true;
    };
  }, []);

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
  // Catalog apps no curated category carries: the "More apps" group.
  const moreApps = useMemo(() => {
    if (!catalog) return [];
    const curated = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => toolkitKey(t.slug)));
    return catalog.filter((a) => !curated.has(toolkitKey(a.slug))).map(catalogToolkit);
  }, [catalog]);
  const allApps = useMemo(() => [...DEFAULT_INTEGRATION_TOOLKITS, ...moreApps], [moreApps]);
  const activeConnections = connections.filter((c) => !c.isDisabled);
  const q = search.trim();
  const connectedCount = activeConnections.length;

  // Filtering is instant and local over the curated catalog from the first character; a 3+ char
  // query ALSO searches the full remote catalog (1,000+ apps) and appends whatever the curated
  // list doesn't already show once the live results land.
  const localMatches = useMemo(
    () => (q ? allApps.filter((t) => matchesQuery(t, q)) : []),
    [q, allApps]
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
      const moreSlugs = new Set(moreApps.map((t) => toolkitKey(t.slug)));
      const curated = category === ALL ? localMatches
        : category === ESSENTIALS ? localMatches.filter((t) => ESSENTIAL_INTEGRATION_SLUGS.includes(t.slug))
        : category === MORE ? localMatches.filter((t) => moreSlugs.has(toolkitKey(t.slug)))
        : localMatches.filter((t) => categoryForSlug(t.slug) === category);
      return category === ALL || category === MORE ? [...curated, ...remoteExtras] : curated;
    }
    if (category === ESSENTIALS) return ESSENTIAL_TOOLKITS;
    if (category === ALL) return allApps;
    if (category === MORE) return moreApps;
    return INTEGRATION_CATEGORIES.find((c) => c.title === category)?.toolkits ?? [];
  }, [q, category, localMatches, remoteExtras, allApps, moreApps]);

  const filtered = useMemo(() => byStatus(base), [base, byStatus]);

  // Counts for the Status rail, over `base` rather than over the whole account. "Connected"
  // here answers "how many of these" — the account-wide number already has a home on the
  // Connected tab, and repeating it beside a filtered grid made it read as a subset of what
  // is on screen when it wasn't.
  const baseConnected = useMemo(
    () => base.filter((t) => isToolkitConnected(connections, t.slug)).length,
    [base, connections]
  );

  // One grid, paged. Any change to what it shows goes back to page 1.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PER_PAGE;
  const shown = filtered.slice(start, start + PER_PAGE);
  const filtersActive = category !== ALL || status !== "all" || q.length > 0;

  function pickCategory(c: string) {
    setCategory(c);
    setPage(1);
  }
  function pickStatus(s: StatusFilter) {
    setStatus(s);
    setPage(1);
  }
  function goTo(p: number) {
    setPage(p);
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function clearFilters() {
    setCategory(ALL);
    setStatus("all");
    setSearch("");
    setPage(1);
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                  onClick={() => pickCategory(ALL)}
                  count={allApps.length}
                >
                  All apps
                </FilterRow>
                <FilterRow
                  active={category === ESSENTIALS}
                  onClick={() => pickCategory(ESSENTIALS)}
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
                      onClick={() => pickCategory(cat.title)}
                      count={categoryCounts.get(cat.title) ?? 0}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {cat.title}
                    </FilterRow>
                  );
                })}
                {moreApps.length > 0 && (
                  <FilterRow
                    active={category === MORE}
                    onClick={() => pickCategory(MORE)}
                    count={moreApps.length}
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    More apps
                  </FilterRow>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-2">
              <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
              <div className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
                <FilterRow
                  active={status === "all"}
                  onClick={() => pickStatus("all")}
                  count={base.length}
                >
                  All
                </FilterRow>
                <FilterRow
                  active={status === "connected"}
                  onClick={() => pickStatus("connected")}
                  count={baseConnected}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  Connected
                </FilterRow>
                <FilterRow
                  active={status === "available"}
                  onClick={() => pickStatus("available")}
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
          <div ref={gridTop} className="scroll-mt-28 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="text-xs font-medium text-muted-foreground">
                {q
                  ? `Results for “${q}”`
                  : category === ALL
                    ? "All apps"
                    : category === ESSENTIALS
                      ? "Essentials"
                      : category === MORE
                        ? "More apps"
                        : category}
                {status !== "all" && (
                  <span className="ml-1.5 font-normal">
                    · {status === "connected" ? "connected only" : "not connected"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {(loadingCatalog || searchingRemote) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {searchingRemote ? "Searching the full catalog…" : "Loading the full catalog…"}
                  </span>
                )}
                {filtered.length > 0 && (
                  <span className="tabular-nums">
                    Showing {start + 1}–{start + shown.length} of {filtered.length.toLocaleString()}
                  </span>
                )}
              </div>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{shown.map(renderCard)}</div>
            )}

            {pageCount > 1 && (
              <nav aria-label="Pages" className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  aria-label="Previous page"
                  disabled={current === 1}
                  onClick={() => goTo(current - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageList(current, pageCount).map((p, i) =>
                  p === "…" ? (
                    <span key={`gap-${i}`} className="px-1.5 text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === current ? "default" : "outline"}
                      size="sm"
                      className="h-9 min-w-9 px-2.5 tabular-nums"
                      aria-label={`Page ${p}`}
                      aria-current={p === current ? "page" : undefined}
                      onClick={() => goTo(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  aria-label="Next page"
                  disabled={current === pageCount}
                  onClick={() => goTo(current + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </div>

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
