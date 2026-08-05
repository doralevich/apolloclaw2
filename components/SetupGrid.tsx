"use client";

import { useEffect, useState } from "react";
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
// Read-only on purpose. Every tile is a link to the page that owns the setup, so this can never
// disagree with Channels or Connections about how something is connected — it only reports what
// they say. That also keeps it cheap: two GETs, no polling, no OAuth redirect to get wrong.
//
// A failure here is silent. This sits above the greeting on the first screen a new customer sees,
// and an error banner about an endpoint they've never heard of is a worse first impression than
// twelve tiles that all say "Connect" — which is, after all, true on day one.

export function SetupGrid({ agentId }: { agentId: string }) {
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[] | null>(null);

  // Both loads land their state in a promise callback rather than the effect body, the same way
  // Channels and Connections do it.
  useEffect(() => {
    let cancelled = false;

    if (CHANNELS_ENABLED) {
      apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
        .then((res) => {
          if (!cancelled) setChannels(res.channels);
        })
        .catch(() => {
          if (!cancelled) setChannels([]);
        });
    }

    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => {
        if (!cancelled) setConnections(res.connections);
      })
      .catch(() => {
        if (!cancelled) setConnections([]);
      });

    return () => {
      cancelled = true;
    };
  }, [agentId]);

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

  // "Loaded" is per row, because the two endpoints answer independently — the Google shelf
  // shouldn't wait on the channels call to stop saying nothing.
  const loaded = (row: SetupRow) =>
    row.tiles[0]?.kind === "channel" ? channels !== null : connections !== null;

  const rows = CHANNELS_ENABLED ? [CHAT_ROW, ...SETUP_ROWS] : SETUP_ROWS;

  return (
    <div className="space-y-6">
      {rows.map((row) => (
        <div key={row.title}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {row.title}
            </h2>
            <Link
              href={row.href}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Set up
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{row.blurb}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {row.tiles.map((tile) => (
              <Tile
                key={tile.kind === "channel" ? tile.id : tile.slug}
                tile={tile}
                href={row.href}
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
  href,
  connected,
  loaded,
}: {
  tile: SetupTile;
  href: string;
  connected: boolean;
  loaded: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-colors hover:border-foreground/25",
        connected &&
          "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/25"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.logo}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-8 w-8 shrink-0 rounded-lg object-contain"
      />
      <span className="w-full truncate text-xs font-medium">{tile.name}</span>
      {/* Before the answer arrives, say nothing. Claiming an app isn't connected when we don't
          know yet is the one wrong thing this line can say, and it's the line a returning
          customer looks at to check their setup survived. */}
      <span className="text-[11px] text-muted-foreground">
        {/* Discord. The tile is worth showing — it says what's coming — but it must not say
            "Connect", which invites four steps of setup that then refuse. */}
        {tile.kind === "channel" && tile.soon ? (
          "Soon"
        ) : !loaded ? (
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
    </Link>
  );
}
