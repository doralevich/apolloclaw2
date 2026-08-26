"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, ClipboardCheck, MessageSquare, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { statusVariant } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import type { Budget, IntegrationConnectionsResult, MergedAgent, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentActionsMenu } from "@/components/AgentActionsMenu";
import { AgentAvatarPicker } from "@/components/AgentAvatarPicker";
import { AgentNameCell } from "@/components/AgentNameCell";
import { SetupCell } from "@/components/SetupPrompt";

// One agent, as a card rather than a row.
//
// This page was a table — Name, Status, Setup, Type, Resources, Quick actions — which is the
// right shape for a fleet and the wrong one for a customer, who owns exactly one agent and so
// saw a table with a single row. Two of those columns were also answering questions nobody
// asked: Type is a constant (they have one), and Resources printed the vCPU/RAM/disk of a
// machine they do not administer and cannot change.
//
// What replaces them is the thing a customer actually wants to know — is it awake, does it
// know about my business, and is it plugged into anything.

export function AgentCard({
  agent,
  role,
  isPlatformAdmin,
  onChanged,
  owner,
}: {
  agent: MergedAgent;
  role: Role;
  isPlatformAdmin: boolean;
  onChanged: () => void;
  /** Who this agent belongs to, resolved by the admin roster. Absent for members, who only
   *  ever see their own. Replaces the separate roster TABLE that repeated every card's facts
   *  one screen lower - one surface, with the missing column added, instead of two. */
  owner?: { first_name: string; last_name: string; email: string } | null;
}) {
  const { active, setActiveId } = useActiveAgent();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function removeAgent() {
    await apiFetch(`/api/agents/${agent.agent37_id}`, { method: "DELETE" });
    toast.success(`${name} deleted`);
    // Clear the selection if the deleted agent was the active one - leaving the dead id in
    // place would keep Chat and Connections pointed at an instance that no longer exists.
    if (active?.agent37_id === agent.agent37_id) setActiveId("");
    onChanged();
  }
  const typeLabel = agent.agent_type ? getAgentType(agent.agent_type)?.label : undefined;
  const name = agent.name?.trim() || typeLabel || "Your agent";

  // How many apps this agent can actually reach. Fetched here rather than threaded through
  // the agent list because it is a different upstream (Composio via Agent37) with its own
  // failure mode — a slow or broken integrations read must not delay or blank the card, so
  // it stays null and simply renders nothing.
  const [connected, setConnected] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agent.agent37_id}/integrations/connections`)
      .then((res) => {
        if (cancelled) return;
        setConnected(
          res.connections.filter((c) => !c.isDisabled && (c.status || "").toUpperCase() === "ACTIVE")
            .length
        );
      })
      .catch(() => {
        // Silent: an unknown count is not worth a toast on a page you opened to check status.
      });
    return () => {
      cancelled = true;
    };
  }, [agent.agent37_id]);

  // Unspent purchased credit, so the delete confirm can warn that it's about to be thrown away.
  // A real customer deleted an agent that still had $23 of credit on it and lost it - the number
  // belongs in front of them before they confirm, not in a support ticket afterwards. Same quiet
  // failure mode as the app count: an unknown balance just doesn't warn.
  const [creditMicros, setCreditMicros] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    apiFetch<Budget & { credit_remaining_micros?: number }>(`/api/agents/${agent.agent37_id}/budget`)
      .then((b) => {
        if (!cancelled) setCreditMicros(b.credit_remaining_micros ?? b.topup_remaining_micros ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [agent.agent37_id]);
  const creditDollars = creditMicros && creditMicros > 0 ? creditMicros / 1_000_000 : 0;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-start gap-4">
        <AgentAvatarPicker
          agentId={agent.agent37_id}
          currentUrl={agent.avatar_url}
          agentName={name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AgentNameCell agent={agent} canEdit={role === "admin"} onRenamed={onChanged} />
            <Badge variant={statusVariant(agent.live_status)}>
              {agent.live_status ?? "unknown"}
            </Badge>
            {agent.past_due && <Badge variant="warning">past due</Badge>}
          </div>

          {agent.status_reason && (
            <p className="mt-1.5 text-xs text-destructive">{agent.status_reason.message}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {/* SetupCell renders bare text ("Complete", "Applying…", or a Finish setup link),
                which was unambiguous as a table cell under a "Setup" header and is not on a
                line beside the app count. The icon carries the header's job. */}
            <span className="inline-flex items-center gap-1.5">
              <ClipboardCheck className="size-3.5" />
              <SetupCell agent={agent} />
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
            {/* The roster's one useful column, where the rest of the facts already were: whose
                agent this is, by name. Admin-only by construction - the roster endpoint that
                resolves names refuses members. */}
            {owner && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                {[owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.email}
                {owner.email && <span className="text-muted-subtle">· {owner.email}</span>}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/chat">
              <MessageSquare className="size-4" />
              Chat
            </Link>
          </Button>
          <AgentActionsMenu
            agent={agent}
            role={role}
            isPlatformAdmin={isPlatformAdmin}
            onChanged={onChanged}
          />
        </div>
      </div>

      {/* Delete, ON the card it deletes - stage 2 of the settings rework. The old
          DeleteAgentSection sat on Settings > General and deleted whichever agent the hidden
          sidebar switcher happened to have active, which in a two-agent workspace was a
          roulette wheel. Here there is no ambiguity to have: the card names the agent, the
          confirm names it again, and the seat-credit behavior is stated before the button. */}
      {role === "admin" && (
        <>
          <div className="mt-4 flex justify-end border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" />
              Delete {name}
            </Button>
          </div>
          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title={`Delete ${name}?`}
            description={
              (creditDollars > 0
                ? `Heads up: ${name} still has $${creditDollars.toFixed(2)} in purchased credit, which is lost once it's finally deleted. `
                : "") +
              `This stops ${name} and moves it to the trash. We keep it for 30 days, so you can ask us to bring it back with its memory of the business, its app connections and its chat history intact - after that it's deleted for good. If this workspace still has another agent afterwards, the $189/month hosting seat is credited back automatically.`
            }
            confirmText={`Delete ${name}`}
            destructive
            onConfirm={removeAgent}
          />
        </>
      )}

      {/* The machine, for us. A customer cannot act on vCPU/RAM/disk and should not have to
          read it; we need it constantly when something is misbehaving. */}
      {isPlatformAdmin && (
        <div className="mt-4 border-t pt-3 text-xs text-muted-subtle">
          {typeLabel ?? agent.template ?? "unknown type"} · {agent.cpu} vCPU · {agent.memory} GB ·{" "}
          {agent.disk} GB · <span className="font-mono">{agent.agent37_id}</span>
        </div>
      )}
    </div>
  );
}
