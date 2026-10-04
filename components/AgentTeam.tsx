"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SubAgentDialog, type EditingAgent } from "@/components/SubAgentDialog";

// The agents living on this instance, and the panel to manage them, under the card for the
// primary one.
//
// The product records one agent per instance; OpenClaw can run several on one gateway. This
// reads the box's own roster and lets the instance's admin add one, edit its role/persona/image,
// or remove it, each in place. One additional agent per instance for now; several at once is the
// next build, at which point the Add button stops hiding once one exists.

type RosterAgent = { id: string; name: string | null; role: string | null; persona: string | null; avatarUrl: string | null; telegram: boolean };

export function AgentTeam({
  agentId,
  mainName,
  canManage = false,
}: {
  agentId: string;
  mainName: string;
  /** The instance admin may add, edit and remove agents. Members see the list only. */
  canManage?: boolean;
}) {
  const [agents, setAgents] = useState<RosterAgent[] | null>(null);
  // A Hermes box has no roster and cannot carry a second agent; the panel stays hidden there.
  const [supported, setSupported] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingAgent | null>(null);
  const [removing, setRemoving] = useState<RosterAgent | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    apiFetch<{ ok: boolean; agents: RosterAgent[]; note?: string }>(`/api/agents/${agentId}/roster`)
      .then((res) => {
        if (cancelled) return;
        if (res.note === "not-openclaw") setSupported(false);
        setAgents(res.ok ? res.agents : []);
      })
      .catch(() => {
        // Silent: a roster that could not be read is the same as a single agent for this page.
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  useEffect(() => load(), [load]);

  const subAgents = (agents ?? []).filter((a) => a.id !== "main");
  // The panel manages the OTHER agents, not the primary one: the primary is the card header
  // above, so repeating it here read as duplicative (David, Oct 4 2026). An admin sees the
  // panel even with no second agent yet, so there is a place to add one; a member sees it only
  // once a second agent exists.
  if (!agents || !supported) return null;
  if (!canManage && subAgents.length === 0) return null;

  // ConfirmDialog awaits this, closes on success, and stays open if it throws.
  async function remove() {
    if (!removing) return;
    await apiFetch(`/api/agents/${agentId}/subagents/${encodeURIComponent(removing.id)}`, { method: "DELETE" });
    toast.success(`${removing.name || removing.id} removed. The instance is restarting.`);
    load();
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5" />
          Other agents on this instance
        </div>
        {canManage && subAgents.length === 0 && (
          <Button variant="outline" size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="size-4" />
            Add agent
          </Button>
        )}
      </div>

      {subAgents.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {mainName} is the only agent here. Add one to give it a teammate with its own role.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {subAgents.map((a) => {
            const label = a.name || a.id;
            return (
              <li key={a.id} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                {a.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.avatarUrl} alt="" className="size-10 shrink-0 rounded-full border object-cover" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted text-base font-semibold text-muted-foreground">
                    {label.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{label}</span>
                    {a.telegram && (
                      <Badge variant="outline" className="gap-1 px-1.5 py-0">
                        <Send className="size-2.5" />
                        Telegram
                      </Badge>
                    )}
                  </div>
                  {a.role && <div className="truncate text-xs text-muted-foreground">{a.role}</div>}
                  {a.persona && <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/90">{a.persona}</p>}
                </div>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Edit ${label}`}
                      onClick={() => { setEditing({ id: a.id, name: a.name || a.id, role: a.role, avatarUrl: a.avatarUrl }); setDialogOpen(true); }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      aria-label={`Remove ${label}`}
                      onClick={() => setRemoving(a)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {dialogOpen && (
        <SubAgentDialog
          instanceId={agentId}
          mainName={mainName}
          editing={editing}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDone={load}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => { if (!o) setRemoving(null); }}
        title={`Remove ${removing?.name || removing?.id}?`}
        description="This takes the agent off the instance and restarts it. The primary agent and its connections are untouched."
        confirmText="Remove agent"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
