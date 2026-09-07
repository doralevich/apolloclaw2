import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { fingerprint } from "@/lib/agent-tasks";

type Ctx = { params: Promise<{ id: string }> };

// One agent's open work.
//
// Most of it is written by the schedule sweep rather than from here - a scheduled report already
// names what needs its owner, and lib/agent-tasks keeps that instead of letting it scroll away.
// This is the customer's side: read the list, tick things off, add one the agent did not think of.

type TaskRow = {
  id: number;
  title: string;
  detail: string | null;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

function toApi(row: TaskRow) {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
  };
}

// Open by default, because that is the list. `?status=done` for what has been cleared - kept
// bounded, since the honest use for closed tasks is "what did we get through this week" rather
// than an archive anyone scrolls.
export const GET = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const wanted = new URL(request.url).searchParams.get("status") ?? "open";
  if (!["open", "done", "dismissed"].includes(wanted)) {
    throw new ApiError(400, "invalid_request", "Unknown status");
  }

  const { data, error } = await createAdminClient()
    .from("agent_tasks")
    .select("*")
    .eq("agent37_id", id)
    .eq("status", wanted)
    .order("created_at", { ascending: false })
    .limit(wanted === "open" ? 100 : 30);
  if (error) throw new Error(error.message);

  return json({ tasks: ((data ?? []) as TaskRow[]).map(toApi) });
});

// One the agent did not think of. Same table and same dedupe as the generated ones, so adding a
// task by hand that the morning brief then surfaces does not produce two rows.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const body = await readJson<{ title?: string; detail?: string }>(request);
  const title = (body.title ?? "").trim();
  if (!title) throw new ApiError(400, "invalid_request", "Say what needs doing");
  if (title.length > 300) throw new ApiError(400, "invalid_request", "Keep it under 300 characters");

  const fp = fingerprint(title);
  if (!fp) throw new ApiError(400, "invalid_request", "Give it some words");

  const { data, error } = await createAdminClient()
    .from("agent_tasks")
    .upsert(
      {
        agent37_id: id,
        title,
        detail: (body.detail ?? "").trim() || null,
        fingerprint: fp,
        source: "manual",
        status: "open",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agent37_id,fingerprint" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);

  return json(toApi(data as TaskRow));
});

// Tick it off, or put it back. PATCH rather than DELETE because a cleared task is not gone: it is
// the only record we keep of what actually got done, and "what did my agent help me get through"
// is the question this whole surface exists to answer.
export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const body = await readJson<{ id?: number; status?: string }>(request);
  if (typeof body.id !== "number") throw new ApiError(400, "invalid_request", "id is required");
  if (!body.status || !["open", "done", "dismissed"].includes(body.status)) {
    throw new ApiError(400, "invalid_request", "status must be open, done or dismissed");
  }

  const { data, error } = await createAdminClient()
    .from("agent_tasks")
    .update({
      status: body.status,
      // Reopening clears the closed stamp, so the column always means what it says rather than
      // "when it was last closed, maybe".
      closed_at: body.status === "open" ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    // Scoped to the agent as well as the id: without it, any member of any workspace could close
    // a row belonging to somebody else's agent by guessing a number.
    .eq("agent37_id", id)
    .eq("id", body.id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new ApiError(404, "not_found", "No such task");

  return json(toApi(data as TaskRow));
});
