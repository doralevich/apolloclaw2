"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  lastError: string | null;
  prompt: string | null;
  title: string | null;
};

/** What a row needs to render, whether it is one of ours or one the customer wrote. */
type RowDef = {
  skill: string;
  label: string;
  blurb: string;
  defaultHour: number;
  defaultDays: string;
  /** Custom rows can be removed. The built-in three are turned off, not deleted - there is
   *  nothing to delete, since the row only exists once you have switched it on. */
  removable?: boolean;
};

// Each carries its own defaults, because the sensible time is part of what the thing IS. A
// morning brief at 5pm and an end-of-day summary at 8am are both just noise.
const SCHEDULABLE = [
  {
    skill: "daily-brief",
    label: "Morning brief",
    blurb: "Today's schedule, what needs a reply, and what moved yesterday.",
    defaultHour: 8,
    defaultDays: "weekdays",
  },
  {
    skill: "eod-summary",
    label: "End of day summary",
    blurb: "What got done, what slipped, and what's due tomorrow.",
    defaultHour: 17,
    defaultDays: "weekdays",
  },
  {
    skill: "weekly-planning",
    label: "Weekly planning",
    blurb: "The week ahead: what's fixed, what's carrying over, and the three that matter.",
    defaultHour: 8,
    defaultDays: "monday",
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

      {/* Anything the customer wrote themselves. Rendered from what is saved rather than from a
          list here, because that list is the point: the three above are ours and these are not. */}
      {(schedules ?? [])
        .filter((s) => s.prompt)
        .map((s) => (
          <ScheduleRow
            key={s.skill}
            agentId={agentId}
            def={{
              skill: s.skill,
              label: s.title || "Your report",
              blurb: s.prompt || "",
              defaultHour: s.hour,
              defaultDays: s.days,
              removable: true,
            }}
            current={s}
            loaded
            onChanged={load}
          />
        ))}

      <CustomReportForm agentId={agentId} onCreated={load} />
    </div>
  );
}

// Write your own, David's call, and it lifts the ceiling this panel had: three fixed reports and
// no way to ask for a fourth. "Every Monday, list the showings I have this week and flag any
// without a confirmed time" had nowhere to go, and the honest answer was a list that did not
// contain it.
//
// The name is not decoration. It becomes the row's identity - `custom:<slug>` - which is what
// makes the existing unique constraint do the right thing: as many reports as you like, and never
// two called the same thing.
function CustomReportForm({ agentId, onCreated }: { agentId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  function create() {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/schedules`, {
      method: "PUT",
      body: JSON.stringify({
        title: title.trim(),
        prompt: prompt.trim(),
        hour: 8,
        days: "weekdays",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enabled: true,
      }),
    })
      .then(() => {
        setTitle("");
        setPrompt("");
        setOpen(false);
        onCreated();
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Write your own report
      </Button>
    );
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h3 className="text-base font-semibold">Write your own report</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Ask for whatever you want, in your own words. It arrives on a schedule, in the same chat
        app as the rest.
      </p>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="report-title">Call it</Label>
          <Input
            id="report-title"
            value={title}
            maxLength={60}
            placeholder="Monday showings"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report-prompt">Ask for</Label>
          <Textarea
            id="report-prompt"
            value={prompt}
            rows={3}
            maxLength={2000}
            placeholder="List the showings I have this week and flag any without a confirmed time."
            onChange={(e) => setPrompt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Write it as if you were asking in chat. You can change the time once it&apos;s saved.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button disabled={busy || !title.trim() || !prompt.trim()} onClick={create}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save report
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </section>
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
  def: RowDef;
  current: Schedule | null;
  loaded: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  // What the controls show is DERIVED from what is saved, with a local override for the moment
  // between changing a dropdown and the reload landing. Deriving rather than copying into state
  // means the saved values appear as soon as they load, with no effect racing to sync them.
  const [pending, setPending] = useState<{ hour?: number; days?: string }>({});
  const hour = pending.hour ?? current?.hour ?? def.defaultHour;
  const days = pending.days ?? current?.days ?? def.defaultDays;

  const save = (next: { hour?: number; days?: string; enabled?: boolean }) => {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/schedules`, {
      method: "PUT",
      body: JSON.stringify({
        skill: def.skill,
        // A custom row carries its instruction on every save, because the upsert replaces the
        // whole row: sending only the hour would blank the prompt it exists for.
        ...(current?.prompt ? { prompt: current.prompt, title: current.title ?? def.label } : {}),
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
        <div className="flex shrink-0 items-center gap-2">
          {def.removable && current && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              title="Delete this report"
              onClick={() => {
                setBusy(true);
                apiFetch(`/api/agents/${agentId}/schedules?skill=${encodeURIComponent(def.skill)}`, {
                  method: "DELETE",
                })
                  .then(() => onChanged())
                  .catch((e) => toast.error((e as Error).message))
                  .finally(() => setBusy(false));
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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

      {/* IT RAN AND FAILED, and until now this said nothing at all.

          The old comment here claimed the only failure worth surfacing was "nowhere to send",
          and that anything else was "either fine or already visible as a channel in an error
          state". It is not: runSchedule catches a thrown turn and writes status "error" with the
          message, and none of that reached the customer. A schedule whose run threw - the box
          asleep, credit gone, the model erroring - looked identical to one that had simply not
          come round yet. Silence is the worst possible answer to "did my Monday report run?". */}
      {current?.lastStatus === "error" && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          This didn&apos;t run{current.lastRunOn ? ` on ${current.lastRunOn}` : ""}. It will try
          again at the next scheduled time.
          {current.lastError ? <span className="mt-1 block opacity-80">{current.lastError}</span> : null}
        </p>
      )}

      {/* Ran, produced something, and had nowhere to send it. */}
      {current?.lastStatus === "no_channel" && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          This ran but had nowhere to go - connect a chat app above, and message it once so your
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
