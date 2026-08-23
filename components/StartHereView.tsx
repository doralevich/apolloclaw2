"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageSquare } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useChatContext } from "@/components/chat/ChatProvider";
import { useWelcomeComplete } from "@/lib/useWelcomeComplete";
import { useLoginCount, gettingStartedRetired } from "@/lib/useLoginCount";
import { AgentAvatarPicker } from "@/components/AgentAvatarPicker";
import { HelpFooter } from "@/components/HelpFooter";
import { getAgentType } from "@/config/agent-types";
import { Button } from "@/components/ui/button";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { cn } from "@/lib/utils";

// The Welcome page, in The College Agent's shape - FOR REAL this time.
//
// David asked for that page three times, and what he kept getting was its ingredients
// rearranged: a greeting, then a progress bar and a "next three items" digest that read as a
// dashboard widget. The College page is not a widget. It is one card that talks: the agent
// introduces itself, walks you through three numbered steps separated by hairlines, and ends
// with a single Open Chat button, centred, inside the card. That shape is what this now is.
//
// The one thing kept from the digest era: the steps still tick themselves against real state
// (questionnaire answered, a tool connected, a first conversation) rather than being static
// prose. A numbered circle becomes a filled check when its step is done - the College page
// never needed that because its steps were instructions, but ours double as progress, and a
// page that tells you to do something you did last week reads as broken.
export function StartHereView() {
  const { current, userFirstName } = useWorkspace();
  const { agents, active, loading } = useActiveAgent();
  const { sessions } = useChatContext();
  const router = useRouter();
  // Same source the sidebar reads to decide whether to keep showing the Welcome tab, and the
  // same checklist the Checklist page uses — so the three can never disagree about what's done.
  const { setupDone, toolDone, chatDone } = useWelcomeComplete(active, sessions.length);

  // Retire the getting-started page for a returning customer. /dashboard still redirects here, so
  // this is where "get rid of it after the fourth login" actually happens: once the user has an
  // agent and has signed in enough times, bounce straight to Chat, the page they come back for.
  // With no agent we do not redirect - Start Here is how they build one, so it stays.
  const { count: loginCount } = useLoginCount();
  const retire = !!active && gettingStartedRetired(loginCount);
  useEffect(() => {
    if (retire) router.replace("/dashboard/chat");
  }, [retire, router]);

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  // Redirecting to Chat: render nothing rather than flashing the page we are retiring.
  if (retire) return null;

  // Reached two ways: a new customer waiting for provisioning, and somebody who deleted their
  // agent to start over. Both get the build button.
  if (agents.length === 0 || !active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          There is no agent in this workspace right now. If you have just bought a license, yours
          is built as soon as the questionnaire is in. If you deleted the last one, you can build
          a fresh one here - your license and hosting are unchanged.
        </p>
        <div className="mt-4 flex justify-center">
          <CreateAgentModal />
        </div>
      </div>
    );
  }

  const type = active.agent_type ? getAgentType(active.agent_type) : undefined;
  const agentName = active.name?.trim() || type?.label || "your agent";

  const setupUrl = active.agent_type
    ? `/onboard/${encodeURIComponent(active.agent_type)}?ws=${encodeURIComponent(current.id)}&agent=${encodeURIComponent(active.agent37_id)}`
    : "/dashboard/checklist";

  // The three steps, each judged from live state.
  const steps: { title: string; body: string; href: string; done: boolean }[] = [
    {
      title: "Tell me about your business",
      body:
        "The setup questions - who you serve, what you run on, what should land on my desk " +
        "instead of yours. Everything I do afterwards is built from these answers, and you can " +
        "come back and change them any time.",
      href: setupUrl,
      done: setupDone,
    },
    {
      title: "Connect your tools",
      body:
        "Your checklist has a Connect button for each app you told us you use - email, " +
        "calendar, files, your CRM. One click each, and I can read what you read.",
      href: "/dashboard/checklist",
      // Done the moment any real connection exists — the point of the step is crossing from
      // zero to one, and the checklist page owns the long tail.
      done: toolDone,
    },
    {
      title: "Ask me something real",
      body:
        "Once email or calendar is connected, try “What's on my calendar this week?” " +
        "and watch. Talk to me the way you'd talk to someone who works for you.",
      href: "/dashboard/chat",
      done: chatDone,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border bg-card p-6 sm:p-10">
        {/* The greeting: face left, words right, the customer's name the one coloured word. */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <div className="shrink-0">
            <AgentAvatarPicker
              agentId={active.agent37_id}
              currentUrl={active.avatar_url}
              agentName={agentName}
              size="lg"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Hey{userFirstName ? " " : ""}
              {userFirstName && <span className="text-primary">{userFirstName}</span>}, I&apos;m{" "}
              {agentName}.
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              I&apos;m built around your business rather than trained on it in general - your
              people, your stack, the things that keep going wrong.
            </p>
          </div>
        </div>

        {/* The numbered steps, College style: circle chip, bold title, muted body, a hairline
            between each. The chip fills with a check once the step's real-world state says done. */}
        <div className="mt-8">
          {steps.map((step, i) => (
            <Link
              key={step.title}
              href={step.href}
              className="group -mx-3 flex items-start gap-4 rounded-lg border-t px-3 py-6 transition-colors first:border-t-0 hover:bg-secondary/40"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  step.done
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {step.done ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-base font-semibold", step.done && "text-muted-foreground line-through decoration-1")}>
                  {step.title}
                </span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">
                  {step.body}
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* One button, centred, inside the card - the College page's ending, kept exactly. */}
        <div className="mt-6 flex justify-center border-t pt-8">
          <Button asChild size="lg" className="px-10">
            <Link href="/dashboard/chat">
              <MessageSquare /> Open Chat
            </Link>
          </Button>
        </div>
      </div>

      <HelpFooter />
    </div>
  );
}
