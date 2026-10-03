"use client";

import { useEffect, useState } from "react";
import { Send, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

// Every agent living on this instance, under the card for the one the app knows about.
//
// The product records one agent per instance, and OpenClaw can run several on one gateway. The
// first time that happened (the two-agent test, Oct 3 2026) the second agent answered on
// Telegram and appeared nowhere in the app. This reads the box's own roster and shows it, so the
// page and the server agree on who is there. Renders nothing while the instance reports a single
// agent, which is every customer today.

type RosterAgent = { id: string; name: string | null; telegram: boolean };

export function AgentTeam({ agentId, mainName }: { agentId: string; mainName: string }) {
  const [agents, setAgents] = useState<RosterAgent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ ok: boolean; agents: RosterAgent[] }>(`/api/agents/${agentId}/roster`)
      .then((res) => {
        if (!cancelled) setAgents(res.ok ? res.agents : []);
      })
      .catch(() => {
        // Silent: a roster that could not be read is the same as a single agent for this page.
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (!agents || agents.length < 2) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Users className="size-3.5" />
        {agents.length} agents on this instance
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {agents.map((a) => {
          const label = a.id === "main" ? mainName : a.name || a.id;
          return (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-muted-foreground">
                {label.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{label}</div>
                <div className="truncate font-mono text-[11px] text-muted-subtle">{a.id}</div>
              </div>
              {a.id === "main" && <Badge variant="secondary">Primary</Badge>}
              {a.telegram && (
                <Badge variant="outline" className="gap-1">
                  <Send className="size-3" />
                  Telegram
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
