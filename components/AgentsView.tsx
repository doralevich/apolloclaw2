"use client";

import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { statusVariant } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentActionsMenu } from "@/components/AgentActionsMenu";
import { AgentNameCell } from "@/components/AgentNameCell";
import { CreateAgentModal } from "@/components/CreateAgentModal";

// The Agents table reads the SAME list as the sidebar switcher (ActiveAgentProvider), so
// lifecycle actions here — create/start/stop/delete/rename — immediately update Chat,
// Integrations, and Credits too. The provider also owns the transitional-status poll.
export function AgentsView() {
  const { current } = useWorkspace();
  const { agents, role, loading, error, refresh } = useActiveAgent();

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Agents</h1>
          <p className="text-sm text-muted-foreground">{current.name}</p>
        </div>
        {/* Visible to every member — the server enforces entitlement + the per-type cap. */}
        <CreateAgentModal triggerSize="sm" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : agents.length === 0 && error ? (
        // Fetch failed with nothing cached — don't masquerade as an empty workspace.
        <div className="flex items-center justify-between gap-3 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No agents in this workspace yet.</p>
          <div className="mt-4 flex justify-center">
            <CreateAgentModal />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Template</th>
                <th className="px-4 py-2 font-medium">Resources</th>
                <th className="px-4 py-2 text-center font-medium">Quick actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.agent37_id} className="border-t [&>td]:align-middle">
                  <td className="px-4 py-3">
                    <AgentNameCell agent={a} canEdit={role === "admin"} onRenamed={refresh} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Badge variant={statusVariant(a.live_status)}>{a.live_status ?? "unknown"}</Badge>
                      {a.past_due && <Badge variant="warning">past due</Badge>}
                    </div>
                    {a.status_reason && (
                      <div
                        className="mt-1 max-w-[16rem] truncate text-xs text-destructive"
                        title={a.status_reason.message}
                      >
                        {a.status_reason.message}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.template ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.cpu} vCPU · {a.memory} GB · {a.disk} GB
                  </td>
                  <td className="px-4 py-3">
                    <AgentActionsMenu agent={a} role={role} onChanged={refresh} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
