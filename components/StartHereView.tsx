"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { AgentAvatarPicker } from "@/components/AgentAvatarPicker";
import { SetupChecklist } from "@/components/SetupChecklist";
import { getAgentType } from "@/config/agent-types";
import { Button } from "@/components/ui/button";
import { CreateAgentModal } from "@/components/CreateAgentModal";

// The permanent landing page for the active agent — shown every time "Start Here" is clicked,
// not just once after provisioning. BuildScreen sends a freshly-provisioned customer here first
// (instead of straight to the Agents table) so their first look at the dashboard is a greeting
// for the agent they just built, not a table row.
//
// Laid out after The College Agent's version, at David's request: one card, the agent
// introducing itself by name, then three numbered steps in the order somebody actually does
// them. What that shape buys over the previous pile of cards is a stated ORDER. Before, the
// page offered several equal-weight things and left the sequencing to the reader — so the
// commonest outcome was opening chat first and asking an agent with nothing connected to do
// something it had no way to do.
//
// The three steps live in SetupChecklist, which ticks them off against real state. They were
// static prose here first — a list that does not know what you have done is a poster, not a
// checklist, and it would have told somebody to connect their tools a week after they did.
//
// It is also what points at Channels now: the channels panel used to sit on this page and
// David has taken it off, so the checklist's second item is the only route to it from here.
export function StartHereView() {
  const { current, userFirstName } = useWorkspace();
  const { agents, active, loading } = useActiveAgent();

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (agents.length === 0 || !active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No agents in this workspace yet. Your Apollo Agent is created for you once your license
          purchase and setup questionnaire are complete.
        </p>
        <div className="mt-4 flex justify-center">
          <CreateAgentModal />
        </div>
      </div>
    );
  }

  const type = active.agent_type ? getAgentType(active.agent_type) : undefined;
  const agentName = active.name?.trim() || type?.label || "your agent";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          {/* Still the picker, not a static illustration. The picture used to be a one-shot
              choice made during the questionnaire, before anyone had spoken to their agent. */}
          <div className="shrink-0">
            <AgentAvatarPicker
              agentId={active.agent37_id}
              currentUrl={active.avatar_url}
              agentName={agentName}
              size="lg"
              portrait
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Hey{userFirstName ? " " : ""}
              {/* The one coloured word on the page. Their name, not the agent's — the agent is
                  the one talking, so emphasising its own name would be the wrong voice. */}
              {userFirstName && <span className="text-primary">{userFirstName}</span>}, I&apos;m{" "}
              {agentName}.
            </h1>
            <p className="mt-3 text-muted-foreground">
              I am built around your business rather than trained on it in general — your people,
              your stack, the things that keep going wrong. Three things make me useful, and
              they go in this order.
            </p>
          </div>
        </div>

        <SetupChecklist agentId={active.agent37_id} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard/chat">
            <MessageSquare /> Open Chat
          </Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Talk to {agentName} the way you&apos;d talk to someone who works for you. The more you
          say about how you want things done, the less you&apos;ll have to repeat yourself.
        </p>
      </div>
    </div>
  );
}
