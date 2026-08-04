"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Budget, Usage } from "@/lib/types";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Button } from "@/components/ui/button";

// Where the month went, split off from Billing. Billing answers "how much is left and how do
// I add more"; this answers "what is it being spent on, and am I on track" — two questions
// with different urgencies that were stacked in one scroll.
//
// Everything here is arithmetic on the two figures Billing already fetches. No new upstream
// call: the usage route has always returned per-integration calls and LLM token counts, and
// the page only ever printed the costs.

type BudgetWithCredit = Budget & { credit_remaining_micros?: number };

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Days elapsed and total, for the period the usage figures cover. Returns null for a period
// that isn't the current month — projecting a month that has already closed is nonsense, and
// the caller hides the projection rather than printing a confident wrong number.
function periodProgress(period: string): { elapsed: number; total: number } | null {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return null;
  const now = new Date();
  if (now.getUTCFullYear() !== y || now.getUTCMonth() + 1 !== m) return null;
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { elapsed: Math.max(1, now.getUTCDate()), total };
}

function perCall(cost: number, calls: number): string {
  if (!calls) return "—";
  // Sub-cent averages are the norm here, so usd() (2dp) would print $0.00 for every row and
  // say nothing. Four decimals is the smallest that distinguishes a cheap call from a dear one.
  return `$${(cost / calls / 1_000_000).toFixed(4)}`;
}

export function UsageView() {
  const { active, agents, loading: agentsLoading, error: agentsError } = useActiveAgent();
  const agentId = active?.agent37_id ?? null;

  const [data, setData] = useState<{ budget: BudgetWithCredit; usage: Usage } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!agentId) return null;
    const [budget, usage] = await Promise.all([
      apiFetch<BudgetWithCredit>(`/api/agents/${agentId}/budget`),
      apiFetch<Usage>(`/api/agents/${agentId}/usage`),
    ]);
    return { budget, usage };
  }, [agentId]);

  useEffect(() => {
    if (!agentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-on-prop-change: clearing the old agent's figures is exactly this effect's job
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
        if (!cancelled) toast.error((e as Error).message || "Couldn't load usage.");
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
      toast.error((e as Error).message || "Couldn't refresh usage.");
    } finally {
      setRefreshing(false);
    }
  }

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="text-sm text-muted-foreground">
          {active?.name ? `Where ${active.name}'s spend went this month.` : "Where this month went."}
        </p>
      </div>
      {agentId && (
        <Button variant="ghost" size="icon" aria-label="Refresh" disabled={loading || refreshing} onClick={refresh}>
          <RefreshCw className={cn(refreshing && "animate-spin")} />
        </Button>
      )}
    </div>
  );

  if (!agentsLoading && agents.length === 0) {
    return (
      <div className="max-w-3xl space-y-6">
        {header}
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {agentsError
            ? "We couldn't load this workspace's agents just now. It usually comes right back."
            : "No agent yet, so there's nothing to report."}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        {header}
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl space-y-6">
        {header}
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t reach this agent&apos;s usage just now. It usually comes right back.
          </p>
          <Button variant="outline" size="sm" disabled={refreshing} onClick={refresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { budget, usage } = data;
  const total = usage.total_micros;
  const rows = [
    {
      icon: <Sparkles className="size-4" />,
      label: "LLM",
      hint: "Thinking and writing — every reply your agent composes.",
      cost: usage.by_integration.llm.cost_micros,
      calls: usage.by_integration.llm.calls,
    },
    {
      icon: <Search className="size-4" />,
      label: "Search",
      hint: "Looking things up on the web.",
      cost: usage.by_integration.brave.cost_micros,
      calls: usage.by_integration.brave.calls,
    },
    {
      icon: <Wrench className="size-4" />,
      label: "Tools",
      hint: "Acting in your connected apps — sending mail, reading files.",
      cost: usage.by_integration.composio.cost_micros,
      calls: usage.by_integration.composio.calls,
    },
  ];

  const progress = periodProgress(usage.period);
  const cap = budget.monthly_cap_micros || 0;
  // Straight-line from the month so far. Deliberately naive and labelled as such — it is a
  // heads-up about the shape of the month, not a forecast, and pretending otherwise on eleven
  // days of data would be worse than saying nothing.
  const projected = progress ? Math.round((total / progress.elapsed) * progress.total) : null;
  const overCap = projected !== null && cap > 0 && projected > cap;

  return (
    <div className="max-w-3xl space-y-6">
      {header}

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Spent this month</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{usd(total)}</div>
          </div>
          <span className="text-sm text-muted-foreground">{monthLabel(usage.period)}</span>
        </div>

        {progress && cap > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", overCap ? "bg-amber-500" : "bg-primary")}
                style={{ width: `${Math.min(100, (total / cap) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((total / cap) * 100)}% of the {usd(cap)} monthly cap, {progress.elapsed} of{" "}
              {progress.total} days in.{" "}
              {projected !== null && (
                <>
                  At this pace the month lands near <span className="font-medium">{usd(projected)}</span>
                  {overCap ? " — over the cap, so top-up credits would cover the rest." : "."}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Breakdown</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          What the spend bought, and what each call cost on average.
        </p>

        <div className="mt-4 space-y-4">
          {rows.map((r) => {
            const share = total > 0 ? (r.cost / total) * 100 : 0;
            return (
              <div key={r.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground">{r.icon}</span>
                    {r.label}
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{usd(r.cost)}</div>
                </div>
                {/* Share of spend as a bar. Three numbers in a column tell you the totals;
                    the bars tell you the shape, which is the thing people actually read. */}
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${share}%` }} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{Math.round(share)}% of spend</span>
                  <span>·</span>
                  <span>{r.calls.toLocaleString()} calls</span>
                  <span>·</span>
                  <span>{perCall(r.cost, r.calls)} each</span>
                </div>
                <p className="mt-1 text-xs text-muted-subtle">{r.hint}</p>
              </div>
            );
          })}
        </div>

        {/* Token counts have been in the usage payload all along and were never shown. They
            are the honest answer to "why is LLM the biggest line" — it is volume of text,
            not a per-call fee. */}
        {usage.by_integration.llm.calls > 0 && (
          <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
            LLM read{" "}
            <span className="font-medium tabular-nums">
              {usage.by_integration.llm.input_tokens.toLocaleString()}
            </span>{" "}
            tokens and wrote{" "}
            <span className="font-medium tabular-nums">
              {usage.by_integration.llm.output_tokens.toLocaleString()}
            </span>
            . Roughly, a token is three quarters of a word — long conversations and big
            attachments are what move this number.
          </p>
        )}
      </div>
    </div>
  );
}
