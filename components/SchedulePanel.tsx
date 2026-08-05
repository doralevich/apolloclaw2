"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

// When the agent should message you first.
//
// Lives on the Channels page because it is the same subject: this page is about the agent
// reaching you rather than you reaching it, and a scheduled brief arrives through exactly the
// channels above. It is also the honest place for the dependency — with nothing connected, a
// schedule has nowhere to deliver, and that is visible right here rather than as a silent
// non-event at 8am.

type Schedule = {
  skill: string;
  hour: number;
  days: string;
  timezone: string;
  enabled: boolean;
  lastRunOn: string | null;
  lastStatus: string | null;
};

// Only the daily brief for now. The other clock-shaped skills from the catalogue — EOD summary,
// weekly planning — need writing before they can be offered, and an option that does nothing is
// worse than an absent one.
const SCHEDULABLE = [
  {
    skill: "daily-brief",
    label: "Morning brief",
    blurb: "Today's schedule, what needs a reply, and what moved yesterday.",
  },
] as const;

const DAY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "daily", label: "Every day" },
  { value: "monday", label: "Mondays only" },
] as const;

export function SchedulePanel({ agentId }: { agentId: string }) {
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);

  const load = useCallback(() => {
    apiFetch<{ schedules: Schedule[] }>(`/api/agents/${agentId}/schedules`)
      .then((res) => setSchedules(res.schedules))
      .catch(() => setSchedules([]));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">On a schedule</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Have your agent message you first. Arrives in whichever chat app you&apos;ve connected
            above.
          </p>
        </div>
      </div>

      {SCHEDULABLE.map((def) => (
        <ScheduleRow
          key={def.skill}
          agentId={agentId}
          def={def}
          current={schedules?.find((s) => s.skill === def.skill) ?? null}
          loaded={schedules !== null}
          onChanged={load}
        />
      ))}
    </div>
  );
}

function ScheduleRow({
  agentId,
  def,
  current,
  loaded,
  onChanged,
}: {
  agentId: string;
  def: (typeof SCHEDULABLE)[number];
  current: Schedule | null;
  loaded: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  // What the controls show is DERIVED from what is saved, with a local override for the moment
  // between changing a dropdown and the reload landing. Deriving rather than copying into state
  // means the saved values appear as soon as they load, with no effect racing to sync them.
  const [pending, setPending] = useState<{ hour?: number; days?: string }>({});
  const hour = pending.hour ?? current?.hour ?? 8;
  const days = pending.days ?? current?.days ?? "weekdays";

  const save = (next: { hour?: number; days?: string; enabled?: boolean }) => {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/schedules`, {
      method: "PUT",
      body: JSON.stringify({
        skill: def.skill,
        hour: next.hour ?? hour,
        days: next.days ?? days,
        // Read from the browser rather than asked for. Onboarding never collected a timezone, and
        // making someone pick one from a list of 400 to get a morning brief is a good way to lose
        // them at the last step.
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enabled: next.enabled ?? current?.enabled ?? true,
      }),
    })
      .then(() => onChanged())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  };

  const on = current?.enabled ?? false;

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{def.label}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{def.blurb}</p>
        </div>
        <Button
          variant={on ? "outline" : "default"}
          size="sm"
          disabled={busy || !loaded}
          onClick={() => save({ enabled: !on })}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {on ? "Turn off" : "Turn on"}
        </Button>
      </div>

      {on && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Send at</span>
          <select
            className="rounded-md border bg-background px-2 py-1"
            value={hour}
            disabled={busy}
            onChange={(e) => {
              const h = Number(e.target.value);
              setPending((p) => ({ ...p, hour: h }));
              save({ hour: h });
            }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <select
            className="rounded-md border bg-background px-2 py-1"
            value={days}
            disabled={busy}
            onChange={(e) => {
              setPending((p) => ({ ...p, days: e.target.value }));
              save({ days: e.target.value });
            }}
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {current?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      )}

      {/* The one failure worth surfacing in the UI: it ran, and had nowhere to send. Anything
          else is either fine or already visible as a channel in an error state. */}
      {current?.lastStatus === "no_channel" && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          This ran but had nowhere to go — connect a chat app above, and message it once so your
          agent knows where to reach you.
        </p>
      )}

      {on && current?.lastRunOn && current.lastStatus?.startsWith("delivered") && (
        <p className="mt-3 text-xs text-muted-foreground">
          Last sent {current.lastRunOn} via {current.lastStatus.split(":")[1]}.
        </p>
      )}
    </section>
  );
}
