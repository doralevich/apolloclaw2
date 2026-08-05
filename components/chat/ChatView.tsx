"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, FileText, Loader2, Mail, PanelRight, PenLine, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickGreeting, type Greeting } from "@/config/greetings";
import { CHAT_CHIPS } from "@/config/shortcuts";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderClock } from "./HeaderClock";
import { IntegrationsRail } from "./IntegrationsRail";
import { DropOverlay } from "./Attachments";
import { ChatComposer } from "./ChatComposer";
import { ChatMessages } from "./ChatMessages";
import { useChatContext } from "./ChatProvider";
import { useChat } from "./useChat";
import { useChatAttachments } from "./useChatAttachments";

// The conversation pane, rendered full-height beside the thread rail inside the chat page.
// Empty state = a centered greeting + big composer; once there are messages it becomes a scrolling
// transcript with the composer docked at the bottom. The composer is kept at a STABLE position in
// the tree across both states so it never remounts (preserving the draft, model, and effort
// selection through the first send).

// Heuristic: does a send failure look like the agent's AI budget ran dry? The gateway's
// wording isn't under our control, so match the family of phrasings rather than one string.
// A false positive still shows a helpful card with the real path to fixing most outages.
// Chip id -> icon. Lives here rather than in config/shortcuts so that file stays JSX-free.
const CHIP_ICONS = { mail: Mail, calendar: CalendarDays, file: FileText, pen: PenLine } as const;

// Whether the integrations panel is tucked away. Remembered, because somebody who closed it does
// not want to close it again on every new chat — and read through useSyncExternalStore so the
// server renders the open state and the browser corrects it, with no state written from an effect
// to get there.
const RAIL_HIDDEN_KEY = "apolloclaw:integrations-rail-hidden";

