import { after } from "next/server";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";
import { deliverPendingCredits, listCreditPurchases } from "@/lib/credits";

// GET /api/credits?workspace_id=...
//
// Purchase history for the Credits tab. Reading it also nudges any undelivered purchase: if
// the runtime was unreachable when the webhook fired, the row is still pending, and the
// customer opening this page is exactly the moment we should try again. The retry runs after
// the response so it never delays the list, and it is idempotent, so a customer refreshing
// the page can't double-grant anything.
export const GET = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const workspaceId = new URL(request.url).searchParams.get("workspace_id");
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace_id is required");
  await requireMember(supabase, workspaceId, user.id);

  const purchases = await listCreditPurchases(workspaceId);
  const pending = purchases.filter((p) => p.status !== "delivered").length;
  if (pending > 0) after(() => deliverPendingCredits(workspaceId));

  return json({ purchases });
});
