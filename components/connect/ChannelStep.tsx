"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AgentFace } from "@/components/AgentFace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLogo, Page } from "@/components/connect/ui";
import {
  APOLLO_CLAW_ANDROID_STEPS,
  APOLLO_CLAW_IPHONE_STEPS,
  BotFatherHelp,
  FinishLinking,
  ManualDelivery,
  SlackManifestHelp,
  WebhookUrl,
} from "@/components/channels/pieces";
import { channelDef, type ChannelDef } from "@/config/channels";
import { FLOW_CHANNELS } from "@/config/connect-flow";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Channel, ChannelId, ChannelsResult } from "@/lib/types";

// The last screen of the guided connect flow: where you want to reach the agent.
//
// See the note in config/connect-flow.ts for why this is last and why it offers two channels
// rather than three. In short: the app steps are a click each, this is a five-minute errand in
// somebody else's app, and there is already a chat in this dashboard - so it is the one step
// that is genuinely additive, and it goes where skipping it costs nothing.
//
// EVERYTHING IT ASKS FOR COMES FROM config/channels.ts. The numbered instructions, the field
// labels, the placeholders and the "what happens once it is on" note are the same strings the
// Channels page renders, read from the same table, and the credential goes to the same route.
// This is a second VIEW of channel setup, never a second copy of it.
//
// THE STEP AFTER THE STEP. A validated credential is not a working channel: each one answers
// exactly one person, and that person is whoever messages it first. So "connected" is not the
// end state here - `linked` is - and the screen keeps polling until somebody has actually said
// hello to the bot.

const POLL_MS = 4000;

/** The channels this screen offers, resolved once. A slug that is not in CHANNELS is a
 *  programming error rather than a runtime state, so it throws at import like the toolkit slugs
 *  in config/connect-flow.ts do. */
const OFFERED: ChannelDef[] = FLOW_CHANNELS.map((id) => {
  const def = channelDef(id);
  if (!def) throw new Error(`connect flow: no channel definition for "${id}"`);
  return def;
});

