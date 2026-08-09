"use client";

import { Bot, Check, ChevronsUpDown } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { isTransitional } from "@/lib/format";
import type { MergedAgent } from "@/lib/types";
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

function AgentAvatar({ agent, className }: { agent: MergedAgent | null; className?: string }) {
  if (agent?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={agent.avatar_url} alt="" className={cn("h-5 w-5 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary", className)}>
      <Bot className="h-3 w-3 text-muted-foreground" />
    </span>
  );
}

// The agent, at the top of the rail: face, name, "Your agent".
//
// This used to render NOTHING for a customer with one agent — `agents.length <= 1` returned
// null, on the reasoning that a dropdown whose menu contains the thing already on screen is
// furniture. True of the dropdown, false of the block: the comment in DashboardShell said the
// rail "opens with Max and 'Your agent' and nothing else", which is the treatment David liked on
// The College Agent, and for every single-agent customer — which is nearly all of them — the
// rail actually opened with the logo and then the nav. The one thing the page is about was the
// one thing missing from it.
//
// So the identity block is now unconditional and only the SWITCHING is conditional. One agent
// gets a plain row; two or more turn that same row into a dropdown trigger. Nothing about the
// block moves when a second agent appears, which is what makes it read as the agent's name
// rather than as a control that grew.
export function AgentSwitcher() {
  const { agents, active, setActiveId, loading } = useActiveAgent();

  // No agents at all: nothing to name. Welcome handles that state with a build button.
  if (!agents.length || !active) return null;

  const many = agents.length > 1;

  const identity = (
    <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
      <AgentAvatar agent={active} className="h-8 w-8" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold leading-tight">{agentLabel(active)}</span>
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass(active.live_status))}
            aria-hidden
          />
        </span>
        <span className="block truncate text-xs text-muted-foreground">Your agent</span>
      </span>
    </span>
  );

  return (
    <div className="flex items-center gap-1">
      {many ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={loading}
              className="flex min-w-0 flex-1 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
            >
              {identity}
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </button>
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
                {a.agent37_id === active.agent37_id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Not a button. With one agent there is nothing to switch to, and a row that highlights
        // on hover and then does nothing when pressed is worse than a row that never invited the
        // press.
        <div className="flex min-w-0 flex-1 items-center px-2 py-1.5">{identity}</div>
      )}

    </div>
  );
}
