"use client";

import { useCallback, useEffect, useState } from "react";
import { CornerDownRight, DoorOpen, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { openWorkspaceInApolloClaw } from "@/components/admin/AdminWorkspacesView";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate, statusVariant } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import type { AdminAgentOverview } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Agents — everything that exists, in the database or in Agent37, in one list.
//
// The two systems drift: an instance deleted in the Agent37 dashboard leaves a GHOST row that
// answers "Instance not found" to every button in the product, and a swept database row whose
// VPS delete was missed leaves an ORPHAN instance that nothing shows but hosting still runs.
// Both burned an afternoon each before this page existed. The presence badge names the case,
// and one Delete handles all of them - it removes whichever halves exist.
//
// Cards grouped by workspace rather than a table, per David: each workspace is a section with
// its main agents as full cards and member-seat agents nested beneath them - so "whose seat is
// that" is visible in the shape of the page, not deduced from a column.

const PRESENCE: Record<
  AdminAgentOverview["presence"],
  { label: string; variant: "success" | "warning" | "destructive" | "muted"; hint: string }
> = {
  ok: { label: "in sync", variant: "success", hint: "Database row and Agent37 instance both exist." },
  ghost: {
    label: "no instance",
    variant: "destructive",
    hint: "Database row with no Agent37 instance behind it - the product shows an agent that answers \"Instance not found\". Delete purges the row.",
  },
  orphan: {
    label: "orphan instance",
    variant: "warning",
    hint: "Agent37 instance with no database row - invisible in the product but still hosted. Delete removes the instance.",
  },
  unknown: { label: "unverified", variant: "muted", hint: "Agent37 could not be reached to compare." },
};

