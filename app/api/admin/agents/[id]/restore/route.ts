import { after } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin";
import { restoreAgent } from "@/lib/agent-lifecycle";
import { changeHostingSeats } from "@/lib/hosting-seats";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/restore — bring a soft-deleted agent back inside its window.
//
// Clears the trash stamps and starts the instance again (see lib/agent-lifecycle.ts). The one
// subtlety is the hosting seat: soft-delete credited one back iff the workspace still had another
// live agent, so restore must re-add one under exactly the same condition - otherwise a restored
// agent runs on a seat nobody is paying for. The condition is read BEFORE restoring, while this
// agent is still soft-deleted, so "live agents in the workspace" is precisely "the others".
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { data: row } = await db
    .from("agents")
    .select("workspace_id")
    .eq("agent37_id", id)
    .not("deleted_at", "is", null)
    .maybeSingle();
  const workspaceId = (row?.workspace_id as string | undefined) ?? undefined;

  let hadLiveSibling = false;
  if (workspaceId) {
    const { count } = await db
      .from("agents")
      .select("agent37_id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null);
    hadLiveSibling = (count ?? 0) >= 1;
  }

  const result = await restoreAgent(db, id, { actorEmail: user.email, request });

  // Mirror of the soft-delete seat credit: re-add the seat only when the delete had credited one.
  if (workspaceId && hadLiveSibling) {
    after(async () => {
      try {
        const seats = await changeHostingSeats(workspaceId, 1);
        console.log("[admin:agents:restore] hosting seat re-added", workspaceId, "->", seats);
      } catch (err) {
        console.error("[admin:agents:restore] seat re-add FAILED - workspace may be under-billed:", workspaceId, err);
      }
    });
  }

  return json({ id, restored: true, ...result });
});
