"use client";

import { useEffect, useState } from "react";
import { Bot, Check, ChevronDown, FileText, Image as ImageIcon, Loader2, Wrench } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import type { ChatMessage, MessageAttachment, ToolEvent } from "./types";

// The agent's own face beside its messages.
//
// This was a hardcoded lucide Bot glyph, so the picture somebody chose on Start Here - a mascot
// pose, or their own logo uploaded - appeared everywhere in the dashboard EXCEPT the place they
// spend all their time. Every reply came from a generic robot outline.
//
// Falls back the same way the picker does: the chosen picture, then the agent's initial. Not a
// stand-in mascot - that made an unconfigured agent look like it had been given a face. The Bot
// glyph survives only for an agent with no name to take a letter from.
function AgentBadge() {
  const { active } = useActiveAgent();
  const [broken, setBroken] = useState(false);
  const src = active?.avatar_url;
  const initial = (active?.name || "").trim().charAt(0).toUpperCase();

  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background text-xs font-semibold text-muted-foreground">
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-7 w-7 object-cover"
          onError={() => setBroken(true)}
        />
      ) : initial ? (
        initial
      ) : (
        <Bot className="h-4 w-4" />
      )}
    </span>
  );
}

// The user's marker beside their messages: first initial in a brand-tinted circle
// (a neutral person glyph if we somehow have no email to take a letter from).

// The reader's own picture, and only if they have one.
//
// No initials fallback on purpose. An avatar column that is empty for most people would add a
// 28px gutter to every message in every transcript to serve the few who uploaded something, and
// the letter-in-a-circle version of this was removed once already for being fussy. Nothing to
// show means nothing rendered.
function UserBadge() {
  const { userAvatarUrl } = useWorkspace();
  const [broken, setBroken] = useState(false);
  if (!userAvatarUrl || broken) return null;
  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 overflow-hidden rounded-full border bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={userAvatarUrl}
        alt=""
        loading="lazy"
        className="h-7 w-7 object-cover"
        onError={() => setBroken(true)}
      />
    </span>
  );
}

// Files that rode along with a user turn, shown as compact chips above the message bubble.
function MessageAttachments({ attachments }: { attachments: MessageAttachment[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {attachments.map((a, k) => (
        <span
          key={`${a.path}-${k}`}
          title={a.name}
          className="flex items-center gap-1.5 rounded-lg border bg-secondary/60 px-2 py-1 text-xs text-foreground"
        >
          {a.isImage ? (
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="max-w-[12rem] truncate">{a.name}</span>
        </span>
      ))}
    </div>
  );
}

function ToolChip({ tool }: { tool: ToolEvent }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
        tool.status === "error" ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground"
      )}
    >
      <Wrench className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium capitalize">{tool.tool.replace(/_/g, " ")}</span>
      {tool.label && <span className="max-w-[12rem] truncate font-mono opacity-70">{tool.label}</span>}
      {tool.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {tool.status === "completed" && <Check className="h-3.5 w-3.5" />}
      {tool.durationMs != null && <span className="ml-auto tabular-nums opacity-60">{(tool.durationMs / 1000).toFixed(1)}s</span>}
    </div>
  );
}

// A live clock while the agent is working, so even a long, silent tool step shows a ticking
// heartbeat. It is the difference between "is this stuck?" and "it has been thinking for 0:48".
function ElapsedTimer({ running }: { running: boolean }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the clock at the start of each turn
    setSecs(0);
    const id = setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);
  if (!running) return null;
  const mm = Math.floor(secs / 60);
  const ss = (secs % 60).toString().padStart(2, "0");
  return <span className="tabular-nums opacity-70">{mm}:{ss}</span>;
}

// The agent's work. While it runs, this is the "it's alive, not stuck" surface: a spinner, a
// running timer, and the model's live reasoning streaming underneath, so a long prompt always
// shows motion. Once the turn ends it collapses to a "Steps" line the reader can expand to see
// what happened. The reasoning + narration + tools live behind the toggle so the reply stays clean.
function AgentSteps({ steps, tools, thinking, working }: { steps?: string; tools: ToolEvent[]; thinking?: string; working: boolean }) {
  const [open, setOpen] = useState(false);
  const hasSteps = !!steps && steps.trim().length > 0;
  const hasThinking = !!thinking && thinking.trim().length > 0;
  // While working, always render (spinner + timer) so the "alive" cue shows from the first moment.
  if (!working && !hasSteps && !hasThinking && tools.length === 0) return null;

  // The tail of the live reasoning, shown uncollapsed while working so there is visible motion
  // without a click. Older lines fade out at the top.
  const livePreview = working && hasThinking ? thinking!.trim().slice(-320) : "";

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
        <span className="font-medium">{working ? "Thinking" : "Steps"}</span>
        {working && <ElapsedTimer running={working} />}
        {tools.length > 0 && <span className="tabular-nums opacity-70">&middot; {tools.length}</span>}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {livePreview && !open && (
        <div
          className="mt-1.5 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap break-words text-[11px] leading-snug text-muted-foreground/70"
          style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 55%)", maskImage: "linear-gradient(to bottom, transparent, black 55%)" }}
        >
          {livePreview}
        </div>
      )}

      {open && (
        <div className="mt-2 space-y-2 border-l-2 border-border/50 pl-3">
          {tools.map((t, k) => (
            <ToolChip key={`${t.tool}-${k}`} tool={t} />
          ))}
          {hasThinking && (
            <div className="whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground/80">{thinking}</div>
          )}
          {hasSteps && (
            <div className="whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{steps}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatMessages({
  messages,
  isStreaming,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
  // User's first initial for their message marker.
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-5 py-6">
      {messages.map((m, i) => {
        if (m.role === "user") {
          const attachments = m.attachments ?? [];
          return (
            // Your own face, once you have set one in Settings.
            //
            // This deliberately had no avatar: right alignment already says who spoke, and a
            // 28px INITIAL hanging off every bubble was the fussiest thing in the transcript.
            // A picture is a different proposition from a letter in a circle - it is somebody's
            // face - so it appears only if they uploaded one, and the transcript stays clean for
            // everyone who did not.
            <div key={m.id} className="flex items-start justify-end gap-2.5">
              <div className="flex min-w-0 max-w-[80%] flex-col items-end gap-1.5">
                {attachments.length > 0 && <MessageAttachments attachments={attachments} />}
                {m.content && (
                  <div className="whitespace-pre-wrap break-words rounded-[20px] rounded-br-md border bg-secondary/70 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                    {m.content}
                  </div>
                )}
              </div>
              <UserBadge />
            </div>
          );
        }

        const lastAssistant = i === messages.length - 1 && m.role === "assistant";
        const tools = m.tools ?? [];

        return (
          <div key={m.id} className="flex items-start justify-start gap-2.5">
            <AgentBadge />
            <div className="min-w-0 flex-1">
              {/* The live "Thinking" surface (spinner, timer, streaming reasoning) shows the agent
                  is alive through a long turn; it collapses to "Steps" once the reply lands. */}
              <AgentSteps steps={m.steps} tools={tools} thinking={m.thinking} working={lastAssistant && isStreaming} />
              {m.content ? <Markdown content={m.content} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
