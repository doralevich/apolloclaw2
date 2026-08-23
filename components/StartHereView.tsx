"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Blocks, CalendarClock, MessageSquare, UserPlus, type LucideIcon } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useLoginCount, gettingStartedRetired } from "@/lib/useLoginCount";
import { HelpFooter } from "@/components/HelpFooter";
import { getAgentType } from "@/config/agent-types";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { cn } from "@/lib/utils";

// The Home page: a launcher, not a metrics dashboard and not a walkthrough.
//
// It replaced the College-style Welcome card (agent intro + three numbered onboarding steps),
// David's call once the redesign settled: a returning customer does not want to be introduced to
// their agent every login, they want one tap into the handful of things they actually do. So the
// page is a greeting and four action tiles - start a conversation, set a schedule, connect an app,
// invite a teammate - each going straight to the surface that does it. The setup guidance the old
// steps carried still lives on the Checklist tab; nothing was lost, it moved to the page built for
// it.
export function StartHereView() {
  const { current, userFirstName } = useWorkspace();
  const { agents, active, loading } = useActiveAgent();
  const router = useRouter();

  // Retire the home for a returning customer. /dashboard still redirects here, so this is where
  // "get rid of it after the fourth login" happens: once the user has an agent and has signed in
  // enough times, bounce straight to Chat, the page they come back for. With no agent we do not
  // redirect - this page is how they build one, so it stays.
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hey{userFirstName ? " " : ""}
          {userFirstName && <span className="text-primary">{userFirstName}</span>}.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          What would you like {agentName} to take off your plate?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LauncherTile
          primary
          href="/dashboard/chat"
          icon={MessageSquare}
          title="Start a conversation"
          desc={`Ask ${agentName} to draft an email, summarize a document, or chase an invoice - whatever is on your plate.`}
        />
        <LauncherTile
          href="/dashboard/checklist"
          icon={CalendarClock}
          title="Set a schedule"
          desc={`Have ${agentName} run on its own, like a numbers recap every Monday morning.`}
        />
        <LauncherTile
          href="/dashboard/integrations"
          icon={Blocks}
          title="Connect an app"
          desc={`Give ${agentName} access to your mail, calendar, or files so it can work in them for you.`}
        />
        <LauncherTile
          href="/dashboard/settings/members"
          icon={UserPlus}
          title="Invite a teammate"
          desc="Add someone from your team to this workspace."
        />
      </div>

      <HelpFooter />
    </div>
  );
}

// One action tile. The primary one (Start a conversation) is filled; the rest are outlined. The
// whole tile is the link, with the arrow only there to say so.
function LauncherTile({
  href,
  icon: Icon,
  title,
  desc,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-4 rounded-xl border p-5 transition-colors",
        primary
          ? "border-primary bg-primary text-primary-foreground hover:brightness-110"
          : "bg-card hover:border-foreground/20"
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg",
          primary ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-base font-semibold">{title}</span>
          <ArrowRight
            className={cn(
              "size-4 transition-transform group-hover:translate-x-0.5",
              primary ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          />
        </span>
        <span
          className={cn(
            "mt-1 block text-sm leading-relaxed",
            primary ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {desc}
        </span>
      </span>
    </Link>
  );
}
