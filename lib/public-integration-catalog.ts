import "server-only";
import { agent37 } from "@/lib/agent37";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogApp } from "@/lib/types";

// The full app catalog for the public /integrations page, served by /api/integrations/catalog.
//
// Agent37 only exposes the catalog under an instance (/instances/:id/integrations/toolkits),
// but what it returns is the integration platform's global catalog - the same list for every
// instance. So this borrows a live agent's id purely to read that shared list. It connects
// nothing and reads nothing from the agent itself.

const PAGE_SIZE = 24; // the most Agent37 returns per call
const MAX_PAGES = 200; // a runaway-cursor guard, well above the catalog's size
const DESCRIPTION_MAX = 140;

function trim(text: string | null): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  return t.length > DESCRIPTION_MAX ? `${t.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : t;
}

async function fetchPage(instanceId: string, cursor: string | undefined) {
  try {
    return await agent37.listIntegrationToolkits(instanceId, { limit: PAGE_SIZE, cursor });
  } catch {
    // One retry: at ~50 sequential calls, a single transient failure is likely.
    await new Promise((r) => setTimeout(r, 750));
    return agent37.listIntegrationToolkits(instanceId, { limit: PAGE_SIZE, cursor });
  }
}

// Keeps whatever it collected if a later page fails - forty good pages are worth showing even
// when the forty-first isn't.
async function fetchAll(instanceId: string): Promise<CatalogApp[]> {
  const seen = new Map<string, CatalogApp>();
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    let res;
    try {
      res = await fetchPage(instanceId, cursor);
    } catch (err) {
      console.error("[integrations-catalog] stopped at page", page, (err as Error).message);
      break;
    }
    for (const t of res.items) {
      if (!t.slug || seen.has(t.slug)) continue;
      seen.set(t.slug, { slug: t.slug, name: t.name || t.slug, description: trim(t.description) });
    }
    if (!res.nextCursor) break;
    cursor = res.nextCursor;
  }
  return [...seen.values()];
}

/** The full catalog in the platform's popularity order, or null if it can't be read right now. */
export async function getPublicIntegrationCatalog(): Promise<CatalogApp[] | null> {
  const { data, error } = await createAdminClient()
    .from("agents")
    .select("agent37_id")
    .is("deleted_at", null)
    .eq("status", "running")
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) {
    console.error("[integrations-catalog] lookup failed", error.message);
    return null;
  }
  // More than one candidate because any single instance can be mid-restart.
  for (const row of data ?? []) {
    const apps = await fetchAll(row.agent37_id as string);
    console.log("[integrations-catalog] loaded", apps.length, "apps via", row.agent37_id);
    if (apps.length) return apps;
  }
  return null;
}