export function AdminAgentsView() {
  const [agents, setAgents] = useState<AdminAgentOverview[] | null>(null);
  const [liveChecked, setLiveChecked] = useState(true);
  const [deleting, setDeleting] = useState<AdminAgentOverview | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ agents: AdminAgentOverview[]; live_checked: boolean }>(
        "/api/admin/agents"
      );
      setAgents(data.agents);
      setLiveChecked(data.live_checked);
    } catch (e) {
      toast.error((e as Error).message);
      setAgents([]);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount; setState happens after the await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function destroy(agent: AdminAgentOverview) {
    const result = await apiFetch<{
      id: string;
      mode: "soft_deleted" | "purged";
      purge_after?: string;
      vps_deleted?: boolean;
      db_deleted?: boolean;
    }>(`/api/admin/agents/${agent.agent37_id}`, { method: "DELETE" });
    if (result.mode === "soft_deleted") {
      toast.success("Moved to trash. Its instance is stopped and it can be restored until it purges.");
    } else {
      toast.success(
        [
          result.vps_deleted ? "Instance deleted." : "Instance was already gone.",
          result.db_deleted ? "Records purged." : "No records to purge.",
        ].join(" ")
      );
    }
    await load();
  }

  async function restore(agent: AdminAgentOverview) {
    try {
      const result = await apiFetch<{ id: string; restored: boolean; started: boolean; startError?: string }>(
        `/api/admin/agents/${agent.agent37_id}/restore`,
        { method: "POST" }
      );
      toast.success(
        result.started
          ? "Restored. The instance is starting back up."
          : "Restored. The instance did not start - start it from the instance controls." +
              (result.startError ? ` (${result.startError})` : "")
      );
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  // One section per workspace (name-sorted), instances outside any workspace last.
  const groups = new Map<string, { name: string; owner: string | null; rows: AdminAgentOverview[] }>();
  for (const a of agents ?? []) {
    const key = a.workspace_id ?? "__none__";
    const group = groups.get(key) ?? {
      name: a.workspace_name ?? "Not in any workspace",
      owner: null,
      rows: [],
    };
    if (!a.is_member_agent && a.owner_email) group.owner = group.owner ?? a.owner_email;
    group.rows.push(a);
    groups.set(key, group);
  }
  const sections = [...groups.entries()].sort(([ka, a], [kb, b]) => {
    if (ka === "__none__") return 1;
    if (kb === "__none__") return -1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Every agent across the platform, checked against Agent37, grouped by workspace.
          Member seats nest under the workspace&apos;s main agent. Delete removes whichever
          halves exist - instance, records, or both.
        </p>
        {!liveChecked && (
          <p className="mt-2 text-sm text-amber-700">
            Agent37 could not be reached - showing database records only, without liveness.
          </p>
        )}
      </div>

      {agents === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No agents anywhere.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(([key, group]) => {
            const main = group.rows.filter((a) => !a.is_member_agent);
            const members = group.rows.filter((a) => a.is_member_agent);
            return (
              <section key={key}>
                <div className="mb-2 flex items-baseline gap-2">
                  <h2 className="font-semibold">{group.name}</h2>
                  {group.owner && <span className="text-xs text-muted-foreground">{group.owner}</span>}
                </div>
                <div className="space-y-3">
                  {main.map((a) => (
                    <AgentCard key={a.agent37_id} agent={a} onDelete={() => setDeleting(a)} onRestore={() => restore(a)} />
                  ))}
                  {members.length > 0 && (
                    <div className="ml-5 space-y-3 border-l-2 border-muted pl-4">
                      {members.map((a) => (
                        <AgentCard key={a.agent37_id} agent={a} member onDelete={() => setDeleting(a)} onRestore={() => restore(a)} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {deleting && (() => {
        // Three outcomes: an already-trashed agent purges for good (skips the wait); an orphan
        // instance (no row) is deleted from Agent37 outright; anything else moves to the trash,
        // reversibly. Only the first two are irreversible.
        const isTrashed = Boolean(deleting.deleted_at);
        const isOrphan = deleting.presence === "orphan";
        const hard = isTrashed || isOrphan;
        return (
          <ConfirmDialog
            open
            onOpenChange={(open) => {
              if (!open) setDeleting(null);
            }}
            title={hard ? `Purge ${deleting.name || deleting.agent37_id} for good?` : `Delete ${deleting.name || deleting.agent37_id}?`}
            description={
              isTrashed
                ? "This agent is already in the trash. Purging destroys its instance and records now, skipping the retention window. This cannot be undone."
                : isOrphan
                  ? "This instance has no records in the product; this deletes it from Agent37 so it stops hosting. This cannot be undone."
                  : `This moves the agent to the trash: its instance is stopped (not destroyed) and it can be restored until it purges${deleting.workspace_name ? `, in "${deleting.workspace_name}"` : ""}. If the workspace keeps another agent, one hosting seat is credited back.`
            }
            confirmText={hard ? "Purge for good" : "Move to trash"}
            destructive={hard}
            onConfirm={() => destroy(deleting)}
          />
        );
      })()}
    </div>
  );
}

// "in 6 days", "today", or "overdue" for a purge_after timestamp.
function purgeCountdown(purgeAfter: string | null): string {
  if (!purgeAfter) return "soon";
  const ms = new Date(purgeAfter).getTime() - Date.now();
  if (ms <= 0) return "any time now";
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

function AgentCard({
  agent,
  member = false,
  onDelete,
  onRestore,
}: {
  agent: AdminAgentOverview;
  member?: boolean;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const presence = PRESENCE[agent.presence];
  const trashed = Boolean(agent.deleted_at);
  const initial = (agent.name || agent.agent37_id).slice(0, 1).toUpperCase();
  const [opening, setOpening] = useState<"apolloclaw" | "instance" | null>(null);

  // Two doors into a customer's agent. "Open" is the ApolloClaw dashboard - support access
  // via workspace membership, where product gets installed and the checklist lives. "Instance"
  // is the raw OpenClaw Control UI (signed URL + token, audit-logged server-side) for when the
  // product isn't the surface you need. A ghost has neither; an orphan has only the instance.
  async function openApolloClaw() {
    if (!agent.workspace_id) return;
    setOpening("apolloclaw");
    try {
      await openWorkspaceInApolloClaw(agent.workspace_id);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(null);
    }
  }

  async function openInstance() {
    setOpening("instance");
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/admin/agents/${agent.agent37_id}/open`, {
        method: "POST",
      });
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(null);
    }
  }
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4${
        trashed ? " border-dashed opacity-70" : ""
      }`}
    >
      {member && <CornerDownRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
      {agent.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- storage URLs and data: URIs; next/image adds nothing here
        <img src={agent.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full border object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted font-semibold text-muted-foreground">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{agent.name || "Untitled agent"}</span>
          {member && <Badge variant="secondary">Member seat</Badge>}
          {trashed && (
            <Badge
              variant="destructive"
              title={`Soft-deleted - the instance is stopped, not destroyed. The purge cron removes it for good ${purgeCountdown(agent.purge_after)}.`}
            >
              In trash · purges {purgeCountdown(agent.purge_after)}
            </Badge>
          )}
          <span title={presence.hint}>
            <Badge variant={presence.variant}>{presence.label}</Badge>
          </span>
          <Badge variant={statusVariant(agent.live_status ?? agent.db_status)}>
            {agent.live_status ?? agent.db_status ?? "unknown"}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span className="font-mono">{agent.agent37_id}</span>
          {agent.agent_type && <span>{getAgentType(agent.agent_type)?.label ?? agent.agent_type}</span>}
          {agent.owner_email && <span>{agent.owner_email}</span>}
          {agent.created_at && <span>Created {formatDate(agent.created_at)}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {agent.workspace_id && (
          <Button variant="outline" size="sm" onClick={openApolloClaw} disabled={opening !== null}>
            <DoorOpen className="h-4 w-4" />
            {opening === "apolloclaw" ? "Opening..." : "Open"}
          </Button>
        )}
        {agent.presence !== "ghost" && (
          <Button variant="ghost" size="sm" onClick={openInstance} disabled={opening !== null}>
            <ExternalLink className="h-4 w-4" />
            {opening === "instance" ? "Opening..." : "Instance"}
          </Button>
        )}
        {trashed ? (
          <>
            <Button variant="outline" size="sm" onClick={onRestore} disabled={opening !== null}>
              <RotateCcw className="h-4 w-4" />
              Restore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Purge now
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
