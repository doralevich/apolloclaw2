"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

// The tabs across the top of the chat when an instance carries more than one agent: the main
// agent first, then one per other agent the box reports. Hidden entirely for the one-agent
// case, which is every customer today.
//
// The roster is read from the box (/api/agents/{id}/roster), the same source the My Agent(s)
// card uses, so an agent added on the server appears here without a database row.

export type RosterAgent = { id: string; name: string | null; telegram: boolean };

export function useInstanceRoster(instanceId: string): RosterAgent[] | null {
  // Keyed by instance so a switch of agent reads as "unknown" until the new roster lands,
  // without a reset inside the effect.
  const [state, setState] = useState<{ id: string; agents: RosterAgent[] } | null>(null);
  useEffect(() => {
    if (!instanceId) return;
    let cancelled = false;
    apiFetch<{ ok: boolean; agents: RosterAgent[] }>(`/api/agents/${instanceId}/roster`)
      .then((res) => {
        if (!cancelled) setState({ id: instanceId, agents: res.ok ? res.agents : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ id: instanceId, agents: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [instanceId]);
  return state && state.id === instanceId ? state.agents : null;
}

export function AgentTabs({
  agents,
  mainName,
  selected,
  onSelect,
}: {
  agents: RosterAgent[];
  mainName: string;
  selected: string;
  onSelect: (agentId: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b bg-card px-3 py-2" role="tablist" aria-label="Agents on this instance">
      {agents.map((a) => {
        const label = a.id === "main" ? mainName : a.name || a.id;
        const active = a.id === selected;
        return (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(a.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
