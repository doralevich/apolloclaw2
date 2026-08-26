import "server-only";
import { agent37, Agent37Error } from "@/lib/agent37";
import { purgeAgentRows } from "@/lib/admin-teardown";
import { logAudit } from "@/lib/audit";
import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createAdminClient>;

// Deleting an agent, made reversible.
//
// The old delete destroyed both halves of an agent at once and for good: the `agents` row was
// dropped and the Agent37 VPS deleted in the same handler. There was no window in which anyone
// could change their mind, and no copy of the one part that can't be rebuilt - the instance, with
// its files, memory and connected mailboxes. A paying customer lost their agent that way.
//
// So delete is now two stages with a gap between them:
//
//   softDeleteAgent - stamp deleted_at (+ who/why + purge_after), and STOP the VPS rather than
//   destroy it. The row survives, hidden from the product by the `deleted_at is null` filters the
//   read paths carry; the instance survives, stopped, ready to start again.
//
//   purgeAgent - the real teardown (agent37.deleteAgent + row/child cleanup), run by the purge
//   cron once purge_after has passed, or by an admin who chooses to skip the wait.
//
// restoreAgent undoes a soft-delete inside the window: clear the stamps, start the instance.
//
// NOTE ON BILLING: a *stopped* Agent37 instance is kept, not deleted, for the whole retention
// window. Whether Agent37 still bills hosting for a stopped instance is not documented in their
// API and must be confirmed; if it does, RETENTION_DAYS is the dial that trades safety for cost.

/** How long a soft-deleted agent is kept before the purge cron may destroy it for good. */
export const RETENTION_DAYS = 30;

function purgeAfterFrom(nowMs: number): string {
  return new Date(nowMs + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export interface SoftDeleteOptions {
  workspaceId: string;
  deletedBy?: string | null;
  actorEmail?: string | null;
  reason?: string | null;
  request?: Request | null;
}

/**
 * Soft-delete one agent: stop its instance and stamp the row so the product treats it as gone
 * while it stays fully restorable. Idempotent - a row already soft-deleted is left as it is.
 * Returns the purge_after timestamp and whether the instance was actually stopped (a ghost whose
 * instance was already gone reports false, and that is fine - there is nothing to stop).
 */
export async function softDeleteAgent(
  db: Db,
  agent37Id: string,
  opts: SoftDeleteOptions
): Promise<{ purgeAfter: string; stopped: boolean }> {
  const now = Date.now();
  const purgeAfter = purgeAfterFrom(now);

  // Stop, don't destroy. A 404 means the instance is already gone (a ghost row) - not an error
  // here, since the goal is only "this agent is no longer running". Any other Agent37 failure is
  // recorded in the audit metadata but does not block the soft-delete: the row must still be
  // stamped so the product stops showing a running agent.
  let stopped = false;
  let stopError: string | undefined;
  try {
    await agent37.stop(agent37Id);
    stopped = true;
  } catch (e) {
    if (!(e instanceof Agent37Error && e.status === 404)) stopError = (e as Error).message;
  }

  const { error } = await db
    .from("agents")
    .update({
      deleted_at: new Date(now).toISOString(),
      deleted_by: opts.deletedBy ?? null,
      delete_reason: opts.reason ?? null,
      purge_after: purgeAfter,
    })
    .eq("agent37_id", agent37Id)
    .is("deleted_at", null);
  if (error) throw new ApiError(500, "db_error", `agents: ${error.message}`);

  await logAudit({
    actorEmail: opts.actorEmail,
    action: "agent.deleted",
    target: agent37Id,
    metadata: {
      soft: true,
      workspace_id: opts.workspaceId,
      purge_after: purgeAfter,
      vps_stopped: stopped,
      ...(stopError ? { stop_error: stopError } : {}),
      ...(opts.reason ? { reason: opts.reason } : {}),
    },
    request: opts.request,
  });

  return { purgeAfter, stopped };
}

/**
 * Restore a soft-deleted agent inside its retention window: clear the stamps and start the
 * instance back up. Throws 404 if the id names no soft-deleted agent (already purged, never
 * deleted, or a bad id). Best-effort on the start - the row is live again either way, and a
 * failed start is reported so an admin can retry from the instance controls.
 */
export async function restoreAgent(
  db: Db,
  agent37Id: string,
  opts: { actorEmail?: string | null; request?: Request | null }
): Promise<{ started: boolean; startError?: string }> {
  const { data, error } = await db
    .from("agents")
    .update({ deleted_at: null, deleted_by: null, delete_reason: null, purge_after: null })
    .eq("agent37_id", agent37Id)
    .not("deleted_at", "is", null)
    .select("workspace_id")
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", `agents: ${error.message}`);
  if (!data) throw new ApiError(404, "not_found", "No deleted agent with that id to restore.");

  let started = false;
  let startError: string | undefined;
  try {
    await agent37.start(agent37Id);
    started = true;
  } catch (e) {
    startError = (e as Error).message;
  }

  await logAudit({
    actorEmail: opts.actorEmail,
    action: "agent.restored",
    target: agent37Id,
    metadata: {
      workspace_id: data.workspace_id,
      vps_started: started,
      ...(startError ? { start_error: startError } : {}),
    },
    request: opts.request,
  });

  return { started, ...(startError ? { startError } : {}) };
}

/**
 * Purge one agent for good: destroy the VPS, then delete every row keyed to it. This is the
 * irreversible half, run by the purge cron after the retention window or by an admin skipping it.
 * A 404 from Agent37 (instance already gone) counts as deleted - the goal is "no longer exists".
 */
export async function purgeAgent(
  db: Db,
  agent37Id: string,
  opts: { actorEmail?: string | null; request?: Request | null; reason?: string } = {}
): Promise<{ vpsDeleted: boolean }> {
  let vpsDeleted = false;
  try {
    await agent37.deleteAgent(agent37Id);
    vpsDeleted = true;
  } catch (e) {
    if (!(e instanceof Agent37Error && e.status === 404)) throw e;
  }

  await purgeAgentRows(db, agent37Id);

  await logAudit({
    actorEmail: opts.actorEmail,
    action: "agent.purged",
    target: agent37Id,
    metadata: { vps_deleted: vpsDeleted, ...(opts.reason ? { reason: opts.reason } : {}) },
    request: opts.request,
  });

  return { vpsDeleted };
}
