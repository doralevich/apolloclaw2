"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, LogOut, Mail, MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { graceDaysLeft, inGrace } from "@/lib/entitlement";
import type { AdminAccount, AdminWorkspaceSummary } from "@/lib/types";
import type { AccountTeardownResult } from "@/lib/admin-teardown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CreateAgentButton } from "@/components/CreateAgentButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  InstanceList,
  LeaveWorkspaceButton,
  OpenWorkspaceButton,
  type Detail,
} from "@/components/admin/workspace-instances";

// Customers — every customer in one place: who they are, their license, their workspace(s), and
// the agents inside. This is the old Workspaces and Accounts tabs merged: the account is the spine
// (so a registered person with no workspace still shows, and the license levers live where the
// person does), and each account expands to the workspace detail Workspaces used to own -
// instances, budgets, and the support actions (Open in ApolloClaw, Create agent, Leave).

type EntitlementAction = "live" | "grace" | "deactivate";

function licenseBadge(account: AdminAccount) {
  if (account.entitlement === "active") return { label: "active", variant: "success" as const };
  if (inGrace(account.grace_until)) {
    return { label: `grace · ${graceDaysLeft(account.grace_until)}d left`, variant: "warning" as const };
  }
  if (account.entitlement) return { label: account.entitlement, variant: "muted" as const };
  return null;
}

function initialFor(account: AdminAccount): string {
  const name = [account.first_name, account.last_name].filter(Boolean).join(" ").trim();
  return (name || account.email).slice(0, 1).toUpperCase();
}

