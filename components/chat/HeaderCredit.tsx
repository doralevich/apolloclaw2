"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { availableMicros } from "@/lib/budget";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Budget } from "@/lib/types";

// What's left to spend, in the chat header next to the clock — and a way to top it up without
// going to find the billing page first.
//
// WHY IT SITS HERE. An agent whose balance reaches zero stops answering mid-conversation, and
// the chat window is where you find that out. The number belongs where the spending happens,
// not two clicks away on a page nobody opens until something has already gone wrong.
//
// The figure is PER AGENT, because that is the only balance that exists: credit is held by the
// runtime instance, not pooled across the workspace. So this is the active agent's money, which
// is also the money this conversation is spending.
//
// Read once on mount rather than polled. A balance moves when the agent works, and the agent
// works when you send something — a ticking number nobody asked for would draw the eye away
// from the conversation for no benefit. It refreshes when you switch agents or reload.

// The runtime renamed this field; the Budget type still carries the old name. See lib/budget.ts.
type BudgetWithCredit = Budget & { credit_remaining_micros?: number };

// Below this, the balance stops being a status line and becomes a warning. Matches the shape of
// the low-balance email, though the threshold there is the customer's own setting — this is only
// about when the header should raise its voice.
const LOW_MICROS = 5_000_000; // $5.00

export function HeaderCredit({ agentId }: { agentId: string | null }) {
  // The agent the figure belongs to is stored WITH it, rather than cleared when agentId
  // changes. Same protection — a previous agent's balance must never appear under the new
  // agent's name — without writing state from inside the effect to get it, and with no render
  // at all where the stale number is on screen.
  const [loaded, setLoaded] = useState<{ agentId: string; micros: number } | null>(null);

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    apiFetch<BudgetWithCredit>(`/api/agents/${agentId}/budget`)
      .then((res) => {
        if (!cancelled) setLoaded({ agentId, micros: availableMicros(res) });
      })
      .catch(() => {
        // Silent, and nothing renders. Same reasoning as AgentVitals: "$0.00" to somebody whose
        // budget call merely failed has the exact shape of "you have run out", which is the one
        // thing this must never say by accident.
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const micros = loaded && loaded.agentId === agentId ? loaded.micros : null;
  if (micros === null) return null;

  const low = micros < LOW_MICROS;

  return (
    // Hidden on narrow screens, like the clock beside it: a chat header on a phone has room for
    // the thread name and the one button.
    <div className="hidden items-center gap-1.5 lg:flex">
      <Link
        href="/dashboard/settings/billing"
        title="AI credits remaining for this agent"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] tabular-nums transition-colors hover:border-foreground/25",
          low ? "border-amber-500/40 text-amber-600 dark:text-amber-500" : "text-muted-foreground/80"
        )}
      >
        <Wallet className="h-3.5 w-3.5" />
        {usd(micros)}
      </Link>
      <Link
        href="/dashboard/settings/billing"
        title="Add credits"
        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[13px] font-medium text-muted-foreground/80 transition-colors hover:border-foreground/25 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Link>
    </div>
  );
}
