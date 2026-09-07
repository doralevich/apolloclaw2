"use client";

import Link from "next/link";
import { ArrowRight, Blocks, CalendarClock, Send, UserPlus, type LucideIcon } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { AgentFace } from "@/components/AgentFace";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { HelpFooter } from "@/components/HelpFooter";
import { getAgentType } from "@/config/agent-types";
import { CHANNELS_ENABLED } from "@/config/channels";
import { hiddenForEveryone } from "@/config/nav";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { SetupChecklist } from "@/components/SetupChecklist";
import { ConnectFirstPrompt } from "@/components/ConnectFirstPrompt";
import { cn } from "@/lib/utils";

// The Home page: a launcher, not a metrics dashboard and not a walkthrough.
//
// It replaced the College-style Welcome card (agent intro + three numbered onboarding steps),
// David's call once the redesign settled: a returning customer does not want to be introduced to
// their agent every login, they want one tap into the handful of things they actually do. So the
// page is a greeting and four action tiles - connect Telegram, connect an app, set a schedule,
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
      {/* THE AGENT SPEAKS HERE, David's call. This page used to talk ABOUT the agent in the third
          person - "<agent> is built and ready. It already knows your business" - which is how you
          describe a product to somebody deciding whether to buy it, not how the thing they just
          bought says hello. First person, with its own face beside the words, is the difference
          between a dashboard and meeting somebody.

          Its face sits in the left gutter for the same reason it sits beside every message in the
          transcript: the greeting is a message, and a message has a sender. */}
      <div className="flex items-start gap-4 sm:gap-5">
        <AgentFace
          src={active.avatar_url}
          name={agentName}
          // Twice the size it was (48/56px), David's call. At the old size it read as a byline
          // next to the greeting; at this one it is the agent, and the greeting is what it is
          // saying. The initial-fallback type scales with it - the ratio of letter to circle is
          // kept from the original rather than left at a size that would swim in it.
          className="mt-1 size-24 text-4xl sm:size-28"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hey{userFirstName ? " " : ""}
            {userFirstName && <span className="text-primary">{userFirstName}</span>}.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Nice to meet you. I&apos;m {agentName}, and I already know your business from the
            questionnaire we went through, so{" "}
            <Link
              href="/dashboard/chat"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              let&apos;s start a conversation
            </Link>{" "}
            and get right to work.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">
            The four below are worthy of 20 minutes today. The first is the one that changes how it
            feels to own: reach me from your phone, the way you would a colleague.
          </p>
        </div>
      </div>

      {/* ABOVE THE TILES, and only until something is connected.

          The tiles are the same four for everybody and none of them is urgent. This is: four of
          the five procedure skills we ship stop on their first step without a calendar, so an
          agent with nothing connected cannot do the things it was sold on. It disappears for good
          the moment anything is connected, and "Not now" hides it for anyone who means it. */}
      <ConnectFirstPrompt agentId={active.agent37_id} agentName={agentName} />

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
            desc="Message me from your phone like you would a colleague. About two minutes to set up."
          />
        )}
        {/* These two follow the product-wide switch in config/nav.ts, the same way the Telegram
            tile follows the channels flag and for the same reason: a section taken out of the
            product should not still be advertised from its front page. The PER-PERSON setting is
            deliberately not consulted here - hiding a rail row is a tidying preference, and it
            must not quietly delete the route somebody was pointed at. */}
        {!hiddenForEveryone("/dashboard/integrations") && (
          <LauncherTile
            href="/dashboard/integrations"
            icon={Blocks}
            title="Connect an app"
            desc="Give me access to your mail, calendar, or files so I can work in them for you."
          />
        )}
        {/* Points at the new My Schedule tab rather than the checklist it used to open. */}
        {!hiddenForEveryone("/dashboard/schedule") && (
          <LauncherTile
            href="/dashboard/schedule"
            icon={CalendarClock}
            title="Set a schedule"
            desc="Have me run on my own, like a numbers recap every Monday morning."
          />
        )}
        <LauncherTile
          href="/dashboard/settings/members"
          icon={UserPlus}
          title="Invite a teammate"
          desc="Add someone from your team to this workspace."
        />
      </div>

      {/* The checklist, summarised, under the tiles. David's call, and it answers the question
          that prompted it: whether the Checklist needs to be a tab of its own at all.

          The four tiles above are the same for everybody. This is the part that is not - it is
          built from the customer's own intake answers, so it names their apps and their handovers.
          A progress bar and the next three unfinished things, never the whole list: printing all
          of it would make Home and the Checklist the same page, with the greeting as the longer
          of the two.

          The component already existed and had been rendering nowhere since Home became a
          launcher. Same useChecklist hook the full page uses, so the two can never disagree about
          the count. */}
      <SetupChecklist agentId={active.agent37_id} />

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
