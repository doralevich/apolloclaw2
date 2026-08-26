import { NextResponse } from "next/server";
import { purgeAgent } from "@/lib/agent-lifecycle";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/cron/purge-agents — daily, from vercel.json.
//
// The back half of soft-delete. When an agent is deleted it is stamped with a `purge_after`
// timestamp (now + retention window) and its instance is STOPPED, not destroyed - so it can be
// restored. This job is what finally destroys the ones nobody brought back: every soft-deleted
// row whose `purge_after` has passed gets the real teardown (agent37.deleteAgent + row/child
// cleanup), logged as `agent.purged`.
//
// It does NOT touch hosting seats: the seat was already credited when the agent was soft-deleted,
// so the customer stopped paying then, not now. Purge only removes what is left.
//
// Same auth contract as the other crons: Vercel sends `Authorization: Bearer $CRON_SECRET`. This
// route deletes customer infrastructure, so it refuses to run without that header - and refuses,
// loudly, if CRON_SECRET was never set.

export const maxDuration = 300;

export const GET = route(async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron:purge-agents] CRON_SECRET is not set - refusing to run");
    return NextResponse.json({ error: "cron not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const nowIso = new Date().toISOString();

  // Only rows actually in the trash AND past their window. A null purge_after (shouldn't happen
  // for a soft-deleted row, but belt-and-braces) is never swept.
  const { data: due, error } = await db
    .from("agents")
    .select("agent37_id")
    .not("deleted_at", "is", null)
    .not("purge_after", "is", null)
    .lte("purge_after", nowIso);
  if (error) {
    console.error("[cron:purge-agents] could not read due agents:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const ids = (due ?? []).map((r) => r.agent37_id as string);
  let purged = 0;
  const failures: { id: string; error: string }[] = [];

  // Sequential, not concurrent: each purge hits the Agent37 control plane, and a burst of DELETEs
  // is exactly the kind of thing a rate limiter rejects. The set is small (only what expired in a
  // day), so serial is fine and kinder to the upstream.
  for (const id of ids) {
    try {
      await purgeAgent(db, id, { reason: "retention window elapsed" });
      purged += 1;
    } catch (e) {
      // One bad purge (a hung instance, a transient 5xx) must not strand the rest - it stays in
      // the trash, still past its window, and the next run tries it again.
      const message = (e as Error).message;
      console.error("[cron:purge-agents] purge failed, will retry next run:", id, message);
      failures.push({ id, error: message });
    }
  }

  return json({ ok: true, due: ids.length, purged, failures });
});
