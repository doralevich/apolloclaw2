"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { HelpFooter } from "@/components/HelpFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MATTER_STATUSES,
  hasMatters,
  matterStatusLabel,
  type MatterStatus,
} from "@/config/matters";

// Matters: the open work, and the reason it is worth typing in.
//
// NOT A PRACTICE MANAGEMENT SYSTEM. Clio and Smokeball exist, firms pay for them, and a worse
// copy alongside the system of record is worth less than nothing. What this is instead: the
// shortest list of facts that lets the agent answer "what am I working on" and "what is due"
// without asking first.
//
// The scheduled reports we ship for this agent open with "go through my open matters" and "list
// everything waiting on my sign-off". Everything saved here is written into a file on the box
// (MATTERS.md), so those reports have ground truth instead of an interview.
//
// AN INDEX, NOT A CASE FILE, and that shapes the form as much as the token cost does. There is no
// field for advice, analysis or anything privileged, and the notes field is labelled for
// logistics. Somewhere to paste privileged detail into a dashboard is a liability dressed as a
// feature.

type Matter = {
  id: number;
  title: string;
  matterNumber: string | null;
  clientName: string | null;
  practiceArea: string | null;
  status: MatterStatus;
  jurisdiction: string | null;
  opposingParty: string | null;
  openedOn: string | null;
  nextActionOn: string | null;
  nextAction: string | null;
  closedOn: string | null;
  notes: string | null;
};

const EMPTY: Omit<Matter, "id"> = {
  title: "",
  matterNumber: null,
  clientName: null,
  practiceArea: null,
  status: "active",
  jurisdiction: null,
  opposingParty: null,
  openedOn: null,
  nextActionOn: null,
  nextAction: null,
  closedOn: null,
  notes: null,
};

