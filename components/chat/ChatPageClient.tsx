"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ChatView } from "./ChatView";

export function ChatPageClient() {
  const { active, loading, error, refresh } = useActiveAgent();

  // A question sent here from the Guide or Start Here (?q=).
  //
  // Read through useSearchParams, NOT from window.location in a useState initializer. That was
  // the first attempt and it silently did nothing: this page is server-rendered, so the
  // initializer ran where `window` is undefined, returned undefined, and React hydrated the
  // client with the server's value — which it then never re-read. Every suggestion opened the
  // chat with an empty box.
  //
  // Latched on first sight so it survives the URL being rewritten underneath us: the provider
  // swaps in a session id via pushState once a thread is created, dropping ?q= from the URL,
  // and without the latch the prefill would evaporate mid-typing.
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);
  if (q && !prefill) setPrefill(q.slice(0, 2000));

  // Fill the dashboard main area (minus its p-4/p-6 padding) so the rail + pane get real height.
  const frame = "flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-card md:h-[calc(100vh-3rem)]";

  if (loading && !active) {
    return (
      <div className={frame}>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </div>
    );
  }

  // The agent-list fetch failed and nothing is cached — don't claim the workspace is empty.
  if (!active && error) {
    return (
      <div className={frame}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">We couldn&apos;t load your agents</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Something went wrong reaching the agent list. It usually comes right back.
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={refresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className={frame}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">No agents in this workspace yet</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create an agent first, then come back here to chat with it.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/dashboard">Create an agent</Link>
          </Button>
        </div>
      </div>
    );
  }

  const running = active.live_status === "running";

  return (
    <div className={frame}>
      {/* The thread list used to be a second column here. It now lives in the dashboard
          sidebar (ChatProvider is mounted in DashboardShell), so conversations are reachable
          from every page rather than only this one — and there is one rail on screen instead
          of two stacked side by side. */}
      <div className="flex min-w-0 flex-1 flex-col bg-card">
        {!running && (
          <div className="flex shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {active.name || "This agent"} is {active.live_status || "not running"} — messages will fail until
              it&apos;s running.{" "}
              <Link href="/dashboard" className="font-semibold underline underline-offset-2">
                Manage agent
              </Link>
            </span>
          </div>
        )}
        <ChatView agentId={active.agent37_id} agentName={active.name} prefill={prefill} />
      </div>
    </div>
  );
}
