import { deleteAccountEverywhere } from "@/lib/admin-teardown";
import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { graceUntilIso } from "@/lib/entitlement";

type Ctx = { params: Promise<{ id: string }> };

// The three levers David has over an account's access, and what each writes. Kept here (not in
// the client) so the grace math is the same one the webhook and gate use.
//   live       — full access, no grace window.
//   grace      — open a fresh 10-day grace window (what a Stripe cancel does automatically).
//   deactivate — lock now, no grace.
const ENTITLEMENT_ACTIONS = {
  live: () => ({ status: "active", grace_until: null }),
  grace: () => ({ status: "canceled", grace_until: graceUntilIso() }),
  deactivate: () => ({ status: "inactive", grace_until: null }),
} as const;
type EntitlementAction = keyof typeof ENTITLEMENT_ACTIONS;

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

// PATCH /api/admin/accounts/{id} — set an account's access state by hand.
//
// The backend control David asked for: flip a customer to live, open a grace window, or
// deactivate, without touching SQL. Keyed by email (the entitlements primary key), resolved
// from the auth user id in the URL. Upsert, not update, so an account that somehow has no
// entitlement row still gets one.
export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const { action } = await readJson<{ action?: string }>(request);
  if (!action || !(action in ENTITLEMENT_ACTIONS)) {
    throw new ApiError(400, "bad_request", "action must be one of: live, grace, deactivate");
  }

  const db = createAdminClient();
  // Prefer the entitlement's own email; fall back to the auth record for an account that has
  // no row yet. Lowercased to match the primary key.
  let email: string | null = null;
  const { data: ent } = await db.from("entitlements").select("email").eq("user_id", id).maybeSingle();
  if (ent?.email) {
    email = String(ent.email).toLowerCase();
  } else {
    const { data: authUser } = await db.auth.admin.getUserById(id);
    email = authUser?.user?.email?.trim().toLowerCase() ?? null;
  }
  if (!email) throw new ApiError(404, "not_found", "No account found for that id");

  const patch = ENTITLEMENT_ACTIONS[action as EntitlementAction]();
  const { error } = await db
    .from("entitlements")
    .upsert({ email, user_id: id, ...patch, updated_at: new Date().toISOString() }, { onConflict: "email" });
  if (error) throw new ApiError(500, "db_error", error.message);

  await logAudit({
    actorEmail: user.email,
    action: `entitlement.${action}`,
    target: email,
    metadata: { ...patch },
    request,
  });
  return json({ ok: true, email, ...patch });
});
