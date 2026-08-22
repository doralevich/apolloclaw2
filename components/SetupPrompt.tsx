"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAgentType } from "@/config/agent-types";
import type { MergedAgent } from "@/lib/types";

/** A blank build has no questionnaire (agent-types `noSetup`), so "finish setup" is meaningless
 *  for it and the link would 404. Treat it as not-needing-setup wherever the nag is decided. */
function needsSetup(a: MergedAgent): boolean {
  return (
    a.setup_completed === false &&
    !!a.agent_type &&
    !getAgentType(a.agent_type)?.noSetup
  );
}

// Surfaces agents whose setup questionnaire has not been completed.
//
// Before this existed nothing in the dashboard read agent_setup at all, so a customer could buy
// an agent, skip the questionnaire, and never be told — leaving an agent running with no
// business context and no visible reason why it felt generic.
//
// Setup is per agent, not per workspace: each type asks its own questions, because what makes a
// CEO agent useful is not what a CFO agent needs.

/** Agents still missing their questionnaire. `undefined` (lookup failed) is treated as done, and
 *  a blank build (noSetup) never counts - it has no questionnaire to miss. */
export function agentsNeedingSetup(agents: MergedAgent[]): MergedAgent[] {
  return agents.filter(needsSetup);
}

export function SetupBanner({ agents }: { agents: MergedAgent[] }) {
  const pending = agentsNeedingSetup(agents);
  if (pending.length === 0) return null;

  const one = pending.length === 1 ? pending[0] : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">
          {one
            ? `${one.name} isn't set up yet`
            : `${pending.length} agents aren't set up yet`}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {one
            ? "It's running, but it doesn't know anything about your business until you answer a few questions."
            : "They're running, but they don't know anything about your business until you answer a few questions for each."}
        </p>
      </div>
      {one && (
        <Button asChild size="sm" className="shrink-0">
          <Link href={`/onboard/${one.agent_type}`}>Finish setup</Link>
        </Button>
      )}
    </div>
  );
}

/** Inline cell for the agents table. */
export function SetupCell({ agent }: { agent: MergedAgent }) {
  if (agent.setup_completed === undefined) return <span className="text-muted-foreground">-</span>;

  // A blank build has no questionnaire, so there is nothing to finish and nowhere to link.
  if (agent.agent_type && getAgentType(agent.agent_type)?.noSetup) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (!agent.setup_completed) {
    return agent.agent_type ? (
      <Link
        href={`/onboard/${agent.agent_type}`}
        className="text-sm font-medium underline underline-offset-4"
      >
        Finish setup
      </Link>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  }

  // Answered, but not yet pushed into the running agent. Usually transient — the injection
  // happens in an after() hook once the questionnaire is submitted.
  if (!agent.setup_injected) {
    return <span className="text-muted-foreground">Applying…</span>;
  }

  return <span className="text-muted-foreground">Complete</span>;
}
