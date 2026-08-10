"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { AdminAccount } from "@/lib/types";
import type { AccountTeardownResult } from "@/lib/admin-teardown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every registered account. Deleting one removes its sole-member workspaces, their
          agents and instances, and the login itself.
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
                      {a.entitlement ? (
                        <Badge variant={a.entitlement === "active" ? "success" : "muted"}>
                          {a.entitlement}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.last_sign_in_at ? formatDate(a.last_sign_in_at) : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.is_platform_admin ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleting(a)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      )}
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
