"use client";

import { usePathname } from "next/navigation";
import { Bot, Check, ChevronsUpDown } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { CHAT_BASE, useChatContext } from "@/components/chat/ChatProvider";
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

function identity(agent: MergedAgent) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
      <AgentAvatar agent={agent} className="h-8 w-8" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold leading-tight">{agentLabel(agent)}</span>
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass(agent.live_status))}
            aria-hidden
          />
        </span>
        <span className="block truncate text-xs text-muted-foreground">Your agent</span>
      </span>
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
//
// An instance that carries more than one agent lists the others underneath, indented under the
// main one, and every row picks who Chat talks to. That list used to be a row of tabs across the
// top of the chat, which only existed on the chat page and pushed the conversation down; here
// it sits with the agent's name, on every page (David, Oct 4 2026).
export function AgentSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { agents, active, setActiveId, loading } = useActiveAgent();
  const { roster, selectedAgentId, selectAgent } = useChatContext();
  const pathname = usePathname();

  // No agents at all: nothing to name. Welcome handles that state with a build button.
  if (!agents.length || !active) return null;

  const many = agents.length > 1;
  const team = (roster ?? []).filter((a) => a.id !== "main");
  // The pick is only worth marking where it shows: on Chat. Elsewhere every row reads plain.
  const onChat = pathname.startsWith(CHAT_BASE);
  const pick = (id: string) => {
    selectAgent(id);
    onNavigate?.();
  };

  const switcherMenu = (
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
  );

  if (team.length > 0) {
    const rowClass = (selected: boolean) =>
      cn(
        "flex min-w-0 flex-1 items-center rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-secondary"
      );
    return (
      <div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => pick("main")}
            aria-current={onChat && selectedAgentId === "main" ? "true" : undefined}
            className={rowClass(onChat && selectedAgentId === "main")}
          >
            {identity(active)}
          </button>
          {/* With a team listed below, the row itself picks the main agent, so switching to
              another instance moves to the chevron beside it. */}
          {many && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={loading}
                  aria-label="Switch instance"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-secondary/60"
                >
                  <ChevronsUpDown className="size-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              {switcherMenu}
            </DropdownMenu>
          )}
        </div>
        <ul className="ml-6 mt-1 space-y-0.5 border-l pl-2" aria-label={`Other agents on ${agentLabel(active)}`}>
          {team.map((a) => {
            const label = a.name || a.id;
            const selected = onChat && selectedAgentId === a.id;
            return (
              <li key={a.id} className="flex">
                <button
                  type="button"
                  onClick={() => pick(a.id)}
                  aria-current={selected ? "true" : undefined}
                  className={rowClass(selected)}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    {a.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.avatarUrl} alt="" className="size-6 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                        {label.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium leading-tight">{label}</span>
                      {a.role && <span className="block truncate text-xs text-muted-foreground">{a.role}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

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
              {identity(active)}
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          {switcherMenu}
        </DropdownMenu>
      ) : (
        // Not a button. With one agent there is nothing to switch to, and a row that highlights
        // on hover and then does nothing when pressed is worse than a row that never invited the
        // press.
        <div className="flex min-w-0 flex-1 items-center px-2 py-1.5">{identity(active)}</div>
      )}

    </div>
  );
}
