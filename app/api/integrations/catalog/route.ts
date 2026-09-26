import { getPublicIntegrationCatalog } from "@/lib/public-integration-catalog";

// Public: the full app catalog for the /integrations directory.
//
// A complete catalog is cached at the CDN for an hour and served stale while it refreshes. A
// partial one (the run hit its time budget; see lib/public-integration-catalog.ts) is cached only
// briefly and marked complete: false, and the page asks again - each run replays the pages the
// last one cached and gets further, so the catalog fills in over a few requests.
//
// Deliberately a route handler rather than a fetch inside the page: fetching the catalog while
// rendering made /integrations wait on the whole thing (and, pre-rendered, silently fall back).
export const maxDuration = 60;

export async function GET() {
  const result = await getPublicIntegrationCatalog().catch((err: Error) => {
    console.error("[integrations-catalog] failed", err.message);
    return { apps: [], complete: false };
  });
  return Response.json(result, {
    headers: {
      "Cache-Control": result.complete
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "public, s-maxage=5",
    },
  });
}
