"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { WorkspaceWithRole } from "@/lib/types";
import { apiFetch } from "@/lib/api";

// The workspace you're currently looking at, remembered across visits.
export const STORAGE_KEY = "agent37wl_workspace";
// A support view of someone else's workspace, kept PER TAB (sessionStorage), never in the
// cross-session localStorage default. This is the fix for the bug where a platform admin who
// opened a customer's workspace for support then landed back in it on every future login: a
// support view lives and dies with its tab and does not become the admin's home.
const SUPPORT_KEY = "agent37wl_support_ws";

interface WorkspaceContextValue {
  workspaces: WorkspaceWithRole[];
  current: WorkspaceWithRole | null;
  setCurrentId: (id: string) => void;
  refresh: () => Promise<WorkspaceWithRole[]>;
  userEmail: string;
  /** The reader's first name for greetings, or null when the account hasn't got a usable one.
   *  Derived server-side from auth user_metadata (config/greetings.ts). */
  userFirstName: string | null;
  /** First and last together, for the header's Welcome row. Null when nothing usable. */
  userFullName: string | null;
  /** The signed-in person's own picture, for their messages in chat. Empty when unset. */
  userAvatarUrl: string;
  /** Platform admin (config/admins.ts), resolved server-side in the dashboard layout.
   *  That list is `server-only` so it can never be imported here — the answer has to be
   *  handed down rather than computed, which also keeps the admin emails out of the bundle. */
  isPlatformAdmin: boolean;
  /** The signed-in person's own workspace (owner_id === them), or null if they own none. */
  ownWorkspaceId: string | null;
  /** True when the current workspace is NOT the viewer's own — i.e. a support view. */
  viewingOther: boolean;
  /** Leave a support view and go back to your own workspace. */
  returnToOwnWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  initialWorkspaces,
  userId,
  userEmail,
  userFirstName = null,
  userFullName = null,
  userAvatarUrl = "",
  isPlatformAdmin,
  children,
}: {
  initialWorkspaces: WorkspaceWithRole[];
  userId: string;
  userEmail: string;
  userFirstName?: string | null;
  userFullName?: string | null;
  userAvatarUrl?: string;
  isPlatformAdmin: boolean;
  children: React.ReactNode;
}) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>(initialWorkspaces);

  const ownWorkspaceId = useMemo(
    () => workspaces.find((w) => w.owner_id === userId)?.id ?? null,
    [workspaces, userId]
  );

  // Start on your own workspace when you own one, so the very first paint is right for the common
  // case (and for a platform admin whose stored default is a customer's workspace).
  const [currentId, setCurrentIdState] = useState<string | null>(
    ownWorkspaceId ?? initialWorkspaces[0]?.id ?? null
  );

  useEffect(() => {
    const has = (id: string | null | undefined) => !!id && workspaces.some((w) => w.id === id);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time selection of the initial workspace on mount, reading client-only storage */

    // 1) An explicit ?ws= (Open in ApolloClaw, or a deep link): honor it for THIS tab and remember
    //    it per-tab, but never write it to the cross-session default.
    const wsParam = new URLSearchParams(window.location.search).get("ws");
    if (has(wsParam)) {
      setCurrentIdState(wsParam!);
      try {
        sessionStorage.setItem(SUPPORT_KEY, wsParam!);
      } catch {
        // Private mode / storage blocked - the support view just won't survive a reload.
      }
      return;
    }

    // 2) A support view already open in this tab (survives reloads within the tab).
    let support: string | null = null;
    try {
      support = sessionStorage.getItem(SUPPORT_KEY);
    } catch {
      support = null;
    }
    if (has(support)) {
      setCurrentIdState(support!);
      return;
    }

    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    // 3) Platform admins always land in their OWN workspace. A stored default is honored only when
    //    it is their own - a customer workspace opened for support must never become home.
    if (isPlatformAdmin) {
      const next = has(stored) && stored === ownWorkspaceId ? stored! : ownWorkspaceId;
      if (next) {
        setCurrentIdState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
      } else if (has(stored)) {
        // Owns no workspace (rare): fall back to a remembered one rather than nothing.
        setCurrentIdState(stored!);
      }
      return;
    }

    // 4) Everyone else: remember the last workspace they chose.
    if (has(stored)) setCurrentIdState(stored!);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrentId = useCallback((id: string) => {
    setCurrentIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const returnToOwnWorkspace = useCallback(() => {
    try {
      sessionStorage.removeItem(SUPPORT_KEY);
    } catch {
      // ignore
    }
    if (ownWorkspaceId) setCurrentId(ownWorkspaceId);
  }, [ownWorkspaceId, setCurrentId]);

  const refresh = useCallback(async () => {
    const { workspaces: ws } = await apiFetch<{ workspaces: WorkspaceWithRole[] }>("/api/workspaces");
    setWorkspaces(ws);
    setCurrentIdState((prev) => (prev && ws.some((w) => w.id === prev) ? prev : ws[0]?.id ?? null));
    return ws;
  }, []);

  const current = useMemo(
    () => workspaces.find((w) => w.id === currentId) ?? null,
    [workspaces, currentId]
  );

  const viewingOther = Boolean(current && ownWorkspaceId && current.id !== ownWorkspaceId);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        current,
        setCurrentId,
        refresh,
        userEmail,
        userFirstName,
        userFullName,
        userAvatarUrl,
        isPlatformAdmin,
        ownWorkspaceId,
        viewingOther,
        returnToOwnWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
