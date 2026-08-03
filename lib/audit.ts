import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Append-only audit trail (playbook §5). Backed by supabase/migrations/0009.
//
// NEVER throws and never blocks. An audit write failing must not take down the action it was
// describing — losing a log line is bad, failing a customer's account deletion because the log
// line failed is worse.

export type AuditEntry = {
  actorEmail?: string | null;
  /** Stable, greppable verb. e.g. "agent.deleted", "entitlement.granted". */
  action: string;
  /** What was acted on: an id, an email, a workspace. */
  target?: string | null;
  metadata?: Record<string, unknown> | null;
  /** Pass the incoming request and the caller's IP is recorded. */
  request?: Request | null;
};

function ipFrom(request?: Request | null): string | null {
  if (!request) return null;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip")?.trim() || null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { error } = await createAdminClient().from("audit_log").insert({
      actor_email: entry.actorEmail ?? null,
      action: entry.action,
      target: entry.target ?? null,
      metadata: entry.metadata ?? null,
      ip: ipFrom(entry.request),
    });
    if (error) console.warn("[audit] write failed:", error.message);
  } catch (err) {
    console.warn("[audit] write threw:", (err as Error).message);
  }
}
