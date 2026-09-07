"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Loader2, MessageCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CHANNELS, isChannelId, type ChannelDef } from "@/config/channels";
import type { Channel, ChannelId, ChannelsResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { SchedulePanel } from "@/components/SchedulePanel";
import { HelpFooter } from "@/components/HelpFooter";

// Channels — where the agent can be talked to.
//
// The distinction this page exists to make: Connections is what the agent can REACH (your mail,
// your files), and this is where it ANSWERS you. They were one screen and it read as one
// undifferentiated pile of apps, so the four chat apps moved here and Connections kept the
// tools.
//
// Every channel here is the customer's OWN account or bot. That is the whole security model and
// the copy says so on every card, because "did I just publish my assistant to my Slack" is the
// first question anyone sensible asks.

export function ChannelsView() {
  const { active, loading, error, refresh } = useActiveAgent();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!active && error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
        </p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <MessageCircle className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You don&apos;t have an agent yet. Create one and you can reach it from your own chat apps.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/settings/agent">Go to My Agent</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.live_status !== "running" && (
        <p className="max-w-4xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {active.name || "This agent"} isn&apos;t running right now ({active.live_status ?? "unknown"}).
          You can set channels up here, but nothing will answer until it&apos;s started from
          Settings → My Agent.
        </p>
      )}
      <ChannelsPanel key={active.agent37_id} agentId={active.agent37_id} agentName={active.name} />
      {/* Below the channels, because it depends on them: a scheduled brief is delivered through
          whichever chat app is connected above. */}
      <SchedulePanel key={`sched-${active.agent37_id}`} agentId={active.agent37_id} />
      <HelpFooter className="max-w-4xl" />
    </div>
  );
}

// Exported so Start Here can show the real cards rather than a second set that looks like them.
// `showHeading` is the only thing that differs there: the page has its own heading, and a second
// <h1> inside somebody else's section is both wrong to read and wrong to hear.
export function ChannelsPanel({
  agentId,
  agentName,
  showHeading = true,
}: {
  agentId: string;
  /** Only used to suggest a Telegram bot username. Optional, so call sites without it still work. */
  agentName?: string | null;
  showHeading?: boolean;
}) {
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // One card open at a time. All four expanded is four sets of developer-console instructions
  // stacked up, and the one you want is whichever you clicked.
  //
  // ?open=telegram arrives from the shelves on Start Here, so a tile there lands on the setup
  // steps rather than on a page of four collapsed cards to hunt through. Read through
  // useSyncExternalStore rather than useSearchParams (which would make this page dynamic) and
  // rather than an effect (which would be a state write on mount); a click then overrides it, and
  // closing that card is an override to null rather than a fall back to the URL.
  const linked = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("open"),
    () => null
  );
  const [override, setOverride] = useState<{ id: ChannelId | null } | null>(null);
  const openId = override
    ? override.id
    : linked && isChannelId(linked)
      ? linked
      : null;
  const setOpenId = (next: (current: ChannelId | null) => ChannelId | null) =>
    setOverride({ id: next(openId) });

  // Every setState lands in a promise callback rather than the effect body, the same way the
  // Connections tab loads its endpoint.
  const load = useCallback(
    () => {
      apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
        .then((res) => setChannels(res.channels))
        .catch((e) => {
          // A first load that fails leaves the cards in their disconnected state rather than an
          // empty screen — every card is still a valid thing to set up.
          setChannels((prev) => prev ?? []);
          toast.error((e as Error).message);
        })
        .finally(() => setRefreshing(false));
    },
    [agentId]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Poll only while a connected channel is still waiting for its first message.
  //
  // That state ends elsewhere: the customer taps through to Telegram, sends a message, and the
  // webhook binds the owner server-side. Nothing tells this page. Without a poll the card sits on
  // "One step left" after the step is done, and the obvious reading of that is that it did not
  // work - which sends somebody back round a setup that is already finished.
  //
  // Narrow on purpose: it runs only while something is genuinely pending, and stops the moment
  // every connected channel is linked. A dashboard tab that polls forever is a cost with no
  // reader.
  const awaitingLink = (channels ?? []).some((c) => c.state === "connected" && !c.linked);
  useEffect(() => {
    if (!awaitingLink) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [awaitingLink, load]);

  const byId = useMemo(() => {
    const map = new Map<ChannelId, Channel>();
    for (const c of channels ?? []) map.set(c.channel, c);
    return map;
  }, [channels]);

  return (
    <div className={cn("space-y-6", showHeading && "max-w-4xl")}>
      {showHeading && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Chat anywhere</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect a chat app you already use, and your agent answers there - to you and
                nobody else.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              load();
            }}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {CHANNELS.map((def) => {
          const channel = byId.get(def.id) ?? null;
          return (
            <ChannelCard
              key={def.id}
              agentId={agentId}
              agentName={agentName}
              def={def}
              channel={channel}
              loaded={channels !== null}
              onChanged={load}
              open={openId === def.id}
              onToggle={() => setOpenId((current) => (current === def.id ? null : def.id))}
            />
          );
        })}
      </div>
    </div>
  );
}

