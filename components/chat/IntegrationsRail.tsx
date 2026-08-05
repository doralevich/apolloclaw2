"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Search, Settings2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CHANNELS_ENABLED } from "@/config/channels";
import { RAIL_GROUPS, type RailGroup, type RailTile } from "@/config/integration-rail";
import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";
import type {
  Channel,
  ChannelsResult,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// What the agent can reach, beside the empty chat.
//
// A tile is a link, never a form. An unconnected app opens the provider's consent screen through
// the same server-side route the Connections page uses; a chat channel opens its card on
// Channels, because no OAuth exists for those — they need a token pasted into somebody else's
// console. This surface therefore can't disagree with either page about how anything connects:
// it reports what they say and hands off to them.
//
// It renders only on the empty state. A 380px rail beside a live transcript is 380px of reading
// width gone, and the conversation is what the page is for.
//
// Every failure is silent. This is an accessory on a screen someone came to type on: a load that
// fails shows tiles that say nothing rather than an error about an endpoint they've never heard
// of, and the composer keeps working either way.

const HIDDEN_KEY = "apolloclaw:integrations-rail-hidden";

function isActive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE";
}

export function IntegrationsRail({ agentId }: { agentId: string }) {
  const [connections, setConnections] = useState<IntegrationConnection[] | null>(null);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [query, setQuery] = useState("");

  // Hidden state is remembered, because somebody who closed this does not want to close it again
  // on every new chat. Read through useSyncExternalStore so the server renders the open state and
  // the browser corrects it, with no state written from an effect to get there.
  const storedHidden = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(HIDDEN_KEY),
    () => null
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const hidden = override ?? storedHidden === "1";

  const toggle = () => {
    const next = !hidden;
    setOverride(next);
    try {
      window.localStorage.setItem(HIDDEN_KEY, next ? "1" : "0");
    } catch {
      // Private browsing, or storage full. The toggle still works for this session.
    }
  };

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

  // Connecting happens in another tab. Coming back to this one is when to find out whether it
  // worked — cheaper and more reliable than polling for something that might never be finished.
  useEffect(() => {
    window.addEventListener("focus", loadConnections);
    return () => window.removeEventListener("focus", loadConnections);
  }, [loadConnections]);

  const connectedSlugs = useMemo(
    () =>
      new Set(
        (connections ?? [])
          .filter(isActive)
          .map((c) => (c.toolkitSlug || "").toLowerCase())
          .filter(Boolean)
      ),
    [connections]
  );
  const connectedChannels = useMemo(
    () => new Set((channels ?? []).filter((c) => c.state === "connected").map((c) => c.channel)),
    [channels]
  );

  const isConnected = useCallback(
    (tile: RailTile) =>
      tile.kind === "toolkit"
        ? connectedSlugs.has(tile.slug.toLowerCase())
        : connectedChannels.has(tile.id),
    [connectedSlugs, connectedChannels]
  );

  const groups = useMemo(
    () => RAIL_GROUPS.filter((g) => g.title !== "Chat apps" || CHANNELS_ENABLED),
    []
  );

  // Searching flattens everything into one list drawn from the WHOLE catalogue, not just the
  // curated groups — otherwise typing the name of an app we support but didn't feature says we
  // don't have it.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[\s_]+/g, "");
    if (!q) return null;
    const featured = new Set(
      groups.flatMap((g) => g.tiles.map((t) => (t.kind === "toolkit" ? t.slug.toLowerCase() : t.id)))
    );
    const fromGroups = groups
      .flatMap((g) => g.tiles)
      .filter((t) => t.name.toLowerCase().replace(/[\s_]+/g, "").includes(q));
    const fromCatalog: RailTile[] = DEFAULT_INTEGRATION_TOOLKITS.filter(
      (t) =>
        !featured.has(t.slug.toLowerCase()) &&
        (t.name.toLowerCase().replace(/[\s_]+/g, "").includes(q) ||
          t.slug.toLowerCase().replace(/[\s_]+/g, "").includes(q))
    ).map((t) => ({
      kind: "toolkit",
      key: t.slug,
      name: t.name,
      slug: t.slug,
      // The catalogue's logo is nullable; the tile's isn't. Fall back to the same URL the
      // catalogue would have built rather than widening the type for a case that costs a
      // broken-image icon at worst.
      logo: t.logo || composioLogoUrl(t.slug),
    }));
    return [...fromGroups, ...fromCatalog];
  }, [query, groups]);

  return (
    <aside className="w-full shrink-0 rounded-2xl border bg-card/60 lg:w-[340px]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h2 className="text-lg font-semibold tracking-tight">Integrations</h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!hidden}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {hidden ? "Show" : "Hide"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", !hidden && "rotate-180")} />
        </button>
      </div>

      {hidden ? null : (
        <>
          <div className="relative px-4 pt-3">
            <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search integrations..."
              aria-label="Search integrations"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 pb-4 pt-4">
            {results ? (
              results.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing matching that.{" "}
                  <Link href="/dashboard/integrations" className="underline underline-offset-2">
                    Browse them all
                  </Link>
                  .
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {results.map((tile) => (
                    <Tile
                      key={`${tile.kind}-${tile.key}`}
                      tile={tile}
                      agentId={agentId}
                      connected={isConnected(tile)}
                    />
                  ))}
                </div>
              )
            ) : (
              groups.map((group) => (
                <Group
                  key={group.title}
                  group={group}
                  agentId={agentId}
                  isConnected={isConnected}
                  // Before the answer lands, no count. "0 connected" to somebody who connected
                  // Gmail months ago is the one wrong thing this line can say.
                  countReady={group.title === "Chat apps" ? channels !== null : connections !== null}
                />
              ))
            )}
          </div>

          <div className="border-t px-4 py-3">
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings2 className="h-4 w-4" />
              Manage integrations
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}

