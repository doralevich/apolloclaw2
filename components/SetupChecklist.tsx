"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChannelsPanel } from "@/components/ChannelsView";
import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";
import type { IntegrationConnection, IntegrationConnectionsResult } from "@/lib/types";

// Setting up, on the page people land on when the build finishes.
//
// WHY THE TWO HALVES ARE DIFFERENT SHAPES. They connect by genuinely different means, and
// pretending otherwise is what makes setup screens lie. An app the agent REACHES is one OAuth
// click, so those are compact cards, two to a row, tabbed by provider — a Connect button and a
// line about what the click will do is the whole story. A chat app is where the agent ANSWERS
// you, and no OAuth exists for any of them: they need a bot token pasted in from somebody else's
// console, seven numbered steps of it for WhatsApp. That does not fit in half a row, so those run
// full width and expand, one at a time, onto the steps and the form.
//
// The full-width half is the Channels page's own ChannelsPanel, not a copy of it. A copy would be
// a second thing to keep in step with config/channels.ts, and the first time the two disagreed
// about a setup step the customer would be the one to find out.
//
// The split itself is the one Channels and Connections already make (reach versus answer). It
// exists because the two were a single screen once and read as an undifferentiated pile of apps.
//
// CONNECT IS A LINK, NOT A HANDLER. /integrations/connect/redirect starts OAuth server-side and
// 302s to the provider, which is what the Connections cards use. A plain anchor to it means no
// fetch, no token in the browser, and no way for this page to disagree with that one about how
// anything connects.
//
// SLUGS ARE NOT GUESSED, for the reason config/integration-rail.ts states: a guessed Google
// Contacts slug shipped once and dead-ended on "Could not connect app". Every slug here is
// asserted against the catalogue at import, so a typo fails the build rather than a customer.

const CATALOG = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => t.slug.toLowerCase()));

type App = {
  slug: string;
  name: string;
  /** What connecting buys you. */
  blurb: string;
  /** What happens when you click, so the new tab is never a surprise. */
  how: string;
  logo: string;
};

function app(slug: string, name: string, blurb: string, how: string): App {
  if (!CATALOG.has(slug.toLowerCase())) {
    throw new Error(
      `SetupChecklist: "${slug}" is not in the Connections catalogue. Add it to ` +
        `lib/integration-catalog.ts first — a slug that isn't there can't be connected.`
    );
  }
  return { slug, name, blurb, how, logo: composioLogoUrl(slug) };
}

type Tab = { id: string; label: string; apps: App[] };

const TABS: Tab[] = [
  {
    id: "google",
    label: "Google",
    apps: [
      app("gmail", "Gmail", "Reads what came in, drafts replies, chases what you're waiting on.", "Opens Google's sign-in in a new tab. Approve the access it asks for and you're done."),
      app("googlecalendar", "Google Calendar", "Knows what your week looks like before it suggests anything.", "Same Google sign-in. Connect it separately from Gmail — Google treats them as two apps."),
      app("googledrive", "Google Drive", "Finds the contract or the deck instead of asking you to paste it in.", "Same Google sign-in again. Docs and Sheets are separate connections under Connections."),
    ],
  },
  {
    id: "microsoft",
    label: "Microsoft",
    apps: [
      // One card, not two. The catalogue entry is "Microsoft's email and calendar platform" — a
      // single connection serving both, so a separate Outlook Calendar card would be this same
      // connection printed twice, flipping to connected the moment this one did.
      app("outlook", "Outlook", "Mail and calendar together — one connection covers both.", "Opens Microsoft's sign-in. If your organisation restricts app consent, an admin may need to approve it."),
      app("one_drive", "OneDrive", "Files kept in Microsoft 365, searchable the same way as the rest.", "A separate Microsoft sign-in from Outlook, even though it's the same account."),
    ],
  },
  {
    id: "other",
    label: "Other",
    apps: [
      app("dropbox", "Dropbox", "Anything filed here, readable without you sending it over.", "Opens Dropbox's sign-in in a new tab."),
    ],
  },
];

function isActive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

function connectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}

function Logo({ src }: { src: string }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={src} alt="" width={28} height={28} className="size-7 shrink-0 rounded" loading="lazy" />;
}

function Badge({ connected, label }: { connected: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        connected ? "border-transparent bg-primary text-primary-foreground" : "text-muted-foreground"
      )}
    >
      {connected && <Check className="size-3" />}
      {label}
    </span>
  );
}

export function SetupChecklist({ agentId }: { agentId: string }) {
  const [tab, setTab] = useState(TABS[0].id);
  const [toolkits, setToolkits] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) =>
        setToolkits(
          new Set(res.connections.filter(isActive).map((c) => (c.toolkitSlug || "").toLowerCase()).filter(Boolean))
        )
      )
      // Silent. Unknown renders as not-connected, which is the safe direction: it invites a click
      // onto a flow that tells the truth, rather than claiming a connection that isn't there.
      .catch(() => {});

  }, [agentId]);

  useEffect(() => {
    load();
    // Connecting finishes in the OAuth tab, so nothing here would ever learn it happened. Coming
    // back to this tab IS the signal — cheaper and more certain than polling on a page somebody
    // may sit on for a while.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const shown = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Set up your connections
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Until these are connected your agent can advise, but it can&apos;t act. Each one is a
          minute, and you only do it once.
        </p>
      </div>

      {/* ── What it can reach: one OAuth click, so connect from here ─────────────────────── */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">What your agent can reach</h3>
          <Link href="/dashboard/integrations" className="text-xs text-muted-foreground hover:text-foreground">
            All apps →
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-1 text-sm" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
                t.id === tab ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shown.apps.map((a) => {
            const connected = toolkits.has(a.slug.toLowerCase());
            return (
              <div key={a.slug} className="flex flex-col rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Logo src={a.logo} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.name}</span>
                      <Badge connected={connected} label={connected ? "Connected" : "Not connected"} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.blurb}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{a.how}</p>
                {connected ? (
                  <Link
                    href="/dashboard/integrations"
                    className="mt-3 inline-flex w-fit items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground/25"
                  >
                    Manage
                  </Link>
                ) : (
                  <a
                    href={connectHref(agentId, a.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Connect <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Where it answers you: no OAuth exists, so these hand off ─────────────────────── */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Where your agent answers you</h3>
          <Link href="/dashboard/channels" className="text-xs text-muted-foreground hover:text-foreground">
            All channels →
          </Link>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick one so you can talk to it without opening this dashboard. Each opens its setup
          steps here — no OAuth exists for these, so they need a bot token from the app&apos;s own
          console.
        </p>

        {/* The Channels page's own cards, not a copy of them: full width, one open at a time,
            expanding onto the numbered steps and the form that finishes the job. A copy would be
            a second thing to keep in step with config/channels.ts, and the first time the two
            disagreed the customer would be the one to find out. */}
        <div className="mt-3">
          <ChannelsPanel agentId={agentId} showHeading={false} />
        </div>
      </div>
    </div>
  );
}
