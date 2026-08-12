"use client";

import { useChecklist } from "@/lib/useChecklist";
import type { MergedAgent } from "@/lib/types";

// The three Welcome steps' done-ness, in ONE place, so the Welcome page and the sidebar can
// never disagree about whether the greeting is finished with.
//
// StartHereView renders these three as numbered steps; DashboardShell reads `allDone` to drop
// the "Welcome" tab off the rail once they're all ticked — David's call that a customer who has
// answered setup, connected a tool and had a first conversation has no more use for the greeting.
//
// Two of the three signals are free (setup_completed rides on the active agent, the session
// count on chat context). Only "a tool is connected" needs a fetch, and that's the SAME
// useChecklist the Checklist page and Start Here already run — reused here rather than a fourth
// copy of "what counts as connected", which is the exact drift useChecklist exists to prevent.
export interface WelcomeCompletion {
  setupDone: boolean;
  toolDone: boolean;
  chatDone: boolean;
  /** All three done AND there is an agent to have done them — false while still loading. */
  allDone: boolean;
}

export function useWelcomeComplete(
  active: MergedAgent | null | undefined,
  sessionCount: number
): WelcomeCompletion {
  // Empty id when there's no agent yet: useChecklist no-ops rather than fetching a bad URL, and
  // allDone stays false (nothing to complete), so the Welcome tab shows for a new customer.
  const { items } = useChecklist(active?.agent37_id ?? "", sessionCount);

  const setupDone = active?.setup_completed === true;
  // Done the moment ANY real tool connection exists — same rule Start Here uses for the step.
  const toolDone = items.some((i) => i.derived?.startsWith("toolkit:") && i.done);
  const chatDone = sessionCount > 0;

  return {
    setupDone,
    toolDone,
    chatDone,
    allDone: Boolean(active) && setupDone && toolDone && chatDone,
  };
}
