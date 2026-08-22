"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, DoorOpen, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate, statusVariant, usd } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import { runtimeForTemplate } from "@/config/agents";
import type { AdminAgentDetail, AdminWorkspaceSummary, Budget } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateAgentButton } from "@/components/CreateAgentButton";
import { STORAGE_KEY } from "@/components/WorkspaceProvider";

// Support access: become an admin member of the customer's workspace (idempotent,
// audit-logged), point the dashboard's stored workspace at it, and open the ApolloClaw
// dashboard in a new tab - landing inside THEIR workspace with the whole product available:
// checklist, integrations, skills, channels. This is how "help the client with their setup"
// actually happens; the OpenClaw button next to it is the raw instance for when the product
// isn't the surface you need.
export async function openWorkspaceInApolloClaw(workspaceId: string): Promise<void> {
  await apiFetch(`/api/admin/workspaces/${workspaceId}/join`, { method: "POST" });
  localStorage.setItem(STORAGE_KEY, workspaceId);
  window.open("/dashboard", "_blank", "noopener");
}

type Detail = { loading: boolean; agents: AdminAgentDetail[] | null };

// One card per workspace, per David - the table rows read as long lines, and a card gives
// each customer a shape: who they are on the left, what they have in the middle, what you can
// do on the right. Expanding a card still reveals its instances (the dense diagnostics stay a
// table - budget, usage, skills are columns of numbers and belong in one).
export function AdminWorkspacesView() {
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceSummary[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, Detail>>({});
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await apiFetch<{ workspaces: AdminWorkspaceSummary[] }>("/api/admin/workspaces");
      setWorkspaces(data.workspaces);
    } catch (e) {
      toast.error((e as Error).message);
      setWorkspaces([]);
    }
  }, []);

  // Stand up a new workspace for an existing user. The seam for a white-glove setup: create it
  // here, then "Create Apollo Agent" on the card drops a blank OpenClaw box in, then Open to
  // write the files. The owner must already have an account (the API resolves email -> user).
  const createWorkspace = useCallback(async () => {
    const email = newEmail.trim();
    if (!email) return;
    setCreating(true);
    try {
      await apiFetch("/api/admin/workspaces", {
        method: "POST",
        body: JSON.stringify({ email, name: newName.trim() || undefined }),
      });
      toast.success(`Workspace created for ${email}.`);
      setNewEmail("");
      setNewName("");
      await loadWorkspaces();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }, [newEmail, newName, loadWorkspaces]);

  useEffect(() => {
    // Initial fetch on mount. setState happens after the await (async), not synchronously
    // in the effect body, so it doesn't cause the cascading renders the rule guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkspaces();
  }, [loadWorkspaces]);

  const loadDetail = useCallback(async (workspaceId: string) => {
    setDetails((d) => ({ ...d, [workspaceId]: { loading: true, agents: d[workspaceId]?.agents ?? null } }));
    try {
      const data = await apiFetch<{ agents: AdminAgentDetail[] }>(
        `/api/admin/workspaces/${workspaceId}/agents`
      );
      setDetails((d) => ({ ...d, [workspaceId]: { loading: false, agents: data.agents } }));
    } catch (e) {
      toast.error((e as Error).message);
      setDetails((d) => ({ ...d, [workspaceId]: { loading: false, agents: [] } }));
    }
  }, []);

  const toggle = useCallback(
    (workspaceId: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(workspaceId)) {
          next.delete(workspaceId);
        } else {
          next.add(workspaceId);
          // Fetch detail the first time a card opens; afterwards we keep the cached rows.
          if (!details[workspaceId]) void loadDetail(workspaceId);
        }
        return next;
      });
    },
    [details, loadDetail]
  );

  // After provisioning into a workspace, refresh the top-level counts and (if open) its
  // instance list so the new agent shows up immediately.
  const onCreated = useCallback(
    (workspaceId: string) => {
      void loadWorkspaces();
      if (expanded.has(workspaceId)) void loadDetail(workspaceId);
    },
    [loadWorkspaces, loadDetail, expanded]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          All workspaces across the platform (newest 50). Expand a card to see its instances.
        </p>
      </div>

      {/* Create a workspace for an existing user, then use "Create Apollo Agent" on its card to
          drop a blank OpenClaw box in and Open to write the files. */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-sm font-medium">New workspace</p>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void createWorkspace();
          }}
        >
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@email.com (must have an account)"
            className="h-9 min-w-[16rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workspace name (optional)"
            className="h-9 min-w-[12rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="sm" disabled={creating || !newEmail.trim()}>
            {creating ? "Creating..." : "Create workspace"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          The user must already have an account. The workspace is owned by them and appears in their dashboard on next login.
        </p>
      </div>

      {workspaces === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No workspaces yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces.map((w) => {
            const isOpen = expanded.has(w.id);
            const detail = details[w.id];
            return (
              <div key={w.id} className="rounded-xl border bg-card">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
                  <button
                    type="button"
                    onClick={() => toggle(w.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-primary"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{w.name}</span>
                      <span className="block truncate font-mono text-xs font-normal text-muted-foreground">
                        {w.id}
                      </span>
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <Stat label="Owner" value={w.owner_email ?? "-"} />
                    <Stat label="Members" value={String(w.member_count)} />
                    <Stat
                      label="Agents"
                      value={
                        w.agent_count === 0
                          ? "0"
                          : `${w.agent_count}${w.running_count ? ` (${w.running_count} running)` : ""}`
                      }
                    />
                    <Stat label="Created" value={formatDate(w.created_at)} />
                  </div>

                  <div className="flex items-center gap-2">
                    <OpenWorkspaceButton workspaceId={w.id} />
                    {w.you_are_member && (
                      <LeaveWorkspaceButton workspaceId={w.id} name={w.name} onLeft={loadWorkspaces} />
                    )}
                    <CreateAgentButton
                      workspaceId={w.id}
                      onCreated={() => onCreated(w.id)}
                      label="Create Apollo Agent"
                      size="sm"
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t bg-muted/30 p-4">
                    <InstanceList detail={detail} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function OpenWorkspaceButton({ workspaceId }: { workspaceId: string }) {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      await openWorkspaceInApolloClaw(workspaceId);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={open} disabled={busy}>
      <DoorOpen className="h-4 w-4" />
      {busy ? "Opening..." : "Open in ApolloClaw"}
    </Button>
  );
}

// Close out a support session: remove the admin's own membership so the customer's Members
// page goes back to showing only their people.
function LeaveWorkspaceButton({
  workspaceId,
  name,
  onLeft,
}: {
  workspaceId: string;
  name: string;
  onLeft: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function leave() {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/workspaces/${workspaceId}/join`, { method: "DELETE" });
      toast.success(`Left "${name}".`);
      onLeft();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={leave} disabled={busy} title="Remove your support membership">
      <LogOut className="h-4 w-4" />
      {busy ? "Leaving..." : "Leave"}
    </Button>
  );
}

function InstanceList({ detail }: { detail: Detail | undefined }) {
  if (!detail || detail.loading) {
    return <p className="px-2 py-2 text-xs text-muted-foreground">Loading instances...</p>;
  }
  if (!detail.agents || detail.agents.length === 0) {
    return <p className="px-2 py-2 text-xs text-muted-foreground">No instances in this workspace.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Instance</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Resources</th>
            <th className="px-3 py-2 font-medium">Budget (spent / cap)</th>
            <th className="px-3 py-2 font-medium">Usage (period)</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium">Skills</th>
            <th className="px-3 py-2 font-medium">Open</th>
          </tr>
        </thead>
        <tbody>
          {detail.agents.map((a) => (
            <tr key={a.agent37_id} className="border-t [&>td]:align-middle">
              <td className="px-3 py-2">
                <div className="font-medium">{a.name || "Untitled agent"}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{a.agent37_id}</div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Badge variant={statusVariant(a.live_status)}>{a.live_status ?? "unknown"}</Badge>
                  {a.past_due && <Badge variant="warning">past due</Badge>}
                </div>
                {a.status_reason && (
                  <div
                    className="mt-1 max-w-[16rem] truncate text-[11px] text-destructive"
                    title={a.status_reason.message}
                  >
                    {a.status_reason.message}
                  </div>
                )}
              </td>
              {/* Product name, then the RUNTIME rather than the image name. Which runtime an
                  instance is decides where it keeps the files it reads, so it's the fact worth
                  having here — the image name only ever told us what the build was once
                  called. An unrecognised image falls back to showing its raw name. */}
              <td className="px-3 py-2 text-muted-foreground">
                {a.agent_type ? getAgentType(a.agent_type)?.label ?? a.agent_type : "-"}
                {(runtimeForTemplate(a.template) ?? a.template) && (
                  <div className="text-[11px] text-muted-foreground/70">
                    {runtimeForTemplate(a.template) ?? a.template}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {a.cpu} vCPU · {a.memory} GB · {a.disk} GB
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {a.budget ? (
                  <>
                    {usd(a.budget.monthly_consumed_micros)} / {usd(a.budget.monthly_cap_micros)}
                    {/* Purchased credit lives in its OWN bucket - addCredit tops up the credit
                        balance, not the monthly cap - so a delivered top-up showed nowhere here
                        and read as "my $25 vanished". Surface it. The runtime renamed the field
                        (topup_remaining_micros -> credit_remaining_micros) and instances answer
                        with either, so read both, newer first, exactly like lib/budget.ts. */}
                    {(() => {
                      const b = a.budget as Budget & { credit_remaining_micros?: number };
                      const credit = b.credit_remaining_micros ?? b.topup_remaining_micros ?? 0;
                      return credit > 0 ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          + {usd(credit)} credit
                        </div>
                      ) : null;
                    })()}
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {a.usage ? `${usd(a.usage.total_micros)} (${a.usage.period})` : "-"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{formatDate(a.created_at)}</td>
              <td className="px-3 py-2">
                <SkillsCell agentId={a.agent37_id} />
              </td>
              <td className="px-3 py-2">
                <OpenInstanceButton agentId={a.agent37_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Log into this instance's OpenClaw dashboard as its user sees it - signed URL plus the
// gateway token, minted by the admin open route and audit-logged there. Built for white-glove
// setup checks: a client signs up, and David confirms the intake configured what it should.
function OpenInstanceButton({ agentId }: { agentId: string }) {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/admin/agents/${agentId}/open`, {
        method: "POST",
      });
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={open} disabled={busy}>
      <ExternalLink className="h-3.5 w-3.5" />
      {busy ? "Opening..." : "Open"}
    </Button>
  );
}

// Per-agent skills: what's installed, and a button to push the current set.
//
// Skills install at provision, so an agent created before a skill was written never gets it and
// an agent created before a skill was IMPROVED keeps the old text. This is how an edit to
// config/skills.ts reaches agents that already exist.
//
// Checked on demand rather than on render. The check is an exec inside the instance, and doing
// that for every agent every time an admin expands a workspace would turn a page load into a
// fleet-wide sweep.
function SkillsCell({ agentId }: { agentId: string }) {
  const [state, setState] = useState<{ busy: boolean; installed: string[] | null }>({
    busy: false,
    installed: null,
  });

  const run = (mode: "inspect" | "install") => {
    setState((s) => ({ ...s, busy: true }));
    const q = `id=${encodeURIComponent(agentId)}${mode === "inspect" ? "&inspect=1" : ""}`;
    apiFetch<{ results: Array<{ skills?: string[]; installed?: string[] }> }>(
      `/api/admin/agents/install-skills?${q}`,
      { method: "POST" }
    )
      .then((res) => {
        const row = res.results?.[0];
        const skills = row?.skills ?? row?.installed ?? [];
        setState({ busy: false, installed: skills });
        if (mode === "install") {
          toast.success(
            skills.length ? `Installed: ${skills.join(", ")}` : "Nothing installed - not an OpenClaw instance?"
          );
        }
      })
      .catch((e) => {
        setState((s) => ({ ...s, busy: false }));
        toast.error((e as Error).message);
      });
  };

  return (
    <div className="flex items-center gap-2">
      {state.installed === null ? (
        <Button variant="ghost" size="sm" onClick={() => run("inspect")} disabled={state.busy}>
          {state.busy ? "Checking..." : "Check"}
        </Button>
      ) : (
        <span className="text-[11px] text-muted-foreground" title={state.installed.join(", ")}>
          {state.installed.length || "none"}
        </span>
      )}
      <Button variant="outline" size="sm" onClick={() => run("install")} disabled={state.busy}>
        {state.busy ? "Working..." : "Install"}
      </Button>
    </div>
  );
}
