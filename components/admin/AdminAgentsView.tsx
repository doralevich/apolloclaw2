"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
// Both burned an afternoon each before this page existed. The presence column names the case,
// and one Delete handles all of them - it removes whichever halves exist.

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
    const result = await apiFetch<{ id: string; vps_deleted: boolean; db_deleted: boolean }>(
      `/api/admin/agents/${agent.agent37_id}`,
      { method: "DELETE" }
    );
    toast.success(
      [
        result.vps_deleted ? "Instance deleted." : "Instance was already gone.",
        result.db_deleted ? "Records purged." : "No records to purge.",
      ].join(" ")
    );
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Every agent across the platform, checked against Agent37. Delete removes whichever
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Agent</th>
                <th className="px-4 py-2 font-medium">Presence</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Workspace</th>
                <th className="px-4 py-2 font-medium">Owner</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => {
                const presence = PRESENCE[a.presence];
                return (
                  <tr key={a.agent37_id} className="border-t [&>td]:align-middle">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.name || "Untitled agent"}</div>
                      <div className="font-mono text-xs text-muted-foreground">{a.agent37_id}</div>
                      {a.agent_type && (
                        <div className="text-xs text-muted-foreground">
                          {getAgentType(a.agent_type)?.label ?? a.agent_type}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span title={presence.hint}>
                        <Badge variant={presence.variant}>{presence.label}</Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(a.live_status ?? a.db_status)}>
                        {a.live_status ?? a.db_status ?? "unknown"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.workspace_name ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.owner_email ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.created_at ? formatDate(a.created_at) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(a)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title={`Delete ${deleting.name || deleting.agent37_id}?`}
          description={
            deleting.presence === "ghost"
              ? "The instance is already gone; this purges the leftover records so the agent stops appearing in the product."
              : deleting.presence === "orphan"
                ? "This instance has no records in the product; this deletes it from Agent37 so it stops hosting."
                : `This deletes the running instance and all of its records${deleting.workspace_name ? ` in "${deleting.workspace_name}"` : ""}. If the workspace keeps another agent, one hosting seat is credited back.`
          }
          confirmText="Delete agent"
          destructive
          onConfirm={() => destroy(deleting)}
        />
      )}
    </div>
  );
}