function Group({
  group,
  agentId,
  isConnected,
  countReady,
}: {
  group: RailGroup;
  agentId: string;
  isConnected: (tile: RailTile) => boolean;
  countReady: boolean;
}) {
  const count = group.tiles.filter(isConnected).length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 pb-2">
        <h3 className="text-sm font-semibold">{group.title}</h3>
        {countReady && (
          <span className="text-[11px] text-muted-foreground">{count} connected</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {group.tiles.map((tile) => (
          <Tile
            key={`${tile.kind}-${tile.key}`}
            tile={tile}
            agentId={agentId}
            connected={isConnected(tile)}
          />
        ))}
        <Link
          href={group.href}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-1 py-2.5 text-center text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] leading-tight">Add more</span>
        </Link>
      </div>
    </div>
  );
}

function Tile({
  tile,
  agentId,
  connected,
}: {
  tile: RailTile;
  agentId: string;
  connected: boolean;
}) {
  const className = cn(
    "group relative flex flex-col items-center gap-1 rounded-xl border bg-card px-1 py-2.5 text-center transition-colors hover:border-foreground/25",
    connected && "border-emerald-200 dark:border-emerald-900/60"
  );

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.logo}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-5 w-5 shrink-0 object-contain"
      />
      <span className="w-full truncate text-[10px] leading-tight">{tile.name}</span>
      {/* A dot, not the word "Connected": at four tiles across there is no room for the word, and
          the dot is the thing anyone is actually scanning for. */}
      {connected && (
        <span
          aria-label="Connected"
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"
        />
      )}
    </>
  );

  if (tile.kind === "channel") {
    return (
      <Link href={`/dashboard/channels?open=${tile.id}`} className={className}>
        {inner}
      </Link>
    );
  }

  if (connected) {
    return (
      <Link href="/dashboard/integrations" className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={`/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(tile.slug)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {inner}
    </a>
  );
}
