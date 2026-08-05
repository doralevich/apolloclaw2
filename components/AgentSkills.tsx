"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { SKILL_FAMILIES, AGENT_SKILLS } from "@/config/skills";
import { cn } from "@/lib/utils";

// What the agent can do, on the page about the agent.
//
// WHY THIS EXISTS. Fifty-eight skills are written onto every agent at provision time and nothing
// in the product has ever shown them. A customer paid for something that can run a pre-mortem, a
// board-of-advisors review, a thirteen-week cash flow — and had no way to find that out except by
// guessing the right question. This is the answer to "what did I actually buy".
//
// IT READS FROM THE SAME REGISTRY THAT INSTALLS THEM. config/skills is the one source: the flat
// list is what gets written to the box, the families are what get read here. A skill cannot be
// installed and missing from this list, or listed and never installed.
//
// WHAT IT DOESN'T CLAIM. It does not report what is on the instance right now — that would be an
// exec call per page load, and the honest phrasing costs nothing: these are the skills this agent
// SHIPS WITH. If an install went wrong, the admin Install action is what fixes it, and the fix
// belongs there rather than in a status badge here.

export function AgentSkills({ agentName }: { agentName: string }) {
  // Closed by default, one at a time. Fifty-eight expanded is a wall, and the families are the
  // level a customer scans at — "it can do finance" lands before "it has a runway calculator".
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </span>
          <div>
            <h2 className="text-base font-semibold">What {agentName} knows how to do</h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              {AGENT_SKILLS.length} skills, built in. You don&apos;t switch them on — ask for one
              in the chat and it&apos;s used.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/chat"
          className="shrink-0 text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Try one
        </Link>
      </div>

      <div className="border-t">
        {SKILL_FAMILIES.map((family) => {
          const isOpen = open === family.title;
          return (
            <div key={family.title} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : family.title)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{family.title}</span>
                    <span className="text-xs text-muted-foreground">{family.skills.length}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{family.blurb}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <ul className="grid gap-x-6 gap-y-3 px-5 pb-5 pt-1 sm:grid-cols-2">
                  {family.skills.map((skill) => (
                    <li key={skill.slug} className="flex gap-2.5">
                      <span aria-hidden className="mt-0.5 shrink-0 text-base leading-none">
                        {skill.emoji}
                      </span>
                      <div className="min-w-0">
                        {/* The slug, spaced out. It is what the runtime lists the skill under, so
                            somebody reading their agent's own output sees the same words here. */}
                        <div className="text-sm font-medium">{skill.slug.replace(/-/g, " ")}</div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
