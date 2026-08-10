import "server-only";
import { agent37, Agent37Error } from "@/lib/agent37";
import { isAdminEmail } from "@/config/admins";
import { findHostingSeat } from "@/lib/hosting-seats";
import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createAdminClient>;

// Complete removal, as code instead of as a SQL session.
//
// Every test-account cleanup so far has been David asking for a sweep and someone running
// sixteen DELETE statements against production by hand. That worked, but it also meant the
// sweep lived in nobody's head but the person who last typed it, and it could never touch the
// half that matters most: the Agent37 VPS behind each agent, which only the deployment's API
// key can delete. Both halves live here now, and the Super Admin UI calls this instead.
//
// The failure contract is deliberate: a dead Agent37 instance (404) is SUCCESS - the goal is
// "this agent no longer exists", and half of these deletes are cleaning up after an instance
// that already vanished upstream. Any other Agent37 failure is recorded and the local purge
// continues anyway, because an account deletion must not be blocked by a hosting hiccup; the
// notes in the result tell the operator what to finish by hand.

/** Delete the instance behind an agent. True = gone now, false = was already gone. */
async function deleteInstance(agent37Id: string): Promise<boolean> {
  try {
    await agent37.deleteAgent(agent37Id);
    return true;
  } catch (e) {
    if (e instanceof Agent37Error && e.status === 404) return false;
    throw e;
  }
}

/** Every row keyed by one agent's instance id, then the agent row itself. */
export async function purgeAgentRows(db: Db, agent37Id: string): Promise<void> {
  // Children first. No FKs enforce this order, but it means a crash mid-purge leaves an agent
  // that still shows up (and can be purged again) rather than orphaned child rows nothing lists.
  for (const table of [
    "agent_channels",
    "agent_checklist_items",
    "agent_schedules",
    "chat_session_titles",
    "credit_settings",
    "agent_setup",
  ] as const) {
    const { error } = await db.from(table).delete().eq("agent37_id", agent37Id);
    if (error) throw new ApiError(500, "db_error", `${table}: ${error.message}`);
  }
  const { error } = await db.from("agents").delete().eq("agent37_id", agent37Id);
  if (error) throw new ApiError(500, "db_error", `agents: ${error.message}`);
}

export interface AccountTeardownResult {
  email: string;
  /** Workspace names fully removed (the account was their only member). */
  workspaces_deleted: string[];
  /** Shared workspaces the account was only removed FROM. */
  memberships_removed: string[];
  /** Instance ids deleted (VPS and rows). */
  agents_deleted: string[];
  /** Things the operator must finish by hand - Stripe subscriptions, failed VPS deletes. */
  notes: string[];
}

/**
 * Delete an account and everything that is only its: sole-member workspaces are torn down
 * completely (agents' VPSes included); shared workspaces just lose the membership. Refuses
 * platform admins so the god-view can never delete its own operators.
 */
export async function deleteAccountEverywhere(userId: string): Promise<AccountTeardownResult> {
  const db = createAdminClient();

  const { data: got, error: getErr } = await db.auth.admin.getUserById(userId);
  if (getErr || !got?.user?.email) {
    throw new ApiError(404, "not_found", "No such account.");
  }
  const email = got.user.email.trim().toLowerCase();
  if (isAdminEmail(email)) {
    throw new ApiError(403, "forbidden", "Platform admins can't be deleted from here. Remove the email from config/admins.ts first.");
  }

  const result: AccountTeardownResult = {
    email,
    workspaces_deleted: [],
    memberships_removed: [],
    agents_deleted: [],
    notes: [],
  };

  const { data: mems, error: memErr } = await db
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId);
  if (memErr) throw new ApiError(500, "db_error", memErr.message);

  for (const m of mems ?? []) {
    const wid = m.workspace_id as string;
    const { data: ws } = await db.from("workspaces").select("name").eq("id", wid).maybeSingle();
    const wsName = (ws?.name as string | undefined) ?? wid;

    const { count: others } = await db
      .from("memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", wid)
      .neq("user_id", userId);

    if ((others ?? 0) > 0) {
      // Someone else still lives here - take only this account's key to the door.
      await db.from("memberships").delete().eq("workspace_id", wid).eq("user_id", userId);
      result.memberships_removed.push(wsName);
      continue;
    }

    // Sole member: the whole workspace goes. Billing is CHECKED before anything is deleted,
    // because finding the subscription resolves through the owner's email - which stops
    // existing the moment the auth user is removed below.
    try {
      const seat = await findHostingSeat(wid);
      if (seat) {
        result.notes.push(
          `Stripe: cancel subscription ${seat.subscriptionId} (hosting x${seat.quantity}) for "${wsName}" - deletion never touches billing.`
        );
      }
    } catch {
      result.notes.push(`Stripe: could not check "${wsName}" for a hosting subscription - verify by hand.`);
    }

    const { data: agents } = await db.from("agents").select("agent37_id").eq("workspace_id", wid);
    for (const a of agents ?? []) {
      const id = a.agent37_id as string;
      try {
        await deleteInstance(id);
      } catch (e) {
        result.notes.push(`Agent37: deleting instance ${id} failed (${(e as Error).message}) - delete it in the Agent37 dashboard.`);
      }
      await purgeAgentRows(db, id);
      result.agents_deleted.push(id);
    }

    for (const table of ["credit_settings", "wallet_transactions", "agent_setup", "invitations", "memberships"] as const) {
      const { error } = await db.from(table).delete().eq("workspace_id", wid);
      if (error) throw new ApiError(500, "db_error", `${table}: ${error.message}`);
    }
    const { error: wsErr } = await db.from("workspaces").delete().eq("id", wid);
    if (wsErr) throw new ApiError(500, "db_error", `workspaces: ${wsErr.message}`);
    result.workspaces_deleted.push(wsName);
  }

  // Rows keyed by identity rather than workspace. Two entitlement deletes (email, then
  // user_id) instead of one .or() - nothing here is worth a PostgREST quoting bug.
  await db.from("entitlements").delete().eq("email", email);
  await db.from("entitlements").delete().eq("user_id", userId);
  await db.from("license_password_claims").delete().eq("user_id", userId);
  await db.from("onboarding_emails").delete().eq("email", email);
  await db.from("onboarding_milestones").delete().eq("email", email);

  // Agents they owned in workspaces that survive (shared ones): the agent stays - it belongs
  // to the workspace - but must not point at an id that no longer resolves to anyone.
  await db.from("agents").update({ owner_id: null }).eq("owner_id", userId);

  const { error: delErr } = await db.auth.admin.deleteUser(userId);
  if (delErr) throw new ApiError(500, "db_error", `auth delete: ${delErr.message}`);

  return result;
}
