"use client";

import { useCallback, useEffect, useState } from "react";
import { CornerDownRight, DoorOpen, ExternalLink, Link2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { openWorkspaceInApolloClaw } from "@/components/admin/AdminWorkspacesView";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate, statusVariant } from "@/lib/format";
import { AGENT_TYPES, getAgentType, LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import type { AdminAgentOverview, AdminWorkspaceSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [adopting, setAdopting] = useState<AdminAgentOverview | null>(null);
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceSummary[] | null>(null);
  const [adoptWs, setAdoptWs] = useState("");
  const [adoptType, setAdoptType] = useState<string>(LICENSE_AGENT_TYPE_ID);
  const [adoptBusy, setAdoptBusy] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

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

  // Backfill capability defaults (memory embeddings, Tavily search, clock) onto an existing box,
  // then it restarts to pick them up. New agents get these at provision automatically.
  async function applyDefaults(agent: AdminAgentOverview) {
    setApplyingId(agent.agent37_id);
    try {
      const r = await apiFetch<{ applied: boolean; memory: boolean; webSearch: boolean; timezone: boolean; note?: string }>(
        `/api/admin/agents/${agent.agent37_id}/apply-defaults`,
        { method: "POST" }
      );
      if (r.applied) {
        toast.success(
          `Defaults applied: memory${r.webSearch ? " + web search" : ""}${r.timezone ? " + clock" : ""}. Instance restarting.` +
            (r.note ? ` (${r.note})` : "")
        );
      } else {
        toast.error(`Could not apply defaults${r.note ? `: ${r.note}` : ""}.`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplyingId(null);
    }
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

  // Adopt an orphan: open the picker, lazily loading the workspace list the first time.
  function openAdopt(agent: AdminAgentOverview) {
    setAdopting(agent);
    setAdoptWs("");
    setAdoptType(LICENSE_AGENT_TYPE_ID);
    if (!workspaces) {
      apiFetch<{ workspaces: AdminWorkspaceSummary[] }>("/api/admin/workspaces")
        .then((d) => setWorkspaces(d.workspaces))
        .catch((e) => toast.error((e as Error).message));
    }
  }

  async function adopt() {
    if (!adopting || !adoptWs) return;
    setAdoptBusy(true);
    try {
      await apiFetch(`/api/admin/agents/${adopting.agent37_id}/adopt`, {
        method: "POST",
        body: JSON.stringify({ workspace_id: adoptWs, agent_type: adoptType }),
      });
      toast.success("Instance adopted - it now belongs to the workspace.");
      setAdopting(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAdoptBusy(false);
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
                    <AgentCard key={a.agent37_id} agent={a} onDelete={() => setDeleting(a)} onRestore={() => restore(a)} onAdopt={() => openAdopt(a)} onApplyDefaults={() => applyDefaults(a)} applying={applyingId === a.agent37_id} />
                  ))}
                  {members.length > 0 && (
                    <div className="ml-5 space-y-3 border-l-2 border-muted pl-4">
                      {members.map((a) => (
                        <AgentCard key={a.agent37_id} agent={a} member onDelete={() => setDeleting(a)} onRestore={() => restore(a)} onAdopt={() => openAdopt(a)} onApplyDefaults={() => applyDefaults(a)} applying={applyingId === a.agent37_id} />
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

      <Dialog open={!!adopting} onOpenChange={(open) => { if (!open) setAdopting(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adopt this instance</DialogTitle>
            <DialogDescription>
              Give this orphaned Agent37 instance a home. It gets a record in the workspace you
              pick and shows up in the product as that workspace&apos;s agent - use this to
              reconnect an instance Agent37 restored, or one a swept row left stranded.
            </DialogDescription>
          </DialogHeader>
          {adopting && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-mono">{adopting.agent37_id}</span>
                {adopting.name ? ` · ${adopting.name}` : ""}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adopt-ws">Workspace</Label>
                <select
                  id="adopt-ws"
                  value={adoptWs}
                  onChange={(e) => setAdoptWs(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    {workspaces === null ? "Loading workspaces..." : "Select a workspace"}
                  </option>
                  {(workspaces ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                      {w.owner_email ? ` — ${w.owner_email}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adopt-type">Agent type</Label>
                <select
                  id="adopt-type"
                  value={adoptType}
                  onChange={(e) => setAdoptType(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  The instance keeps its own persona - this only sets the label the product shows.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdopting(null)} disabled={adoptBusy}>
              Cancel
            </Button>
            <Button onClick={adopt} disabled={adoptBusy || !adoptWs}>
              {adoptBusy ? "Adopting..." : "Adopt instance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  onAdopt,
  onApplyDefaults,
  applying = false,
}: {
  agent: AdminAgentOverview;
  member?: boolean;
  onDelete: () => void;
  onRestore: () => void;
  onAdopt: () => void;
  onApplyDefaults: () => void;
  applying?: boolean;
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
        {/* Orphan only: a live instance with no row can be adopted into a workspace instead of
            deleted. The reconnect path for a restored or stranded instance. */}
        {agent.presence === "orphan" && (
          <Button variant="outline" size="sm" onClick={onAdopt}>
            <Link2 className="h-4 w-4" />
            Adopt
          </Button>
        )}
        {/* Backfill capability defaults (memory, web search, clock) onto a box that has a live
            instance. New agents get these at provision; this catches up the older ones. */}
        {agent.presence !== "ghost" && !trashed && (
          <Button variant="ghost" size="sm" onClick={onApplyDefaults} disabled={applying} title="Apply memory + web search + clock defaults, then restart">
            <Sparkles className="h-4 w-4" />
            {applying ? "Applying..." : "Apply defaults"}
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
