"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Loader2 } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { AgentFace } from "@/components/AgentFace";
import { Button } from "@/components/ui/button";
import { getAgentType } from "@/config/agent-types";
import {
  MAIL_SLUG,
  VENDORS,
  VENDOR_LIST,
  type ConnectStep,
  type Vendor,
  type VendorGuess,
  type VendorId,
} from "@/config/connect-flow";
import { ChannelStep } from "@/components/connect/ChannelStep";
import { AppLogo, joinPhrases, Page, StepDots } from "@/components/connect/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { IntegrationConnection, IntegrationConnectionsResult } from "@/lib/types";

// The guided connect flow, asked one question at a time.
//
// Where a new owner goes straight from the build screen. The rules about WHICH apps and in what
// order live in config/connect-flow.ts; this file is the asking.
//
// THE SHAPE, and why it is this shape:
//
//   1. One decision, at the top. "Where is your email" is the only question, because the answer
//      settles the calendar and the files too. Everything after it is a button.
//   2. The answer is pre-selected from what we already know - the questionnaire, the tech stack
//      they ticked, the address on their account - with the reason printed underneath. Never
//      auto-advanced on: a wrong guess acted on silently connects the wrong account.
//   3. Nothing blocks. Every step skips, and skipping says so plainly rather than scolding.
//   4. The OAuth consent screen opens in a new tab, so this one survives it. While that tab is
//      open this page polls, and the moment the connection lands it moves itself on. Coming back
//      to a page that has already advanced is the whole feeling the flow is built around.

const POLL_MS = 2000;
// ~50s. Long enough for a consent screen with an account picker and a 2FA prompt in it, short
// enough that an abandoned tab stops spinning at somebody.
const POLL_MAX = 25;

function isLive(c: IntegrationConnection): boolean {
  return (c.status || "").toUpperCase() === "ACTIVE" && !c.isDisabled;
}

function slugSet(connections: IntegrationConnection[]): Set<string> {
  return new Set(
    connections
      .filter(isLive)
      .map((c) => (c.toolkitSlug || "").toLowerCase())
      .filter(Boolean)
  );
}

function connectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}

/** The first step of `vendor` that is not already connected, or steps.length when they all are. */
function firstOpenStep(vendor: VendorId, connected: Set<string>): number {
  const steps = VENDORS[vendor].steps;
  const i = steps.findIndex((s) => !connected.has(s.slug.toLowerCase()));
  return i === -1 ? steps.length : i;
}

