"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// The two-agents-on-one-box test, from the Fleet page. Adds a second agent ("Atlas", a CFO who
// knows one planted fact) to an instance that already has one, with its own Telegram bot and
// agent-to-agent messaging switched on between the two. Then the test is done in Telegram: ask
// Atlas for the cash on hand, then ask the first agent to ask Atlas. "Check" reads back what the
// gateway loaded; "Remove Atlas" restores the config the box had before.
//
// This is the proof for the Command Center plan (several agents per server that can talk to each
// other) before any product code depends on it. It is a test tool, so it lives on the admin page
// and asks for the two Telegram values directly rather than storing them anywhere.

type Verify = {
  file?: string;
  agents?: unknown;
  telegramAccounts?: string[] | null;
  bindings?: unknown;
  agentToAgent?: unknown;
  cli?: string;
};

type SetupResult = { ok: boolean; backedUp: boolean; restarted: boolean; verify?: Verify; note?: string };
type VerifyResult = { ok: boolean; verify?: Verify; note?: string };
type RevertResult = { ok: boolean; restored: boolean; restarted: boolean; note?: string };

const NOTES: Record<string, string> = {
  "not-openclaw": "This is a Hermes box, and the test only works on OpenClaw.",
  "no-node-on-box": "The box has no node binary, so the config merge could not run.",
  "config-parse-fail": "The box's openclaw.json would not parse. Nothing was changed.",
  "no-confirmation": "The box did not answer after several tries. It may still be waking up; try again in a minute.",
  "no-backup": "No backup from an earlier setup was found, so nothing was changed.",
};

function explain(note?: string): string {
  return note ? NOTES[note] ?? note : "";
}

function summarize(v?: Verify): string {
  if (!v) return "";
  const lines = [
    `config: ${v.file ?? "?"}`,
    `agents: ${JSON.stringify(v.agents ?? null)}`,
    `telegram accounts: ${JSON.stringify(v.telegramAccounts ?? null)}`,
    `bindings: ${JSON.stringify(v.bindings ?? null)}`,
    `agentToAgent: ${JSON.stringify(v.agentToAgent ?? null)}`,
    "",
    "openclaw agents list --bindings:",
    v.cli ?? "(no output)",
  ];
  return lines.join("\n");
}

export function SecondAgentDialog({
  agentId,
  agentName,
  open,
  onOpenChange,
}: {
  agentId: string;
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [botToken, setBotToken] = useState("");
  const [telegramUser, setTelegramUser] = useState("");
  const [busy, setBusy] = useState<"add" | "check" | "remove" | null>(null);
  const [readout, setReadout] = useState("");

  const base = `/api/admin/agents/${agentId}/second-agent`;

  async function add() {
    setBusy("add");
    try {
      const r = await apiFetch<SetupResult>(base, {
        method: "POST",
        body: JSON.stringify({ botToken: botToken.trim(), telegramUser: telegramUser.trim() }),
      });
      if (r.ok) {
        toast.success(
          `Atlas added${r.backedUp ? " (config backed up)" : ""}. ${
            r.restarted ? "Instance restarting; give it a minute, then press Check." : "Config written, but the restart failed; restart the instance by hand."
          }`
        );
        setReadout(summarize(r.verify));
      } else {
        toast.error(`Could not add Atlas: ${explain(r.note)}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function check() {
    setBusy("check");
    try {
      const r = await apiFetch<VerifyResult>(base);
      if (r.ok) setReadout(summarize(r.verify));
      else toast.error(`Could not read the box: ${explain(r.note)}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    try {
      const r = await apiFetch<RevertResult>(base, { method: "DELETE" });
      if (r.ok && r.restored) {
        toast.success(`Atlas removed and the earlier config restored. ${r.restarted ? "Instance restarting." : "Restart the instance by hand."}`);
        setReadout("");
      } else if (r.ok) {
        toast.info(explain(r.note));
      } else {
        toast.error(`Could not remove Atlas: ${explain(r.note)}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const canAdd = /^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken.trim()) && /^\d+$/.test(telegramUser.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => { if (busy === null) onOpenChange(o); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Second agent test on {agentName}</DialogTitle>
          <DialogDescription>
            Adds a second agent named Atlas to this instance, with its own Telegram bot and
            agent-to-agent messaging switched on between the two. Atlas is a CFO who knows one
            fact: cash on hand is $412,000. The existing agent keeps everything it has.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sa-token">Atlas bot token</Label>
            <Input
              id="sa-token"
              type="password"
              autoComplete="off"
              placeholder="123456789:AAH..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              disabled={busy !== null}
            />
            <p className="text-xs text-muted-foreground">
              From @BotFather in Telegram: send /newbot, name it Atlas, pick a username ending in
              &quot;bot&quot;, and paste the token it replies with.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sa-user">Your Telegram user id</Label>
            <Input
              id="sa-user"
              inputMode="numeric"
              placeholder="987654321"
              value={telegramUser}
              onChange={(e) => setTelegramUser(e.target.value)}
              disabled={busy !== null}
            />
            <p className="text-xs text-muted-foreground">
              A number. Ask @getmyid_bot or @userinfobot in Telegram. Only this account may message
              the Atlas bot.
            </p>
          </div>

          <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Press Add Atlas. The instance restarts; wait a minute, then press Check.</li>
            <li>In Telegram, open the Atlas bot and send: What is our cash on hand? Expect $412,000.</li>
            <li>Open the first agent&apos;s chat and send: Ask Atlas what our cash on hand is and tell me. The same number back means the two agents are talking.</li>
            <li>Remove Atlas when done. That restores the config the box had before.</li>
          </ol>

          {readout && (
            <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed">
              {readout}
            </pre>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={check} disabled={busy !== null}>
              {busy === "check" ? "Checking..." : "Check"}
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={remove} disabled={busy !== null}>
              {busy === "remove" ? "Removing..." : "Remove Atlas"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy !== null}>
              Close
            </Button>
            <Button onClick={add} disabled={busy !== null || !canAdd}>
              {busy === "add" ? "Adding..." : "Add Atlas"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
