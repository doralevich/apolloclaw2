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
// Step 2 is also how this page went back to ASKING anybody to connect their apps. That prompt
// left with the "What your agent can reach" grid, and without it a customer who never opened
// Connections on their own was never told an agent with no mailbox can only give advice.
const STEPS = [
  {
    title: "Tell me about you",
    body: (agentName: string) =>
      `Open a chat and say what your business does, who you serve, and what you want off your ` +
      `plate. ${agentName} has your questionnaire answers already — this is the detail that ` +
      `never fits in a form.`,
  },
  {
    title: "Connect your tools",
    body: () =>
      "Go to Connections in the sidebar and link the apps you already live in: Gmail, Calendar, " +
      "Drive, Outlook, Dropbox. An agent with no connections can advise. One with connections " +
      "can act.",
  },
  {
    title: "Ask me something real",
    body: () =>
      "Not a test question — something you were going to have to do anyway. That is the fastest " +
      "way to find where it helps, and the Guide has openers grouped by what you are trying to " +
      "get done.",
  },
];

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

        <div className="mt-8 space-y-6 border-t pt-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {i + 1}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body(agentName)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channels stays below the card rather than becoming a fourth step: it is optional in a
          way the three above are not. Somebody who never connects Slack still has a working
          agent; somebody who never connects Gmail does not. */}
      <SetupChecklist agentId={active.agent37_id} />

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
