"use client";

import Link from "next/link";
import { ChannelsPanel } from "@/components/ChannelsView";

// Setting up, on the page people land on when the build finishes.
//
// This was two halves once: the apps an agent REACHES (Gmail, Calendar, Drive, Outlook,
// OneDrive, Dropbox) as compact OAuth cards, and the chat apps where it ANSWERS you below them.
// The reach half is gone at David's request, along with the tab strip, the connection poll and
// the card grid that served it. Connecting those apps still lives at /dashboard/integrations,
// which the rail links to; what is gone is this page ASKING anyone to.
//
// The full-width half that remains is the Channels page's own ChannelsPanel, not a copy of it. A
// copy would be a second thing to keep in step with config/channels.ts, and the first time the
// two disagreed about a setup step the customer would be the one to find out.
//
// The two headings collapsed into one when the halves stopped being two. "Set up your
// connections — until these are connected your agent can advise, but it can't act" described the
// apps specifically; left above a channels list on its own it would have been pointing at
// nothing.
export function SetupChecklist({ agentId }: { agentId: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Where your agent answers you
        </h2>
        <Link
          href="/dashboard/channels"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          All channels →
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick one so you can talk to it without opening this dashboard. Each opens its setup steps
        here — no OAuth exists for these, so they need a bot token from the app&apos;s own console.
      </p>

      <div className="mt-3">
        <ChannelsPanel agentId={agentId} showHeading={false} />
      </div>
    </div>
  );
}
