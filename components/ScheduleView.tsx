"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { SchedulePanel } from "@/components/SchedulePanel";
import { HelpFooter } from "@/components/HelpFooter";
import { Button } from "@/components/ui/button";

// My Schedule — when the agent runs on its own.
//
// It used to live at the bottom of the Channels page, under the chat-app cards, on the reasoning
// that a scheduled brief is delivered through whichever channel is connected. True, but it made
// the one feature people describe as the reason they bought ("it turns up on Monday morning
// without being asked") something you found by scrolling past a setup screen you had already
// finished with. David's call: its own tab.
//
// And now the ONLY place it lives. The Checklist carried the same panel for a while, which was a
// half-move: a tab of its own plus a copy further down the same dashboard is two places to find
// one setting and one of them to edit by mistake. David's call to take it off the Checklist.

export function ScheduleView() {
  const { active, loading, error, refresh } = useActiveAgent();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!active && error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
        </p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You don&apos;t have an agent yet. Create one and you can have it run on a schedule.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/settings/agent">Go to My Agent</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* A schedule with nowhere to deliver is the one failure worth warning about up front: the
          brief runs, and then has no chat app to arrive in. Says it plainly rather than letting
          somebody find out on Monday. */}
      {active.live_status !== "running" && (
        <p className="max-w-4xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {active.name || "This agent"} isn&apos;t running right now ({active.live_status ?? "unknown"}).
          You can set a schedule here, but nothing will run until it&apos;s started from
          Settings → My Agent.
        </p>
      )}
      <SchedulePanel
        key={`sched-${active.agent37_id}`}
        agentId={active.agent37_id}
        agentType={active.agent_type}
      />
      <HelpFooter className="max-w-4xl" />
    </div>
  );
}
