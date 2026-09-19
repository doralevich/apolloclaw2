"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Loader2, SkipForward } from "lucide-react";
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

  const header = (title: string) => (
    <div className="flex items-start gap-4">
      <AgentFace
        src={active.avatar_url}
        name={agentName}
        className="mt-0.5 size-14 shrink-0 text-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{agentName}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{title}</h1>
      </div>
    </div>
  );

  // ── The one question ────────────────────────────────────────────────────────────────────────
  if (!vendor) {
    return (
      <div className="mx-auto max-w-xl space-y-8 py-4">
        {header("Let's connect your email")}
        <p className="text-muted-foreground">
          {userFirstName ? `${userFirstName}, before ` : "Before "}I can be much use I need to see
          what you see. Your email is the first and biggest piece of that, and the answer sorts out
          your calendar and your files at the same time.
        </p>

        <div className="space-y-3">
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

        <div className="space-y-3 border-t pt-5 text-sm">
          <p className="text-muted-foreground">
            Running on something else? Every other mail provider we support is in Connections, and
            you can come back to this any time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/integrations">Browse all apps</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/start-here">Skip for now</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Closing screen ──────────────────────────────────────────────────────────────────────────
  if (!step) {
    const live = steps.filter((s) => connected.has(s.slug.toLowerCase()));
    const missed = steps.filter(
      (s) => !connected.has(s.slug.toLowerCase()) && !s.coveredByPrevious
    );
    // De-duplicated because Outlook satisfies two steps and should be read back once.
    const can = Array.from(new Set(live.map((s) => s.gained)));

    return (
      <div className="mx-auto max-w-xl space-y-8 py-4">
        {/* Not "You're all set" unconditionally: somebody who skipped every step would be told
            they were finished with nothing connected, which is the one thing this page exists to
            prevent being believed. */}
        {header(can.length > 0 ? "You're all set" : "Nothing connected yet")}
        {can.length > 0 ? (
          <p className="text-muted-foreground">
            That is the part that matters. I can work in {joinPhrases(can)} now, so ask me for
            something real rather than something to try.
          </p>
        ) : (
          <p className="text-muted-foreground">
            No harm done, and nothing is broken. I can still think out loud with you, I just
            can&apos;t act in your inbox or calendar until one of these is in.
          </p>
        )}

        <ul className="space-y-2">
          {steps
            .filter((s) => !s.coveredByPrevious)
            .map((s) => (
              <li
                key={s.key}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
              >
                <AppLogo logo={s.logo} name={s.appName} />
                <span className="flex-1 font-medium">{s.appName}</span>
                {connected.has(s.slug.toLowerCase()) ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                    <Check className="size-4" />
                    Connected
                  </span>
                ) : (
                  <a
                    href={connectHref(agentId, s.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-foreground underline underline-offset-4"
                  >
                    Connect
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
        </ul>

        {missed.length > 0 && (
          <p className="text-sm text-muted-foreground">
            You skipped {joinPhrases(missed.map((s) => s.appName))}. Nothing is lost, it is one
            click from Connections whenever you want it.
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t pt-5">
          <Button asChild>
            <Link href="/dashboard/chat">
              Start a conversation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/start-here">Go to my dashboard</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/integrations">Browse all apps</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── One step ────────────────────────────────────────────────────────────────────────────────
  const waiting = waitingFor === stepSlug;
  const advance = () => {
    setTimedOut(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 py-4">
      {header(heading!)}

      <StepDots total={steps.length} current={index} />

      <div className="space-y-5 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <AppLogo logo={step.logo} name={step.appName} size="lg" />
          <div className="min-w-0">
            <p className="text-base font-semibold">{step.appName}</p>
            {step.optional && (
              <p className="text-xs text-muted-foreground">Optional, and a good idea</p>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{blurb}</p>

        {stepDone ? (
          // flex-col rather than space-y: the status line and the button are BOTH inline-flex, so
          // a vertical-margin stack leaves them sharing a line and the button lands on top of the
          // text. Caught in a screenshot; it is invisible in the markup.
          <div className="flex flex-col items-start gap-4">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" />
              {step.coveredByPrevious
                ? `Covered by your ${step.appName} connection`
                : `${step.appName} is connected`}
            </p>
            <Button onClick={advance}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : waiting ? (
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Waiting for {step.appName} in the other tab. This page moves on by itself the moment
              it lands.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void refresh()}>
                I finished in the other tab
              </Button>
              <Button variant="ghost" onClick={() => setWaitingFor(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button asChild>
              <a
                href={connectHref(agentId, step.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimedOut(false);
                  setWaitingFor(stepSlug);
                }}
              >
                Connect {step.appName}
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Opens {step.appName} in a new tab so you can approve it. Come straight back here.
            </p>
          </div>
        )}

        {timedOut && !stepDone && (
          <p className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            We stopped watching for that one. If you did approve it, press &ldquo;I finished in the
            other tab&rdquo; after trying again. If you closed it, no harm done.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        {index === 0 ? (
          <button
            type="button"
            onClick={() => setVendor(null)}
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            I picked the wrong one
          </button>
        ) : (
          <span />
        )}
        {!stepDone && (
          <button
            type="button"
            // Nothing recorded. What was skipped is simply what is not connected at the end,
            // which stays true if they go and connect it from somewhere else in the meantime.
            onClick={() => {
              setWaitingFor(null);
              advance();
            }}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="size-3.5" />
            {index === steps.length - 1 ? "Skip and finish" : "Skip for now"}
          </button>
        )}
      </div>
    </div>
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
        "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
        suggested ? "border-primary bg-primary/5" : "bg-card hover:border-foreground/20"
      )}
    >
      <AppLogo logo={vendor.logo} name={vendor.label} size="lg" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold">{vendor.label}</span>
          {suggested && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Probably you
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{vendor.examples}</span>
        {reason && <span className="mt-1.5 block text-xs text-muted-foreground">{reason}</span>}
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium">
        Step {Math.min(current + 1, total)} of {total}
      </span>
      <span className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i < current ? "w-5 bg-primary/40" : i === current ? "w-5 bg-primary" : "w-1.5 bg-border"
            )}
          />
        ))}
      </span>
    </div>
  );
}

function AppLogo({
  logo,
  name,
  size = "sm",
}: {
  logo: string;
  name: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "size-10" : "size-7";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt=""
      loading="lazy"
      decoding="async"
      title={name}
      className={cn(box, "shrink-0 rounded-lg object-contain")}
    />
  );
}

/** "a, b and c" - the agent is talking, and a comma-separated list reads like a form. */
function joinPhrases(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
