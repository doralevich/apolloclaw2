import { requirePlatformAdmin } from "@/lib/admin";
import { isAdminEmail } from "@/config/admins";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminAccount } from "@/lib/types";

const MIN_PASSWORD = 8;

// GET /api/admin/accounts — every registered account, with what hangs off it.
//
// "All the email addresses that are in the current database. Where can I see them." The
// answer used to be the Supabase dashboard; now it's the Accounts tab of the god-view, which
// this route feeds. One row per auth user: identity, when they registered and last signed in,
// entitlement, and each workspace they belong to with its member/agent counts - enough to
// decide "is this a customer or a leftover test account" without leaving the page.
//
// Full-table reads on memberships/workspaces/agents/entitlements are fine at this scale: the
// platform is allowlist-sized, and the god-view already lists workspaces the same way.

/** Every auth user, paged. Stops on an EMPTY page, not a short one - GoTrue may cap perPage. */
async function listAllUsers(db: ReturnType<typeof createAdminClient>) {
  const out: {
    id: string;
    email: string;
    first: string;
    last: string;
    created_at: string;
    last_sign_in_at: string | null;
  }[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new ApiError(500, "db_error", `listUsers page ${page}: ${error.message}`);
    const batch = data?.users ?? [];
    if (batch.length === 0) break;
    for (const u of batch) {
      const email = (u.email || "").trim().toLowerCase();
      if (!email) continue;
      const meta = (u.user_metadata ?? {}) as {
        first_name?: string;
        last_name?: string;
        full_name?: string;
        name?: string;
      };
      const full = String(meta.full_name || meta.name || "").trim();
      out.push({
        id: u.id,
        email,
        first: meta.first_name || full.split(/\s+/)[0] || "",
        last: meta.last_name || full.split(/\s+/).slice(1).join(" ") || "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      });
    }
  }
  return out;
}

export const GET = route(async () => {
  await requirePlatformAdmin();
  const db = createAdminClient();

  const [users, memsRes, wsRes, agentsRes, entsRes] = await Promise.all([
    listAllUsers(db),
    db.from("memberships").select("workspace_id, user_id, role"),
    db.from("workspaces").select("id, name"),
    db.from("agents").select("agent37_id, workspace_id, name, owner_id").is("deleted_at", null),
    db.from("entitlements").select("email, user_id, status, grace_until"),
  ]);
  for (const res of [memsRes, wsRes, agentsRes, entsRes]) {
    if (res.error) throw new ApiError(500, "db_error", res.error.message);
  }

  const wsName = new Map((wsRes.data ?? []).map((w) => [w.id as string, w.name as string]));
  const wsMembers = new Map<string, number>();
  for (const m of memsRes.data ?? []) {
    wsMembers.set(m.workspace_id, (wsMembers.get(m.workspace_id) ?? 0) + 1);
  }
  const wsAgents = new Map<string, number>();
  for (const a of agentsRes.data ?? []) {
    wsAgents.set(a.workspace_id, (wsAgents.get(a.workspace_id) ?? 0) + 1);
  }

  const accounts: AdminAccount[] = users.map((u) => {
    const memberships = (memsRes.data ?? []).filter((m) => m.user_id === u.id);
    const ent = (entsRes.data ?? []).find((e) => e.user_id === u.id || e.email === u.email);
    return {
      id: u.id,
      email: u.email,
      first_name: u.first,
      last_name: u.last,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_platform_admin: isAdminEmail(u.email),
      entitlement: (ent?.status as string | undefined) ?? null,
      grace_until: (ent?.grace_until as string | null | undefined) ?? null,
      workspaces: memberships.map((m) => ({
        id: m.workspace_id as string,
        name: wsName.get(m.workspace_id) ?? m.workspace_id,
        role: m.role as string,
        member_count: wsMembers.get(m.workspace_id) ?? 0,
        agent_count: wsAgents.get(m.workspace_id) ?? 0,
      })),
      agents_owned: (agentsRes.data ?? [])
        .filter((a) => a.owner_id === u.id)
        .map((a) => ({ agent37_id: a.agent37_id as string, name: (a.name as string | null) ?? null })),
    };
  });

  // Newest first, same as the workspace list.
  accounts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return json({ accounts });
});

// POST /api/admin/accounts { email, password, firstName?, lastName? } — create a login for a
// client by hand, so a white-glove setup doesn't wait on them registering. Created already
// email-confirmed, which fires the signup trigger and gives them an active entitlement, so they
// can sign in immediately. The admin sets the password and hands it to the client directly - the
// reliable path when the client's corporate mail blocks our email.
export const POST = route(async (request: Request) => {
  const { user } = await requirePlatformAdmin();
  const { email, password, firstName, lastName } = await readJson<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>(request);

  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanEmail) throw new ApiError(400, "invalid_request", "email is required");
  if (!password || password.length < MIN_PASSWORD) {
    throw new ApiError(400, "invalid_request", `password must be at least ${MIN_PASSWORD} characters`);
  }

  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: {
      ...(first ? { first_name: first } : {}),
      ...(last ? { last_name: last } : {}),
      ...(full ? { full_name: full } : {}),
    },
  });
  if (error) {
    // GoTrue returns a 422 for an address that already has an account.
    const already = /already|registered|exists/i.test(error.message);
    throw new ApiError(already ? 409 : 500, already ? "conflict" : "db_error",
      already ? `An account already exists for ${cleanEmail}.` : error.message);
  }

  await logAudit({
    actorEmail: user.email,
    action: "account.created",
    target: cleanEmail,
    metadata: { user_id: data.user?.id },
    request,
  });

  return json({ id: data.user?.id, email: cleanEmail }, 201);
});
