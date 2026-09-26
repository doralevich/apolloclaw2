import { getPublicIntegrationCatalog } from "@/lib/public-integration-catalog";

// Public: the full app catalog for the /integrations directory. Paging through it is ~50
// sequential Agent37 calls, so the response is cached at the CDN for an hour and served stale
// while it refreshes - visitors hit the cache, not Agent37.
//
// Deliberately a route handler rather than a fetch inside the page: the Agent37 client uses
// no-store fetches, and inside a pre-rendered page that throws Next's "go dynamic" signal, which
// a try/catch then swallows - the page shipped the curated fallback for exactly that reason.
export const maxDuration = 300;

export async function GET() {
  const apps = await getPublicIntegrationCatalog().catch((err: Error) => {
    console.error("[integrations-catalog] failed", err.message);
    return null;
  });
  return Response.json(
    { apps: apps ?? [] },
    {
      headers: {
        // A failed read is cached only briefly, so the next visitor retries soon.
        "Cache-Control": apps?.length
          ? "public, s-maxage=3600, stale-while-revalidate=86400"
          : "public, s-maxage=60",
      },
    }
  );
}
