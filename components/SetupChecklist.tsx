"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/components/chat/ChatProvider";
import type {
  ChannelsResult,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// The three steps on Start Here, ticking themselves.
//
// They were static prose first, which is the same failure the onboarding emails had: the page
// telling somebody to connect their tools a week after they connected them. A list that does not
// know what you have done is not a checklist, it is a poster.
//
// Each item reads live state, and each links to the surface that completes it. Those links are
// the whole reason this is not just decoration — the channels panel used to be embedded on this
// page, and with it gone this list is what points at Channels at all.
//
// WHAT COUNTS AS DONE is deliberately the weakest honest signal in each case:
//
//   Tools    — one ACTIVE, non-disabled Composio connection. Not "all of them", because there
//              is no list anybody has to finish; one connected mailbox already changes what the
//              agent can do.
//   Channel  — one channel `connected` or `pending`. Pending counts because it means a QR is
//              waiting to be scanned or an OAuth tab is still open, and un-ticking somebody
//              mid-setup would read as the page losing their work. `error` deliberately does
//              NOT count: that channel was set up once and has since broken, so the honest
//              thing is to send them back to fix it rather than call it done.
//   Asked    — one chat session exists. Free: the dashboard already holds the thread list for
//              the sidebar, so this costs no request.
//
// Unknown always renders as NOT done. That direction is the safe one: it invites a click onto a
// flow that tells the truth, rather than claiming a thing is set up when it never was.

type Item = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

const ITEMS: Item[] = [
  {
    id: "tools",
    title: "Connect your tools",
    body:
      "Link the apps you already live in — Gmail, Calendar, Drive, Outlook, Dropbox. An agent " +
      "with no connections can advise. One with connections can act.",
    href: "/dashboard/integrations",
    cta: "Open Connections",
  },
  {
    id: "channel",
    title: "Choose where it answers you",
    body:
      "Connect a chat app so you can reach it without opening this dashboard. Optional, but it " +
      "is the difference between somewhere you visit and something you use.",
    href: "/dashboard/channels",
    cta: "Open Channels",
  },
  {
    id: "asked",
    title: "Ask it something real",
    body:
      "Not a test question — something you were going to have to do anyway. That is the fastest " +
      "way to find where it actually helps.",
    href: "/dashboard/chat",
    cta: "Open Chat",
  },
];

function isActiveConnection(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

export function SetupChecklist({ agentId }: { agentId: string }) {
  const { sessions } = useChatContext();
  const [hasTools, setHasTools] = useState(false);
  const [hasChannel, setHasChannel] = useState(false);

  const load = useCallback(() => {
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => setHasTools(res.connections.some(isActiveConnection)))
      .catch(() => {});
    apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
      .then((res) => setHasChannel(res.channels.some((c) => c.state === "connected" || c.state === "pending")))
      .catch(() => {});
  }, [agentId]);

  useEffect(() => {
    load();
    // Connecting an app finishes in the OAuth tab, so nothing here would ever learn it happened.
    // Coming back to this tab IS the signal — cheaper and more certain than polling a page
    // somebody may sit on for a while.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const done: Record<string, boolean> = {
    tools: hasTools,
    channel: hasChannel,
    asked: sessions.length > 0,
  };
  const count = ITEMS.filter((i) => done[i.id]).length;

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {count === ITEMS.length ? "You are set up" : "Three things make me useful"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {count} of {ITEMS.length}
        </span>
      </div>

      <div className="mt-5 space-y-5">
        {ITEMS.map((item, i) => {
          const complete = done[item.id];
          return (
            <div key={item.id} className={cn("flex gap-4", complete && "opacity-60")}>
              {/* The number becomes a tick rather than sitting beside one: the position in the
                  list is what the number was for, and once a step is done its order stops
                  mattering. */}
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  complete
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
                aria-hidden
              >
                {complete ? <Check className="size-4" /> : i + 1}
              </div>

              <div className="min-w-0">
                <h3 className={cn("font-semibold", complete && "line-through decoration-1")}>
                  {item.title}
                </h3>
                <span className="sr-only">{complete ? " — done" : " — not done yet"}</span>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                {/* The link stays after completion. It is where you'd go to add a second
                    mailbox or change the channel, so removing it would strand the one person
                    who came back on purpose. */}
                <Link
                  href={item.href}
                  className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {complete ? "Manage" : item.cta} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
