"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

// Super Admin > Setup keys: the credentials clients give in the /setup form, for a Mac Mini
// install. They are stored encrypted (lib/setup-secrets.ts) and arrive here hidden. Revealing a
// submission decrypts it on the server and writes the reveal to the audit log; the values hide
// themselves again after two minutes, so a key does not sit open on a screen left unattended.

type Submission = {
  id: number;
  email: string;
  client_name: string | null;
  context: Record<string, string>;
  provided: string[];
  submitted_at: string;
};

type Revealed = { values: { label: string; value: string }[] };

const HIDE_AFTER_MS = 2 * 60 * 1000;

export function SetupKeysView() {
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("email") ?? "");
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<number, Revealed>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ submissions: Submission[] }>("/api/admin/setup-secrets")
      .then((res) => {
        if (!cancelled) setRows(res.submissions);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function reveal(id: number) {
    setBusy(id);
    try {
      const res = await apiFetch<Revealed>(`/api/admin/setup-secrets/${id}/reveal`, { method: "POST" });
      setOpen((o) => ({ ...o, [id]: res }));
      window.setTimeout(() => hide(id), HIDE_AFTER_MS);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function hide(id: number) {
    setOpen((o) => {
      const next = { ...o };
      delete next[id];
      return next;
    });
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Select the text instead.");
    }
  }

  const q = query.trim().toLowerCase();
  const shown = (rows ?? []).filter(
    (r) => !q || r.email.includes(q) || (r.client_name ?? "").toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <KeyRound className="size-5" />
          Setup keys
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Credentials clients gave in the setup form, stored encrypted. Revealing a submission is logged,
          and the keys hide again after two minutes.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by email or name"
        aria-label="Filter by email or name"
        className="h-9 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : rows === null ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {rows.length === 0 ? "No setup submissions stored yet." : "Nothing matches that filter."}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const revealed = open[r.id];
            return (
              <li key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.client_name || r.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.email} · {formatDate(r.submitted_at)}
                      {r.context.assistant_name ? ` · assistant ${r.context.assistant_name}` : ""}
                      {r.context.computer_name ? ` · ${r.context.computer_name}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Holds: {r.provided.join(", ") || "nothing"}</p>
                  </div>
                  {revealed ? (
                    <Button variant="outline" size="sm" onClick={() => hide(r.id)}>
                      <EyeOff className="size-4" />
                      Hide
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => reveal(r.id)} disabled={busy === r.id}>
                      <Eye className="size-4" />
                      {busy === r.id ? "Revealing..." : "Reveal keys"}
                    </Button>
                  )}
                </div>
                {revealed && (
                  <dl className="mt-3 space-y-2 border-t pt-3">
                    {revealed.values.map((v) => (
                      <div key={v.label} className="grid gap-1 sm:grid-cols-[11rem_1fr_auto] sm:items-center">
                        <dt className="text-xs text-muted-foreground">{v.label}</dt>
                        <dd className="break-all font-mono text-xs">{v.value}</dd>
                        <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => copy(v.value)}>
                          <Copy className="size-3.5" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
