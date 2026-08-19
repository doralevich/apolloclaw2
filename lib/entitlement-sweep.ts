import { createAdminClient } from "@/lib/supabase/admin";

// Server-only companion to lib/entitlement.ts. Kept separate from the pure helpers so the
// admin client never rides along into a client/Server-Component bundle that only wants the
// access rules.

/**
 * Close out every grace window that has passed: a lapsed row (status <> 'active') whose
 * grace_until is now in the past becomes 'inactive' with grace_until cleared. The dashboard
 * gate already blocks these accounts the moment grace_until passes (it reads grace_until, not
 * status), so this is purely to keep the stored state — and the admin Accounts view — honest.
 * Runs on the hourly credit-watch cron. Returns how many rows were flipped.
 */
export async function expireGracePeriods(): Promise<number> {
  const db = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await db
    .from("entitlements")
    .update({ status: "inactive", grace_until: null, updated_at: nowIso })
    .neq("status", "active")
    .not("grace_until", "is", null)
    .lt("grace_until", nowIso)
    .select("email");
  if (error) {
    console.error("[entitlement-sweep] grace expiry failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}
