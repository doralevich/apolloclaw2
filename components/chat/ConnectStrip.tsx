"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  DEFAULT_INTEGRATION_TOOLKITS,
  ESSENTIAL_INTEGRATION_SLUGS,
} from "@/lib/integration-catalog";
import type { IntegrationConnection, IntegrationConnectionsResult, IntegrationToolkit } from "@/lib/types";

// The row of app logos above the empty-chat greeting.
//
// An agent with nothing connected can talk but can't DO anything, and the place people find
// that out is the chat — not the Connections tab, which you have to already know to look for.
// So the invitation goes where the arriving customer actually is.
//
// It only ever shows apps that are NOT connected yet, and disappears entirely once the
// essentials are done. A strip of green ticks would be a scoreboard; this is a to-do list that
// finishes. It is also purely additive — every failure path renders nothing rather than
// interrupting the chat, because a broken accessory must not cost anyone their composer.

const ESSENTIALS: IntegrationToolkit[] = ESSENTIAL_INTEGRATION_SLUGS.map((slug) =>
  DEFAULT_INTEGRATION_TOOLKITS.find((t) => t.slug.toLowerCase() === slug.toLowerCase())
).filter((t): t is IntegrationToolkit => !!t);

// Room for a handful before the row starts to read as a wall. The rest are one click away.
const MAX_SHOWN = 5;

function isConnected(conns: IntegrationConnection[], slug: string): boolean {
  return conns.some(
    (c) =>
      (c.toolkitSlug || "").toLowerCase() === slug.toLowerCase() &&
      (c.status || "").toUpperCase() === "ACTIVE"
  );
}

export function ConnectStrip({ agentId }: { agentId: string }) {
  const [connections, setConnections] = useState<IntegrationConnection[] | null>(null);

  // Every setState lands in a promise callback rather than the effect body, matching how the
  // Connections tab loads the same endpoint. A failure resolves to "nothing to show" instead of
  // a toast: this is an accessory on someone else's screen, not their errand.
  const load = useCallback(() => {
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => setConnections(res.connections))
      .catch(() => setConnections([]));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Connecting happens in a second tab. Re-check when this one comes back to the front, so the
  // app the customer just authorised drops off the strip without a manual refresh.
  useEffect(() => {
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

  // Render nothing until we know the answer: flashing "connect Gmail" at someone who connected
  // Gmail months ago is worse than showing the strip a beat late.
  if (!connections) return null;

  const pending = ESSENTIALS.filter((t) => !isConnected(connections, t.slug));
  if (pending.length === 0) return null;

  const shown = pending.slice(0, MAX_SHOWN);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {shown.map((t) => (
          <a
            key={t.slug}
            href={`/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(t.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Connect ${t.name}`}
            aria-label={`Connect ${t.name}`}
            className="group inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-card transition-colors hover:border-foreground/25 hover:bg-secondary"
          >
            {t.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.logo}
                alt=""
                loading="lazy"
                decoding="async"
                // Unconnected apps sit back until you look at them, so the row reads as an offer
                // rather than a set of alerts.
                className="h-6 w-6 object-contain opacity-70 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {t.name.charAt(0).toUpperCase()}
              </span>
            )}
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Connect an app to give your agent something to work with, or{" "}
        <Link href="/dashboard/integrations" className="underline underline-offset-2 hover:text-foreground">
          browse them all
        </Link>
        .
      </p>
    </div>
  );
}
