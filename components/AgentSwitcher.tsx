"use client";

import { Bot, Check, ChevronsUpDown } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { isTransitional } from "@/lib/format";
import type { MergedAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function statusDotClass(status: string | null | undefined): string {
  if (status === "running") return "bg-emerald-500";
  if (isTransitional(status)) return "bg-amber-500";
  if (status === "failed" || status === "error") return "bg-destructive";
  return "bg-muted-foreground/40";
}

function agentLabel(agent: MergedAgent): string {
  return agent.name || agent.agent37_id;
}

function AgentAvatar({ agent }: { agent: MergedAgent | null }) {
  if (agent?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={agent.avatar_url} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary">
      <Bot className="h-3 w-3 text-muted-foreground" />
    </span>
  );
}

// Compact active-agent picker for the sidebar, directly below the WorkspaceSwitcher. Hidden
// entirely when the workspace has no agents (nothing to scope Chat/Integrations/Credits to).
export function AgentSwitcher() {
  const { agents, active, setActiveId, loading } = useActiveAgent();

  if (agents.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal" disabled={loading}>
          <span className="flex min-w-0 items-center gap-2">
            <AgentAvatar agent={active} />
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass(active?.live_status))}
              aria-hidden
            />
            <span className="truncate">{active ? agentLabel(active) : "Select agent"}</span>
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Agents</DropdownMenuLabel>
        {agents.map((a) => (
          <DropdownMenuItem key={a.agent37_id} onClick={() => setActiveId(a.agent37_id)}>
            <AgentAvatar agent={a} />
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass(a.live_status))}
              aria-hidden
            />
            <span className="flex-1 truncate">{agentLabel(a)}</span>
            {a.agent37_id === active?.agent37_id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
