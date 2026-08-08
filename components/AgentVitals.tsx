"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/components/chat/ChatProvider";
import { sessionTime } from "@/components/chat/session-time";
import type { Budget } from "@/lib/types";

// The two questions people have on this page after "is it running".
//
// IS IT ABOUT TO STOP. The budget already exists on Settings → Billing, which is the right home
// for changing it and the wrong place to answer a glance. One line here, linking there.
//
// IS ANYONE USING IT. A status badge says the container is up. This says the agent was spoken to
// twenty minutes ago, which is the thing a person actually wanted to know — and it costs nothing,
// because the thread list is already loaded at the dashboard level for the sidebar.

type BudgetWithCredit = Budget & { credit_remaining_micros?: number };

export function AgentVitals({ agentId }: { agentId: string }) {
  const { sessions } = useChatContext();
  const [budget, setBudget] = useState<BudgetWithCredit | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<BudgetWithCredit>(`/api/agents/${agentId}/budget`)
      .then((res) => {
        if (!cancelled) setBudget(res);
      })
      .catch(() => {
        // Silent. This is a glance on a page that already told you the important thing; a toast
        // about a budget endpoint is not what somebody opened My Agent for.
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // The most recent conversation, whichever thread it was in.
  //
  // The memo stays PURE — it picks the largest raw value and nothing else. Reading the clock in
  // here is what the purity rule objects to, and rightly: a memo that depends on the time has a
  // dependency it hasn't declared. Validating the value against now is sessionTime's job, and it
  // does it at render, where the clock belongs.
  const lastRaw = useMemo(() => {
    let best: number | null = null;
    for (const s of sessions) {
      const v = s.last_active;
      if (typeof v === "number" && Number.isFinite(v) && (best === null || v > best)) best = v;
    }
    return best;
  }, [sessions]);
  const lastActive = sessionTime(lastRaw);

  const cap = budget?.monthly_cap_micros ?? 0;
  const used = budget?.monthly_consumed_micros ?? 0;
  // A cap of zero means uncapped, not spent-out — showing 100% there would be a lie that reads
  // as an emergency.
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : null;
  const low = pct !== null && pct >= 80;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href="/dashboard/settings/billing"
        className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/25"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">AI credits</div>
          {budget === null ? (
            // Nothing rather than a zero. "$0.00 used" to somebody whose budget call failed is
            // the same shape as good news, which is the worst thing this line could be.
            <p className="mt-0.5 text-sm text-muted-foreground">&nbsp;</p>
          ) : (
            <>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {usd(used)} used{cap > 0 ? ` of ${usd(cap)}` : ""} this month
              </p>
              {pct !== null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", low ? "bg-amber-500" : "bg-foreground/70")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Link>

      <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">Last conversation</div>
          {/* Null covers both "no threads" and "a timestamp we could not trust" - see
              session-time.ts. Neither is worth inventing a date for. */}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lastActive ?? (sessions.length === 0 ? "No conversations yet" : "-")}
          </p>
        </div>
      </div>
    </div>
  );
}
