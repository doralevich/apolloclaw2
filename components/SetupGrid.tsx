"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CHANNELS_ENABLED } from "@/config/channels";
import { CHAT_ROW, SETUP_ROWS, type SetupRow, type SetupTile } from "@/config/setup-grid";
import type {
  Channel,
  ChannelsResult,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// The connect shelves at the top of Start Here.
//
// A tile is a link, not a form. For a toolkit that means the same server-side OAuth start that
// Connections uses — one click from this page to Google's consent screen, no intermediate page to
// find the app on. For a chat channel there is no such thing: every one of them needs a token the
// customer creates in somebody else's console, so those link through to Channels with their own
// card already open.
//
// Nothing here holds credentials or owns state. It reports what Channels and Connections say and
// hands off to them, so it can never disagree with them about how something is connected.
//
// A failure is silent. This sits on the first screen a new customer sees, and an error banner
// about an endpoint they've never heard of is a worse first impression than tiles that say
// "Connect" — which is, after all, true on day one.

function connectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}

export function SetupGrid({ agentId }: { agentId: string }) {
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[] | null>(null);

  // Both loads land their state in a promise callback rather than the effect body, the same way
  // Channels and Connections do it. A failed load resolves to an empty list rather than staying
  // null forever, so the tiles settle on "Connect" instead of a permanent blank.
  const loadConnections = useCallback(() => {
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => setConnections(res.connections))
      .catch(() => setConnections((prev) => prev ?? []));
  }, [agentId]);

  useEffect(() => {
    if (CHANNELS_ENABLED) {
      apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
        .then((res) => setChannels(res.channels))
        .catch(() => setChannels((prev) => prev ?? []));
    }
    loadConnections();
  }, [agentId, loadConnections]);

  // Connecting happens in another tab. Coming back to this one is the moment to find out whether
  // it worked — cheaper and more reliable than polling on a timer for something that might never
  // be finished.
  useEffect(() => {
    window.addEventListener("focus", loadConnections);
    return () => window.removeEventListener("focus", loadConnections);
  }, [loadConnections]);

  const isConnected = (tile: SetupTile): boolean => {
    if (tile.kind === "channel") {
      return (channels ?? []).some((c) => c.channel === tile.id && c.state === "connected");
    }
    return (connections ?? []).some(
      (c) =>
        (c.toolkitSlug || "").toLowerCase() === tile.slug.toLowerCase() &&
        (c.status || "").toUpperCase() === "ACTIVE"
    );
  };

  // Loaded is per row, because the two endpoints answer independently — the Google shelf
  // shouldn't wait on the channels call to stop saying nothing.
  const loaded = (row: SetupRow) =>
    row.tiles[0]?.kind === "channel" ? channels !== null : connections !== null;

  const rows = CHANNELS_ENABLED ? [CHAT_ROW, ...SETUP_ROWS] : SETUP_ROWS;

  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.title}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {row.title}
            </h2>
            <Link
              href={row.href}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              All settings
            </Link>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{row.blurb}</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {row.tiles.map((tile) => (
              <Tile
                key={tile.key}
                tile={tile}
                agentId={agentId}
                rowHref={row.href}
                connected={isConnected(tile)}
                loaded={loaded(row)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tile({
  tile,
  agentId,
  rowHref,
  connected,
  loaded,
}: {
  tile: SetupTile;
  agentId: string;
  rowHref: string;
  connected: boolean;
  loaded: boolean;
}) {
  const soon = tile.kind === "channel" && tile.soon;

  // A toolkit that isn't connected yet goes straight to the provider's consent screen, in a new
  // tab so this page survives to notice when it comes back. Everything else is in-app.
  const startsOAuth = tile.kind === "toolkit" && !connected && loaded;

  const href = startsOAuth
    ? connectHref(agentId, tile.slug)
    : tile.kind === "channel" && !soon
      ? `${rowHref}?open=${tile.id}`
      : rowHref;

  const className = cn(
    "flex flex-col items-center gap-1.5 rounded-xl border bg-card px-2 py-2.5 text-center transition-colors hover:border-foreground/25",
    connected &&
      "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/25"
  );

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.logo}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-6 w-6 shrink-0 rounded object-contain"
      />
      <span className="w-full truncate text-xs font-medium">{tile.name}</span>
      <span className="text-[11px] leading-none text-muted-foreground">
        {/* Discord. The tile is worth showing — it says what's coming — but it must not say
            "Connect", which invites four steps of setup that then refuse. */}
        {soon ? (
          "Soon"
        ) : !loaded ? (
          // Before the answer arrives, say nothing. Claiming an app isn't connected when we don't
          // know yet is the one wrong thing this line can say, and it's the line a returning
          // customer reads to check their setup survived.
          " "
        ) : connected ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            Connected
          </span>
        ) : (
          "Connect"
        )}
      </span>
    </>
  );

  if (startsOAuth) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
