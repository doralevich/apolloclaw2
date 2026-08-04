"use client";

import { MessagesSquare } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ShortcutCard } from "@/components/ShortcutCard";
import { fillShortcut, SHORTCUT_GROUPS } from "@/config/shortcuts";

// The Guide: what to say.
//
// This page also carried a "What the words mean" glossary. It's gone, and config/glossary.ts
// with it. Someone opening the Guide is looking for something to do, not for a definition, and
// a wall of vocabulary underneath the shortcuts mostly served to make the page long. Terms that
// genuinely need explaining should be explained where they appear — Usage already says what its
// own numbers mean — rather than collected on a page nobody visits to look one up.

export function GuideView() {
  const { active } = useActiveAgent();
  const agentName = active?.name?.trim() || "your agent";

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">Things to ask {agentName}.</p>
      </div>

      {/* ── Shortcuts ─────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <MessagesSquare className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Things to say</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click any of these to open the chat with it typed out — then edit it or send it as
              is. {agentName} already knows your business, so you can talk the way you would to
              someone who works for you.
            </p>
          </div>
        </div>

        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.id}>
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fillShortcut(group.blurb, agentName)}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.shortcuts.map((s) => (
                <ShortcutCard key={s.id} shortcut={s} agentName={agentName} />
              ))}
            </div>
          </div>
        ))}

        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          None of these are commands — there is no list of supported phrases. Ask in your own
          words. The more you tell {agentName} about how you want things done, the less you have
          to explain next time.
        </p>
      </section>
    </div>
  );
}