function subscribeStorage(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function isOutOfCreditsError(message: string): boolean {
  return /budget|credit|insufficient|quota|payment required|\b402\b/i.test(message);
}

export function ChatView({
  agentId,
  agentName,
  prefill,
}: {
  // Passed in rather than read from context: the provider now lives at the dashboard level,
  // where there may be no agent at all, so its agentId is nullable. This page only renders once
  // an agent is resolved, so it holds the non-null one.
  agentId: string;
  // The active agent's display name — greets the user on the empty state.
  agentName?: string | null;
  // A question carried in from Shortcuts or Start Here (?q=), dropped into the composer.
  prefill?: string;
}) {
  const { userFirstName } = useWorkspace();
  const {
    sessions,
    activeSessionId,
    composerFocusToken,
    requestComposerFocus,
    startNewChat,
    onSessionCreated,
    bumpSession,
  } = useChatContext();
  const { messages, isStreaming, loadingHistory, error, send, stop } = useChat({
    agentId,
    sessionId: activeSessionId,
    onSessionCreated,
    onActivity: bumpSession,
  });

  // Attachment state lives here (not in the composer) so the ENTIRE pane is a drop zone — a file
  // dropped anywhere over the transcript or composer lands in the same tray. A landed attachment
  // refocuses the composer through the same shared signal selecting/creating a thread uses.
  const att = useChatAttachments(agentId, requestComposerFocus);
  const { clearFiles } = att;

  // Switching threads / starting a new chat empties the staged tray, so a file picked for one
  // conversation can't silently ride along into the next.
  useEffect(() => {
    clearFiles();
  }, [activeSessionId, clearFiles]);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the user is pinned near the bottom — controls whether new tokens auto-scroll.
  const stickRef = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Follow the stream only when the user is already near the bottom.
  useEffect(() => {
    if (!stickRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loadingHistory]);

  const showWelcome = !loadingHistory && messages.length === 0;
  // Memoized so the per-token re-renders during streaming don't re-scan the thread list.
  const activeTitle = useMemo(
    () => sessions.find((s) => s.session_id === activeSessionId)?.title?.trim(),
    [sessions, activeSessionId]
  );
  const headerTitle = activeTitle || (activeSessionId ? "Chat" : "New chat");

  // A chip the customer clicked, and how many have been clicked. The counter is what makes
  // picking the SAME chip twice work — see the note in ChatComposer.
  const [picked, setPicked] = useState<{ text: string; n: number } | null>(null);

  const storedRailHidden = useSyncExternalStore(
    subscribeStorage,
    () => window.localStorage.getItem(RAIL_HIDDEN_KEY),
    () => null
  );
  const [railOverride, setRailOverride] = useState<boolean | null>(null);
  const railHidden = railOverride ?? storedRailHidden === "1";
  const setRailHidden = (next: boolean) => {
    setRailOverride(next);
    try {
      window.localStorage.setItem(RAIL_HIDDEN_KEY, next ? "1" : "0");
    } catch {
      // Private browsing, or storage full. The toggle still works for this session.
    }
  };

  // Null rather than a placeholder: an unnamed agent should stay out of the greeting entirely.
  const greetName = agentName?.trim() || null;

  // The empty-chat greeting, drawn fresh for each new chat rather than being one fixed line
  // forever (config/greetings.ts). Chosen in an effect and not during render because the pick
  // is random: doing it inline would make the server and the browser disagree on the text.
  // Null until then, which is why the block below reserves its height.
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  useEffect(() => {
    if (!showWelcome) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate post-hydration pick: the greeting is random, so the server must not choose one, and re-rolling when a new empty chat appears is exactly this effect's job
    setGreeting(
      pickGreeting({
        userName: userFirstName,
        agentName: greetName,
        hour: new Date().getHours(),
      })
    );
  }, [showWelcome, activeSessionId, userFirstName, greetName]);

  return (
    <div className="relative flex h-full min-h-0 flex-col" {...att.dragHandlers}>
      {att.dragOver && <DropOverlay />}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card/80 px-6 backdrop-blur-sm md:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">{headerTitle}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
        {/* Date and time, from the mockup. The weather it also shows isn't here — see HeaderClock. */}
        <HeaderClock />
        {/* Light/dark at the top of the screen, where you are when you decide you want it. The
            three-way preference (including "follow my device") stays in Settings. */}
        <ThemeToggle />
        <button
          type="button"
          onClick={startNewChat}
          title="New chat"
          className="brand-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-shadow hover:shadow-md hover:shadow-primary/30"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
        </div>
      </header>

      {/* Everything below the header is a row: the conversation, and — only on the empty state —
          the integrations rail beside it.
          The rail is a SIBLING of the conversation column rather than something inside it, so its
          appearing and disappearing never moves the composer within its parent. That matters: the
          composer holds the draft, the model and the effort setting, and a change of tree position
          would remount it and lose all three mid-sentence.
          Gone once a conversation starts. A 340px rail beside a live transcript is 340px of
          reading width spent on something nobody is looking at. */}
      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col",
            // Decoration only, and only where there's nothing to read yet — see .chat-wash.
            showWelcome && "chat-wash"
          )}
        >
      {/* Top: scrolling transcript when there are messages; the centered welcome panel when
          empty (justify-end seats it just above the composer). */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          "min-h-0",
          showWelcome
            ? "flex shrink-0 flex-col items-center gap-5 px-4 pb-2 pt-[9vh]"
            : "flex-1 overflow-y-auto overflow-x-hidden"
        )}
      >
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          <ChatMessages messages={messages} isStreaming={isStreaming} />
        ) : (
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            {/* Height reserved so the composer doesn't jump when the greeting lands. */}
            <div className="flex min-h-[76px] flex-col items-center gap-2">
              {greeting && (
                <>
                  <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                    {/* Was split, with the address in the accent — that was the loudest part of
                        the violet pass and it went with it. Weight carries the line instead. */}
                    {greeting.headline}
                  </h1>
                  <p className="text-lg text-foreground/75">{greeting.subline}</p>
                </>
              )}
            </div>
            {/* The rail's stand-in below lg. One line rather than a squeezed copy of it. */}
            <Link
              href="/dashboard/integrations"
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground lg:hidden"
            >
              Connect your apps
            </Link>
          </div>
        )}
      </div>

      {/* Composer wrapper — the STABLE 2nd child. Its chrome (docked vs bare centered) is a
          className swap so the ChatComposer inside never changes tree position. */}
      <div className={cn("relative", showWelcome ? "w-full px-6 md:px-10" : "bg-background px-6 py-3 md:px-10 sm:py-4")}>
        {/* No hard divider — a short fade dissolves the transcript into the composer instead. */}
        {!showWelcome && (
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent" />
        )}
        <div className={cn("mx-auto w-full", showWelcome ? "max-w-2xl" : "max-w-3xl")} aria-live="polite">
          {error &&
            (isOutOfCreditsError(error) ? (
              <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <p className="font-semibold">Your agent is out of AI credits.</p>
                <p className="mt-0.5">Check your usage and budget on the API Credits tab.</p>
                <Link
                  href="/dashboard/settings/billing"
                  className="mt-1.5 inline-block font-semibold underline underline-offset-2"
                >
                  View API credits
                </Link>
              </div>
            ) : (
              <p className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
            ))}
        </div>
        <ChatComposer
          agentId={agentId}
          isStreaming={isStreaming}
          att={att}
          onSend={send}
          onStop={stop}
          large={showWelcome}
          focusToken={composerFocusToken}
          prefill={picked?.text ?? prefill}
          prefillToken={picked?.n}
        />
      </div>

      {/* Bottom: balances the vertical spacing on the welcome state. */}
      {showWelcome && (
        <div className="flex flex-1 flex-col items-center gap-4 px-4 pt-4">
          {/* Four things to say, under the box you'd say them in. They fill the composer rather
              than sending: several want a name or a document swapped in first, and firing one off
              unedited produces exactly the weak first answer this is meant to prevent. */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CHAT_CHIPS.map((chip) => {
              const Icon = CHIP_ICONS[chip.icon];
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setPicked((p) => ({ text: chip.prompt, n: (p?.n ?? 0) + 1 }))}
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/25 hover:bg-secondary/60"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {chip.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            The more context you give, the better your agent can help.
          </p>
        </div>
      )}
        </div>

        {/* The panel slides OUT TO THE RIGHT rather than collapsing in place, and the wrapper's
            width goes with it — a panel that closes without giving its space back has moved, not
            closed. Both properties are on the same transition so the chat widens at exactly the
            rate the panel leaves.
            overflow-hidden is what keeps the translated panel from painting over the composer on
            its way out. The rail stays mounted so its fetched state survives a close and reopen.
            Hidden below lg — a 340px rail on a phone would be the whole screen. Mobile gets the
            one-line link under the greeting instead, so Connections is still reachable from here. */}
        {showWelcome && (
          <div
            className={cn(
              "hidden shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out lg:block",
              railHidden ? "w-0 opacity-0" : "w-[372px] opacity-100"
            )}
            aria-hidden={railHidden}
          >
            <div
              className={cn(
                "h-full w-[372px] p-4 pl-0 transition-transform duration-300 ease-out",
                railHidden && "translate-x-full"
              )}
            >
              <IntegrationsRail agentId={agentId} onHide={() => setRailHidden(true)} />
            </div>
          </div>
        )}

        {/* The way back. A tab on the edge the panel left from, so reopening is where closing
            happened rather than somewhere in the header. */}
        {showWelcome && railHidden && (
          <button
            type="button"
            onClick={() => setRailHidden(false)}
            aria-label="Show integrations"
            title="Integrations"
            className="my-4 mr-4 hidden shrink-0 items-center gap-1.5 self-start rounded-l-xl border border-r-0 bg-card px-2 py-3 text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
