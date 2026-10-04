"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { readApiError } from "@/lib/api";
import { AgentFace } from "@/components/AgentFace";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "./ChatMessages";
import { uid, type ChatMessage } from "./types";

// A plain conversation with one named agent on the instance, over the direct line
// (/api/agents/{id}/agents/{agentId}/chat). Used by the per-agent tabs when an instance carries
// more than one agent.
//
// Plain on purpose: no thread rail, no attachments, no model menu. The gateway keeps the
// conversation's context under a session of its own, so follow-ups work, but this page holds the
// transcript only while it is open. Those parts return to every tab once Agent37's chat API can
// name an agent, at which point this component goes away.

type Props = {
  instanceId: string;
  agentId: string;
  agentName: string;
  avatarUrl?: string | null;
};

// The gateway streams OpenAI-style chunks: "data: {...choices[0].delta.content}" lines and a
// final "data: [DONE]".
async function readOpenAiStream(body: ReadableStream<Uint8Array>, onDelta: (text: string) => void) {
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
        const j = JSON.parse(data) as { choices?: { delta?: { content?: string } }[]; error?: { message?: string } };
        if (j.error?.message) onDelta(`\n\n${j.error.message}`);
        const delta = j.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) onDelta(delta);
      } catch {
        // a partial or non-JSON line; the next read completes it
      }
    }
  }
}

export function DirectAgentChat({ instanceId, agentId, agentName, avatarUrl }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    try {
      const res = await fetch(`/api/agents/${instanceId}/agents/${encodeURIComponent(agentId)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const msg = await readApiError(res, "Chat request failed");
        setError(msg);
        setMessages((m) => m.filter((x) => x.id !== assistantId));
        return;
      }
      await readOpenAiStream(res.body, (delta) => {
        setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + delta } : x)));
      });
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

  const empty = messages.length === 0;

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
                A direct line to {agentName} on this instance. It remembers this conversation on
                the server, and the transcript here lasts while the page is open.
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isStreaming={streaming} />
        )}
      </div>

      <div className="relative bg-background px-6 py-3 md:px-10 sm:py-4">
        <div className="mx-auto w-full max-w-3xl" aria-live="polite">
          {error && <p className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          <form
            className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm"
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
              className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {streaming ? (
              <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Stop">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
