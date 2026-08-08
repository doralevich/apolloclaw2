"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, Check, ExternalLink, MessageSquare } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useChatContext } from "@/components/chat/ChatProvider";
import { useChecklist, type ResolvedItem } from "@/lib/useChecklist";
import { CHECKLIST_CATEGORIES, connectHref, type ChecklistIcon } from "@/config/checklist";
import { Button } from "@/components/ui/button";
import { SchedulePanel } from "@/components/SchedulePanel";
import { HelpFooter } from "@/components/HelpFooter";
import { cn } from "@/lib/utils";

// The checklist page.
//
// It was a column of grey text with a small link under each line, which read as a document
// rather than something to use. Three things fixed that, and they are all about making a row
// look like the thing it is:
//
//   A TILE AT THE FRONT. Product logos where they exist — a HubSpot row carrying the HubSpot
//   mark is recognisable before you have read a word, which "Connect HubSpot" in body text
//   never was. Lucide icons everywhere else, so no row is a bare paragraph.
//
//   THE WHOLE ROW IS THE TARGET. A 90px-wide text link at the bottom of a 4-line block is a
//   small target reached by reading first. The row is the link now, with the arrow only there
//   to say so.
//
//   DONE LOOKS FINISHED RATHER THAN DELETED. Struck-through grey said "cancelled". A filled
//   tick and a receded tile says "that one is behind you", which is what a checklist is for.

function ItemIcon({ icon, className }: { icon: ChecklistIcon; className?: string }) {
  if (icon.kind === "logo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon.src} alt="" loading="lazy" className={cn("size-6 rounded object-contain", className)} />;
  }
  // Resolved by name so config/checklist.ts stays JSX-free and server-safe, the same split
  // config/agent-types makes. Unknown names fall back rather than crashing the page.
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon.name] ?? Icons.Sparkles;
  return <Cmp className={cn("size-5", className)} />;
}

export function ChecklistView() {
  const { active, loading: loadingAgent } = useActiveAgent();
  const { sessions } = useChatContext();
  const agentId = active?.agent37_id ?? "";
  const { items, doneCount, total, personalized, loading, toggle } = useChecklist(
    agentId,
    sessions.length
  );

  if (loadingAgent) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No agent in this workspace yet. The checklist appears once yours is built.
        </p>
      </div>
    );
  }

  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const complete = total > 0 && doneCount === total;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">
              {complete ? "You are set up." : "Getting set up"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {personalized
                ? "Built from what you told us at onboarding, so it only lists what applies to you."
                : "The essentials, in the order they matter."}
            </p>
          </div>
          {/* The number, at the size the number deserves. A progress bar with the count buried
              in 12px grey underneath made the one fact people came for the smallest thing here. */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-semibold tabular-nums">
              {doneCount}
              <span className="text-muted-foreground">/{total}</span>
            </div>
            <div className="text-xs text-muted-foreground">{pct}% done</div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        CHECKLIST_CATEGORIES.map((cat) => {
          const rows = items.filter((i) => i.category === cat);
          // Connect survives an empty item list: the channel cards live under it and a customer
          // with no intake answers still has to be able to reach them.
          if (!rows.length && cat !== "Connect your tools") return null;
          const catDone = rows.filter((r) => r.done).length;
          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between gap-3 px-1 pb-2.5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat}
                </h2>
                {rows.length > 0 && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {catDone}/{rows.length}
                  </span>
                )}
              </div>
              {/* Apps two-up, everything else full width - the layout David picked.
                  An app card is logo, name, one line and a button, which is narrow content: at
                  full width the button ends up a long way from the name it belongs to. A channel
                  or a handover carries more text and earns the whole row. */}
              {rows.some((r) => r.toolkitSlug) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {rows
                    .filter((r) => r.toolkitSlug)
                    .map((item) => (
                      <Row
                        key={item.id}
                        item={item}
                        agentId={agentId}
                        onToggle={() => toggle(item)}
                      />
                    ))}
                </div>
              )}

              <div className="mt-2 space-y-2">
                {rows
                  .filter((r) => !r.toolkitSlug)
                  .map((item) => (
                    <Row key={item.id} item={item} agentId={agentId} onToggle={() => toggle(item)} />
                  ))}
              </div>

              {/* Says why the apps are missing rather than leaving a gap. Only under Connect, and
                  only when nothing was on file — an agent built outside the licence questionnaire
                  has no answers to read, which is otherwise invisible and reads as a bug. */}
              {cat === "Connect your tools" && !personalized && (
                <div className="mt-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No apps came through from your onboarding answers, so there is nothing to list
                  here yet.{" "}
                  <Link href="/dashboard/integrations" className="font-medium text-primary hover:underline">
                    Browse Connections
                  </Link>{" "}
                  to connect whatever you use.
                </div>
              )}

              {cat === "Connect your tools" && <ScheduleBlock agentId={agentId} />}
            </section>
          );
        })
      )}

      {/* Chat is not a step. "Ask it something real" was the last row of a list, which put the
          point of the product behind everything else and made it something to tick rather than
          something to do. It is a button now, reachable at any point down the page. */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <Button asChild size="lg">
          <Link href="/dashboard/chat">
            <MessageSquare /> Open Chat
          </Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          You do not have to finish the list first - it works better with connections, but it
          works now.
        </p>
      </div>

      <HelpFooter />
    </div>
  );
}

