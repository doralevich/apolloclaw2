"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useChatContext } from "@/components/chat/ChatProvider";
import { useChecklist } from "@/lib/useChecklist";
import { cn } from "@/lib/utils";

// The checklist, summarised, inside the Start Here greeting.
//
// Deliberately not the whole list. Start Here is a greeting and the checklist can now run to a
// dozen items built from somebody's intake answers — printing all of them here would make the
// two pages the same page, and the greeting the longer of them.
//
// So: a progress bar, and the next three things that are not done. Three because it is enough to
// see what kind of work is left without becoming the list itself.
export function SetupChecklist({ agentId }: { agentId: string }) {
  const { sessions } = useChatContext();
  const { items, doneCount, total, loading } = useChecklist(agentId, sessions.length);

  if (loading && !total) return null;
  if (!total) return null;

  const pct = Math.round((doneCount / total) * 100);
  const next = items.filter((i) => !i.done).slice(0, 3);
  const finished = next.length === 0;

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {finished ? "You are set up" : "Getting set up"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {doneCount} of {total}
        </span>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {finished ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Everything on the checklist is done. Anything else you hand over from here is a bonus.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {next.map((item) => (
            <li key={item.id} className="flex items-start gap-3 text-sm">
              <span
                className="mt-0.5 size-4 shrink-0 rounded-full border border-muted-foreground/30"
                aria-hidden
              />
              <span className="min-w-0">
                <span className="font-medium">{item.title}</span>
                {/* One line, not the full body — the detail is one click away and repeating it
                    here is what turned the greeting into a second checklist last time. */}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/checklist"
        className={cn(
          "mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        )}
      >
        {finished ? <Check className="size-4" /> : null}
        {finished ? "Review the checklist" : "Open the checklist"} →
      </Link>
    </div>
  );
}
