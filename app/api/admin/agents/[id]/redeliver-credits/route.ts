import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliverPendingCredits } from "@/lib/credits";
import { ApiError, json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// TEMP admin: re-run credit delivery for this agent's workspace, then show the resulting budget.
// Re-applies a top-up that was marked delivered BEFORE the write-field fix (topup_micros ->
// credit_micros) but never actually landed on the runtime. Idempotent: addCredit reads the
// current credit and adds, so a row already reflected on the instance is a no-op. Platform-admin
// only, removed alongside budget-raw once the credit path is confirmed.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;

  const db = createAdminClient();
  const { data: agent } = await db
    .from("agents")
    .select("workspace_id")
    .eq("agent37_id", id)
    .maybeSingle();
  if (!agent?.workspace_id) throw new ApiError(404, "not_found", "No agent with that id.");

  const redeliver = await deliverPendingCredits(agent.workspace_id as string);
  const budget = await agent37
    .getBudget(id)
    .catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));

  return json({ agent37_id: id, redeliver, budget });
});
