"use client";

import { useState } from "react";
import { DoorOpen, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate, statusVariant, usd } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import { runtimeForTemplate } from "@/config/agents";
import type { AdminAgentDetail, Budget } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Shared instance/workspace building blocks for the admin god-view. These used to live inside
// AdminWorkspacesView; they were lifted out when Workspaces + Accounts merged into the Customers
// tab, so both Customers (per-workspace detail on a customer row) and Fleet (Open in ApolloClaw)
// pull from one place.

// Support access: become an admin member of the customer's workspace (idempotent, audit-logged)
// and open the ApolloClaw dashboard in a new tab pointed AT their workspace via ?ws= - landing
// inside THEIR workspace with the whole product available: checklist, integrations, skills,
// channels. This is how "help the client with their setup" actually happens; the OpenClaw button
// next to it is the raw instance for when the product isn't the surface you need.
//
// The ?ws= param is a PER-TAB support view (see WorkspaceProvider): it deliberately does NOT
// write the cross-session default, so opening a customer for support never makes their workspace
// the admin's home on future logins.
export async function openWorkspaceInApolloClaw(workspaceId: string): Promise<void> {
  await apiFetch(`/api/admin/workspaces/${workspaceId}/join`, { method: "POST" });
  // Open the FINAL page (start-here), not /dashboard: /dashboard is a server redirect to
  // start-here, and that redirect drops the query string - so opening /dashboard?ws= lost the
  // param before the provider could read it. Targeting the real destination keeps ?ws= intact.
  window.open(`/dashboard/start-here?ws=${encodeURIComponent(workspaceId)}`, "_blank", "noopener");
}

export type Detail = { loading: boolean; agents: AdminAgentDetail[] | null };

export function OpenWorkspaceButton({ workspaceId }: { workspaceId: string }) {
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
export function LeaveWorkspaceButton({
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

export function InstanceList({ detail }: { detail: Detail | undefined }) {
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
                  having here — the image name only ever told us what the build was once called. */}
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
                    {/* Purchased credit lives in its OWN bucket - read both field names, newer
                        first, exactly like lib/budget.ts. */}
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

// Log into this instance's OpenClaw dashboard as its user sees it - signed URL plus the gateway
// token, minted by the admin open route and audit-logged there.
export function OpenInstanceButton({ agentId }: { agentId: string }) {
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    // Opened synchronously inside the click: after the await the browser no longer treats this
    // as user-initiated and silently blocks the popup (returns null, throws nothing).
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null; // preserve the old noopener guarantee
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/admin/agents/${agentId}/open`, {
        method: "POST",
      });
      if (tab) tab.location.href = url;
      else window.location.assign(url); // popup blocked anyway → fall back to this tab
    } catch (e) {
      tab?.close();
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

// Per-agent skills: what's installed, and a button to push the current set. Skills install at
// provision, so this is how an edit to config/skills.ts reaches agents that already exist.
export function SkillsCell({ agentId }: { agentId: string }) {
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
