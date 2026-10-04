import { requirePlatformAdmin } from "@/lib/admin";
import { readInstanceRoster } from "@/lib/instance-roster";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/agents/{id}/roster - the agents living on a customer's instance, for the
// Customers tab. The customer roster route requires membership in the workspace, which a
// platform admin deliberately isn't, so this is the same read behind the platform-admin gate.
// Read-only: one exec that reads the config, nothing written.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  return json(await readInstanceRoster(id));
});
