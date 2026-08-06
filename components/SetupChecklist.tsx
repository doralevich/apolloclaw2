"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CHANNELS } from "@/config/channels";
import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";
import type {
  Channel,
  ChannelsResult,
  ChannelId,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// "Have you connected anything yet" — on Start Here, as the named apps rather than as abstract
// capabilities, so there is nothing to decode before you can click.
//
// WHY IT IS HERE AT ALL. The connect shelves left this page for the chat's empty state, where
// somebody about to type can act on them, and that still holds: the rail and the two Connections
// pages are where things GET connected. What left with the shelves was anybody ASKING. A customer
// who never opens the rail never learns that an agent with no mailbox can only give advice, and
// this is the page they land on when the build finishes.
//
// THE TWO GROUPS ARE NOT COSMETIC. Channels is where the agent ANSWERS you; Connections is what it
// can REACH. Those were one screen once and it read as an undifferentiated pile of apps, which is
// why they were split. Listing them here in one flat run would rebuild the pile, so the split is
// carried over and each group hands off to the page that owns it.
//
// SLUGS ARE NOT GUESSED, for the same reason config/integration-rail.ts says so: a guessed Google
// Contacts slug once shipped and dead-ended on "Could not connect app". Every slug below is
// asserted against the catalogue at import, so a typo fails the build instead of a customer.

const CATALOG = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => t.slug.toLowerCase()));

type Item = {
  key: string;
  name: string;
  /** The line under the name. Says what connecting gets you, not what the product is. */
  blurb: string;
  logo: string;
  /** Any one of these satisfies the row. More than one only where a provider genuinely bundles. */
  slugs?: string[];
  channel?: ChannelId;
};

function app(slug: string, name: string, blurb: string): Item {
  if (!CATALOG.has(slug.toLowerCase())) {
    throw new Error(
      `SetupChecklist: "${slug}" is not in the Connections catalogue. Add it to ` +
        `lib/integration-catalog.ts first — a slug that isn't there can't be connected.`
    );
  }
  return { key: slug, name, blurb, logo: composioLogoUrl(slug), slugs: [slug] };
}

function chat(id: ChannelId): Item {
  const def = CHANNELS.find((c) => c.id === id);
  if (!def) throw new Error(`SetupChecklist: no channel definition for "${id}".`);
  // Name, logo and tagline all come from config/channels.ts rather than being restated here, so
  // this page can never disagree with the Channels cards about what a channel is.
  return { key: id, name: def.name, blurb: def.tagline, logo: def.logo, channel: id };
}

type Group = { title: string; blurb: string; href: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Where your agent answers you",
    blurb: "Pick at least one, so you can talk to it without opening this dashboard.",
    href: "/dashboard/channels",
    items: [chat("telegram"), chat("slack"), chat("whatsapp")],
  },
  {
    title: "What your agent can reach",
    blurb: "This is what turns advice into work actually getting done.",
    href: "/dashboard/integrations",
    items: [
      app("gmail", "Gmail", "Read what came in, draft replies, chase what you're waiting on."),
      app("googlecalendar", "Google Calendar", "Know what your week looks like before suggesting anything."),
      app("googledrive", "Google Drive", "Find the contract or the deck instead of asking you to paste it."),
      // One row, not two. The catalogue entry is "Microsoft's email and calendar platform" — a
      // single connection serving both, so a separate Outlook Calendar row would be the same
      // connection twice and would flip the moment this one did.
      app("outlook", "Outlook", "Mail and calendar together — one Microsoft connection covers both."),
      app("one_drive", "OneDrive", "The Microsoft side of files, for everything kept in 365."),
      app("dropbox", "Dropbox", "Anything filed here, searchable the same way as the rest."),
    ],
  },
];

function isActive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

export function SetupChecklist({ agentId }: { agentId: string }) {
  const [toolkits, setToolkits] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    let cancelled = false;

    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => {
        if (cancelled) return;
        setToolkits(
          new Set(res.connections.filter(isActive).map((c) => (c.toolkitSlug || "").toLowerCase()).filter(Boolean))
        );
      })
      // Silent, like the rail. Unknown renders as not-connected, which is the safe direction: it
      // invites a click onto a page telling the truth, rather than claiming a connection that
      // isn't there.
      .catch(() => {});

    apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
      .then((res) => {
        if (!cancelled) setChannels(res.channels);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const connectedAs = (item: Item): string | null => {
    if (item.channel) {
      const c = channels.find((ch) => ch.channel === item.channel && ch.state === "connected");
      return c ? c.account || "Connected" : null;
    }
    return (item.slugs ?? []).some((s) => toolkits.has(s)) ? "Connected" : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Set up your connections
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Click any of these to set it up. Each one takes about a minute, and you only do it once.
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold">{group.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{group.blurb}</p>
          <div className="mt-3 space-y-2">
            {group.items.map((item) => {
              const status = connectedAs(item);
              return (
                <Link
                  key={item.key}
                  href={group.href}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/25"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logo}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          status
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {status ?? "Not connected"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.blurb}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
