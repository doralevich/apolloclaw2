import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { getStripe } from "@/lib/stripe/client";
import { seedStripeCatalog } from "@/lib/stripe/seed-catalog";

// POST /api/admin/stripe/sync — run the idempotent catalog seed against whatever
// STRIPE_SECRET_KEY the deployment carries. This is how the catalog gets synced on
// production (live key) without shelling into the box; the CLI twin is
// scripts/seed-stripe-catalog.mjs. Platform admins only.
export const POST = route(async () => {
  await requirePlatformAdmin();
  const results = await seedStripeCatalog(getStripe());
  return json({ synced: results.length, results });
});
