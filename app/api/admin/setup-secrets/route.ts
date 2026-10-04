import { requirePlatformAdmin } from "@/lib/admin";
import { listSetupSecrets } from "@/lib/setup-secrets";
import { json, route } from "@/lib/http";

// GET /api/admin/setup-secrets - every /setup submission, newest first, with which credentials
// each holds and none of their values. Values come only from the reveal route, one at a time.
export const GET = route(async () => {
  await requirePlatformAdmin();
  return json({ submissions: await listSetupSecrets() });
});
