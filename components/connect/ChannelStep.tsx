"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLogo, Page } from "@/components/connect/ui";
import { BotFatherHelp, CopyableValue, FinishLinking, WebhookUrl } from "@/components/channels/pieces";
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
  eyebrow,
  onDone,
}: {
  agentId: string;
  agentName?: string | null;
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

  // ── The chooser ─────────────────────────────────────────────────────────────────────────────
  if (!def) {
    return (
      <Page eyebrow={eyebrow} title="Where do you want to reach me?">
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          You can always talk to me right here in the dashboard. This is for the other times: a
          message from your phone on the way somewhere, without opening any of this.
        </p>

        <div className="mt-10 space-y-3">
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
                    {/* Only on the one that is genuinely easiest to finish. A recommendation on
                        more than one is not a recommendation. */}
                    {d.recommended && !live && (
                      <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Easiest
                      </span>
                    )}
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
            personal one in somebody's pocket is not eligible. Learning that on step two of seven,
            inside Meta's developer console, is the worst possible place to learn it. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Each of these takes about five minutes and happens mostly in that app, not here.
          WhatsApp also needs a phone number that is not already on WhatsApp.
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
          {/* Slack and Meta have no API for "deliver to this URL" - the customer pastes it
              themselves, and hiding it once the credentials land would strand the setup
              half-done. */}
          {def.showWebhookUrl && <WebhookUrl agentId={agentId} channel={def.id} />}
          {/* WhatsApp's other half. Meta's webhook form asks for the Callback URL AND a verify
              token, and echoes the token back to us on save to prove the endpoint is ours.
              Without this on screen the WhatsApp setup simply cannot be completed from this
              flow - it was missing the whole time the chooser did not offer WhatsApp, which is
              exactly the kind of hole that opens when a screen is built for two of three cases.
              The Channels page has always shown it (components/ChannelsView.tsx). */}
          {row?.verifyToken && <CopyableValue label="Verify token" value={row.verifyToken} />}
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
  const canSubmit = def.fields.every((f) => (values[f.key] ?? "").trim().length > 0);

  return (
    <Page eyebrow={eyebrow} title={`Set up ${def.name}`}>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{def.tagline}. Follow these
        in {def.name}, then bring the last bit back here.</p>

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
