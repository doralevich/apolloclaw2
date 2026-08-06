"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, FileText, Mail, MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  Channel,
  ChannelsResult,
  IntegrationConnection,
  IntegrationConnectionsResult,
} from "@/lib/types";

// "Have you connected anything yet" — on Start Here, in the four terms a customer thinks in.
//
// WHY IT IS A CHECKLIST AND NOT THE SHELVES AGAIN. Connect tiles used to live on this page and
// were moved to the chat's empty state, where somebody about to type can act on them. That move
// was right, and this does not undo it: the rail is still where you CONNECT things. This asks
// the question the rail cannot — "is this set up?" — which is the one thing a landing page is
// well placed to say, and it says it in four rows rather than thirty tiles.
//
// It is also deliberately NOT a copy of Connections or Channels. Those two are split on purpose
// (what the agent can REACH versus where it ANSWERS you) and putting both back on one screen is
// exactly the undifferentiated pile that split was undoing. So each row owns a CAPABILITY, names
// whichever provider happens to satisfy it, and hands off to the page that owns the connecting.
//
// Every failure is silent, like the rail: this is an accessory on a page whose job is to get
// somebody into the chat, and an error about an endpoint they have never heard of helps nobody.
// Unknown reads the same as unconnected, which is the safe way round — it invites a click that
// lands on a page telling the truth, rather than claiming a connection that isn't there.

type Row = {
  key: string;
  label: string;
  Icon: typeof Mail;
  blurb: string;
  href: string;
  /** Any one of these toolkits satisfies the row. */
  toolkits?: string[];
  /** Set instead of `toolkits` for the row satisfied by a chat channel. */
  anyChannel?: boolean;
};

// Microsoft serves mail AND calendar from the single Outlook connection, so it satisfies both
// rows — the same fact config/integration-rail.ts records when explaining why the Microsoft
// shelf is three tiles rather than eight.
const ROWS: Row[] = [
  {
    key: "email",
    label: "Email",
    Icon: Mail,
    blurb: "So it can read what came in, draft replies, and chase what you're waiting on.",
    href: "/dashboard/integrations",
    toolkits: ["gmail", "outlook"],
  },
  {
    key: "calendar",
    label: "Calendar",
    Icon: CalendarDays,
    blurb: "So it knows what your week looks like before it suggests anything.",
    href: "/dashboard/integrations",
    toolkits: ["googlecalendar", "outlook"],
  },
  {
    key: "documents",
    label: "Documents",
    Icon: FileText,
    blurb: "So it can find the contract or the deck instead of asking you to paste it in.",
    href: "/dashboard/integrations",
    toolkits: ["googledrive", "googledocs", "one_drive", "dropbox"],
  },
  {
    key: "channel",
    label: "How to reach you",
    Icon: MessageCircle,
    blurb: "WhatsApp, Telegram or Slack, so you can talk to it without opening this dashboard.",
    href: "/dashboard/channels",
    anyChannel: true,
  },
];

function isActive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

export function SetupChecklist({ agentId }: { agentId: string }) {
  const [toolkits, setToolkits] = useState<Set<string> | null>(null);
  const [channels, setChannels] = useState<Channel[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => {
        if (cancelled) return;
        setToolkits(
          new Set(
            res.connections
              .filter(isActive)
              .map((c) => (c.toolkitSlug || "").toLowerCase())
              .filter(Boolean)
          )
        );
      })
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

  const connectedChannel = channels?.find((c) => c.state === "connected") ?? null;
  const isDone = (row: Row): boolean =>
    row.anyChannel
      ? !!connectedChannel
      : !!toolkits && (row.toolkits ?? []).some((t) => toolkits.has(t));

  const done = ROWS.filter(isDone).length;

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Set up your connections
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {done === ROWS.length
          ? "All connected. Everything below is wired up."
          : "Until these are connected, your agent can advise but it can't act. Each one takes about a minute."}
      </p>

      <div className="mt-4 divide-y rounded-lg border bg-card">
        {ROWS.map((row) => {
          const complete = isDone(row);
          return (
            <Link
              key={row.key}
              href={row.href}
              className="flex items-start gap-3 p-4 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted/40"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border",
                  complete ? "border-transparent bg-primary text-primary-foreground" : "bg-background"
                )}
              >
                {complete ? <Check className="size-4" /> : <row.Icon className="size-4 text-muted-foreground" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{row.label}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      complete ? "text-muted-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {/* Named once connected, because "which mailbox?" is the fact worth having at
                        a glance — the same reason the Channels cards say who they answer as. */}
                    {complete
                      ? row.anyChannel
                        ? connectedChannel?.account || "Connected"
                        : "Connected"
                      : "Set up →"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{row.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
