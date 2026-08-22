"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trash2, MoreHorizontal, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { graceDaysLeft, inGrace } from "@/lib/entitlement";
import type { AdminAccount } from "@/lib/types";
import type { AccountTeardownResult } from "@/lib/admin-teardown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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

// One access-state control per row. "Live" = full access; "grace" opens the same 10-day window
// a Stripe cancellation does; "deactivate" locks immediately. Mirrors the server's actions.
type EntitlementAction = "live" | "grace" | "deactivate";

// How the License cell reads, given the stored status and grace window. Grace is shown even
// though the underlying status is still "canceled", because access is what the admin cares about.
function licenseBadge(account: AdminAccount) {
  if (account.entitlement === "active") return { label: "active", variant: "success" as const };
  if (inGrace(account.grace_until)) {
    const days = graceDaysLeft(account.grace_until);
    return { label: `grace · ${days}d left`, variant: "warning" as const };
  }
  if (account.entitlement) return { label: account.entitlement, variant: "muted" as const };
  return null;
}

// Accounts — every registered person, and the door out for the ones that shouldn't be here.
//
// Built after the go-live cleanup, when "show me all the email addresses" meant the Supabase
// dashboard and "delete this account" meant a hand-run SQL sweep. One row per auth user with
// what hangs off them; Delete runs the full teardown (workspaces, agents, the Agent37 VPS
// behind each) and reports back anything that still needs a human - a Stripe subscription to
// cancel, an instance whose delete failed.

export function AdminAccountsView() {
  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);
  const [emailEditing, setEmailEditing] = useState<AdminAccount | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [newAcct, setNewAcct] = useState({ email: "", first: "", last: "", password: "" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ accounts: AdminAccount[] }>("/api/admin/accounts");
      setAccounts(data.accounts);
    } catch (e) {
      toast.error((e as Error).message);
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount; setState happens after the await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Create a login by hand so a white-glove setup doesn't wait on the client registering. You
  // set the password and hand it over directly - the reliable path when their corporate mail
  // blocks ours. The account is created active, so they can sign in right away.
  async function createAccount() {
    const email = newAcct.email.trim();
    if (!email || newAcct.password.length < 8) {
      toast.error("Email and a password of at least 8 characters are required.");
      return;
    }
    setCreating(true);
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
      setCreating(false);
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
    // Follow-ups stay on screen until dismissed - these are the by-hand steps.
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every registered account. Deleting one removes its sole-member workspaces, their
          agents and instances, and the login itself.
        </p>
      </div>

      {/* Create a login by hand for a white-glove client, set the password and hand it over, then
          go to Workspaces to create their workspace. */}
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
            className="h-9 min-w-[15rem] flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="text"
            value={newAcct.first}
            onChange={(e) => setNewAcct((a) => ({ ...a, first: e.target.value }))}
            placeholder="First name"
            className="h-9 w-28 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="text"
            value={newAcct.last}
            onChange={(e) => setNewAcct((a) => ({ ...a, last: e.target.value }))}
            placeholder="Last name"
            className="h-9 w-28 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="text"
            value={newAcct.password}
            onChange={(e) => setNewAcct((a) => ({ ...a, password: e.target.value }))}
            placeholder="Password (8+ chars)"
            className="h-9 w-40 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="sm" disabled={creating || !newAcct.email.trim() || newAcct.password.length < 8}>
            {creating ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Created active and ready to sign in. Give the client the password directly (their mail may block ours).
        </p>
      </div>

      {accounts === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No accounts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Workspaces</th>
                <th className="px-4 py-2 font-medium">Agents</th>
                <th className="px-4 py-2 font-medium">License</th>
                <th className="px-4 py-2 font-medium">Registered</th>
                <th className="px-4 py-2 font-medium">Last sign-in</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const name = [a.first_name, a.last_name].filter(Boolean).join(" ");
                return (
                  <tr key={a.id} className="border-t [&>td]:align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        {a.email}
                        {a.is_platform_admin && (
                          <span title="Platform admin">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{name || "No name on file"}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.workspaces.length === 0
                        ? "-"
                        : a.workspaces.map((w) => (
                            <div key={w.id}>
                              {w.name}{" "}
                              <span className="text-xs">
                                ({w.role}
                                {w.member_count > 1 ? `, ${w.member_count} members` : ""})
                              </span>
                            </div>
                          ))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.agents_owned.length === 0
                        ? String(a.workspaces.reduce((n, w) => n + w.agent_count, 0) || "-")
                        : a.agents_owned.map((ag) => (
                            <div key={ag.agent37_id}>
                              {ag.name || "Untitled"}{" "}
                              <span className="font-mono text-[11px]">{ag.agent37_id}</span>
                            </div>
                          ))}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const b = licenseBadge(a);
                        return b ? (
                          <Badge variant={b.variant}>{b.label}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.last_sign_in_at ? formatDate(a.last_sign_in_at) : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
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
                            <DropdownMenuItem
                              disabled={a.entitlement === "active"}
                              onClick={() => setEntitlement(a, "live")}
                            >
                              Set live
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEntitlement(a, "grace")}>
                              Start 10-day grace
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEntitlement(a, "deactivate")}>
                              Deactivate now
                            </DropdownMenuItem>
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!emailEditing}
        onOpenChange={(open) => {
          if (!open) setEmailEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              Moves the login and the entitlement to the new address, so access is kept. The new
              address is marked verified with no confirmation email sent. Use this when a customer
              cannot receive our mail at their current address.
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
