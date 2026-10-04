"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, Briefcase, MessageSquare, Pencil, Plus, Send, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { statusVariant } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { SubAgentDialog, type EditingAgent } from "@/components/SubAgentDialog";
import { useChatContext } from "@/components/chat/ChatProvider";
import type { RosterAgent } from "@/components/chat/types";

// The other agents living on an instance, each as a card of its own beside the primary one.
//
// The product records one agent per instance; OpenClaw can run several on one gateway. This
// reads the box's own roster and gives every other agent the same card the primary gets: face,
// name, status, what it shares with the instance, and its own Chat button (David, Oct 4 2026:
// "SEO should be just as big as Timmy Turner, with the same details"). The instance admin adds,
// edits and removes them here. One additional agent per instance for now; the Add card hides
// once one exists, until the plan tiers set the limit.

export function AgentTeam({
  agentId,
  mainName,
  liveStatus,
  connected,
  owner,
  canManage = false,
}: {
  agentId: string;
  mainName: string;
  /** The instance's status. Every agent on it is up or down together. */
  liveStatus: string | null | undefined;
  /** Apps connected to the instance, which every agent on it can reach. Null while unknown. */
  connected: number | null;
  owner?: { first_name: string; last_name: string; email: string } | null;
  /** The instance admin may add, edit and remove agents. Members see the cards only. */
  canManage?: boolean;
}) {
  const [agents, setAgents] = useState<RosterAgent[] | null>(null);
  // A Hermes box has no roster and cannot carry a second agent; nothing renders there.
  const [supported, setSupported] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingAgent | null>(null);
  const [removing, setRemoving] = useState<RosterAgent | null>(null);
  const { agentId: sidebarInstance, refreshRoster, selectAgent } = useChatContext();
  const { setActiveId } = useActiveAgent();

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

  // The sidebar lists the same agents under the active instance's name. After a change here it
  // reads the box again, so it never shows an agent that is gone or a name that changed.
  const changed = useCallback(() => {
    load();
    if (sidebarInstance === agentId) refreshRoster();
  }, [load, sidebarInstance, agentId, refreshRoster]);

  const subAgents = (agents ?? []).filter((a) => a.id !== "main");
  if (!agents || !supported) return null;
  if (!canManage && subAgents.length === 0) return null;

  // ConfirmDialog awaits this, closes on success, and stays open if it throws.
  async function remove() {
    if (!removing) return;
    await apiFetch(`/api/agents/${agentId}/subagents/${encodeURIComponent(removing.id)}`, { method: "DELETE" });
    toast.success(`${removing.name || removing.id} removed. The instance is restarting.`);
    changed();
  }

  // Chat with this agent. On the active instance that is a pick in the sidebar; on another one,
  // switch to it first (the pick resets with the switch, so it opens on the main agent).
  function chatWith(id: string) {
    if (sidebarInstance === agentId) selectAgent(id);
    else {
      setActiveId(agentId);
      window.location.assign("/dashboard/chat");
    }
  }

  function openEdit(a: RosterAgent) {
    setEditing({ id: a.id, name: a.name || a.id, role: a.role, avatarUrl: a.avatarUrl });
    setDialogOpen(true);
  }

  const ownerName = owner ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.email : null;

  return (
    <>
      {subAgents.map((a) => {
        const label = a.name || a.id;
        return (
          <div key={a.id} className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-start gap-4">
              {canManage ? (
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  aria-label={`Change ${label}'s picture`}
                  className="block size-14 shrink-0 overflow-hidden rounded-full bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SubAgentFace label={label} url={a.avatarUrl} />
                </button>
              ) : (
                <span className="block size-14 shrink-0 overflow-hidden rounded-full bg-secondary">
                  <SubAgentFace label={label} url={a.avatarUrl} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-base font-semibold">{label}</span>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Edit ${label}`}
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  <Badge variant={statusVariant(liveStatus)}>{liveStatus ?? "unknown"}</Badge>
                </div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {agentId} / {a.id}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  {a.role && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3.5" />
                      {a.role}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    On {mainName}, sharing its company brain
                  </span>
                  {connected !== null && (
                    <Link
                      href="/dashboard/integrations"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      <Blocks className="size-3.5" />
                      {connected === 0
                        ? "No apps connected yet"
                        : `${connected} app${connected === 1 ? "" : "s"} connected`}
                    </Link>
                  )}
                  {a.telegram && (
                    <span className="inline-flex items-center gap-1.5">
                      <Send className="size-3.5" />
                      Its own Telegram bot
                    </span>
                  )}
                  {owner && ownerName && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5" />
                      {ownerName}
                      {owner.email && <span className="text-muted-subtle">· {owner.email}</span>}
                    </span>
                  )}
                </div>

                {a.persona && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">{a.persona}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" onClick={() => chatWith(a.id)}>
                  <MessageSquare className="size-4" />
                  Chat
                </Button>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 flex justify-end border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setRemoving(a)}
                >
                  <Trash2 className="size-3.5" />
                  Remove {label}
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Room for a teammate, as a card in the same column, for the admin only. */}
      {canManage && subAgents.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-6">
          <div className="min-w-0">
            <p className="text-sm font-medium">Give {mainName} a teammate</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A second agent on this instance with its own name, role, and face. It knows the
              business through the same company brain.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="size-4" />
            Add an agent to {mainName}
          </Button>
        </div>
      )}

      {dialogOpen && (
        <SubAgentDialog
          instanceId={agentId}
          mainName={mainName}
          editing={editing}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDone={changed}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => { if (!o) setRemoving(null); }}
        title={`Remove ${removing?.name || removing?.id}?`}
        description={`This takes the agent off the instance and restarts it. ${mainName} and its connections are untouched.`}
        confirmText="Remove agent"
        destructive
        onConfirm={remove}
      />
    </>
  );
}

function SubAgentFace({ label, url }: { label: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="size-full object-cover" />;
  }
  return (
    <span className="flex size-full items-center justify-center text-xl font-semibold text-muted-foreground">
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}
