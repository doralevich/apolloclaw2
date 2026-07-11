"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { setupQuestionsFor, type SetupQuestion } from "@/config/onboarding";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NAVY = "#0B1729";
const RED = "#D72B2B";

type Answers = Record<string, string | string[]>;

function Field({
  q,
  value,
  onChange,
}: {
  q: SetupQuestion;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  if (q.type === "select") {
    return (
      <select
        id={q.id}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Select...</option>
        {q.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (q.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {q.options?.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((s) => s !== o) : [...selected, o])}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                on ? "border-transparent text-white" : "border-input text-foreground hover:bg-secondary"
              )}
              style={on ? { background: RED } : undefined}
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  if (q.type === "textarea") {
    return (
      <textarea
        id={q.id}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        rows={3}
        maxLength={2000}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    );
  }
  return (
    <Input
      id={q.id}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder}
      maxLength={500}
    />
  );
}

function Section({
  title,
  questions,
  answers,
  setAnswer,
}: {
  title: string;
  questions: SetupQuestion[];
  answers: Answers;
  setAnswer: (id: string, v: string | string[]) => void;
}) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-lg" style={{ color: NAVY }}>
        {title}
      </h2>
      {questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <Label htmlFor={q.id}>
            {q.label}
            {q.required && <span style={{ color: RED }}> *</span>}
          </Label>
          <Field q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        </div>
      ))}
    </section>
  );
}

export function AgentSetupForm({
  agentTypeId,
  agentLabel,
  workspaceId,
  justPaid,
}: {
  agentTypeId: string;
  agentLabel: string;
  workspaceId?: string;
  justPaid: boolean;
}) {
  const { core, module } = useMemo(() => setupQuestionsFor(agentTypeId), [agentTypeId]);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const setAnswer = (id: string, v: string | string[]) => setAnswers((a) => ({ ...a, [id]: v }));

  const required = [...core, ...(module?.questions ?? [])].filter((q) => q.required);
  const missing = required.filter((q) => {
    const v = answers[q.id];
    return !v || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);
  });

  async function submit() {
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((q) => q.label).join(", ")}`);
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/agent-setup", {
        method: "POST",
        body: JSON.stringify({ workspace_id: workspaceId, agent_type: agentTypeId, answers }),
      });
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save — please try again");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
        <CheckCircle className="h-12 w-12" style={{ color: RED }} />
        <h1 className="font-display mt-6 text-3xl" style={{ color: NAVY }}>
          Your {agentLabel} knows the plan.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          We&apos;ve saved your setup and are writing it into your agent. It&apos;ll be in your
          dashboard, ready to work, within a couple of minutes.
        </p>
        <Button asChild className="mt-8" style={{ background: RED }}>
          <Link href="/dashboard">Go to my dashboard</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      {justPaid && (
        <div
          className="mb-8 rounded-lg border p-4 text-sm"
          style={{ borderColor: "rgba(215,43,43,0.3)", background: "rgba(215,43,43,0.05)" }}
        >
          <strong style={{ color: NAVY }}>Payment received — your {agentLabel} is being built right now.</strong>{" "}
          While it boots (a minute or two), tell it about your business below.
        </div>
      )}
      <h1 className="font-display text-3xl" style={{ color: NAVY }}>
        Set up your {agentLabel}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        About 10 minutes. Everything you share goes straight to your agent — the more real
        detail, the more useful its first day.
      </p>

      <div className="mt-10 space-y-10">
        <Section title="About your business" questions={core} answers={answers} setAnswer={setAnswer} />
        {module && (
          <Section title={module.title} questions={module.questions} answers={answers} setAnswer={setAnswer} />
        )}
      </div>

      <Button onClick={submit} disabled={busy} className="mt-10 w-full" style={{ background: RED }}>
        {busy ? "Saving..." : `Finish setup`}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        You can update any of this later — just tell your agent.
      </p>
    </main>
  );
}