export function MattersView() {
  const { active, loading } = useActiveAgent();
  const [matters, setMatters] = useState<Matter[] | null>(null);
  const [editing, setEditing] = useState<Matter | Omit<Matter, "id"> | null>(null);

  const agentId = active?.agent37_id;

  const load = useCallback(() => {
    if (!agentId) return;
    apiFetch<{ matters: Matter[] }>(`/api/agents/${agentId}/matters`)
      .then((res) => setMatters(res.matters))
      .catch(() => setMatters([]));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You don&apos;t have an agent yet. Create one and you can keep your matters here.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/settings/agent">Go to My Agent</Link>
        </Button>
      </div>
    );
  }

  // Reachable by typing the URL on an agent with no matters feature. Hiding a rail row is not the
  // same as blocking a page, and a table nobody's agent reads is worse than a sentence saying so.
  if (!hasMatters(active.agent_type)) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Matters are part of the Law Agent. {active.name || "This agent"} doesn&apos;t use them.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Matters</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            What&apos;s open and what&apos;s due. Your agent reads this, so anything here is what
            it means by &quot;your matters&quot; in a brief or a deadline report.
          </p>
        </div>
        {editing === null && (
          <Button className="shrink-0" onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {editing !== null && (
        <MatterForm
          agentId={active.agent37_id}
          initial={editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {matters === null && <p className="text-sm text-muted-foreground">Loading...</p>}

      {matters !== null && matters.length === 0 && editing === null && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing here yet. Add a matter and your agent will know about it the next time you ask.
          </p>
        </div>
      )}

      {/* Grouped by status, open work first. The API already returns them soonest-deadline first
          within each group, which is the order the questions come in. */}
      {MATTER_STATUSES.map((status) => {
        const group = (matters ?? []).filter((m) => m.status === status);
        if (!group.length) return null;
        return (
          <section key={status} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {matterStatusLabel(status)} ({group.length})
            </h3>
            {group.map((matter) => (
              <MatterCard
                key={matter.id}
                agentId={active.agent37_id}
                matter={matter}
                onEdit={() => setEditing(matter)}
                onChanged={load}
              />
            ))}
          </section>
        );
      })}

      <HelpFooter className="max-w-4xl" />
    </div>
  );
}

function MatterCard({
  agentId,
  matter,
  onEdit,
  onChanged,
}: {
  agentId: string;
  matter: Matter;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const facts = [
    matter.matterNumber,
    matter.clientName,
    matter.practiceArea,
    matter.jurisdiction,
    matter.opposingParty ? `v. ${matter.opposingParty}` : null,
  ].filter(Boolean);

  function remove() {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/matters?matterId=${matter.id}`, { method: "DELETE" })
      .then(() => onChanged())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{matter.title}</p>
          {facts.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">{facts.join(" · ")}</p>
          )}
          {/* The next action gets its own emphasised line rather than joining the run above. It
              is the single most looked-at thing on this page, and a deadline in a dot-separated
              list is a deadline somebody skims past. */}
          {(matter.nextAction || matter.nextActionOn) && (
            <p className="mt-1 text-sm font-medium">
              Next: {matter.nextAction ?? "not specified"}
              {matter.nextActionOn ? ` by ${matter.nextActionOn}` : ""}
            </p>
          )}
          {matter.notes && (
            <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
              {matter.notes}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} title="Delete" onClick={remove}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MatterForm({
  agentId,
  initial,
  onDone,
  onCancel,
}: {
  agentId: string;
  initial: Matter | Omit<Matter, "id">;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Omit<Matter, "id">>(key: K, value: Matter[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function save() {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/matters`, {
      method: "PUT",
      body: JSON.stringify({
        ...("id" in form ? { id: form.id } : {}),
        title: form.title,
        matterNumber: form.matterNumber,
        clientName: form.clientName,
        practiceArea: form.practiceArea,
        status: form.status,
        jurisdiction: form.jurisdiction,
        opposingParty: form.opposingParty,
        openedOn: form.openedOn,
        nextActionOn: form.nextActionOn,
        nextAction: form.nextAction,
        closedOn: form.closedOn,
        notes: form.notes,
      }),
    })
      .then(() => onDone())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h3 className="text-base font-semibold">{"id" in form ? "Edit" : "Add a matter"}</h3>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="m-title">Matter</Label>
          <Input
            id="m-title"
            value={form.title}
            maxLength={300}
            placeholder="Henderson v. Ridgeline Logistics"
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-status">Status</Label>
            <select
              id="m-status"
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={form.status}
              onChange={(e) => set("status", e.target.value as MatterStatus)}
            >
              {MATTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {matterStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-client">Client</Label>
            <Input
              id="m-client"
              value={form.clientName ?? ""}
              maxLength={200}
              onChange={(e) => set("clientName", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-ref">Matter number</Label>
            <Input
              id="m-ref"
              value={form.matterNumber ?? ""}
              maxLength={60}
              onChange={(e) => set("matterNumber", e.target.value || null)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-area">Practice area</Label>
            <Input
              id="m-area"
              value={form.practiceArea ?? ""}
              maxLength={120}
              placeholder="Commercial contracts"
              onChange={(e) => set("practiceArea", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-juris">Governing law</Label>
            <Input
              id="m-juris"
              value={form.jurisdiction ?? ""}
              maxLength={120}
              placeholder="Illinois"
              onChange={(e) => set("jurisdiction", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-opposing">Other side</Label>
            <Input
              id="m-opposing"
              value={form.opposingParty ?? ""}
              maxLength={200}
              onChange={(e) => set("opposingParty", e.target.value || null)}
            />
          </div>
        </div>

        {/* The next action pair, given its own row and its own helper. These two fields are why
            the deadline reports work at all, so the form says what the date means rather than
            leaving somebody to guess between "due" and "act by". */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-next">Next action</Label>
            <Input
              id="m-next"
              value={form.nextAction ?? ""}
              maxLength={300}
              placeholder="Serve written discovery responses"
              onChange={(e) => set("nextAction", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-next-on">Act by</Label>
            <Input
              id="m-next-on"
              type="date"
              value={form.nextActionOn ?? ""}
              onChange={(e) => set("nextActionOn", e.target.value || null)}
            />
            <p className="text-xs text-muted-foreground">
              The date you need to act, not the date it expires.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-opened">Opened</Label>
            <Input
              id="m-opened"
              type="date"
              value={form.openedOn ?? ""}
              onChange={(e) => set("openedOn", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-closed">Closed</Label>
            <Input
              id="m-closed"
              type="date"
              value={form.closedOn ?? ""}
              onChange={(e) => set("closedOn", e.target.value || null)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="m-notes">Logistics your agent should know</Label>
          <Textarea
            id="m-notes"
            rows={3}
            maxLength={4000}
            value={form.notes ?? ""}
            placeholder="Client is slow to respond, chase by phone. Opposing counsel is on holiday until the 14th."
            onChange={(e) => set("notes", e.target.value || null)}
          />
          <p className="text-xs text-muted-foreground">
            Who owes the next move, what it&apos;s waiting on, which template applies. Not a case
            file, and not the place for privileged detail or advice.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button disabled={busy || !form.title.trim()} onClick={save}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