function ChannelCard({
  agentId,
  agentName,
  def,
  channel,
  loaded,
  onChanged,
  open,
  onToggle,
}: {
  agentId: string;
  agentName?: string | null;
  def: ChannelDef;
  channel: Channel | null;
  loaded: boolean;
  onChanged: () => void;
  open: boolean;
  onToggle: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const state = channel?.state ?? "disconnected";
  const connected = state === "connected";

  const connect = () => {
    setBusy(true);
    apiFetch<Channel>(`/api/agents/${agentId}/channels/${def.id}`, {
      method: "POST",
      body: JSON.stringify({ credentials: values }),
    })
      .then((res) => {
        // Credentials never stay in the DOM longer than the request that used them.
        setValues({});
        if (res.state === "connected") toast.success(`${def.name} connected.`);
        onChanged();
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/agents/${agentId}/channels/${def.id}`, { method: "DELETE" });
      toast.success(`${def.name} disconnected.`);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const canSubmit = def.fields.every((f) => (values[f.key] ?? "").trim().length > 0);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      {/* The whole header is the toggle. A chevron alone is a small target for a row this wide. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-muted/40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={def.logo}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-9 w-9 shrink-0 rounded-lg object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{def.name}</h2>
            <StateBadge state={state} loaded={loaded} />
            {/* Only on the one that is genuinely easiest to finish. A recommendation on more
                than one is not a recommendation. */}
            {def.recommended && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Recommended
              </span>
            )}
          </div>
          {/* Collapsed, this line is all anyone sees - so once connected it says who it's
              connected AS, which is the fact worth having at a glance. */}
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {connected && channel?.account ? `Connected as ${channel.account}` : def.tagline}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {!open ? null : connected ? (
        <div className="space-y-3 border-t px-5 pb-5 pt-4">
          {channel?.account && (
            <p className="text-sm">
              <span className="text-muted-foreground">Connected as</span>{" "}
              <span className="font-medium">{channel.account}</span>
            </p>
          )}
          {/* THE STEP EVERYONE MISSED. A channel is bound to its owner by the first message sent
              to it, and until that happens the agent answers nobody - but the card said
              "Connected" from the moment the credential validated, so this looked finished and
              was not. Telegram is the one where we can close the gap ourselves: we know the bot's
              @username from getMe, and t.me/<name> opens that exact chat. One tap instead of
              "now go find your bot". */}
          {!channel?.linked && <FinishLinking def={def} account={channel?.account ?? null} />}
          {def.connectedNote && <p className="text-sm text-muted-foreground">{def.connectedNote}</p>}
          {/* Still shown once connected - for Slack and WhatsApp this is the step AFTER
              connecting, and hiding it the moment the credentials land would strand the setup
              half-done. */}
          {def.showWebhookUrl && <WebhookUrl agentId={agentId} channel={def.id} />}
          {channel?.verifyToken && (
            <CopyableValue label="Verify token" value={channel.verifyToken} />
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={busy}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-3 border-t px-5 pb-5 pt-4">
          {state === "error" && channel?.message && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              {channel.message}
            </p>
          )}

          <ol className="space-y-1 text-sm text-muted-foreground">
            {def.steps.map((step, i) => (
              <li key={step}>
                {i + 1}. {step}
              </li>
            ))}
          </ol>

          {def.id === "telegram" && <BotFatherHelp agentName={agentName} seed={agentId} />}

          {def.showWebhookUrl && <WebhookUrl agentId={agentId} channel={def.id} />}

          <div className="space-y-2">
            {def.fields.map((f) => (
              <Input
                key={f.key}
                // Credentials, so: never autofilled, never spellchecked, never in a password
                // manager's way. type=password would hide a token the customer is trying to
                // check they pasted correctly, which is the more common need here.
                type="text"
                autoComplete="off"
                spellCheck={false}
                aria-label={f.label}
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            ))}
            <Button size="sm" onClick={connect} disabled={busy || !canSubmit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Disconnect ${def.name}?`}
        description={`Your agent will stop answering in ${def.name}, and its credentials are forgotten. You can set it up again at any time.`}
        confirmText="Disconnect"
        destructive
        onConfirm={() => disconnect()}
      />
    </section>
  );
}

// Telegram usernames must be globally unique and end in "bot", so "step 1: create a bot" is in
// practice a guessing game against every name already taken. Somebody non-technical hits three
// rejections from BotFather and concludes the product is broken.
//
// This does not automate it - Telegram has no API for creating a bot, and no way to pre-fill a
// message to BotFather, so the customer really does have to have that conversation. What it does
// is remove the two things they can get wrong: it opens BotFather directly rather than leaving
// them to search a name they might mistype (there are impersonator accounts), and it offers a
// name derived from their own agent, which is far likelier to be free than "assistant_bot".
function BotFatherHelp({ agentName, seed }: { agentName?: string | null; seed: string }) {
  // Telegram's rules: 5-32 characters, letters digits and underscores only, must end in "bot".
  // Suffixed with a short tail because the clean form of any name is usually already taken, and a
  // suggestion that gets rejected is worse than no suggestion.
  //
  // The tail is DERIVED FROM THE AGENT ID, not random. Math.random() here would be impure in
  // render and, worse, would differ between the server and client passes - so the suggestion
  // would visibly change on hydration and again on every re-render, which is no way to treat a
  // value somebody is about to copy. Hashing the agent id gives the same four characters every
  // time for this agent and different ones for the next.
  const suggestion = useMemo(() => {
    const base = (agentName || "apollo").replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || "apollo";
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const tail = h.toString(36).slice(0, 4).padStart(4, "0");
    return `${base}_${tail}_bot`;
  }, [agentName, seed]);

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">
        BotFather asks for a display name (anything you like), then a username that has to be
        unique and end in <span className="font-mono">bot</span>. That second one is where people
        get stuck, so here is one that should be free.
      </p>
      <CopyableValue label="Suggested username" value={suggestion} />
      <a
        href="https://t.me/BotFather"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        Open BotFather in Telegram
      </a>
    </div>
  );
}

// The credential landed; the channel still answers nobody. This is the nudge that closes it.
//
// Every channel binds its owner from the FIRST message sent to it, which means a customer who
// pastes a token and walks away owns a channel that works for no one. The old card called that
// "Connected", so there was nothing on screen to suggest otherwise.
//
// Telegram gets a button rather than a sentence, because it is the one where we hold enough to
// build the link: connectTelegram stores the bot's @username from getMe, and https://t.me/<name>
// opens that exact chat in the app. `?start` makes Telegram show a START button, so it is one tap
// to send the message that binds it. Slack and WhatsApp have no equivalent - the customer has to
// find the app or dial the number themselves - so they get the plain instruction.
//
// Not an error state. Nothing has gone wrong; the setup is simply one step from done, and the
// tone says so.
function FinishLinking({ def, account }: { def: ChannelDef; account: string | null }) {
  const username = def.id === "telegram" && account?.startsWith("@") ? account.slice(1) : null;
  // ?start=setup rather than a bare ?start: the payload is what makes Telegram reliably show
  // the START button instead of an empty chat, and the receiver treats any /start the same way.
  const url = username ? `https://t.me/${username}?start=setup` : null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/40">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">One step left</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
        {url ? (
          <>
            Send {account} a message and it becomes yours. Nobody else who finds the bot gets an
            answer after that.
          </>
        ) : (
          <>
            Message {account ?? `your ${def.name}`} and it becomes yours. Nobody else gets an
            answer after that.
          </>
        )}
      </p>
      {url && (
        <div className="mt-3 space-y-2">
          <Button asChild size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open {account} in Telegram
            </a>
          </Button>
          {/* Telegram is mostly a phone app and this page is mostly opened on a desktop, so the
              button alone strands anyone whose Telegram is not on this machine. A copyable link
              they can send themselves covers it.

              A QR would be nicer and is deliberately not here: every QR service is somebody
              else's server, this repo has no encoder, and img-src does not allow one. Handing a
              third party the bot usernames of paying customers to save one paste is not a trade
              worth making quietly. */}
          <CopyableValue label="Or send yourself this link" value={url} />
        </div>
      )}
    </div>
  );
}

