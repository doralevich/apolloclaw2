"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { RefreshCw, Search, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Budget, Usage } from "@/lib/types";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { BuyCredits } from "@/components/BuyCredits";
import { CreditSafetyNet } from "@/components/CreditSafetyNet";
import { CreditsGlossary } from "@/components/CreditsGlossary";
import { Button } from "@/components/ui/button";

// Read-only API Credits tab: the active agent's remaining balance, monthly allowance,
// and this month's managed-spend breakdown (LLM / search / tools). Raw platform values —
// no top-ups, no markup, no ledger. Data comes from the existing budget/usage routes.

// Newer Agent37 builds report the one-time-credit balance as `credit_remaining_micros`;
// the Budget type still carries the older `topup_remaining_micros` name. Read both so the
// headline balance is right on either build (see foundation notes on the pending rename).
type BudgetWithCredit = Budget & { credit_remaining_micros?: number };

type CreditsData = { budget: BudgetWithCredit; usage: Usage };

// "2026-07" -> "July 2026". UTC-parsed so the label can't slip a month in western timezones.
function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function CreditsView() {
  const { active, agents, loading: agentsLoading, error: agentsError, refresh: refreshAgents } = useActiveAgent();
  const { current } = useWorkspace();
  const agentId = active?.agent37_id ?? null;

  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (): Promise<CreditsData | null> => {
    if (!agentId) return null;
    const [budget, usage] = await Promise.all([
      apiFetch<BudgetWithCredit>(`/api/agents/${agentId}/budget`),
      apiFetch<Usage>(`/api/agents/${agentId}/usage`),
    ]);
    return { budget, usage };
  }, [agentId]);

  // Active agent changed (or first mount): drop the old agent's figures and refetch.
  useEffect(() => {
    if (!agentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-on-prop-change: clearing stale figures when the active agent changes is exactly this effect's job
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setData(null);
    load()
      .then((d) => {
        if (!cancelled && d) setData(d);
      })
      .catch((e) => {
        if (!cancelled) toast.error((e as Error).message || "Couldn't load credits.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, load]);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const d = await load();
      if (d) setData(d);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't refresh credits.");
    } finally {
      setRefreshing(false);
    }
  }

  // The agent-list fetch failed and nothing is cached — don't claim the workspace is empty.
  if (!agentsLoading && agents.length === 0 && agentsError) {
    return (
      <div className="max-w-3xl space-y-6">
        <Header />
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
          </p>
          <Button variant="outline" size="sm" onClick={refreshAgents}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Workspace has no agents: nothing to meter yet.
  if (!agentsLoading && agents.length === 0) {
    return (
      <div className="max-w-3xl space-y-6">
        <Header />
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No agents in this workspace yet. Create one to see its credits and usage here.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dashboard">Go to Agents</Link>
          </Button>
        </div>
      </div>
    );
  }

  const showSkeleton = agentsLoading || loading;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <Header agentName={active ? (active.name ?? active.agent37_id) : undefined} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh credits"
          disabled={showSkeleton || refreshing}
          onClick={refresh}
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} />
        </Button>
      </div>

      {showSkeleton ? (
        <CreditsSkeleton />
      ) : !data ? (
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t reach this agent&apos;s balance just now. It usually comes right back.
          </p>
          <Button variant="outline" size="sm" disabled={refreshing} onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : (
        <CreditsCards data={data} />
      )}

      {/* Buying stays available even when the balance read fails — an unreachable runtime is
          the moment someone is most likely to be topping up. */}
      {!showSkeleton && <BuyCredits agentId={agentId} workspaceId={current?.id ?? null} />}

      {/* The safety net sits AFTER buying, deliberately: auto-recharge needs a saved card, and
          a card is saved by buying a pack. Offering the switch above the thing that unlocks it
          would read as broken. */}
      {!showSkeleton && <CreditSafetyNet agentId={agentId} />}

      {!showSkeleton && <CreditsGlossary />}
    </div>
  );
}

function Header({ agentName }: { agentName?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">API Credits</h1>
      <p className="text-sm text-muted-foreground">
        {agentName
          ? `What ${agentName} has left to spend, and where this month went.`
          : "Balance and usage for your agent."}
      </p>
    </div>
  );
}

function CreditsCards({ data }: { data: CreditsData }) {
  const { budget, usage } = data;
  const monthlyRemaining = budget.monthly_remaining_micros ?? 0;
  // Runtime shape varies by Agent37 build; either field may be absent.
  const credit = budget.credit_remaining_micros ?? budget.topup_remaining_micros ?? 0;
  const available = monthlyRemaining + credit;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-6">
        <div className="text-xs font-medium text-muted-foreground">Available balance</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{usd(available)}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {usd(monthlyRemaining)} monthly allowance
          {credit > 0 && <> + {usd(credit)} credits</>}
          {" · "}pays for model calls, search, and tools
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-xs font-medium text-muted-foreground">Monthly cap</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {usd(budget.monthly_cap_micros)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Resets each month{budget.monthly_period ? ` · ${monthLabel(budget.monthly_period)}` : ""}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-xs font-medium text-muted-foreground">Spent this month</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {usd(budget.monthly_consumed_micros)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Counts against the monthly cap</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Usage breakdown</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {monthLabel(usage.period)}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{usd(usage.total_micros)}</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <UsageRow
            icon={<Sparkles />}
            label="LLM"
            cost={usage.by_integration.llm.cost_micros}
            calls={usage.by_integration.llm.calls}
          />
          <UsageRow
            icon={<Search />}
            label="Search"
            cost={usage.by_integration.brave.cost_micros}
            calls={usage.by_integration.brave.calls}
          />
          <UsageRow
            icon={<Wrench />}
            label="Tools"
            cost={usage.by_integration.composio.cost_micros}
            calls={usage.by_integration.composio.calls}
            last
          />
        </div>
      </div>
    </div>
  );
}

function UsageRow({
  icon,
  label,
  cost,
  calls,
  last,
}: {
  icon: ReactNode;
  label: string;
  cost: number;
  calls: number;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2.5 text-sm",
        !last && "border-b"
      )}
    >
      <span className="flex items-center gap-2 font-medium [&_svg]:size-4 [&_svg]:text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="tabular-nums text-muted-foreground">
        {calls} {calls === 1 ? "call" : "calls"} · {usd(cost)}
      </span>
    </div>
  );
}

function CreditsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="rounded-xl border bg-card p-6">
        <Pulse className="h-3 w-24" />
        <Pulse className="mt-3 h-8 w-32" />
        <Pulse className="mt-3 h-3 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Pulse className="h-3 w-24" />
            <Pulse className="mt-3 h-6 w-20" />
            <Pulse className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6">
        <Pulse className="h-5 w-36" />
        <div className="mt-4 space-y-3">
          <Pulse className="h-9 w-full" />
          <Pulse className="h-9 w-full" />
          <Pulse className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