export function ChannelStep({
  agentId,
  agentName,
  agentAvatarUrl,
  eyebrow,
  onDone,
}: {
  agentId: string;
  agentName?: string | null;
  /** The picture beside "How should we communicate?" - this is the one screen in the flow
   *  asking about the agent rather than speaking as it, so its own face belongs on it. */
  agentAvatarUrl?: string | null;
  eyebrow: React.ReactNode;
  /** Move to the closing screen, naming the channel that ended up live so it can be read back
   *  there. Null when they skipped, or connected one but never claimed it. */
  onDone: (linkedChannel: string | null) => void;
}) {
  const [rows, setRows] = useState<Channel[] | null>(null);
  const [choice, setChoice] = useState<ChannelId | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A fourth tile on the chooser, but not a channel: no credential, no webhook, nothing this
  // page's polling can ever see happen. Kept entirely local rather than added to CHANNELS/
  // ChannelId - those exist because a channel needs a row in agent_channels and a receiver
  // route, and a home-screen icon needs neither. It is a faster door to the SAME dashboard chat,
  // not a new inbox, which is also why it skips the "connected"/"linked" states below.
  const [showInstall, setShowInstall] = useState(false);

  const load = useCallback(async (): Promise<Channel[]> => {
    const res = await apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`);
    setRows(res.channels);
    return res.channels;
  }, [agentId]);

  // One load on mount. Somebody who already set a channel up - on the Channels page, or on an
  // earlier run through this flow - lands on that channel's state rather than on the chooser.
  //
  // Fetched inline rather than through load(), so every setState lands in a promise callback and
  // none in the effect body. Same shape as ConnectFlow's own mount effect, and the same reason:
  // the react-hooks rule reads a call to a setState-ing helper as a setState in the effect.
  useEffect(() => {
    let cancelled = false;
    apiFetch<ChannelsResult>(`/api/agents/${agentId}/channels`)
      .then((res) => {
        if (cancelled) return;
        setRows(res.channels);
        const live = OFFERED.find(
          (d) => res.channels.find((c) => c.channel === d.id)?.state === "connected"
        );
        if (live) setChoice(live.id);
      })
      .catch(() => {
        // A failed read is not a reason to hide the step: the chooser and the setup form below it
        // work regardless, and the POST is what actually reports a problem.
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const def = choice ? OFFERED.find((d) => d.id === choice) ?? null : null;
  const row = def ? rows?.find((c) => c.channel === def.id) ?? null : null;
  const connected = row?.state === "connected";
  const linked = connected && !!row?.linked;

  // Poll only between the credential landing and somebody messaging the bot.
  //
  // That second half happens somewhere this page cannot see - in Telegram, probably on a phone -
  // so without the poll the screen sits on "one step left" after the step is done, and the
  // obvious reading of that is that it did not work.
  useEffect(() => {
    if (!connected || linked) return;
    const t = setInterval(() => {
      void load().catch(() => {
        // Transient. The next tick tries again.
      });
    }, POLL_MS);
    return () => clearInterval(t);
  }, [connected, linked, load]);

  const connect = () => {
    if (!def) return;
    setBusy(true);
    setError(null);
    apiFetch<Channel>(`/api/agents/${agentId}/channels/${def.id}`, {
      method: "POST",
      body: JSON.stringify({ credentials: values }),
    })
      .then(() => {
        // Credentials never stay in the DOM longer than the request that used them.
        setValues({});
        return load();
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  };

  // ── Apollo Claw: a home-screen icon, not a channel ──────────────────────────────────────────
  if (showInstall) {
    return (
      <Page eyebrow={eyebrow} title="Add Apollo Claw to your home screen">
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          This puts an icon on your phone that opens straight to me, full-screen, no browser bar
          around it. Same dashboard, one tap closer.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <p className="text-sm font-semibold text-foreground">On iPhone, in Safari</p>
            <ol className="mt-3 space-y-3 border-y py-6">
              {APOLLO_CLAW_IPHONE_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="w-5 shrink-0 font-medium tabular-nums text-foreground">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">On Android, in Chrome</p>
            <ol className="mt-3 space-y-3 border-y py-6">
              {APOLLO_CLAW_ANDROID_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="w-5 shrink-0 font-medium tabular-nums text-foreground">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Button onClick={() => onDone("Apollo Claw")} className="mt-2 h-14 w-full rounded-2xl text-base">
          Done
          <ArrowRight className="size-4" />
        </Button>

        <div className="mt-10 flex flex-col items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setShowInstall(false)}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            Pick a different one
          </button>
        </div>
      </Page>
    );
  }

  // ── The chooser ─────────────────────────────────────────────────────────────────────────────
  if (!def) {
    return (
      <Page
        eyebrow={eyebrow}
        title="How should we communicate?"
        titleIcon={<AgentFace src={agentAvatarUrl} name={agentName} className="size-12 text-lg" />}
      >
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          You can always talk to me right here in the dashboard. This is for the other times: a
          message from your phone on the way somewhere, without opening any of this.
        </p>

        <div className="mt-10 space-y-3">
          {/* Not one of OFFERED - see `showInstall` above for why. Same tile shape so it reads
              as one more way in rather than a different kind of thing bolted onto the list.
              First, David's call: it costs a tap rather than a trip into another app, so it is
              the option most people should actually take. */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowInstall(true);
            }}
            className="flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors hover:border-foreground/20 hover:bg-secondary/30"
          >
            <AppLogo logo="/icon-192.png" name="Apollo Claw" size="lg" />
            <span className="min-w-0 flex-1">
              <span className="text-lg font-semibold">Apollo Claw</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">A shortcut on your phone, opens like an app</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </button>

          {OFFERED.map((d) => {
            const live = rows?.find((c) => c.channel === d.id)?.state === "connected";
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setError(null);
                  setChoice(d.id);
                }}
                className="flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors hover:border-foreground/20 hover:bg-secondary/30"
              >
                <AppLogo logo={d.logo} name={d.name} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">{d.name}</span>
                    {live && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <Check className="size-3.5" />
                        Connected
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{d.tagline}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* SAYS HOW LONG IT TAKES, where the app steps did not need to. Those were a click; this
            is a trip into another app, and finding that out halfway through is worse than being
            told.

            WhatsApp gets its own sentence because its cost is not time, it is a phone number:
            Meta will not put a business line on a number that is already on WhatsApp, so the
            personal one in somebody's pocket is not eligible. Learning that on step two of five,
            inside Meta's developer console, is the worst possible place to learn it.

            Named rather than "the first three" - Apollo Claw sits first in the list now and is
            neither a trip into another app nor five minutes, so position no longer says which
            three this sentence means. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Telegram, Slack and WhatsApp take about five minutes each and happen mostly in that
          app, not here. WhatsApp also needs a phone number that is not already on WhatsApp.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => onDone(null)}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            Just the dashboard for now
          </button>
        </div>
      </Page>
    );
  }

  // ── Linked: the whole thing is done ─────────────────────────────────────────────────────────
  if (linked) {
    return (
      <Page eyebrow={eyebrow} title={`${def.name} is yours`}>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{def.connectedNote}</p>
        <Button onClick={() => onDone(def.name)} className="mt-10 h-14 w-full rounded-2xl text-base">
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </Page>
    );
  }

  // ── Connected, waiting to be claimed ────────────────────────────────────────────────────────
  if (connected) {
    return (
      <Page eyebrow={eyebrow} title="Now say hello to it">
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          The credential works. {def.name} binds to whoever writes to it first, so send it one
          message and it is yours for good.
        </p>

        <div className="mt-10 space-y-4">
          <FinishLinking def={def} account={row?.account ?? null} />
          {/* Slack has no API for "deliver to this URL" - the customer pastes it themselves, and
              hiding it once the credentials land would strand the setup half-done. WhatsApp used
              to be in the same position and no longer is: connecting registers its callback with
              Meta, so reaching this screen on WhatsApp means delivery is already on. If it
              wasn't, the row would read "error" and this screen would not be the one showing. */}
          {def.showWebhookUrl && <WebhookUrl agentId={agentId} channel={def.id} />}
          <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Loader2 className="size-4 shrink-0 animate-spin" />
            Watching for your first message. This page notices by itself.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-sm">
          {/* NOT auto-advanced when the message lands, unlike the OAuth steps above.
              This is the last screen of the flow, and the person's attention is provably in
              another app - ending the whole thing while they are looking at their phone means
              they never see that the thing they just did worked. */}
          <button type="button" onClick={() => onDone(null)} className="text-muted-foreground/60 hover:text-foreground">
            I&apos;ll do that later
          </button>
        </div>
      </Page>
    );
  }

  // ── The setup itself ────────────────────────────────────────────────────────────────────────
  // An optional field left blank does not hold the button down - WhatsApp's Phone Number ID is
  // worked out from the token, and asked for by name only when it cannot be.
  const canSubmit = def.fields.every(
    (f) => f.optional || (values[f.key] ?? "").trim().length > 0
  );

  // A credential that was accepted, on a channel that still is not delivering. Only WhatsApp
  // reaches this: the automatic half failed and the row carries Meta's own reason for it.
  const needsManual = row?.state === "error" && !!row.verifyToken;

  return (
    <Page eyebrow={eyebrow} title={`Set up ${def.name}`}>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{def.tagline}. Follow these
        in {def.name}, then bring the last bit back here.</p>

      {/* Before the steps, because the steps are not the next action from here: the credential
          already worked, and what is left is two values to paste. */}
      {needsManual && (
        <div className="mt-8 space-y-4">
          <p className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {row.message}
          </p>
          <ManualDelivery agentId={agentId} channel={def.id} verifyToken={row.verifyToken!} />
        </div>
      )}

      <ol className="mt-8 space-y-3 border-y py-6">
        {def.steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="w-5 shrink-0 font-medium tabular-nums text-foreground">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-4">
        {def.id === "telegram" && <BotFatherHelp agentName={agentName} seed={agentId} />}
        {def.id === "slack" && <SlackManifestHelp agentId={agentId} agentName={agentName} />}
        {def.showWebhookUrl && <WebhookUrl agentId={agentId} channel={def.id} />}

        <div className="space-y-2">
          {def.fields.map((f) => (
            <Input
              key={f.key}
              // Credentials, so: never autofilled, never spellchecked, never in a password
              // manager's way. type=password would hide a token the customer is trying to check
              // they pasted correctly, which is the more common need here.
              type="text"
              autoComplete="off"
              spellCheck={false}
              aria-label={f.label}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="h-12"
            />
          ))}
        </div>

        {error && (
          <p className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {error}
          </p>
        )}

        <Button
          onClick={connect}
          disabled={busy || !canSubmit}
          className={cn("h-14 w-full rounded-2xl text-base")}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Connect {def.name}
        </Button>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => onDone(null)}
          className="text-muted-foreground/60 hover:text-foreground"
        >
          Skip and finish
        </button>
        <button
          type="button"
          onClick={() => {
            setChoice(null);
            setValues({});
            setError(null);
          }}
          className="text-muted-foreground/60 hover:text-foreground"
        >
          Pick a different one
        </button>
      </div>
    </Page>
  );
}
