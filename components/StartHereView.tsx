"use client";

import Link from "next/link";
import { Blocks, Bot, MessageSquare, Sparkles } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { getAgentType } from "@/config/agent-types";
import { Button } from "@/components/ui/button";
import { CreateAgentModal } from "@/components/CreateAgentModal";

// The permanent landing page for the active agent — shown every time "Start Here" is
// clicked, not just once after provisioning. BuildScreen sends a freshly-provisioned
// customer here first (instead of straight to the Agents table) so their first look at
// the dashboard is a greeting for the agent they just built, not a table row.
export function StartHereView() {
  const { current } = useWorkspace();
  const { agents, active, loading } = useActiveAgent();

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (agents.length === 0 || !active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No agents in this workspace yet. Your Apollo Agent is created for you once your
          license purchase and setup questionnaire are complete.
        </p>
        <div className="mt-4 flex justify-center">
          <CreateAgentModal />
        </div>
      </div>
    );
  }

  const type = active.agent_type ? getAgentType(active.agent_type) : undefined;
  const agentName = active.name?.trim() || type?.label || "Your agent";

  const steps = [
    {
      icon: MessageSquare,
      title: "Start chatting",
      body: `Head to the Chat tab and start talking. ${agentName} already knows your business from your setup questionnaire.`,
    },
    {
      icon: Blocks,
      title: "Connect your tools",
      body: `Link your calendar, email, and other apps from the Integrations tab so ${agentName} can act on your behalf.`,
    },
    {
      icon: Sparkles,
      title: "Ask something",
      body: `Try asking about your business, your priorities, or anything from your setup questionnaire — ${agentName} is ready.`,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start gap-4 rounded-lg border bg-card p-6">
        {active.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.avatar_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Hey! I&apos;m {agentName}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {type?.description || "Your new AI agent, built for your business."}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What to do next
        </h2>
        <ol className="mt-3 divide-y rounded-lg border">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex items-start gap-4 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {step.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/chat">Open Chat</Link>
        </Button>
      </div>
    </div>
  );
}
