"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { readApiError } from "@/lib/api";
import { AgentFace } from "@/components/AgentFace";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "./ChatMessages";
import { ModelControl } from "./ModelControl";
import { uid, type ChatMessage } from "./types";

// A conversation with one named agent on the instance, over the direct line
// (/api/agents/{id}/agents/{agentId}/chat). Used for every agent when an instance carries more
// than one, picked in the sidebar.
//
// Each turn is saved to a thread on the server (lib/agent-threads.ts), so the conversation shows
// in the Chats list with the agent's face and reopens later: `threadId` opens a saved one, null
// starts fresh. No attachments yet, which return once Agent37's chat API can name an agent and
// this component goes away.
//
// The model menu is here too (Oct 5, 2026). It was only in the main composer, and a box with
// several agents never shows that one, so on David's own box the pill flashed for the instant
// before the roster loaded and was gone once it did. The choice rides along on the turn, and
// the gateway's own answer to the switch is shown above the box, so what the gateway did is
// visible rather than assumed.

type Props = {
  instanceId: string;
  agentId: string;
  agentName: string;
  avatarUrl?: string | null;
  /** The saved conversation to open, or null for a fresh one. */
  threadId: string | null;
  /** A fresh conversation was saved under this id; its opening line titles it. */
  onThreadCreated?: (threadId: string, title: string) => void;
  /** A message went out in a saved conversation, so the list can move it to the top. */
  onActivity?: (threadId: string) => void;
};

// The gateway streams OpenAI-style chunks: "data: {...choices[0].delta.content}" lines and a
// final "data: [DONE]". Our route may put one chunk of its own in front, {"apollo":{...}}, which
// carries the gateway's reply to a model switch; it has no `choices` so it is never answer text.
async function readOpenAiStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
  onNotice?: (notice: string) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const j = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
          error?: { message?: string };
          apollo?: { notice?: string };
        };
        if (typeof j.apollo?.notice === "string") onNotice?.(j.apollo.notice);
        if (j.error?.message) onDelta(`\n\n${j.error.message}`);
        const delta = j.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) onDelta(delta);
      } catch {
        // a partial or non-JSON line; the next read completes it
      }
    }
  }
}

export function DirectAgentChat({ instanceId, agentId, agentName, avatarUrl, threadId, onThreadCreated, onActivity }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // The thread this pane holds. Kept here as well as in the URL because a fresh conversation
  // learns its id mid-stream: when the URL then catches up to the same id, there is nothing to
  // reload, and reloading would wipe the answer still arriving.
  const [shown, setShown] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The model picked in the pill (null rides the agent's default), and the one this thread's
  // gateway session was last told about. The turn names the model only when the two differ, so
  // a switch costs one extra gateway call and the turns after it cost nothing more.
  const [model, setModel] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  // The gateway's own words about the last switch, shown above the box.
  const [notice, setNotice] = useState<string | null>(null);
  // Another thread named (a rail click, Back/Forward), or none (a fresh chat): reset the pane in
  // render, React's "adjust state when a prop changes", and let the effect below fetch it. The
  // model choice stays; what the new thread's session was told is unknown, so it is told again.
  if (threadId !== shown) {
    setShown(threadId);
    setMessages([]);
    setError(null);
    setNotice(null);
    setApplied(null);
    setLoadingThread(!!threadId);
  }
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [agentId]);

  // Fetch the saved conversation the pane was just pointed at.
  useEffect(() => {
    if (!loadingThread || !threadId) return;
    abortRef.current?.abort();
    let cancelled = false;
    fetch(`/api/agents/${instanceId}/threads/${threadId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res, "Couldn't open that chat."));
        return (await res.json()) as { messages: { role: "user" | "assistant"; content: string }[] };
      })
      .then((res) => {
        if (cancelled) return;
        setMessages(res.messages.map((m) => ({ id: uid(m.role === "user" ? "u" : "a"), role: m.role, content: m.content })));
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => {
      cancelled = true;
    };
  }, [threadId, loadingThread, instanceId]);

  async function send() {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    setError(null);
    const assistantId = uid("a");
    setMessages((m) => [
      ...m,
      { id: uid("u"), role: "user", content: text },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const switchTo = model && model !== applied ? model : null;
    try {
      const res = await fetch(`/api/agents/${instanceId}/agents/${encodeURIComponent(agentId)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text, threadId: shown, ...(switchTo ? { model: switchTo } : {}) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const msg = await readApiError(res, "Chat request failed");
        setError(msg);
        setMessages((m) => m.filter((x) => x.id !== assistantId));
        return;
      }
      if (switchTo) setApplied(switchTo);
      // A fresh conversation is named by the server once it is saved. Adopt the id before the
      // URL moves to it, so the move does not reload the pane mid-answer.
      const savedAs = res.headers.get("X-Apollo-Thread-Id");
      if (savedAs && !shown) {
        setShown(savedAs);
        onThreadCreated?.(savedAs, text);
      } else if (savedAs) {
        onActivity?.(savedAs);
      }
      await readOpenAiStream(
        res.body,
        (delta) => {
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + delta } : x)));
        },
        (said) => setNotice(said)
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setMessages((m) => m.filter((x) => x.id !== assistantId));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const empty = messages.length === 0 && !loadingThread;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className={cn("min-h-0", empty ? "flex flex-1 flex-col items-center justify-center px-4" : "flex-1 overflow-y-auto overflow-x-hidden")}
      >
        {empty ? (
          <div className="flex w-full max-w-2xl items-start gap-4 text-left sm:gap-5">
            <AgentFace src={avatarUrl} name={agentName} className="mt-0.5 size-16 shrink-0 text-2xl" />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{agentName}</h2>
              <p className="mt-1 text-base text-foreground/75">
                Ask {agentName} anything in its area. The conversation is saved to your Chats list.
              </p>
            </div>
          </div>
        ) : loadingThread ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <ChatMessages messages={messages} isStreaming={streaming} agentName={agentName} agentAvatarUrl={avatarUrl ?? null} />
        )}
      </div>

      <div className="relative bg-background px-6 py-3 md:px-10 sm:py-4">
        <div className="mx-auto w-full max-w-3xl" aria-live="polite">
          {error && <p className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          {notice && !error && (
            <p className="mb-2 rounded-md bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Model switch:</span> {notice}
            </p>
          )}
          <form
            className="rounded-2xl border bg-card shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder={`Message ${agentName}`}
              // 16px on phones so iOS Safari does not zoom the page when the box is focused.
              className="max-h-40 min-h-[44px] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <div className="flex items-center gap-2 px-2 pb-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <ModelControl
                  agentId={instanceId}
                  model={model}
                  disabled={streaming}
                  onChange={(next) => {
                    setModel(next);
                    setNotice(null);
                  }}
                />
              </div>
              <div className="ml-auto flex shrink-0 items-center">
                {streaming ? (
                  <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Stop">
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
