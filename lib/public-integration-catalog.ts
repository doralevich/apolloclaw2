import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogApp, IntegrationToolkitsResult } from "@/lib/types";

// The full app catalog for the public /integrations page, served by /api/integrations/catalog.
//
// Agent37 only exposes the catalog under an instance (/instances/:id/integrations/toolkits),
// but what it returns is the integration platform's global catalog - the same list for every
// instance. So this borrows a live agent's id purely to read that shared list. It connects
// nothing and reads nothing from the agent itself.
//
// WHY EACH PAGE IS CACHED ON ITS OWN. The catalog is ~50 pages of 24, and the only way through it
// is one cursor at a time. At real Agent37 latency that runs past a function's time limit, and a
// request that dies there caches nothing - so every visitor saw the curated fallback. Now every
// page lands in the Data Cache the moment it's fetched (keyed by instance + cursor), and a run
// stops itself inside TIME_BUDGET_MS and reports how far it got. The next run replays the cached
// pages instantly and carries on from there, so the catalog fills in across a few requests even
// when no single one could fetch it all.

const BASE = (process.env.AGENT37_API_BASE_URL || "https://api.agent37.com").replace(/\/$/, "");
const PAGE_SIZE = 24; // the most Agent37 returns per call
const MAX_PAGES = 200; // a runaway-cursor guard, well above the catalog's size
const TIME_BUDGET_MS = 40_000;
const PAGE_TTL_SECONDS = 60 * 60 * 24;
const DESCRIPTION_MAX = 140;

export type CatalogResult = { apps: CatalogApp[]; complete: boolean };

function trim(text: string | null): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  return t.length > DESCRIPTION_MAX ? `${t.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : t;
}

async function fetchPage(instanceId: string, cursor: string | undefined): Promise<IntegrationToolkitsResult> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  const url = `${BASE}/v1/instances/${instanceId}/integrations/toolkits?${params}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AGENT37_API_KEY ?? ""}` },
      next: { revalidate: PAGE_TTL_SECONDS, tags: ["integration-catalog"] },
    });
    if (res.ok) return (await res.json()) as IntegrationToolkitsResult;
    // One retry: across ~50 sequential calls a single transient failure is likely.
    if (attempt >= 1) throw new Error(`Agent37 ${res.status} on catalog page ${cursor ?? "first"}`);
    await new Promise((r) => setTimeout(r, 750));
  }
}

async function fetchAll(instanceId: string, deadline: number): Promise<CatalogResult> {
  const seen = new Map<string, CatalogApp>();
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    if (Date.now() > deadline) {
      console.log("[integrations-catalog] time budget reached at page", page, "apps", seen.size);
      return { apps: [...seen.values()], complete: false };
    }
    let res: IntegrationToolkitsResult;
    try {
      res = await fetchPage(instanceId, cursor);
    } catch (err) {
      console.error("[integrations-catalog] stopped at page", page, (err as Error).message);
      return { apps: [...seen.values()], complete: false };
    }
    for (const t of res.items ?? []) {
      if (!t.slug || seen.has(t.slug)) continue;
      seen.set(t.slug, { slug: t.slug, name: t.name || t.slug, description: trim(t.description) });
    }
    if (!res.nextCursor || !res.items?.length) break;
    cursor = res.nextCursor;
  }
  return { apps: [...seen.values()], complete: true };
}

/** As much of the catalog as could be read, in the platform's popularity order. */
export async function getPublicIntegrationCatalog(): Promise<CatalogResult> {
  const deadline = Date.now() + TIME_BUDGET_MS;
  const { data, error } = await createAdminClient()
    .from("agents")
    .select("agent37_id")
    .is("deleted_at", null)
    .eq("status", "running")
    // OLDEST first, not newest: the page cache is keyed by instance, so the same instance has to
    // be picked on every run for one run's pages to help the next. New agents are created all the
    // time; the oldest running one changes rarely.
    .order("created_at", { ascending: true })
    .limit(3);
  if (error) {
    console.error("[integrations-catalog] lookup failed", error.message);
    return { apps: [], complete: false };
  }
  // More than one candidate because any single instance can be mid-restart.
  let best: CatalogResult = { apps: [], complete: false };
  for (const row of data ?? []) {
    const result = await fetchAll(row.agent37_id as string, deadline);
    console.log("[integrations-catalog]", result.apps.length, "apps", result.complete ? "(complete)" : "(partial)", "via", row.agent37_id);
    if (result.apps.length > best.apps.length) best = result;
    if (best.complete || Date.now() > deadline) break;
  }
  return best;
}
