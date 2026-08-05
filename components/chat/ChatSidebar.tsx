"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Loader2, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useChatContext } from "./ChatProvider";
import { sessionTime } from "./session-time";

// The "Chats" list, rendered in the SHARED dashboard sidebar under the nav — so your
// conversations are one click away from Credits, the Guide or anywhere else, not just from the
// chat page. Selecting a thread pushState-navigates when you're already on Chat, and does a
// real navigation when you aren't (see ChatProvider).
//
// Renders nothing at all when there's no agent: an empty "Chats" heading in the sidebar of a
// workspace that cannot chat yet is noise.
export function ChatSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const {
    agentId,
    sessions,
    activeSessionId,
    loadingSessions,
    selectSession,
    startNewChat,
    deleteSession,
    renameSession,
  } = useChatContext();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDelete = sessions.find((s) => s.session_id === pendingDeleteId) ?? null;

  // Inline rename: the row's label swaps to a text input. Enter (or blur) commits; Escape cancels
  // without committing — `skipBlur` suppresses the commit the resulting blur would otherwise fire.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const skipBlur = useRef(false);

  function startRename(sessionId: string, current: string | null) {
    setEditingId(sessionId);
    setDraft(current ?? "");
  }

  function commitRename(sessionId: string, current: string | null) {
    setEditingId(null);
    const next = draft.trim();
    if (next && next !== (current ?? "")) renameSession(sessionId, next);
  }

  function onRenameKeyDown(e: KeyboardEvent<HTMLInputElement>, sessionId: string, current: string | null) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename(sessionId, current);
    } else if (e.key === "Escape") {
      e.preventDefault();
      skipBlur.current = true;
      setEditingId(null);
    }
  }

  if (!agentId) return null;

  return (
    <>
      <div className="mt-6 flex min-h-0 flex-col">
        <div className="flex items-center justify-between px-3 pb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Chats
          </span>
          <button
            type="button"
            onClick={() => {
              startNewChat();
              onNavigate?.();
            }}
            aria-label="New chat"
            title="New chat"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Capped rather than flex-1: this shares the rail with the nav above and the account
            controls below, so a customer with forty threads must not push those off screen. */}
        <div className="max-h-[40vh] min-h-0 overflow-y-auto">
          {loadingSessions ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          ) : sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No chats yet.</p>
          ) : (
            <nav className="flex flex-col gap-0.5">
              {sessions.map((s) => {
                const label = s.title || "New chat";
                // Null when the instance sent nothing usable — see session-time.ts. The row
                // simply has no timestamp rather than an invented one.
                const when = sessionTime(s.last_active);
                return (
                  <div key={s.session_id} className="group relative">
                    {editingId === s.session_id ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => onRenameKeyDown(e, s.session_id, s.title)}
                        onBlur={() => {
                          if (skipBlur.current) {
                            skipBlur.current = false;
                            return;
                          }
                          commitRename(s.session_id, s.title);
                        }}
                        aria-label="Chat name"
                        className="w-full rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground outline-none ring-1 ring-ring"
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            selectSession(s.session_id);
                            onNavigate?.();
                          }}
                          onDoubleClick={() => startRename(s.session_id, s.title)}
                          className={cn(
                            "flex w-full select-none items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            // Room for the hover actions only while hovering, so the timestamp
                            // gets the space the rest of the time.
                            "pr-3 group-hover:pr-14",
                            activeSessionId === s.session_id
                              ? "bg-secondary font-medium text-foreground"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{label}</span>
                          {when && (
                            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/80 group-hover:hidden">
                              {when}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => startRename(s.session_id, s.title)}
                          aria-label={`Rename chat ${label}`}
                          title="Rename chat"
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(s.session_id)}
                          aria-label={`Delete chat ${label}`}
                          title="Delete chat"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title="Delete chat?"
        description={`Are you sure you want to delete "${pendingDelete?.title || "New chat"}"? This cannot be undone.`}
        confirmText="Delete chat"
        destructive
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          await deleteSession(pendingDeleteId);
        }}
      />
    </>
  );
}
