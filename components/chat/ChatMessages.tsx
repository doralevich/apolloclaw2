"use client";

import { useState } from "react";
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

// The agent's work, tucked away. While it runs a task it narrates ("let me open the page…") and
// fires tools; none of that is the answer, so it lives behind a single collapsed line the reader
// can expand if they want to see what happened. Collapsed by default, on purpose — the point of
// this is that a customer sees the reply, not the play-by-play.
function AgentSteps({ steps, tools, working }: { steps?: string; tools: ToolEvent[]; working: boolean }) {
  const [open, setOpen] = useState(false);
  const hasSteps = !!steps && steps.trim().length > 0;
  if (!hasSteps && tools.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
        <span className="font-medium">{working ? "Working" : "Steps"}</span>
        {tools.length > 0 && <span className="tabular-nums opacity-70">&middot; {tools.length}</span>}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 border-l-2 border-border/50 pl-3">
          {tools.map((t, k) => (
            <ToolChip key={`${t.tool}-${k}`} tool={t} />
          ))}
          {hasSteps && (
            <div className="whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">{steps}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Bigger, higher-contrast "..." with a staggered bounce — visible the whole time the agent is
// generating, until the first content chunk arrives.
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2" aria-label="Agent is typing">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-2 w-2 animate-bounce rounded-full bg-foreground/60"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
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
        // Show the typing dots whenever the agent is generating and no markdown content has
        // streamed yet — even if a thinking block or tool chip is already visible, so there's
        // always an obvious "something is happening" cue.
        const showDots = lastAssistant && isStreaming && !m.content;

        return (
          <div key={m.id} className="flex items-start justify-start gap-2.5">
            <AgentBadge />
            <div className="min-w-0 flex-1">
              <AgentSteps steps={m.steps} tools={tools} working={lastAssistant && isStreaming} />
              {m.content ? <Markdown content={m.content} /> : null}
              {showDots && (
                <div className={tools.length > 0 ? "mt-2" : undefined}>
                  <TypingDots />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
