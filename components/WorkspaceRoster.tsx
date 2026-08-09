"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { isTransitional } from "@/lib/format";
import { cn } from "@/lib/utils";

// The admin's view of the team's agents: who each one belongs to, by name, and whether it has
// been set up. David's ask - "a dashboard of their agents with information and necessary data.
// First name and last name are important."
//
// A table, deliberately, where My Agent uses cards. The card answers "how is MY agent doing";
// this answers "across everyone I'm paying for, who has what and who never finished setup" -
// a scanning question, and scanning is what tables are for.
//
// Renders nothing for non-admins and nothing below two agents: a roster of one is the card
// directly above it, restated.

interface RosterAgent {
  agent37_id: string;
  name: string | null;
  avatar_url: string | null;
  status: string | null;
  created_at: string;
  owner: { first_name: string; last_name: string; email: string } | null;
  setup_complete: boolean;
}

function statusDot(status: string | null): string {
  if (status === "running") return "bg-emerald-500";
  if (isTransitional(status)) return "bg-amber-500";
  if (status === "failed" || status === "error") return "bg-destructive";
  return "bg-muted-foreground/40";
}

export function WorkspaceRoster({ role }: { role: string | null }) {
  const { current } = useWorkspace();
  const [agents, setAgents] = useState<RosterAgent[] | null>(null);

  const workspaceId = role === "admin" ? current?.id : undefined;
  useEffect(() => {
    if (!workspaceId) return;
    apiFetch<{ agents: RosterAgent[] }>(`/api/workspaces/${workspaceId}/roster`)
      .then((res) => setAgents(res.agents))
      .catch(() => setAgents(null));
  }, [workspaceId]);

  if (!workspaceId || !agents || agents.length < 2) return null;

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Your team&apos;s agents</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every agent this workspace pays for, and who each one belongs to.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">Agent</th>
              <th className="px-4 py-2.5 font-semibold">Belongs to</th>
              <th className="px-4 py-2.5 font-semibold">Email</th>
              <th className="px-4 py-2.5 font-semibold">Setup</th>
              <th className="px-4 py-2.5 font-semibold">Added</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => {
              const person = a.owner;
              const fullName = person ? [person.first_name, person.last_name].filter(Boolean).join(" ") : "";
              return (
                <tr key={a.agent37_id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      {a.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.avatar_url} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <Bot className="size-3.5 text-muted-foreground" />
                        </span>
                      )}
                      <span className="font-medium">{a.name || a.agent37_id}</span>
                      <span className={cn("size-2 shrink-0 rounded-full", statusDot(a.status))} aria-hidden />
                    </span>
                  </td>
                  {/* The names David asked for, or an honest dash - never a guessed one. */}
                  <td className="px-4 py-3">{fullName || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person?.email || "—"}</td>
                  <td className="px-4 py-3">
                    {a.setup_complete ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Complete
                      </span>
                    ) : (
                      // The one cell that changes what an admin does next: a seat that was paid
                      // for and never personalised is running generic, and the fix is a nudge.
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Not started
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
