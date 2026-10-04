import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { revealSetupSecrets } from "@/lib/setup-secrets";
import { ApiError, json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/setup-secrets/{id}/reveal - one submission's credentials, decrypted. Platform
// admins only, and every reveal is written to the audit log (who, whose, when), so "who has seen
// this client's keys" always has an answer. POST rather than GET so a key never lands in a
// browser history or a prefetch.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new ApiError(400, "invalid_request", "Unknown submission.");
  const found = await revealSetupSecrets(n);
  if (!found) throw new ApiError(404, "not_found", "That submission is not here.");
  await logAudit({
    actorEmail: user.email,
    action: "setup_secrets.revealed",
    target: found.email,
    metadata: { submission: n, fields: found.values.map((v) => v.label) },
    request,
  });
  return json(found);
});