export function ConnectFlow() {
  const { userFirstName } = useWorkspace();
  const { active, loading: agentLoading } = useActiveAgent();
  const agentId = active?.agent37_id ?? null;

  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [guess, setGuess] = useState<VendorGuess>({ vendor: null, reason: null });
  const [vendor, setVendor] = useState<VendorId | null>(null);
  const [index, setIndex] = useState(0);
  /** Set while a consent tab is open for this slug: it is what turns the polling on. */
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  /** The channel that ended up live, named, so the closing screen can read it back. Set by the
   *  channel step when it hands over; null means skipped or never claimed. */
  const [channelLive, setChannelLive] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<Set<string>> => {
    const res = await apiFetch<IntegrationConnectionsResult>(
      `/api/agents/${agentId}/integrations/connections`
    );
    const set = slugSet(res.connections);
    setConnected(set);
    return set;
  }, [agentId]);

  // One load on mount: what is already connected, and which suite they probably run on. Both
  // setStates land in the promise callback, so the effect body itself sets nothing.
  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;
    Promise.all([
      apiFetch<IntegrationConnectionsResult>(`/api/agents/${agentId}/integrations/connections`),
      apiFetch<VendorGuess>(`/api/agents/${agentId}/connect-plan`).catch(
        // A missing guess costs a pre-selected button, not the flow. Ask cold instead.
        () => ({ vendor: null, reason: null }) as VendorGuess
      ),
    ])
      .then(([conns, plan]) => {
        if (cancelled) return;
        const set = slugSet(conns.connections);
        setConnected(set);
        setGuess(plan);
        // A live mail connection is not a guess, it is the answer. Somebody returning to this
        // page mid-way picks up where they stopped rather than being asked again.
        const known = (Object.keys(MAIL_SLUG) as VendorId[]).find((v) => set.has(MAIL_SLUG[v]));
        // Assigned unconditionally, INCLUDING the null case, because this effect re-runs whenever
        // the agent changes - which is what switching workspace from the rail does. Setting these
        // only when `known` was found left the previous agent's vendor and step index in place, so
        // the new agent inherited a half-finished flow and never got asked the one question.
        setVendor(known ?? null);
        setIndex(known ? firstOpenStep(known, set) : 0);
        setWaitingFor(null);
        setTimedOut(false);
        setChannelLive(null);
      })
      .catch(() => {
        // Connections failing to load is not a reason to hide the flow - the connect links still
        // work, and the poll below will pick the state up.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const steps: ConnectStep[] = vendor ? VENDORS[vendor].steps : [];
  const step: ConnectStep | undefined = steps[index];
  const stepSlug = step?.slug.toLowerCase() ?? null;
  const stepDone = stepSlug ? connected.has(stepSlug) : false;

  // Watch for the consent tab finishing.
  //
  // Two signals, because neither is enough on its own. Returning to this tab fires `focus` and is
  // instant, but somebody who completes the grant and leaves the other tab open never fires it;
  // the poll covers that, and only runs while a tab is actually open.
  //
  // The advance is gated on `waitingFor` deliberately. Without it, a step whose app is ALREADY
  // connected would skip past itself before it had been on screen - which is exactly the case for
  // the Microsoft calendar step, whose whole job is to say the Outlook grant already covered it.
  useEffect(() => {
    if (!agentId || !stepSlug) return;
    const watching = waitingFor === stepSlug;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const check = () => {
      refresh()
        .then((set) => {
          if (cancelled) return;
          if (watching && set.has(stepSlug)) {
            setWaitingFor(null);
            setTimedOut(false);
            setIndex((i) => i + 1);
          }
        })
        .catch(() => {
          // Transient. The next tick or the next focus tries again.
        });
    };

    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    if (watching) {
      timer = setInterval(() => {
        attempts += 1;
        check();
        if (attempts >= POLL_MAX && !cancelled) {
          setWaitingFor(null);
          setTimedOut(true);
        }
      }, POLL_MS);
    }
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (timer) clearInterval(timer);
    };
  }, [agentId, stepSlug, waitingFor, refresh]);

  const agentName = useMemo(() => {
    if (!active) return "your agent";
    const type = active.agent_type ? getAgentType(active.agent_type) : undefined;
    return active.name?.trim() || type?.label || "your agent";
  }, [active]);

  const spinner = (
    <div className="mx-auto flex max-w-xl items-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Loading...
    </div>
  );

  if (agentLoading) return spinner;

  // ORDER MATTERS HERE. The no-agent case has to be checked before `ready`, because `ready` is
  // set by an effect that returns early when there is no agent id - so a workspace with no agent
  // would sit on the spinner forever if this came second.
  //
  // Home already handles this case properly, so send them there rather than growing a second
  // empty state that has to be kept in step with it.
  if (!active || !agentId) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          There is no agent in this workspace yet. Once one is built you can connect your email and
          calendar to it here.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/start-here">Go to my dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!ready) return spinner;

  // A step that says it is already covered, when the connection covering it was skipped, is
  // describing something that never happened. Microsoft's calendar step is the only one of these,
  // and it carries its own copy for the case.
  const uncovered = step?.coveredByPrevious && !stepDone ? step.whenNotCovered : undefined;
  const heading = uncovered?.heading ?? step?.heading;
  const blurb = uncovered?.blurb ?? step?.blurb;

  // The agent, named, above the headline. Small on purpose: on Home its face is the size of the
  // greeting because the greeting IS the agent introducing itself, but here the headline is a
  // question and the face is the byline on it.
  const speaker = (
    <div className="flex items-center gap-2.5">
      <AgentFace src={active.avatar_url} name={agentName} className="size-7 text-xs" />
      <span className="text-sm font-medium text-muted-foreground">{agentName}</span>
    </div>
  );

  // ── The one question ────────────────────────────────────────────────────────────────────────
  if (!vendor) {
    return (
      <Page eyebrow={speaker} title="Let's connect your email">
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {userFirstName ? `${userFirstName}, before ` : "Before "}I can be much use I need to see
          what you see. Your email is the biggest piece of that, and your answer sorts out your
          calendar and your files at the same time. You can disconnect any of it at any time.
        </p>

        <div className="mt-10 space-y-3">
          {VENDOR_LIST.map((v) => (
            <VendorChoice
              key={v.id}
              vendor={v}
              suggested={guess.vendor === v.id}
              reason={guess.vendor === v.id ? guess.reason : null}
              onPick={() => {
                setVendor(v.id);
                setIndex(firstOpenStep(v.id, connected));
                // Both cleared, or a timeout from the vendor they just backed out of shows up as
                // an amber warning over the first step of the one they picked instead.
                setWaitingFor(null);
                setTimedOut(false);
              }}
            />
          ))}
        </div>

        {/* Centered and low contrast, the way the reference handles "Skip for now": present, and
            plainly not the thing you came here to press. */}
        <div className="mt-10 flex flex-col items-center gap-3 text-sm">
          <Link
            href="/dashboard/integrations"
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            I use something else
          </Link>
          <Link href="/dashboard/start-here" className="text-muted-foreground/60 hover:text-foreground">
            Skip for now
          </Link>
        </div>
      </Page>
    );
  }

  // ── Where you want to reach it ──────────────────────────────────────────────────────────────
  //
  // One past the last app step. The apps are what the agent can reach; this is where it answers,
  // and it is last because it is the only step here that costs more than a click. The reasoning
  // is written out in config/connect-flow.ts next to FLOW_CHANNELS.
  if (!step && index === steps.length) {
    return (
      <ChannelStep
        agentId={agentId}
        agentName={active.name}
        agentAvatarUrl={active.avatar_url}
        eyebrow={<StepDots total={steps.length + 1} current={index} />}
        onDone={(linkedChannel) => {
          setChannelLive(linkedChannel);
          setIndex((i) => i + 1);
        }}
      />
    );
  }

  // ── Closing screen ──────────────────────────────────────────────────────────────────────────
  if (!step) {
    const live = steps.filter((s) => connected.has(s.slug.toLowerCase()));
    const missed = steps.filter((s) => !connected.has(s.slug.toLowerCase()) && !s.coveredByPrevious);
    // De-duplicated because Outlook satisfies two steps and should be read back once.
    const can = Array.from(new Set(live.map((s) => s.gained)));

    return (
      <Page
        eyebrow={speaker}
        // Not "You're all set" unconditionally: somebody who skipped every step would be told they
        // were finished with nothing connected, which is the one thing this page exists to prevent
        // being believed.
        // A live channel counts: somebody who skipped every app but claimed a Telegram bot has
        // set something up, and "Nothing connected yet" would be telling them otherwise.
        title={can.length > 0 || channelLive ? "You're all set" : "Nothing connected yet"}
      >
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {can.length > 0 ? (
            <>
              That is the part that matters. I can work in {joinPhrases(can)} now, so ask me for
              something real rather than something to try.
            </>
          ) : (
            <>
              No harm done, and nothing is broken. I can still think out loud with you, I just
              can&apos;t act in your inbox or calendar until one of these is in.
            </>
          )}
          {/* Said as a second sentence rather than folded into the list above, because it is a
              different fact: that list is what I can reach, this is where you can find me. */}
          {channelLive && (
            <span className="block pt-3">
              And you can reach me in {channelLive} now, without opening any of this.
            </span>
          )}
        </p>

        {/* Divided rows rather than bordered cards: three boxes stacked in a column was most of
            the chrome this screen used to carry. */}
        <ul className="mt-10 divide-y border-y">
          {steps
            .filter((s) => !s.coveredByPrevious)
            .map((s) => (
              <li key={s.key} className="flex items-center gap-3 py-4">
                <AppLogo logo={s.logo} name={s.appName} />
                <span className="flex-1 font-medium">{s.appName}</span>
                {connected.has(s.slug.toLowerCase()) ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <Check className="size-4" />
                    Connected
                  </span>
                ) : (
                  <a
                    href={connectHref(agentId, s.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
                  >
                    Connect
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
        </ul>

        {missed.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            You skipped {joinPhrases(missed.map((s) => s.appName))}. Nothing is lost, it is one
            click from Connections whenever you want it.
          </p>
        )}

        <Button asChild className="mt-10 h-14 w-full rounded-2xl text-base">
          <Link href="/dashboard/chat">
            Start a conversation
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm">
          <Link href="/dashboard/start-here" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Go to my dashboard
          </Link>
          <Link href="/dashboard/integrations" className="text-muted-foreground/60 hover:text-foreground">
            Browse all apps
          </Link>
        </div>
      </Page>
    );
  }

  // ── One step ────────────────────────────────────────────────────────────────────────────────
  const waiting = waitingFor === stepSlug;
  const advance = () => {
    setTimedOut(false);
    setIndex((i) => i + 1);
  };

  return (
    <Page eyebrow={<StepDots total={steps.length + 1} current={index} />} title={heading!}>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        {blurb}
        {step.optional && (
          <span className="block pt-2 text-base">Optional, and worth the thirty seconds.</span>
        )}
      </p>

      <div className="mt-10">
        {stepDone ? (
          <div className="flex flex-col items-stretch gap-4">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" />
              {step.coveredByPrevious
                ? `Covered by your ${step.appName} connection`
                : `${step.appName} is connected`}
            </p>
            <Button onClick={advance} className="h-14 w-full rounded-2xl text-base">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : waiting ? (
          <div className="flex flex-col items-stretch gap-4">
            <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              Waiting for {step.appName}. This page moves on by itself.
            </p>
            <Button
              variant="outline"
              onClick={() => void refresh()}
              className="h-14 w-full rounded-2xl text-base"
            >
              I finished in the other tab
            </Button>
            <button
              type="button"
              onClick={() => setWaitingFor(null)}
              className="text-sm text-muted-foreground/60 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* The one button, full width, with the app's own logo in it - the shape the reference
                uses for "Connect Google", and the reason that screen reads as a single decision. */}
            <Button
              asChild
              variant="outline"
              className="h-16 w-full rounded-2xl text-base font-semibold"
            >
              <a
                href={connectHref(agentId, step.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimedOut(false);
                  setWaitingFor(stepSlug);
                }}
              >
                <AppLogo logo={step.logo} name={step.appName} size="lg" />
                Connect {step.appName}
              </a>
            </Button>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Opens in a new tab so you can approve it. Come straight back here.
            </p>
          </>
        )}

        {timedOut && !stepDone && (
          <p className="mt-5 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            We stopped watching for that one. If you did approve it, press &ldquo;I finished in the
            other tab&rdquo; after trying again. If you closed it, no harm done.
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-sm">
        {!stepDone && (
          <button
            type="button"
            // Nothing recorded. What was skipped is simply what is not connected at the end, which
            // stays true if they go and connect it from somewhere else in the meantime.
            onClick={() => {
              setWaitingFor(null);
              advance();
            }}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            Skip for now
          </button>
        )}
        {index === 0 && (
          <button
            type="button"
            onClick={() => setVendor(null)}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            I picked the wrong one
          </button>
        )}
      </div>
    </Page>
  );
}

/** One of the two suite buttons. The suggestion changes the border and adds a line of reasoning;
 *  it never changes which buttons work, because the guess is a guess. */
function VendorChoice({
  vendor,
  suggested,
  reason,
  onPick,
}: {
  vendor: Vendor;
  suggested: boolean;
  reason: string | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors",
        suggested ? "border-foreground/40 bg-secondary/40" : "hover:border-foreground/20 hover:bg-secondary/30"
      )}
    >
      <AppLogo logo={vendor.logo} name={vendor.label} size="lg" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{vendor.label}</span>
          {suggested && (
            <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Probably you
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{vendor.examples}</span>
        {reason && <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{reason}</span>}
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
