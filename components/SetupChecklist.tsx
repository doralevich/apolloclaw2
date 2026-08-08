"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { connectHref, type ChecklistIcon } from "@/config/checklist";
import { useChatContext } from "@/components/chat/ChatProvider";
import { useChecklist } from "@/lib/useChecklist";

// The checklist, summarised, inside the Start Here greeting.
//
// Deliberately not the whole list. Start Here is a greeting and the checklist can now run to a
// dozen items built from somebody's intake answers — printing all of them here would make the
// two pages the same page, and the greeting the longer of them.
//
// So: a progress bar, and the next three things that are not done. Three because it is enough to
// see what kind of work is left without becoming the list itself.
function ItemIcon({ icon }: { icon: ChecklistIcon }) {
  if (icon.kind === "logo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon.src} alt="" loading="lazy" className="size-4 rounded object-contain" />;
  }
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon.name] ?? Icons.Sparkles;
  return <Cmp className="size-4 text-muted-foreground" />;
}

export function SetupChecklist({ agentId }: { agentId: string }) {
  const { sessions } = useChatContext();
  const { items, doneCount, total, loading } = useChecklist(agentId, sessions.length);

  if (loading && !total) return null;
  if (!total) return null;

  const pct = Math.round((doneCount / total) * 100);
  const next = items.filter((i) => !i.done).slice(0, 3);
  const finished = next.length === 0;

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {finished ? "You are set up" : "Getting set up"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {doneCount} of {total}
        </span>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {finished ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Everything on the checklist is done. Anything else you hand over from here is a bonus.
        </p>
      ) : (
        // Rows, not bullets. Each one goes straight to the place that finishes it, so the
        // summary is usable rather than a table of contents pointing at another page.
        <div className="mt-4 space-y-1.5">
          {next.map((item) => {
            // An app row IS the connection now, not a signpost to it.
            //
            // It used to go to /dashboard/integrations, where you then had to find the same app
            // again and press Connect - two screens and a search to do the one thing the row was
            // already naming. This is the same server-side redirect the Connections page uses,
            // as a plain anchor: no fetch, no token in the browser, and no way for the two to
            // disagree about how anything connects.
            //
            // Rows without a toolkit still navigate, because there is nothing to start: a
            // channel needs a bot token pasted in, and a handover happens in a conversation.
            const connects = !!item.toolkitSlug;
            const className =
              "group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60";
            const body = (
              <>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary/70">
                  <ItemIcon icon={item.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                {connects ? (
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
              </>
            );

            return connects ? (
              <a
                key={item.id}
                href={connectHref(agentId, item.toolkitSlug!)}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {body}
              </a>
            ) : (
              <Link key={item.id} href={item.href} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      )}

      {/* "Open the checklist ->" was here and is gone at David's call. Welcome grew a proper
          Open Checklist button under the card, so this was the same destination offered twice on
          one screen - and the small text link was the weaker of the two. */}
    </div>
  );
}
