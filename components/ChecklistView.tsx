"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useChatContext } from "@/components/chat/ChatProvider";
import { useChecklist, type ResolvedItem } from "@/lib/useChecklist";
import { CHECKLIST_CATEGORIES } from "@/config/checklist";
import { cn } from "@/lib/utils";

// The full checklist page.
//
// Two kinds of row, and the difference is visible on purpose. A derived row ticks itself from
// something observable — a live Composio connection, a configured channel, a chat thread — and
// cannot be clicked, because it is a fact rather than a claim. A self-reported row is a checkbox,
// because handing invoicing over to your agent happens inside a conversation and no column
// anywhere records that it went well.
//
// Making them look identical would be the friendlier lie. Somebody who unticks "Connect HubSpot"
// and watches it tick straight back would conclude the page is broken; showing it as a state
// rather than a control says why before they try.

export function ChecklistView() {
  const { active, loading: loadingAgent } = useActiveAgent();
  const { sessions } = useChatContext();
  const agentId = active?.agent37_id ?? "";
  const { items, doneCount, total, personalized, loading, toggle } = useChecklist(
    agentId,
    sessions.length
  );

  if (loadingAgent) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No agent in this workspace yet. The checklist appears once yours is built.
        </p>
      </div>
    );
  }

  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Setup checklist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {personalized
            ? "Built from what you told us at onboarding, so it only lists what applies to you."
            : "The essentials, in the order they matter."}
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">
            {doneCount} of {total} complete
          </span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        CHECKLIST_CATEGORIES.map((cat) => {
          const rows = items.filter((i) => i.category === cat);
          if (!rows.length) return null;
          const catDone = rows.filter((r) => r.done).length;
          return (
            <div key={cat} className="rounded-xl border bg-card">
              <div className="flex items-baseline justify-between gap-3 border-b px-5 py-3.5">
                <h2 className="font-semibold">{cat}</h2>
                <span className="text-xs text-muted-foreground">
                  {catDone}/{rows.length}
                </span>
              </div>
              <div className="divide-y">
                {rows.map((item) => (
                  <Row key={item.id} item={item} onToggle={() => toggle(item)} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Row({ item, onToggle }: { item: ResolvedItem; onToggle: () => void }) {
  const derived = !!item.derived;

  return (
    <div className="flex items-start gap-3 px-5 py-4">
      {derived ? (
        // A state, not a control. No hover, no cursor, nothing that invites a click it would
        // have to refuse — the tick is telling you what we can already see.
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
            item.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
          )}
          aria-hidden
        >
          {item.done && <Check className="size-3" />}
        </span>
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={item.done}
          aria-label={item.title}
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors",
            item.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 hover:border-foreground"
          )}
        >
          {item.done && <Check className="size-3" />}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className={cn("font-medium", item.done && "text-muted-foreground line-through decoration-1")}>
            {item.title}
          </span>
          {derived && (
            // Says why this one has no checkbox, once, where somebody would otherwise try.
            <span className="text-[11px] text-muted-foreground/70">ticks itself</span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
        {!item.done && (
          <Link
            href={item.href}
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            {item.cta} →
          </Link>
        )}
      </div>
    </div>
  );
}
