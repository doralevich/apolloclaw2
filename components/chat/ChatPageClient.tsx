"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ChatProvider } from "./ChatProvider";
import { ChatSidebar } from "./ChatSidebar";
import { ChatView } from "./ChatView";

const CHAT_BASE = "/dashboard/chat";

// The open thread's id from the URL (/dashboard/chat/<sessionId>) — null for a new chat.
// Resolved client-side from the pathname; the server only validates the segment as a string.
function sessionFromPath(pathname: string): string | null {
  if (!pathname.startsWith(CHAT_BASE)) return null;
  const seg = pathname.slice(CHAT_BASE.length).split("/").filter(Boolean)[0];
  return seg ? decodeURIComponent(seg) : null;
}

// Thread switches ride the native History API (Next syncs usePathname to pushState/replaceState),
// so selecting a thread never remounts the page — while a hard refresh on
// /dashboard/chat/<sessionId> still restores that session via the optional catch-all route.
function updateChatHistory(path: string, mode: "push" | "replace") {
  if (typeof window === "undefined" || window.location.pathname === path) return;
  if (mode === "replace") window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
}

export function ChatPageClient() {
  const { active, loading, error, refresh } = useActiveAgent();
  const pathname = usePathname();
  const urlSessionId = sessionFromPath(pathname);

  const navigateToSession = useCallback((sessionId: string | null, mode: "push" | "replace" = "push") => {
    updateChatHistory(sessionId ? `${CHAT_BASE}/${encodeURIComponent(sessionId)}` : CHAT_BASE, mode);
  }, []);

  // Switching the active agent (sidebar switcher) invalidates the open thread — session ids
  // belong to one instance — so drop back to a fresh chat URL. `replace` keeps Back sane.
  const agentId = active?.agent37_id ?? null;
  const prevAgentRef = useRef<string | null>(agentId);
  useEffect(() => {
    if (agentId && prevAgentRef.current && prevAgentRef.current !== agentId) {
      navigateToSession(null, "replace");
    }
    if (agentId) prevAgentRef.current = agentId;
  }, [agentId, navigateToSession]);

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
      {/* Keyed by agent so switching agents remounts the provider (fresh rail + thread). */}
      <ChatProvider
        key={active.agent37_id}
        agentId={active.agent37_id}
        urlSessionId={urlSessionId}
        navigateToSession={navigateToSession}
      >
        {/* The thread rail lives INSIDE the chat page as its own column — not in the shell. */}
        <aside className="hidden w-60 shrink-0 border-r bg-card sm:block">
          <ChatSidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col bg-background">
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
          <ChatView agentName={active.name} />
        </div>
      </ChatProvider>
    </div>
  );
}
