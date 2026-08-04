"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { CHANNELS, CHANNELS_ENABLED } from "@/config/channels";
import type { Channel, ChannelId, ChannelsResult } from "@/lib/types";

// The chat-app icons above the empty chat — the ones from David's original ask.
//
// Its sibling ConnectStrip offers the apps an agent WORKS FROM (mail, calendar, files). This
// offers the places it can ANSWER YOU. Same shape on purpose: two rows of logos, one question
// each, so the empty chat says "here is what I can reach" and "here is where I can reach you"
// without either becoming a paragraph.
//
// Renders nothing at all while Channels is dark (config/channels.ts) — no fetch, no row, no
// link into a page that 404s. It lights up with the rest of the feature.

export function ChannelStrip({ agentId }: { agentId: string }) {
  const [channels, setChannels] = useState<Channel[] | null>(null);

  const load = useCallback(() => {
    if (!CHANNELS_ENABLED) return;
    apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
      .then((res) => setChannels(res.channels))
      // Silent: an accessory on the chat screen, not the customer's errand.
      .catch(() => setChannels([]));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Setting one up happens on the Channels page, often in a second tab for the token. Re-check
  // on return so a channel that just went live drops off this row.
  useEffect(() => {
    if (!CHANNELS_ENABLED) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  if (!CHANNELS_ENABLED || !channels) return null;

  const connected = new Set<ChannelId>(
    channels.filter((c) => c.state === "connected").map((c) => c.channel)
  );
  const pending = CHANNELS.filter((def) => !connected.has(def.id));
  // Every channel is already live — there is nothing left to offer.
  if (pending.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {pending.map((def) => (
          <Link
            key={def.id}
            href="/dashboard/channels"
            title={`Set up ${def.name}`}
            aria-label={`Set up ${def.name}`}
            className="group inline-flex h-14 w-14 items-center justify-center rounded-xl border bg-card transition-colors hover:border-foreground/25 hover:bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={def.logo}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-8 w-8 object-contain opacity-70 transition-opacity group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Or talk to your agent where you already chat —{" "}
        <Link href="/dashboard/channels" className="underline underline-offset-2 hover:text-foreground">
          set up a channel
        </Link>
        .
      </p>
    </div>
  );
}
