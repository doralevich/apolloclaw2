"use client";

import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { AgentAvatarPicker } from "@/components/AgentAvatarPicker";
import { SetupChecklist } from "@/components/SetupChecklist";
import { AddToPhoneCard } from "@/components/AddToPhoneCard";
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start gap-4 rounded-lg border bg-card p-6">
        {/* Click to change — the picture used to be a one-shot choice made during the
            questionnaire, before anyone had spoken to their agent. */}
        <AgentAvatarPicker
          agentId={active.agent37_id}
          currentUrl={active.avatar_url}
          agentName={agentName}
        />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Hey! I&apos;m {agentName}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            I&apos;ve read your setup questionnaire, so I already know your business, what you&apos;re
            trying to fix, and how you like things written. You don&apos;t have to explain any of
            that first.
          </p>
        </div>
      </div>

      {/* The connect shelves that were here moved to the chat's empty state, where somebody about
          to type a question can act on them. That still holds — the rail is where you CONNECT.
          What was missing is anyone ASKING: a customer who never opens the rail never learns that
          an agent with no mailbox can only give advice. So the shelves stay gone and this asks
          the question instead, by name, in the order somebody would actually do them. */}
      <SetupChecklist agentId={active.agent37_id} />

      {/* A "Now what?" grid of six opening questions sat here, and a "Connect your tools" card
          beside the one below. Both are gone, and for the same reason: this page now has ONE job.
          An agent with nothing connected cannot do any of the six things that grid suggested, so
          offering them first taught people the agent was a chatbot — which is precisely what the
          grid was added to prevent. The questions still exist, one click away under the Guide,
          where they are useful to somebody who has finished setting up. */}
      <div className="grid gap-3">
        <Link
          href="/dashboard/guide"
          className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/25"
        >
          <Sparkles className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="font-medium">Things to ask {agentName}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {/* Was "plus what the words around here mean" — the Guide's glossary was deleted
                  along with config/glossary.ts, so this promised a section that isn't there. */}
              A full list of openers, grouped by what you&apos;re trying to get done. Worth a look
              once the connections above are in.
            </p>
          </div>
        </Link>
      </div>

      {/* Below the setup checklist and the Guide link, above the call to open chat: this is a
          convenience, not a step, and it should not sit between somebody and the thing they
          came here to do. Hides itself once installed, or if dismissed. */}
      <AddToPhoneCard />

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
