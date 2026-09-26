import "server-only";
import { agent37 } from "@/lib/agent37";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogApp } from "@/lib/types";

// The full app catalog for the public /integrations page.
//
// Agent37 only exposes the catalog under an instance (/instances/:id/integrations/toolkits),
// but what it returns is the integration platform's global catalog - the same list for every
// instance. So the public page borrows a live agent's id purely to read that shared list. It
// connects nothing and reads nothing from the agent itself.

const PAGE_SIZE = 24; // the most Agent37 returns per call
const MAX_PAGES = 200; // a runaway-cursor guard, well above the catalog's size
const DESCRIPTION_MAX = 140;

function trim(text: string | null): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  return t.length > DESCRIPTION_MAX ? `${t.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : t;
}

async function fetchAll(instanceId: string): Promise<CatalogApp[]> {
  const seen = new Map<string, CatalogApp>();
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await agent37.listIntegrationToolkits(instanceId, { limit: PAGE_SIZE, cursor });
    for (const t of res.items) {
      if (!t.slug || seen.has(t.slug)) continue;
      seen.set(t.slug, { slug: t.slug, name: t.name || t.slug, description: trim(t.description) });
    }
    if (!res.nextCursor) break;
    cursor = res.nextCursor;
  }
  return [...seen.values()];
}

/** The full catalog in the platform's popularity order, or null if it can't be read right now
 *  (the page then shows the curated list alone). */
export async function getPublicIntegrationCatalog(): Promise<CatalogApp[] | null> {
  try {
    const { data } = await createAdminClient()
      .from("agents")
      .select("agent37_id")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3);
    // More than one candidate because any single instance can be mid-restart or stopped.
    for (const row of data ?? []) {
      try {
        const apps = await fetchAll(row.agent37_id as string);
        if (apps.length) return apps;
      } catch (err) {
        console.error("[integrations-catalog] instance failed", row.agent37_id, (err as Error).message);
      }
    }
  } catch (err) {
    console.error("[integrations-catalog] lookup failed", (err as Error).message);
  }
  return null;
}
