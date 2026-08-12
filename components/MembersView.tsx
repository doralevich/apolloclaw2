"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Trash2, UserPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAsyncAction } from "@/lib/useAsyncAction";
import type { Invitation, Role, WorkspaceMember } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Shown in the invite dialog. Worded around what the person can DO, because "admin" and
// "member" mean nothing to someone inviting their office manager. Member is listed first
// because it is the right answer almost every time.
const ROLE_CHOICES: { value: Role; label: string; description: string }[] = [
  {
    value: "member",
    label: "Member",
    description:
      "Can chat with your agents, connect apps, and see usage. Can't buy credits, change workspace settings, or invite anyone.",
  },
  {
    value: "admin",
    label: "Admin",
    description:
      "Full control: billing, workspace settings, invites, and creating or deleting agents. An admin can remove you.",
  },
];

export function MembersView() {
  const { current } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviteEmail, setInviteEmail] = useState("");
  // Set when the server has said the address is outside the inviter's company. The next press
  // sends allow_external and goes through — a confirm, not a wall. See lib/seats.ts for why
  // this warns rather than refuses.
  const [externalWarning, setExternalWarning] = useState("");
  const [withAgent, setWithAgent] = useState(false);
  // The charge is two presses, at David's call. He went through this flow and it "just went to
  // payment" - the price was on screen, but stating a price and asking permission to charge it
  // are different acts, and the second one deserves its own press. First press arms; the box
  // below says exactly what the next press does; anything that changes the order disarms.
  const [chargeArmed, setChargeArmed] = useState(false);
  const { busy, run } = useAsyncAction();

  const load = useCallback(async () => {
    if (!current) return;
    try {
      const data = await apiFetch<{ members: WorkspaceMember[]; invitations: Invitation[]; role: Role }>(
        `/api/workspaces/${current.id}/members`
      );
      setMembers(data.members);
      setInvitations(data.invitations);
      setRole(data.role);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [current]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const isAdmin = role === "admin";

  function resendInvite(token: string, email: string) {
    if (!current) return;
    return run(async () => {
      try {
        await apiFetch(`/api/workspaces/${current.id}/invitations/${token}/resend`, { method: "POST" });
        toast.success(`Invitation resent to ${email}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function createInvite() {
    if (!current) return;
    if (withAgent && !chargeArmed) {
      setChargeArmed(true);
      return;
    }
    return run(async () => {
      try {
        // Two endpoints, because they are two different acts. /seats charges the card and
        // builds a VPS; /members writes an invitation row. Folding them together would make a
        // checkbox the difference between a free action and a recurring bill inside one
        // handler, which is exactly the kind of thing that gets refactored wrong later.
        const path = withAgent
          ? `/api/workspaces/${current.id}/seats`
          : `/api/workspaces/${current.id}/members`;
        const { url } = await apiFetch<{ url?: string }>(path, {
          method: "POST",
          body: JSON.stringify({
            role: inviteRole,
            // Optional on /members: an invite with no address is the old copy-a-link
            // behaviour, still the only option when you do not know where they read mail.
            // Required on /seats, which is why the checkbox is disabled without one.
            ...(inviteEmail.trim() ? { email: inviteEmail.trim() } : {}),
            allow_external: !!externalWarning,
          }),
        });
        if (url) await navigator.clipboard.writeText(url).catch(() => {});
        toast.success(
          withAgent
            ? "Seat added - their agent is building now"
            : url
              ? "Invite link created and copied"
              : "Invitation created"
        );
        setInviteOpen(false);
        setInviteEmail("");
        setExternalWarning("");
        setWithAgent(false);
        load();
      } catch (e) {
        // 409 external_domain is a question, not a failure: show what is unusual about the
        // address and let the same button mean "yes, I meant that".
        const err = e as { code?: string; message?: string };
        if (err?.code === "external_domain") {
          setExternalWarning(err.message || "That address is outside your company.");
          return;
        }
        throw e;
      }
    });
  }

  async function removeMember(userId: string) {
    if (!current) return;
    try {
      await apiFetch(`/api/workspaces/${current.id}/members/${userId}`, { method: "DELETE" });
      toast.success("Member removed");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function revokeInvite(token: string) {
    if (!current) return;
    try {
      await apiFetch(`/api/workspaces/${current.id}/invitations/${token}`, { method: "DELETE" });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">{current.name}</p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4" />
                Invite member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite member</DialogTitle>
                <DialogDescription>
                  Create an invite link and share it. Anyone who opens it joins this workspace with
                  the access you pick below.
                </DialogDescription>
              </DialogHeader>

              {/* Who it is for. Optional, because an invite with no address is the old
                  copy-a-link behaviour and is still the only option when you do not know where
                  someone reads their mail. Supplied, it is what the same-company check reads
                  and what a seat will be provisioned against. */}
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Their email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    // Editing the address retracts the confirmation — otherwise a second,
                    // different outside address would ride through on the first one's approval.
                    setExternalWarning("");
                  }}
                  placeholder="colleague@yourcompany.com"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Leave it empty for a link you share yourself.
                </p>
              </div>

              {externalWarning && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  {externalWarning} Press invite again to go ahead.
                </div>
              )}

              {/* An agent of their own, and what it costs, on the screen where the decision is
                  made. This is the one control in the dashboard that both charges the card and
                  creates a VPS, so the price is stated next to the checkbox rather than
                  discovered on the invoice. */}
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  withAgent ? "border-primary ring-1 ring-primary" : "hover:bg-secondary/50",
                  !inviteEmail.trim() && "cursor-not-allowed opacity-60"
                )}
              >
                <input
                  type="checkbox"
                  checked={withAgent}
                  disabled={!inviteEmail.trim()}
                  onChange={(e) => { setWithAgent(e.target.checked); setChargeArmed(false); }}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">Give them their own agent</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    <strong className="text-foreground">$449 one-time + $189/month</strong> hosting,
                    pro-rated from today, both on the same invoice. Their agent is built now and
                    waiting when they sign in. They answer their own questionnaire, so it is built
                    around their work, not yours.
                    {!inviteEmail.trim() && " Needs an email address above."}
                  </span>
                </span>
              </label>

              {chargeArmed && (
                <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-xs leading-relaxed">
                  <strong className="text-foreground">Pressing again charges your card.</strong>{" "}
                  $449 once plus $189/month added to your hosting subscription, pro-rated from
                  today, and their agent starts building immediately. Cancel costs nothing.
                </div>
              )}

              {/* Member is the default and deliberately listed first. Admin used to be the only
                  option — inviting anyone handed them the workspace. */}
              <div className="space-y-2">
                {ROLE_CHOICES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setInviteRole(c.value)}
                    aria-pressed={inviteRole === c.value}
                    className={cn(
                      "w-full cursor-pointer rounded-lg border p-3 text-left transition-colors",
                      inviteRole === c.value ? "border-primary ring-1 ring-primary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="text-sm font-medium">{c.label}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                  </button>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setInviteOpen(false); setChargeArmed(false); }} disabled={busy}>
                  Cancel
                </Button>
                <Button onClick={createInvite} disabled={busy}>
                  {busy
                    ? withAgent
                      ? "Adding seat..."
                      : "Creating..."
                    : externalWarning
                      ? "Invite anyway"
                      : withAgent
                        ? chargeArmed
                          ? "Confirm - charge $449 + $189/mo"
                          : "Add seat - $449 + $189/mo"
                        : "Create invite link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Added</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id} className="border-t">
                    <td className="px-4 py-3 font-medium">{m.email}</td>
                    <td className="px-4 py-3">
                      {/* Was hardcoded to "Admin", which was accurate only because admin was
                          the sole role the schema allowed. It reads the row now. */}
                      <Badge variant={m.role === "admin" ? "default" : "muted"}>
                        {m.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove member"
                          onClick={() => removeMember(m.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isAdmin && invitations.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Pending invitations</h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Invited</th>
                      <th className="px-4 py-2.5 font-medium">Joins as</th>
                      <th className="px-4 py-2.5 font-medium">Created</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => (
                      <tr key={inv.token} className="border-t">
                        {/* WHO, not a token stub - David's review: an admin scanning this
                            table is asking "did Sarah get hers?", and eight hex characters
                            answer nothing. Link-only invitations keep the stub, honestly:
                            they have no recipient to name. */}
                        <td className="px-4 py-3">
                          {inv.email ? (
                            <span className="inline-flex items-center gap-2">
                              {inv.email}
                              {inv.with_agent && <Badge variant="default">Agent seat</Badge>}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              …/invite/{inv.token.slice(0, 8)}
                            </span>
                          )}
                        </td>
                        {/* A link already out in the world carries a role decided when it was
                            made, so it has to be visible before someone opens it. */}
                        <td className="px-4 py-3">
                          <Badge variant={inv.role === "admin" ? "default" : "muted"}>
                            {inv.role === "admin" ? "Admin" : "Member"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {/* Resend, only where there is somewhere to send to. Spam folders
                              happen, and the alternative was revoke-and-reinvite - which for
                              a seat invitation tears down billing state to fix a lost email. */}
                          {inv.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Resend invitation email"
                              title="Resend email"
                              onClick={() => resendInvite(inv.token, inv.email!)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copy invite link"
                            onClick={() => {
                              navigator.clipboard.writeText(inv.url);
                              toast.success("Link copied");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Revoke invite"
                            onClick={() => revokeInvite(inv.token)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