// One labelled value with a copy button. The webhook URL and WhatsApp's verify token are both
// things the customer has to paste into somebody else's console, and getting either subtly wrong
// by hand-retyping is a setup that fails with no explanation.
function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Couldn't copy - select the text and copy it manually."));
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border bg-muted/50 px-3 py-2 text-xs">
          {value || "\u2026"}
        </code>
        <Button variant="outline" size="sm" onClick={copy} disabled={!value}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

// The inbound URL for this agent.
//
// Built from window.location.origin rather than a server value, so it is always the host the
// customer is actually looking at — pasting a production URL into Slack or Meta from a preview
// deploy would send their messages somewhere they didn't expect.
function WebhookUrl({ agentId, channel }: { agentId: string; channel: ChannelId }) {
  // window doesn't exist during the server render, so the origin is read through
  // useSyncExternalStore: empty on the server, real after hydration, and no state written from an
  // effect to get there.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const url = origin ? `${origin}/api/channels/${channel}/${agentId}` : "";
  return <CopyableValue label={channel === "whatsapp" ? "Callback URL" : "Request URL"} value={url} />;
}

function StateBadge({ state, loaded }: { state: Channel["state"]; loaded: boolean }) {
  // Before the first load lands, say nothing rather than "Not connected" — claiming a channel
  // is off when the answer hasn't arrived is the one wrong thing this badge can say.
  if (!loaded) return null;

  if (state === "connected") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Check className="h-3 w-3" />
        Connected
      </Badge>
    );
  }
  if (state === "pending") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Waiting for you to scan
      </Badge>
    );
  }
  if (state === "error") {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 dark:text-amber-300">
        <TriangleAlert className="h-3 w-3" />
        Needs attention
      </Badge>
    );
  }
  return <Badge variant="outline">Not connected</Badge>;
}
