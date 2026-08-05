"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { type ChatSession } from "./types";

export const CHAT_BASE = "/dashboard/chat";

/** "/dashboard/chat/abc" -> "abc"; the bare chat URL (and any other page) -> null. */
export function sessionFromPath(pathname: string): string | null {
  if (!pathname.startsWith(`${CHAT_BASE}/`)) return null;
  const rest = pathname.slice(CHAT_BASE.length + 1).split("/")[0];
  return rest ? decodeURIComponent(rest) : null;
}

interface ChatContextValue {
  /** Null when the workspace has no agent yet — the rail renders empty rather than erroring. */
  agentId: string | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  composerFocusToken: number;
  // Ping the composer to refocus its textarea (e.g. after an attachment lands).
  requestComposerFocus: () => void;
  loadingSessions: boolean;
  selectSession: (sessionId: string | null) => void;
  startNewChat: () => void;
  onSessionCreated: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  // Rename a thread (server-side via PATCH). Optimistic; rolls back + toasts if the build
  // doesn't support titles.
  renameSession: (sessionId: string, title: string) => Promise<void>;
  // Move a thread to the top of the rail on new activity (most-recently-used first).
  bumpSession: (sessionId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within a ChatProvider");
  return ctx;
}

// Holds the thread list + the active selection. Mounted at the DASHBOARD level, not inside the
// chat page, so the sidebar can show your conversations from anywhere — Credits, Settings, the
// Guide — instead of only once you've navigated to Chat.
//
// That placement is why this derives the URL and does its own navigating rather than taking
// them as props: the chat page could hand those down, but the dashboard rail can't, and two
// copies of the session list would drift the moment somebody renamed a thread.
//
// The list comes straight from the Agent37 Agents API (GET /v1/sessions) — there is no local
// sessions table. Each row's label (server-side title, else the first-message preview) is
// resolved by the sessions route, so it paints in one fetch with no per-session hydration.
export function ChatProvider({
  agentId,
  children,
}: {
  /** The active agent, or null when the workspace has none yet. */
  agentId: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // The open thread's id comes from the URL (/dashboard/chat/<id>) — null for a new chat, and
  // null on every page that isn't Chat. The URL stays the source of truth so refresh,
  // Back/Forward and shared links all reopen the same thread.
  const urlSessionId = sessionFromPath(pathname);
  const onChatRoute = pathname.startsWith(CHAT_BASE);

  // Switching threads while already on Chat uses pushState: it changes the URL without
  // remounting the conversation pane, which is what makes the rail feel instant. From anywhere
  // else there is no chat page mounted yet, so it has to be a real navigation.
  const navigateToSession = useCallback(
    (sessionId: string | null, mode: "push" | "replace" = "push") => {
      const path = sessionId ? `${CHAT_BASE}/${encodeURIComponent(sessionId)}` : CHAT_BASE;
      if (!onChatRoute) {
        router.push(path);
        return;
      }
      if (mode === "replace") window.history.replaceState(null, "", path);
      else window.history.pushState(null, "", path);
    },
    [onChatRoute, router]
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(urlSessionId);
  const [composerFocusToken, setComposerFocusToken] = useState(0);
  // Starts false when there's no agent: nothing will ever load, so "loading..." would be a lie
  // that never resolves.
  const [loadingSessions, setLoadingSessions] = useState(!!agentId);

  // Adopt the thread from the URL whenever it changes — a rail click, Back/Forward, or a refresh.
  // Done during render (React's "adjust state when a prop changes" pattern) so there's no extra
  // paint.
  const [syncedUrlSessionId, setSyncedUrlSessionId] = useState<string | null>(urlSessionId);
  if (urlSessionId !== syncedUrlSessionId) {
    setSyncedUrlSessionId(urlSessionId);
    setActiveSessionId(urlSessionId);
  }

  // Load the list from upstream — labels and ordering arrive ready from the sessions route.
  //
  // No state clearing here: DashboardChatProvider keys this component by agent, so switching
  // agents REMOUNTS it with empty state. Clearing in the effect as well would be a second,
  // slower path to the same place — and the one the lint rule rightly objects to.
  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;

    apiFetch<{ sessions: ChatSession[] }>(`/api/agents/${agentId}/chat/sessions`)
      .then((res) => {
        if (!cancelled) setSessions(res.sessions);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSessions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Switching the active agent invalidates the open thread — session ids belong to one
  // instance, so /dashboard/chat/<id> would ask the new agent for a conversation it has never
  // heard of. Drop back to a fresh chat URL, but only while ON the chat page: doing it from
  // Credits would yank the customer somewhere they didn't ask to go.
  const prevAgentRef = useRef<string | null>(agentId);
  useEffect(() => {
    if (agentId && prevAgentRef.current && prevAgentRef.current !== agentId && onChatRoute) {
      navigateToSession(null, "replace");
    }
    if (agentId) prevAgentRef.current = agentId;
  }, [agentId, onChatRoute, navigateToSession]);

  const requestComposerFocus = useCallback(() => setComposerFocusToken((n) => n + 1), []);

  const selectSession = useCallback(
    (sessionId: string | null) => {
      navigateToSession(sessionId);
      requestComposerFocus();
    },
    [navigateToSession, requestComposerFocus]
  );

  const startNewChat = useCallback(() => {
    navigateToSession(null);
    requestComposerFocus();
  }, [navigateToSession, requestComposerFocus]);

  // A brand-new conversation just minted its session id mid-stream. We already have its first
  // message (the label), so add the rail row locally and promote it.
  const onSessionCreated = useCallback(
    (sessionId: string, title: string) => {
      // Give the freshly-minted thread its own URL (replace, so Back doesn't return to the blank
      // new-chat URL).
      navigateToSession(sessionId, "replace");
      const label = title.trim().slice(0, 80) || null;
      setSessions((prev) =>
        prev.some((s) => s.session_id === sessionId)
          ? prev
          : [{ session_id: sessionId, title: label }, ...prev]
      );

      // Store the label. Without this it lives only in this tab's memory, and the next load —
      // which re-reads the list from an instance that holds no titles — brings the thread back as
      // "New chat". The sessions route can recover a name by opening the thread and reading its
      // first message, but that costs a call per thread; naming it here, from the message we
      // already have in hand, means that never has to happen.
      //
      // `derived` because we chose this, rather than the customer typing it: a name they type
      // later must win, and must not be quietly replaced by the opening line of the conversation.
      //
      // Silent by design — a nicety on top of a message that has already been sent, so a toast
      // about a failed background write would be noise mid-conversation.
      if (agentId && label) {
        apiFetch(`/api/agents/${agentId}/chat/sessions/${sessionId}`, {
          method: "PATCH",
          body: JSON.stringify({ title: label, derived: true }),
        }).catch(() => {});
      }
    },
    [agentId, navigateToSession]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!agentId) return;
      const removed = sessions.find((x) => x.session_id === sessionId);
      const wasActive = activeSessionId === sessionId;
      setSessions((s) => s.filter((x) => x.session_id !== sessionId)); // optimistic, functional
      // Deleting the open thread falls back to a new chat.
      if (wasActive) navigateToSession(null);
      try {
        await apiFetch(`/api/agents/${agentId}/chat/sessions/${sessionId}`, { method: "DELETE" });
      } catch (e) {
        // Functional rollback: re-insert only the removed row (preserving any threads added
        // concurrently) and restore the open thread.
        if (removed) setSessions((s) => (s.some((x) => x.session_id === sessionId) ? s : [removed, ...s]));
        if (wasActive) navigateToSession(sessionId);
        toast.error((e as Error).message || "Couldn't delete that chat.");
      }
    },
    [agentId, activeSessionId, sessions, navigateToSession]
  );

  const renameSession = useCallback(
    async (sessionId: string, title: string) => {
      if (!agentId) return;
      const next = title.trim().slice(0, 200);
      const prev = sessions.find((s) => s.session_id === sessionId)?.title ?? null;
      if (!next || next === prev) return;
      setSessions((s) => s.map((x) => (x.session_id === sessionId ? { ...x, title: next } : x))); // optimistic
      try {
        await apiFetch(`/api/agents/${agentId}/chat/sessions/${sessionId}`, {
          method: "PATCH",
          body: JSON.stringify({ title: next }),
        });
      } catch (e) {
        setSessions((s) => s.map((x) => (x.session_id === sessionId ? { ...x, title: prev } : x))); // rollback
        toast.error((e as Error).message || "Couldn't rename that chat.");
      }
    },
    [agentId, sessions]
  );

  // Move a thread to the top of the rail on new activity. Upstream ordering (last_active) only
  // refreshes on reload, so keep the most-recently-used thread first in the meantime.
  const bumpSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.session_id === sessionId);
      if (idx <= 0) return prev; // not present, or already at the top
      return [prev[idx], ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      agentId,
      sessions,
      activeSessionId,
      composerFocusToken,
      requestComposerFocus,
      loadingSessions,
      selectSession,
      startNewChat,
      onSessionCreated,
      deleteSession,
      renameSession,
      bumpSession,
    }),
    [agentId, sessions, activeSessionId, composerFocusToken, requestComposerFocus, loadingSessions, selectSession, startNewChat, onSessionCreated, deleteSession, renameSession, bumpSession]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
