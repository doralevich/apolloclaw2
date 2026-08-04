"use client";

import { BookOpen, MessagesSquare } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ShortcutCard } from "@/components/ShortcutCard";
import { GLOSSARY, type GlossaryTerm } from "@/config/glossary";
import { fillShortcut, SHORTCUT_GROUPS } from "@/config/shortcuts";

// The Guide: what to say, and what the words mean.
//
// David's framing, and it's the right one — these are the same problem. A customer who doesn't
// know what to ask and a customer who doesn't know what "credits" means are both stuck for the
// same reason, and splitting them across two pages means neither gets found.
//
// Shortcuts first. Someone arriving here is far more likely to be looking for something to do
// than for a definition, and the definitions are what you scroll to when a word stops you.

export function GuideView() {
  const { active } = useActiveAgent();
  const agentName = active?.name?.trim() || "your agent";

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Things to ask {agentName}, and what the words on these pages mean.
        </p>
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

      {/* ── Glossary ──────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold" id="glossary">
              What the words mean
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plain English for the terms on your Credits page and around the dashboard.
            </p>
          </div>
        </div>

        <dl className="divide-y rounded-xl border bg-card">
          {GLOSSARY.map((term: GlossaryTerm) => (
            <div key={term.term} className="p-4 sm:flex sm:gap-6">
              <dt className="text-sm font-semibold sm:w-48 sm:shrink-0">{term.term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground sm:mt-0">{term.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
