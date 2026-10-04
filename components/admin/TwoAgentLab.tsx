"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// The two-agent proof on a throwaway box, with nothing else in the loop: no Telegram, no
// customer's agent. Create a box with two agents, ask each a question through the gateway's
// own chat endpoint, read the answers here, delete the box.
//
// The three questions, in order: Atlas's planted fact (the request reached Atlas), main asked
// the same thing (the two are separate), then main told to ask Atlas (agent to agent).

type Box = { id: string; status: string; name: string | null; created: number | null };
type Question = { key: string; agent: string; text: string; expect: string };
type Answer = { agent: string; question: string; status: number; answer: string; ms: number };

export function TwoAgentLabButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title="Prove two agents on one box can each be reached and can message each other">
        <FlaskConical className="h-4 w-4" />
        Two-agent lab
      </Button>
      {open && <TwoAgentLabDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

function TwoAgentLabDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [box, setBox] = useState<Box | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await apiFetch<{ box: Box | null; questions: Question[] }>("/api/admin/two-agent-lab");
      setBox(r.box);
      setQuestions(r.questions);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    // Initial fetch on open; setState happens after the await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function create() {
    setBusy("create");
    setAnswers({});
    try {
      const r = await apiFetch<{ box: Box; setup: { ok: boolean; note?: string } }>("/api/admin/two-agent-lab", {
        method: "POST",
        body: JSON.stringify({ action: "create" }),
      });
      setBox(r.box);
      if (r.setup.ok) toast.success("Box created with both agents. It is restarting; give it a minute, then ask.");
      else toast.error(`Box created but the two-agent setup did not confirm${r.setup.note ? `: ${r.setup.note}` : ""}.`);
    } catch (e) {
      toast.error((e as Error).message);
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function ask(key: string) {
    if (!box) return;
    setBusy(key);
    try {
      const a = await apiFetch<Answer>("/api/admin/two-agent-lab", {
        method: "POST",
        body: JSON.stringify({ action: "ask", id: box.id, key }),
      });
      setAnswers((s) => ({ ...s, [key]: a }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function askAll() {
    for (const q of questions) {
      if (!box) return;
      setBusy(q.key);
      try {
        const a = await apiFetch<Answer>("/api/admin/two-agent-lab", {
          method: "POST",
          body: JSON.stringify({ action: "ask", id: box.id, key: q.key }),
        });
        setAnswers((s) => ({ ...s, [q.key]: a }));
      } catch (e) {
        toast.error((e as Error).message);
        break;
      }
    }
    setBusy(null);
  }

  async function remove() {
    if (!box) return;
    setBusy("delete");
    try {
      const r = await apiFetch<{ deleted: boolean }>("/api/admin/two-agent-lab", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: box.id }),
      });
      toast.success(r.deleted ? "Lab box deleted." : "The box was already gone.");
      setBox(null);
      setAnswers({});
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (busy === null) onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Two-agent lab</DialogTitle>
          <DialogDescription>
            A throwaway Starter box with two agents on it: main, and Atlas, a CFO who knows one
            fact (cash on hand is $412,000). Each question goes to one named agent through the
            gateway&apos;s own chat endpoint, the same path per-agent tabs in the product would
            use. Costs the Starter hourly rate while it exists; delete it when done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            {!loaded ? (
              <span className="text-muted-foreground">Looking for a lab box...</span>
            ) : box ? (
              <>
                <span className="font-mono text-xs">{box.id}</span>
                <Badge variant="secondary">{box.status}</Badge>
                <span className="text-xs text-muted-foreground">{box.name ?? "Two-agent lab"}</span>
              </>
            ) : (
              <span className="text-muted-foreground">No lab box right now.</span>
            )}
          </div>

          <ol className="space-y-3">
            {questions.map((q, i) => {
              const a = answers[q.key];
              return (
                <li key={q.key} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {i + 1}. To <span className="font-mono normal-case">{q.agent}</span>
                      </div>
                      <p className="mt-1 text-sm">{q.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Expect: {q.expect}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => ask(q.key)} disabled={busy !== null || !box}>
                      {busy === q.key ? "Asking..." : "Ask"}
                    </Button>
                  </div>
                  {a && (
                    <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
                      <div className="mb-1 text-[11px] text-muted-foreground">
                        {a.status === 200 ? "answered" : `status ${a.status}`} · {(a.ms / 1000).toFixed(1)}s
                      </div>
                      <pre className="whitespace-pre-wrap font-sans">{a.answer}</pre>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            {box ? (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={remove} disabled={busy !== null}>
                {busy === "delete" ? "Deleting..." : "Delete box"}
              </Button>
            ) : (
              <Button size="sm" onClick={create} disabled={busy !== null || !loaded}>
                {busy === "create" ? "Creating (about two minutes)..." : "Create box"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy !== null}>
              Close
            </Button>
            <Button onClick={askAll} disabled={busy !== null || !box}>
              {busy && busy !== "create" && busy !== "delete" ? "Asking..." : "Ask all three"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