// The schedule, where the channel cards used to be. David's call, and the swap is the right way
// round.
//
// The channel cards were the Channels page's own component, embedded here so the two could not
// drift. That was true and still left this page duplicating a whole page of the dashboard: the
// checklist already carries a "choose where it answers you" row that links to Channels, so the
// cards below it were the same job done twice, and they were the longest thing on the screen.
//
// A schedule is the opposite case. It has no row of its own, it is the step people do not think
// to look for, and it is the difference between an agent that answers when spoken to and one
// that turns up on its own on Monday morning - which is the thing customers say sold them. It
// belongs on the list of things worth setting up.
//
// Same reuse rule as before: the Channels page's SchedulePanel, not a copy of it.
function ScheduleBlock({ agentId }: { agentId: string }) {
  return (
    <div className="mt-2">
      <SchedulePanel agentId={agentId} />
    </div>
  );
}

function Row({
  item,
  agentId,
  onToggle,
}: {
  item: ResolvedItem;
  agentId: string;
  onToggle: () => void;
}) {
  const derived = !!item.derived;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors",
        item.done ? "border-primary/25 bg-primary/[0.03]" : "hover:border-foreground/20"
      )}
    >
      {/* The tile. Carries the tick when done, so completion reads at the front of the row where
          the eye already is, rather than as a second marker competing with the icon. */}
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg border transition-colors",
          item.done ? "border-primary bg-primary text-primary-foreground" : "bg-secondary/60"
        )}
      >
        {item.done ? <Check className="size-5" /> : <ItemIcon icon={item.icon} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className={cn("font-semibold leading-tight", item.done && "text-muted-foreground")}>
            {item.title}
          </h3>
          {derived && item.done && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Connected
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>

        {!item.done &&
          (item.toolkitSlug ? (
            // The actual connection, here. This is the same server-side redirect the Connections
            // page uses — a plain anchor, so no fetch and no token in the browser — which means
            // connecting Gmail is one press on this page rather than a trip to another one.
            <Button asChild size="sm" className="relative z-10 mt-2.5 h-8">
              <a
                href={connectHref(agentId, item.toolkitSlug)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.cta}
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          ) : (
            // The whole row is the target for everything else: this stretches over the card, so
            // the tick button stays clickable by sitting above it.
            <Link
              href={item.href}
              className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-primary after:absolute after:inset-0 after:content-[''] hover:underline"
            >
              {item.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
      </div>

      {/* Self-reported only. A derived row has nothing to toggle - its tile already says what we
          can see — and a checkbox that refused every click would be worse than no checkbox. */}
      {!derived && (
        <button
          type="button"
          role="checkbox"
          aria-checked={item.done}
          aria-label={`Mark "${item.title}" as ${item.done ? "not done" : "done"}`}
          onClick={onToggle}
          className={cn(
            "relative z-10 mt-0.5 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            item.done
              ? "border-primary/30 text-primary hover:bg-primary/5"
              : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "flex size-3.5 items-center justify-center rounded-full border",
              item.done ? "border-primary bg-primary text-primary-foreground" : "border-current"
            )}
          >
            {item.done && <Check className="size-2.5" />}
          </span>
          {item.done ? "Done" : "Mark done"}
        </button>
      )}
    </div>
  );
}
