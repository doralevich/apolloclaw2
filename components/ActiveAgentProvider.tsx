"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { MergedAgent, Role } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { isTransitional } from "@/lib/format";
import { useWorkspace } from "@/components/WorkspaceProvider";

// Per-workspace persistence so switching workspaces restores each one's last-used agent.
const STORAGE_PREFIX = "apolloclaw_active_agent:";

interface ActiveAgentContextValue {
  agents: MergedAgent[];
  active: MergedAgent | null;
  role: Role;
  setActiveId: (id: string) => void;
  loading: boolean;
  // Last agent-list fetch failure — lets consumers distinguish "couldn't load agents" from a
  // genuinely empty workspace instead of showing the "create your first agent" empty state.
  error: string | null;
  refresh: () => Promise<void>;
}

const ActiveAgentContext = createContext<ActiveAgentContextValue | null>(null);

// Global "which agent am I talking to" selection: Chat, Integrations, and API Credits all
// scope to `active`, and the Agents table renders this same list — one fetch, one source of
// truth, so lifecycle actions (create/start/stop/delete/rename) update every surface at once.
// Lives inside WorkspaceProvider — the agent list reloads whenever the current workspace
// changes, and a stored selection that no longer exists falls back to the workspace's first
// agent. While any agent is in a transitional state (provisioning/starting/stopping) the list
// polls so status flips propagate to the switcher dot, Chat banner, and Integrations warning.
export function ActiveAgentProvider({ children }: { children: React.ReactNode }) {
  const { current } = useWorkspace();
  const workspaceId = current?.id ?? null;

  const [agents, setAgents] = useState<MergedAgent[]>([]);
  const [role, setRole] = useState<Role>("admin");
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The workspace whose agents we currently WANT. Opening a customer for support mounts on the
  // admin's own workspace and then switches, so two loads (own, then customer) are in flight at
  // once; without this guard the slower one wins and can blank the customer's agent with the
  // (empty) own-workspace result. Every load stamps this and ignores its own response if the
  // workspace has moved on since.
  const wantRef = useRef<string | null>(workspaceId);

  // `silent` suppresses the toast for background polls — a flaky network shouldn't toast
  // every 5 seconds; the error state (and any cached list) still updates.
  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      const ws = workspaceId;
      wantRef.current = ws;
      if (!ws) {
        setAgents([]);
        setError(null);
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch<{ agents: MergedAgent[]; role: Role }>(
          `/api/agents?workspace=${ws}`
        );
        if (wantRef.current !== ws) return; // superseded by a newer workspace - drop this result
        setAgents(data.agents);
        setRole(data.role);
        setError(null);
      } catch (e) {
        if (wantRef.current !== ws) return;
        const message = (e as Error).message || "Couldn't load agents.";
        setError(message);
        if (!silent) toast.error(message);
      } finally {
        if (wantRef.current === ws) setLoading(false);
      }
    },
    [workspaceId]
  );

  // Workspace switched (or first mount): drop the old workspace's list, restore this
  // workspace's persisted selection, and refetch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-on-prop-change: dropping the previous workspace's agents when the workspace switches is exactly this effect's job
    setLoading(true);
    setAgents([]);
    setError(null);
    setActiveIdState(workspaceId ? localStorage.getItem(STORAGE_PREFIX + workspaceId) : null);
    load();
  }, [workspaceId, load]);

  // Poll while any agent is transitional so provisioning->running (and stop/start flips)
  // reach every consumer — not just whichever page kicked the action off.
  useEffect(() => {
    if (!agents.some((a) => isTransitional(a.live_status))) return;
    const t = setInterval(() => load({ silent: true }), 5000);
    return () => clearInterval(t);
  }, [agents, load]);

  const setActiveId = useCallback(
    (id: string) => {
      setActiveIdState(id);
      if (workspaceId) localStorage.setItem(STORAGE_PREFIX + workspaceId, id);
    },
    [workspaceId]
  );

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  // Stored/selected id wins when it still exists; otherwise fall back to the first agent
  // (covers deleted agents and a fresh workspace with no stored selection).
  const active = useMemo(
    () => agents.find((a) => a.agent37_id === activeId) ?? agents[0] ?? null,
    [agents, activeId]
  );

  return (
    <ActiveAgentContext.Provider value={{ agents, active, role, setActiveId, loading, error, refresh }}>
      {children}
    </ActiveAgentContext.Provider>
  );
}

export function useActiveAgent() {
  const ctx = useContext(ActiveAgentContext);
  if (!ctx) throw new Error("useActiveAgent must be used within an ActiveAgentProvider");
  return ctx;
}
