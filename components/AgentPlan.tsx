"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { SubAgentDialog } from "@/components/SubAgentDialog";
import { AGENT_UPGRADE_HREF, PLANS_ON_SALE, agentsLabel, dollars, type AgentPlanUsage } from "@/config/agent-plans";

// The workspace's agent plan on the customer's side: how many agents it includes, how many are in
// use, and the one button that follows from those two numbers. "Add agent" while there is room,
// "Upgrade for more agents" once there is not. The sidebar and My Agent(s) both use it, so the
// answer is the same wherever the customer asks.

const AGENTS_CHANGED = "apolloclaw:agents-changed";

/** Tell every listener (the sidebar roster, the My Agent(s) cards, the plan count) that an agent
 *  was added, edited or removed, so each reads again instead of showing what was true before. */
export function notifyAgentsChanged() {
  window.dispatchEvent(new Event(AGENTS_CHANGED));
}

/** Run `fn` whenever an agent is added, edited or removed anywhere on the page. */
export function useOnAgentsChanged(fn: () => void) {
  useEffect(() => {
    window.addEventListener(AGENTS_CHANGED, fn);
    return () => window.removeEventListener(AGENTS_CHANGED, fn);
  }, [fn]);
}

/** The current workspace's plan and usage. Null until it loads, and stays null if it cannot. */
export function useAgentPlan(): AgentPlanUsage | null {
  const { current } = useWorkspace();
  const workspaceId = current?.id ?? null;
  const [state, setState] = useState<{ id: string; usage: AgentPlanUsage } | null>(null);
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((n) => n + 1), []);
  useOnAgentsChanged(bump);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    apiFetch<AgentPlanUsage>(`/api/workspaces/${workspaceId}/agent-plan`)
      .then((usage) => {
        if (!cancelled) setState({ id: workspaceId, usage });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [workspaceId, version]);

  return state && state.id === workspaceId ? state.usage : null;
}

/** "Basic plan · 2 of 3 agents". */
export function AgentPlanLine({ usage, className }: { usage: AgentPlanUsage; className?: string }) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {usage.custom || usage.tier.id === "legacy" ? "Your plan" : `${usage.tier.label} plan`} · {usage.used} of{" "}
      {agentsLabel(usage.limit)}
    </span>
  );
}

/** Add an agent to an instance while the plan has room; point at the upgrade once it is full.
 *  `variant="rail"` is the quiet sidebar row, the default is a button. */
export function AddAgentOrUpgrade({
  usage,
  instanceId,
  mainName,
  variant = "button",
  onNavigate,
}: {
  usage: AgentPlanUsage;
  instanceId: string;
  mainName: string;
  variant?: "button" | "rail";
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const rail =
    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // Full, and the plan sells one more: still "Add agent", with the monthly price on it, and the
  // dialog states the charge before anything is billed.
  const charge = !usage.canAdd && usage.addOnCents !== null ? usage.addOnCents : null;
  const nextPlan = PLANS_ON_SALE.find((p) => p.agents > usage.tier.agents);
  const chargeNote =
    charge !== null
      ? `Adds ${dollars(charge)} a month to your ${usage.tier.label} plan, charged now for the rest of this month.`
      : undefined;

  if (!usage.canAdd && charge === null) {
    return variant === "rail" ? (
      <Link href={AGENT_UPGRADE_HREF} onClick={onNavigate} className={rail}>
        <ArrowUpRight className="size-3.5 shrink-0" />
        Upgrade for more agents
      </Link>
    ) : (
      <Button asChild variant="outline" size="sm">
        <Link href={AGENT_UPGRADE_HREF}>
          <ArrowUpRight className="size-4" />
          Upgrade for more agents
        </Link>
      </Button>
    );
  }

  return (
    <>
      {variant === "rail" ? (
        <button type="button" onClick={() => setOpen(true)} className={rail}>
          <Plus className="size-3.5 shrink-0" />
          Add agent
          <span className="ml-auto tabular-nums">
            {charge !== null ? `+${dollars(charge)}/mo` : `${usage.used}/${usage.limit}`}
          </span>
        </button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          {charge !== null ? `Add agent (+${dollars(charge)}/mo)` : "Add agent"}
        </Button>
      )}
      {/* At the size where the next plan up is the better buy (Solo at 3, Team at 6), say so
          where the next agent is added. */}
      {usage.suggestUpgrade && nextPlan && variant === "button" && (
        <Link href={AGENT_UPGRADE_HREF} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          {nextPlan.label} includes {agentsLabel(nextPlan.agents)}
        </Link>
      )}
      {open && (
        <SubAgentDialog
          instanceId={instanceId}
          mainName={mainName}
          editing={null}
          open={open}
          onOpenChange={setOpen}
          onDone={notifyAgentsChanged}
          chargeNote={chargeNote}
        />
      )}
    </>
  );
}
