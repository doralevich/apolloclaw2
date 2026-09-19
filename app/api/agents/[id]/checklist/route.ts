import { loadAgentAnswers } from "@/lib/agent-answers";
import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChecklist } from "@/config/checklist";

type Ctx = { params: Promise<{ id: string }> };

// One agent's setup checklist: the generated item list, plus which of them have been ticked.
//
// Service-role behind requireAgentAccess, the same as every other agent-scoped table here.
//
// The item list is BUILT ON READ rather than stored. It comes from the customer's questionnaire
// answers, which already live in agent_setup — so generating each time means editing the copy in
// config/checklist.ts is a deploy rather than a backfill, and a customer who never answered gets
// the generic list without a row anywhere saying so.
//
// The agent_setup lookup itself moved to lib/agent-answers.ts when the connect flow needed the
// same row to work out which email suite the customer runs on.

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const db = createAdminClient();
  const answers = await loadAgentAnswers(db, id);

  const { data, error } = await db
    .from("agent_checklist_items")
    .select("item")
    .eq("agent37_id", id);
  if (error) throw new Error(error.message);

  return json({
    items: buildChecklist(answers),
    // Only the self-reported ones live here. Anything derived is computed in the browser from
    // the connections/channels/sessions it already loads, so this never disagrees with what the
    // Connections page is showing on the same screen.
    done: (data ?? []).map((r) => r.item as string),
    // Whether this customer's list is personal or the generic fallback. The UI says so, because
    // "we built this from your answers" is only worth claiming when it is true.
    personalized: !!answers,
  });
});

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { user } = await requireAgentAccess(id, "member");

  const body = await readJson<{ item?: string }>(request);
  const item = (body.item || "").trim();
  if (!item) throw new ApiError(400, "invalid_request", "item is required");

  const db = createAdminClient();
  // Idempotent: ticking something already ticked is a no-op rather than a 409. The client fires
  // this optimistically and a double-click must not surface an error.
  const { error } = await db
    .from("agent_checklist_items")
    .upsert({ agent37_id: id, item, done_by: user.id }, { onConflict: "agent37_id,item" });
  if (error) throw new Error(error.message);

  return json({ ok: true });
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const item = new URL(request.url).searchParams.get("item");
  if (!item) throw new ApiError(400, "invalid_request", "item is required");

  const db = createAdminClient();
  const { error } = await db
    .from("agent_checklist_items")
    .delete()
    .eq("agent37_id", id)
    .eq("item", item);
  if (error) throw new Error(error.message);

  return json({ ok: true });
});
