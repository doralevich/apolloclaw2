"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpFooter } from "@/components/HelpFooter";
import { cn } from "@/lib/utils";

// What needs you.
//
// NOT AN ACTIVITY LOG, which is what was first proposed and would have been the wrong page. A
// list of what the agent did is a diary: interesting once, and never the thing anybody opens a
// dashboard to find. What a professional's assistant produces is a shorter list of what needs
// THEM - and this product already produced that every morning and threw all of it away.
//
// The daily brief has a "waiting on you" block. The follow-up chaser leaves drafts on approval.
// The end-of-day summary lists what slipped. Every one of those lands in a Telegram message at
// 8am and is gone by lunchtime. This is where it stays instead.
//
// Which is why nearly everything here arrives from the schedule sweep rather than being typed in.
// Adding your own is here because a list you cannot add to is somebody else's list, but it is the
// secondary path, and the page reads that way.

type Task = {
  id: number;
  title: string;
  detail: string | null;
  source: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
};

/** "schedule:daily-brief" -> "Morning brief". The source is a fact about where a task came from,
 *  and the customer never chose those slugs, so it is translated rather than printed. */
function sourceLabel(source: string): string {
  if (source === "manual") return "Added by you";
  const skill = source.replace(/^schedule:/, "");
  const named: Record<string, string> = {
    "daily-brief": "Morning brief",
    "eod-summary": "End of day",
    "weekly-planning": "Weekly planning",
    "follow-up-chaser": "Follow-ups",
  };
  if (named[skill]) return named[skill];
  // A custom report, named by the customer: custom:monday-showings -> "Monday showings".
  if (skill.startsWith("custom:")) {
    const slug = skill.slice("custom:".length).replace(/-/g, " ");
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
  return "Your agent";
}

function whenLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
}

export function TasksView() {
  const { active, loading: agentLoading } = useActiveAgent();
  const agentId = active?.agent37_id;

  const [open, setOpen] = useState<Task[] | null>(null);
  const [done, setDone] = useState<Task[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [adding, setAdding] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!agentId) return;
    apiFetch<{ tasks: Task[] }>(`/api/agents/${agentId}/tasks`)
      .then((r) => setOpen(r.tasks))
      .catch(() => setOpen([]));
    apiFetch<{ tasks: Task[] }>(`/api/agents/${agentId}/tasks?status=done`)
      .then((r) => setDone(r.tasks))
      .catch(() => {});
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  function setStatus(task: Task, status: string) {
    if (!agentId) return;
    setBusyId(task.id);
    apiFetch(`/api/agents/${agentId}/tasks`, {
      method: "PATCH",
      body: JSON.stringify({ id: task.id, status }),
    })
      .then(() => load())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusyId(null));
  }

  function add() {
    if (!agentId || !adding.trim()) return;
    setSaving(true);
    apiFetch(`/api/agents/${agentId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title: adding.trim() }),
    })
      .then(() => {
        setAdding("");
        load();
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setSaving(false));
  }

  if (agentLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!active) {
    return <p className="text-sm text-muted-foreground">No agent in this workspace yet.</p>;
  }

  const agentName = active.name?.trim() || "Your agent";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">What needs you</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Things {agentName} surfaced in your briefs and reports, kept here until they&apos;re
          done. Tick one off and it moves out of the way.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={adding}
          placeholder="Add something yourself"
          maxLength={300}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <Button disabled={saving || !adding.trim()} onClick={add}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </div>

      {open === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : open.length === 0 ? (
        // The empty state has to be honest about WHY it is empty, because there are two very
        // different reasons and they need different things from the reader.
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing needs you right now.
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            This fills up from your scheduled briefs and reports. If you haven&apos;t set one up
            yet, that&apos;s why it&apos;s empty rather than because your week is clear.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {open.map((task) => (
            <li key={task.id} className="flex items-start gap-3 p-4">
              <Button
                variant="outline"
                size="icon"
                className="mt-0.5 size-7 shrink-0 rounded-full"
                title="Done"
                disabled={busyId === task.id}
                onClick={() => setStatus(task, "done")}
              >
                {busyId === task.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed">{task.title}</p>
                {task.detail && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.detail}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {sourceLabel(task.source)} &middot; {whenLabel(task.createdAt)}
                </p>
              </div>
              {/* Dismiss is separate from done on purpose. "I did this" and "this was never mine"
                  are different answers, and collapsing them into one button makes the completed
                  list a lie. */}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground"
                title="Not needed"
                disabled={busyId === task.id}
                onClick={() => setStatus(task, "dismissed")}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="cursor-pointer text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {showDone ? "Hide" : "Show"} {done.length} completed
          </button>
          {showDone && (
            <ul className="mt-3 divide-y rounded-xl border bg-card">
              {done.map((task) => (
                <li key={task.id} className="flex items-center gap-3 p-3">
                  <span className={cn("min-w-0 flex-1 text-sm text-muted-foreground line-through")}>
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground"
                    title="Put it back"
                    disabled={busyId === task.id}
                    onClick={() => setStatus(task, "open")}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <HelpFooter />
    </div>
  );
}
