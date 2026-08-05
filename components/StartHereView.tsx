"use client";

import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { AgentAvatarPicker } from "@/components/AgentAvatarPicker";
import { SetupGrid } from "@/components/SetupGrid";
import { ShortcutCard } from "@/components/ShortcutCard";
import { getAgentType } from "@/config/agent-types";
import { FIRST_MOVES } from "@/config/shortcuts";
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

      {/* Connect first, ask second. The greeting is the introduction; this is the first thing
          there is to DO, and it goes above "Now what?" because most of the good answers to
          "now what" are worth more once the agent can see a calendar and a mailbox. */}
      <SetupGrid agentId={active.agent37_id} />

      {/* The "now what?" problem. Before this, the page said "head to the Chat tab and start
          talking" — which is not an instruction, it's the absence of one. Almost everybody
          opened with "hi", asked something a search engine could answer, decided it was a
          chatbot, and never came back. These are six things to actually say, each one a click
          that opens the chat with the question already typed. */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Now what?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Click any of these and it opens the chat with the question ready — edit it or send it
          as is.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FIRST_MOVES.map((s) => (
            <ShortcutCard key={s.id} shortcut={s} agentName={agentName} />
          ))}
        </div>
      </div>

      {/* "Connect your tools" used to sit alongside this, pointing at the same page the shelves
          above now point at by name. One generic card competing with twelve specific ones is a
          worse version of the same link, so it went. */}
      <Link
        href="/dashboard/guide"
        className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/25"
      >
        <Sparkles className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <div className="font-medium">More things to ask</div>
          <p className="mt-1 text-sm text-muted-foreground">
            The full list, by what you&apos;re trying to get done — plus what the words around here
            mean.
          </p>
        </div>
      </Link>

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
