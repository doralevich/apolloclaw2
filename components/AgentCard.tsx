"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, ClipboardCheck, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { statusVariant } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import type { IntegrationConnectionsResult, MergedAgent, Role } from "@/lib/types";
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
}: {
  agent: MergedAgent;
  role: Role;
  isPlatformAdmin: boolean;
  onChanged: () => void;
}) {
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
