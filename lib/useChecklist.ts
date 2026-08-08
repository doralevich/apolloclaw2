"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ChecklistItem } from "@/config/checklist";
import type {
  ChannelsResult,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// One agent's checklist, resolved: the generated items, plus whether each one is done.
//
// Done comes from two places and they are deliberately different. Self-reported items read the
// stored ticks. Derived items are computed here, in the browser, from the same endpoints the
// Connections and Channels pages use — so this can never claim Gmail is connected on a screen
// where Connections says it is not. Storing a derived tick would create exactly that drift the
// first time somebody revoked an app.
//
// Shared by the full page and the summary on Start Here so the two can never disagree about the
// count, which is the whole reason it is a hook and not two copies of the same fetching.

type ChecklistResponse = {
  items: ChecklistItem[];
  done: string[];
  personalized: boolean;
};

function isActiveConnection(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

export type ResolvedItem = ChecklistItem & { done: boolean };

export function useChecklist(agentId: string, sessionCount: number) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [connectedSlugs, setConnectedSlugs] = useState<Set<string>>(new Set());
  const [liveChannels, setLiveChannels] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    apiFetch<ChecklistResponse>(`/api/agents/${agentId}/checklist`)
      .then((res) => {
        setItems(res.items);
        setTicked(new Set(res.done));
        setPersonalized(res.personalized);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) =>
        setConnectedSlugs(
          new Set(
            res.connections
              .filter(isActiveConnection)
              .map((c) => (c.toolkitSlug || "").toLowerCase())
              .filter(Boolean)
          )
        )
      )
      .catch(() => {});

    apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
      .then((res) =>
        setLiveChannels(
          new Set(
            res.channels
              .filter((c) => c.state === "connected" || c.state === "pending")
              .map((c) => c.channel)
          )
        )
      )
      .catch(() => {});
  }, [agentId]);

  useEffect(() => {
    load();
    // Connecting an app finishes in the OAuth tab, so nothing here would ever learn it happened.
    // Returning to this tab IS the signal — cheaper and more certain than polling a page somebody
    // may sit on for a while.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const isDone = useCallback(
    (item: ChecklistItem): boolean => {
      if (!item.derived) return ticked.has(item.id);
      if (item.derived === "tools") return connectedSlugs.size > 0;
      if (item.derived === "channel") return liveChannels.size > 0;
      if (item.derived === "asked") return sessionCount > 0;
      // toolkit:<slug> / channel:<id> — that specific app or channel, not any of them.
      // "Connect HubSpot" ticking because somebody connected Gmail, or "Put it in Slack"
      // ticking because they set up Telegram, would be the page lying about the one it named.
      if (item.derived.startsWith("channel:")) {
        return liveChannels.has(item.derived.slice("channel:".length));
      }
      return connectedSlugs.has(item.derived.slice("toolkit:".length).toLowerCase());
    },
    [ticked, connectedSlugs, liveChannels, sessionCount]
  );

  // Optimistic. A tick that waits on a round-trip feels broken, and the failure mode of getting
  // it wrong is a checkbox that flicks back — recoverable, unlike a lost answer.
  const toggle = useCallback(
    (item: ChecklistItem) => {
      if (item.derived) return; // derived items are facts; there is nothing to toggle
      const next = new Set(ticked);
      const wasDone = next.has(item.id);
      if (wasDone) next.delete(item.id);
      else next.add(item.id);
      setTicked(next);

      const request = wasDone
        ? apiFetch(`/api/agents/${agentId}/checklist?item=${encodeURIComponent(item.id)}`, {
            method: "DELETE",
          })
        : apiFetch(`/api/agents/${agentId}/checklist`, {
            method: "POST",
            body: JSON.stringify({ item: item.id }),
          });

      request.catch(() => {
        // Put it back. Silent: the box moving on its own says "that did not save" more clearly
        // than a toast somebody has to read and dismiss.
        setTicked((cur) => {
          const rollback = new Set(cur);
          if (wasDone) rollback.add(item.id);
          else rollback.delete(item.id);
          return rollback;
        });
      });
    },
    [agentId, ticked]
  );

  const resolved: ResolvedItem[] = items.map((i) => ({ ...i, done: isDone(i) }));
  const doneCount = resolved.filter((i) => i.done).length;

  return { items: resolved, doneCount, total: resolved.length, personalized, loading, toggle };
}