export function AdminCustomersView() {
  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceSummary[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, Detail>>({});

  // Account-level state (from the old Accounts tab)
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);
  const [emailEditing, setEmailEditing] = useState<AdminAccount | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [newAcct, setNewAcct] = useState({ email: "", first: "", last: "", password: "" });
  const [creatingAcct, setCreatingAcct] = useState(false);

  // Workspace-level state (from the old Workspaces tab)
  const [newWs, setNewWs] = useState({ email: "", name: "" });
  const [creatingWs, setCreatingWs] = useState(false);
  const [confirmLeaveAll, setConfirmLeaveAll] = useState(false);
  const [leavingAll, setLeavingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const [acc, ws] = await Promise.all([
        apiFetch<{ accounts: AdminAccount[] }>("/api/admin/accounts"),
        apiFetch<{ workspaces: AdminWorkspaceSummary[] }>("/api/admin/workspaces"),
      ]);
      setAccounts(acc.accounts);
      setWorkspaces(ws.workspaces);
    } catch (e) {
      toast.error((e as Error).message);
      setAccounts([]);
      setWorkspaces([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const wsMap = useMemo(() => {
    const m = new Map<string, AdminWorkspaceSummary>();
    for (const w of workspaces ?? []) m.set(w.id, w);
    return m;
  }, [workspaces]);

  const supportCount = (workspaces ?? []).filter((w) => w.you_are_member && !w.you_own).length;

  const loadDetail = useCallback(async (workspaceId: string) => {
    setDetails((d) => ({ ...d, [workspaceId]: { loading: true, agents: d[workspaceId]?.agents ?? null } }));
    try {
      const data = await apiFetch<{ agents: Detail["agents"] }>(`/api/admin/workspaces/${workspaceId}/agents`);
      setDetails((d) => ({ ...d, [workspaceId]: { loading: false, agents: data.agents } }));
    } catch (e) {
      toast.error((e as Error).message);
      setDetails((d) => ({ ...d, [workspaceId]: { loading: false, agents: [] } }));
    }
  }, []);

  const toggle = useCallback(
    (account: AdminAccount) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(account.id)) {
          next.delete(account.id);
        } else {
          next.add(account.id);
          for (const w of account.workspaces) {
            if (!details[w.id]) void loadDetail(w.id);
          }
        }
        return next;
      });
    },
    [details, loadDetail]
  );

  async function createAccount() {
    const email = newAcct.email.trim();
    if (!email || newAcct.password.length < 8) {
      toast.error("Email and a password of at least 8 characters are required.");
      return;
    }
    setCreatingAcct(true);
    try {
      await apiFetch("/api/admin/accounts", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: newAcct.password,
          firstName: newAcct.first.trim() || undefined,
          lastName: newAcct.last.trim() || undefined,
        }),
      });
      toast.success(`Account created for ${email}. Give them the password directly.`);
      setNewAcct({ email: "", first: "", last: "", password: "" });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreatingAcct(false);
    }
  }

  async function createWorkspace() {
    const email = newWs.email.trim();
    if (!email) return;
    setCreatingWs(true);
    try {
      await apiFetch("/api/admin/workspaces", {
        method: "POST",
        body: JSON.stringify({ email, name: newWs.name.trim() || undefined }),
      });
      toast.success(`Workspace created for ${email}.`);
      setNewWs({ email: "", name: "" });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreatingWs(false);
    }
  }

  async function leaveAll() {
    setLeavingAll(true);
    try {
      const { count } = await apiFetch<{ left: string[]; count: number }>(
        "/api/admin/workspaces/leave-all",
        { method: "POST" }
      );
      toast.success(
        count === 0 ? "No support memberships to leave." : `Left ${count} support workspace${count === 1 ? "" : "s"}.`
      );
      setConfirmLeaveAll(false);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLeavingAll(false);
    }
  }

  async function destroy(account: AdminAccount) {
    const result = await apiFetch<AccountTeardownResult>(`/api/admin/accounts/${account.id}`, {
      method: "DELETE",
    });
    const parts = [
      `${result.email} deleted.`,
      result.workspaces_deleted.length ? `Workspaces removed: ${result.workspaces_deleted.join(", ")}.` : "",
      result.agents_deleted.length ? `Agents deleted: ${result.agents_deleted.join(", ")}.` : "",
    ].filter(Boolean);
    toast.success(parts.join(" "));
    for (const note of result.notes) toast.warning(note, { duration: Infinity });
    await load();
  }

  async function setEntitlement(account: AdminAccount, action: EntitlementAction) {
    const verb = action === "live" ? "set live" : action === "grace" ? "moved to grace" : "deactivated";
    try {
      await apiFetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      toast.success(`${account.email} ${verb}.`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function saveEmail() {
    if (!emailEditing) return;
    const next = emailValue.trim().toLowerCase();
    if (!next || next === emailEditing.email) {
      setEmailEditing(null);
      return;
    }
    setEmailSaving(true);
    try {
      await apiFetch(`/api/admin/accounts/${emailEditing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ newEmail: next }),
      });
      toast.success(`Email changed to ${next}.`);
      setEmailEditing(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEmailSaving(false);
    }
  }

  const onCreatedAgent = useCallback(
    (workspaceId: string) => {
      void load();
      void loadDetail(workspaceId);
    },
    [load, loadDetail]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Every registered account, with its license, workspace(s), and agents. Expand a customer
            for instance detail and support access. Deleting an account removes its sole-member
            workspaces, their agents and instances, and the login itself.
          </p>
        </div>
        {supportCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmLeaveAll(true)}
            title="Leave every workspace you only joined for support"
          >
            <LogOut className="h-4 w-4" />
            Leave {supportCount} support workspace{supportCount === 1 ? "" : "s"}
          </Button>
        )}
      </div>

      {/* Create forms: a login by hand, or a workspace for an existing user. */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">New account</p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void createAccount();
            }}
          >
            <input
              type="email"
              required
              value={newAcct.email}
              onChange={(e) => setNewAcct((a) => ({ ...a, email: e.target.value }))}
              placeholder="user@email.com"
              className="h-9 min-w-[12rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              value={newAcct.first}
              onChange={(e) => setNewAcct((a) => ({ ...a, first: e.target.value }))}
              placeholder="First"
              className="h-9 w-20 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              value={newAcct.last}
              onChange={(e) => setNewAcct((a) => ({ ...a, last: e.target.value }))}
              placeholder="Last"
              className="h-9 w-20 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              value={newAcct.password}
              onChange={(e) => setNewAcct((a) => ({ ...a, password: e.target.value }))}
              placeholder="Password (8+)"
              className="h-9 w-32 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="sm" disabled={creatingAcct || !newAcct.email.trim() || newAcct.password.length < 8}>
              {creatingAcct ? "Creating..." : "Create"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Created active and ready to sign in. Give the client the password directly.
          </p>
        </div>

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
              value={newWs.email}
              onChange={(e) => setNewWs((w) => ({ ...w, email: e.target.value }))}
              placeholder="user@email.com (must have an account)"
              className="h-9 min-w-[14rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              type="text"
              value={newWs.name}
              onChange={(e) => setNewWs((w) => ({ ...w, name: e.target.value }))}
              placeholder="Workspace name (optional)"
              className="h-9 min-w-[10rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="sm" disabled={creatingWs || !newWs.email.trim()}>
              {creatingWs ? "Creating..." : "Create"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            The user must already have an account. Owned by them, appears in their dashboard next login.
          </p>
        </div>
      </div>

      {accounts === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((a) => {
            const isOpen = expanded.has(a.id);
            const name = [a.first_name, a.last_name].filter(Boolean).join(" ");
            const members = a.workspaces.reduce((n, w) => n + w.member_count, 0);
            const agentCount = a.workspaces.reduce((n, w) => n + w.agent_count, 0);
            const running = a.workspaces.reduce((n, w) => n + (wsMap.get(w.id)?.running_count ?? 0), 0);
            const lic = licenseBadge(a);
            return (
              <div key={a.id} className="rounded-xl border bg-card">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggle(a)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left hover:text-primary"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted font-semibold text-muted-foreground">
                      {initialFor(a)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span className="truncate">{a.email}</span>
                        {a.is_platform_admin && (
                          <span title="Platform admin">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{name || "No name on file"}</div>
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="w-24">
                      <p className="text-xs text-muted-foreground">License</p>
                      {lic ? <Badge variant={lic.variant}>{lic.label}</Badge> : <span className="text-sm text-muted-foreground">-</span>}
                    </div>
                    <Stat label="Members" value={String(members)} className="w-14" />
                    <Stat
                      label="Agents"
                      value={agentCount === 0 ? "0" : `${agentCount}${running ? ` (${running} running)` : ""}`}
                      className="w-28"
                    />
                    <Stat label="Last seen" value={a.last_sign_in_at ? formatDate(a.last_sign_in_at) : "Never"} className="w-24" />
                  </div>

                  <div className="ml-auto">
                    {a.is_platform_admin ? (
                      <span className="text-xs text-muted-foreground">Protected</span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Access</DropdownMenuLabel>
                          <DropdownMenuItem disabled={a.entitlement === "active"} onClick={() => setEntitlement(a, "live")}>
                            Set live
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEntitlement(a, "grace")}>Start 10-day grace</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEntitlement(a, "deactivate")}>Deactivate now</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEmailValue(a.email);
                              setEmailEditing(a);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                            Change email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(a)}>
                            <Trash2 className="h-4 w-4" />
                            Delete account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t bg-muted/30 p-4">
                    {a.workspaces.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No workspace yet. Create one for this customer with the New workspace form above (use{" "}
                        <span className="font-mono">{a.email}</span>).
                      </p>
                    ) : (
                      a.workspaces.map((w) => {
                        const ws = wsMap.get(w.id);
                        return (
                          <div key={w.id} className="space-y-2">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <div className="min-w-0">
                                <span className="font-medium">{w.name}</span>{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({w.role}
                                  {w.member_count > 1 ? `, ${w.member_count} members` : ""})
                                </span>
                                <span className="block truncate font-mono text-xs text-muted-foreground">{w.id}</span>
                              </div>
                              <div className="ml-auto flex flex-wrap items-center gap-2">
                                <OpenWorkspaceButton workspaceId={w.id} />
                                {ws?.you_are_member && !ws?.you_own && (
                                  <LeaveWorkspaceButton workspaceId={w.id} name={w.name} onLeft={load} />
                                )}
                                <CreateAgentButton
                                  workspaceId={w.id}
                                  onCreated={() => onCreatedAgent(w.id)}
                                  label="Create Apollo Agent"
                                  size="sm"
                                />
                              </div>
                            </div>
                            <InstanceList detail={details[w.id]} />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmLeaveAll}
        onOpenChange={(open) => {
          if (!leavingAll) setConfirmLeaveAll(open);
        }}
        title={`Leave ${supportCount} support workspace${supportCount === 1 ? "" : "s"}?`}
        description="Removes your support membership from every customer workspace you don't own. Your own workspaces are untouched, and you can rejoin any customer any time with Open in ApolloClaw."
        confirmText={leavingAll ? "Leaving..." : "Leave all"}
        onConfirm={leaveAll}
      />

      <Dialog open={!!emailEditing} onOpenChange={(open) => { if (!open) setEmailEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              Moves the login and the entitlement to the new address, so access is kept. The new
              address is marked verified with no confirmation email sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              autoComplete="off"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="name@example.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEmail();
              }}
            />
            {emailEditing && (
              <p className="text-xs text-muted-foreground">
                Currently <span className="font-medium text-foreground">{emailEditing.email}</span>.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailEditing(null)} disabled={emailSaving}>
              Cancel
            </Button>
            <Button onClick={saveEmail} disabled={emailSaving}>
              {emailSaving ? "Saving..." : "Change email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleting && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          title={`Delete ${deleting.email}?`}
          description={
            `This permanently removes the account` +
            (deleting.workspaces.length
              ? `, its workspace${deleting.workspaces.length === 1 ? "" : "s"} (${deleting.workspaces
                  .map((w) => w.name)
                  .join(", ")}), and every agent inside - including the running instances.`
              : ".") +
            ` Stripe subscriptions are never touched; you'll be told if one needs cancelling.`
          }
          confirmText="Delete account"
          destructive
          onConfirm={() => destroy(deleting)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm" title={value}>
        {value}
      </p>
    </div>
  );
}
