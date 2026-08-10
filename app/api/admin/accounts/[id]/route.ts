import { deleteAccountEverywhere } from "@/lib/admin-teardown";
import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/accounts/{id} — the complete removal of one account.
//
// This replaces the hand-run SQL sweeps that cleaned up every test account so far, and does
// the one thing SQL never could: delete the Agent37 VPS behind each of the account's agents.
// The rules (sole-member workspaces are torn down entirely, shared ones just lose the
// membership, platform admins are refused) live in lib/admin-teardown.ts; the response carries
// exactly what was removed plus notes for whatever must still be finished by hand - a Stripe
// subscription to cancel, an instance whose delete failed.
export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const result = await deleteAccountEverywhere(id);
  await logAudit({
    actorEmail: user.email,
    action: "account.deleted",
    target: result.email,
    metadata: { ...result },
    request,
  });
  return json(result);
});
