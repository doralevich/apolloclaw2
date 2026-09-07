"use client";

import Link from "next/link";
import { ArrowRight, Blocks, CalendarClock, Send, UserPlus, type LucideIcon } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { HelpFooter } from "@/components/HelpFooter";
import { getAgentType } from "@/config/agent-types";
import { CHANNELS_ENABLED } from "@/config/channels";
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
//
// It ALWAYS shows now (David's call): the earlier "retire after the fourth login" redirect is gone,
// because a launcher is a home you come back to, not a getting-started page you outgrow.
export function StartHereView() {
  const { current, userFirstName } = useWorkspace();
  const { agents, active, loading } = useActiveAgent();

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;
  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

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
        {/* A WELCOME, not just a prompt, David's call. The line here used to be "What would you
            like <agent> to take off your plate?" - a question asked of somebody who may have
            owned the thing for four minutes and does not yet know what it can take. It reads as
            a search box, not a greeting.

            So: say what they have, say the one thing worth doing first, and point at chat in a
            sentence rather than spending a tile on it. Chat sits directly under Home on the rail
            and is the one destination nobody needs a tile to find; the four tiles below are the
            setup somebody actually has to be told about. */}
        <p className="mt-3 text-lg text-muted-foreground">
          {agentName} is built and ready. It already knows your business from the setup
          questionnaire, so you can{" "}
          <Link href="/dashboard/chat" className="font-medium text-primary underline-offset-4 hover:underline">
            start a conversation
          </Link>{" "}
          right now and put it to work.
        </p>
        <p className="mt-2 text-lg text-muted-foreground">
          The four below are worth twenty minutes today. The first is the one that changes how it
          feels to own: reach it from your phone, the way you would a colleague.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Telegram first, David's call, and it earns the position: it is the difference between
            a website somebody visits and an assistant they have. Hidden when the channels
            feature is off, because a tile leading to a 404 is worse than no tile. */}
        {CHANNELS_ENABLED && (
          <LauncherTile
            primary
            href="/dashboard/channels?open=telegram"
            icon={Send}
            title="Connect it to Telegram"
            desc={`Message ${agentName} from your phone like you would a colleague. About two minutes to set up.`}
          />
        )}
        <LauncherTile
          href="/dashboard/integrations"
          icon={Blocks}
          title="Connect an app"
          desc={`Give ${agentName} access to your mail, calendar, or files so it can work in them for you.`}
        />
        {/* Points at the new My Schedule tab rather than the checklist it used to open. */}
        <LauncherTile
          href="/dashboard/schedule"
          icon={CalendarClock}
          title="Set a schedule"
          desc={`Have ${agentName} run on its own, like a numbers recap every Monday morning.`}
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
