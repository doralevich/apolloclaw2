import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { getStripe } from "@/lib/stripe/client";
import { seedStripeCatalog } from "@/lib/stripe/seed-catalog";

// /api/admin/stripe/sync — run the idempotent catalog seed against whatever
// STRIPE_SECRET_KEY the deployment carries. This is how the catalog gets synced on
// production (live key) without shelling into the box; the CLI twin is
// scripts/seed-stripe-catalog.mjs. Platform admins only.
//
// Answers GET as well as POST so a logged-in admin can run it by simply visiting the
// URL in a browser — the sync is idempotent, so a repeated GET is harmless.
const sync = route(async () => {
  await requirePlatformAdmin();
  const results = await seedStripeCatalog(getStripe());
  return json({ synced: results.length, results });
});

export const POST = sync;
export const GET = sync;
