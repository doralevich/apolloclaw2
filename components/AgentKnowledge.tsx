"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

// "What your agent knows about you" — the setup questionnaire, read back to the person who
// filled it in.
//
// The answers have always been stored and pushed into the instance as USER.md, and nothing
// ever showed them again. So someone who had just paid several thousand pounds had exactly
// one way to find out whether their agent absorbed any of it: ask it in chat and hope. This
// is the receipt.
//
// It is also the fastest route to fixing a wrong answer — "Update your answers" reopens the
// same questionnaire rather than making them describe the correction in conversation.

type Section = { title: string; rows: { label: string; value: string }[] };
type Payload = { sections: Section[]; updated_at: string | null; injected_at: string | null };

export function AgentKnowledge({
  workspaceId,
  agentType,
  agentName,
}: {
  workspaceId: string;
  agentType: string | null;
  agentName: string;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!agentType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-on-prop-change: an agent with no type has no questionnaire to read
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiFetch<Payload>(
      `/api/agent-setup?workspace=${encodeURIComponent(workspaceId)}&type=${encodeURIComponent(agentType)}`
    )
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // Silent. This panel is reassurance, not a control — a failed read should leave the
        // page looking normal, not put an error in front of someone checking on their agent.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, agentType]);

  if (loading || !agentType) return null;

  // Nothing stored: the questionnaire hasn't been filled in. SetupCell on the card above
  // already says so and links to it, so a second empty panel would just be noise.
  if (!data || data.sections.length === 0) return null;

  const total = data.sections.reduce((n, s) => n + s.rows.length, 0);
  const shown = expanded ? data.sections : data.sections.slice(0, 1);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-4 text-muted-foreground" />
            What {agentName} knows about you
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total} answers from your setup questionnaire. {agentName} has read all of it, so you
            don&apos;t have to explain any of it again.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/onboard/${agentType}`}>
            <Pencil className="size-3.5" />
            Update your answers
          </Link>
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        {shown.map((s) => (
          <div key={s.title}>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {s.title}
            </div>
            <dl className="mt-2 space-y-2">
              {s.rows.map((r) => (
                <div key={r.label} className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
                  <dt className="text-xs text-muted-foreground sm:pt-0.5">{r.label}</dt>
                  {/* whitespace-pre-wrap because free-text answers carry the line breaks the
                      person typed, and a paragraph they wrote about their business should not
                      come back as one run-on line. */}
                  <dd className="whitespace-pre-wrap text-sm">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {data.sections.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full text-xs text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown className={expanded ? "size-3.5 rotate-180 transition-transform" : "size-3.5 transition-transform"} />
          {expanded
            ? "Show less"
            : `Show everything (${data.sections.length - 1} more section${data.sections.length === 2 ? "" : "s"})`}
        </Button>
      )}

      {data.updated_at && (
        <p className="mt-3 border-t pt-3 text-xs text-muted-subtle">
          Last updated {formatDate(data.updated_at)}
          {data.injected_at
            ? ` · delivered to ${agentName} ${formatDate(data.injected_at)}`
            : " · not yet delivered to your agent"}
        </p>
      )}
    </div>
  );
}
