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

// A second agent on one box, from the Fleet page. Adds "Atlas", a CFO who knows one planted
// fact, to an instance that already has one agent, with agent-to-agent messaging switched on
// between the two and the gateway's chat endpoint on for the per-agent chat tabs. From then on
// the instance's chat page shows a tab per agent. "Check" reads back what the gateway loaded;
// "Remove Atlas" restores the config the box had before.
//
// Telegram is optional: with a bot token from @BotFather and the tester's Telegram id, Atlas
// gets a bot of its own on the server as well. The proof for the Command Center plan (several
// agents per server that can talk to each other) ran on the two-agent lab; this is the same
// setup on a real instance.

type Verify = {
  file?: string;
  agents?: unknown;
  ownership?: unknown;
  defaultMarker?: string[];
  owners?: unknown;
  telegramAccounts?: string[] | null;
  bindings?: unknown;
  agentToAgent?: unknown;
  httpChat?: boolean;
  bind?: unknown;
  memorySearch?: { enabled: boolean; provider: string | null; extraPaths: unknown } | null;
  sharedBrain?: boolean;
  secondBrain?: boolean;
  cli?: string;
};

type SetupResult = { ok: boolean; backedUp: boolean; restarted: boolean; verify?: Verify; note?: string };
type VerifyResult = { ok: boolean; verify?: Verify; note?: string };
type RevertResult = { ok: boolean; restored: boolean; restarted: boolean; note?: string };

const NOTES: Record<string, string> = {
  "not-openclaw": "This is a Hermes box, and a second agent only works on OpenClaw.",
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
    `chat endpoint for the tabs: ${v.httpChat ? "on" : "off"}`,
    `shared company brain: ${v.sharedBrain ? "COMPANY.md present" : "not found"}${v.secondBrain ? ", loaded by the second agent" : ", not loaded by the second agent"}`,
    `memory search: ${v.memorySearch ? (v.memorySearch.enabled ? "on (each agent's own memory; the company brain is loaded context, not search)" : "off") : "default"}`,
    `ownership: ${JSON.stringify(v.ownership ?? null)} | default marker on: ${JSON.stringify(v.defaultMarker ?? [])}`,
    `owners: ${JSON.stringify(v.owners ?? null)}`,
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
  // The intake for a second agent: a name, a role, and a few sentences of persona. Empty name
  // falls back to the Atlas test agent, which the proof and a quick check still use.
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [persona, setPersona] = useState("");
  const [withTelegram, setWithTelegram] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [mainBotToken, setMainBotToken] = useState("");
  const [telegramUser, setTelegramUser] = useState("");
  const [busy, setBusy] = useState<"add" | "check" | "remove" | null>(null);
  const [readout, setReadout] = useState("");

  const base = `/api/admin/agents/${agentId}/second-agent`;
  const label = name.trim() || "Atlas";

  async function add() {
    setBusy("add");
    try {
      const r = await apiFetch<SetupResult>(base, {
        method: "POST",
        body: JSON.stringify({
          ...(name.trim() ? { name: name.trim(), role: role.trim(), persona: persona.trim() } : {}),
          ...(withTelegram
            ? {
                botToken: botToken.trim(),
                telegramUser: telegramUser.trim(),
                ...(mainBotToken.trim() ? { mainBotToken: mainBotToken.trim() } : {}),
              }
            : {}),
        }),
      });
      if (r.ok) {
        toast.success(
          `${label} added${r.backedUp ? " (config backed up)" : ""}. ${
            r.restarted ? "Instance restarting; give it a minute, then press Check." : "Config written, but the restart failed; restart the instance by hand."
          }`
        );
        setReadout(summarize(r.verify));
      } else {
        toast.error(`Could not add the agent: ${explain(r.note)}`);
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
        toast.success(`The agent was removed and the earlier config restored. ${r.restarted ? "Instance restarting." : "Restart the instance by hand."}`);
        setReadout("");
      } else if (r.ok) {
        toast.info(explain(r.note));
      } else {
        toast.error(`Could not remove the agent: ${explain(r.note)}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const TOKEN = /^\d+:[A-Za-z0-9_-]{20,}$/;
  const mainOk = !mainBotToken.trim() || (TOKEN.test(mainBotToken.trim()) && mainBotToken.trim() !== botToken.trim());
  const telegramOk = TOKEN.test(botToken.trim()) && /^\d+$/.test(telegramUser.trim()) && mainOk;
  // A named agent needs a role too. No name means the Atlas test agent, which needs nothing.
  const intakeOk = !name.trim() || role.trim().length > 0;
  const canAdd = intakeOk && (!withTelegram || telegramOk);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (busy === null) onOpenChange(o); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add an agent to {agentName}</DialogTitle>
          <DialogDescription>
            Adds a second agent to this instance with a name, a role, and a persona, and switches
            on agent-to-agent messaging between the two. {agentName} keeps everything it has, and
            the chat page shows a tab per agent. The shared company brain (shared/COMPANY.md,
            seeded from what {agentName} knows about the owner) is loaded into the new agent as
            context, so it knows the company while keeping its own role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border bg-amber-50 px-3 py-2 text-xs text-amber-900">
            While a second agent is on this instance, the chat page and the Telegram, Slack and
            WhatsApp connections talk to the agents over a direct line to the box, since
            Agent37&apos;s chat API cannot name an agent on a multi-agent box. The chat tabs are
            plain: no thread list, files or model menu until that API can. Remove the agent and
            everything is as before.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sa-name">Agent name</Label>
            <Input
              id="sa-name"
              placeholder="Atlas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy !== null}
            />
            <p className="text-xs text-muted-foreground">
              What the agent is called, and where its tab appears. Leave blank to add the Atlas
              test agent (a CFO who knows one planted fact) for a quick check.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sa-role">Role</Label>
            <Input
              id="sa-role"
              placeholder="CFO, Scheduler, Support lead..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={busy !== null || !name.trim()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sa-persona">Persona</Label>
            <textarea
              id="sa-persona"
              rows={3}
              placeholder="A few sentences on how this agent should act and what it is responsible for."
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              disabled={busy !== null || !name.trim()}
              className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Optional. The agent also knows the company from the shared brain; this is its own
              character and remit on top of that.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withTelegram}
              onChange={(e) => setWithTelegram(e.target.checked)}
              disabled={busy !== null}
              className="h-4 w-4"
            />
            Also give this agent a Telegram bot of its own
          </label>

          {withTelegram && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sa-token">{label} bot token</Label>
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
                  From @BotFather in Telegram: send /newbot, name it after this agent, pick a
                  username ending in &quot;bot&quot;, and paste the token it replies with.
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
                  this agent&apos;s bot.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sa-main-token">{agentName}&apos;s own bot token (optional)</Label>
                <Input
                  id="sa-main-token"
                  type="password"
                  autoComplete="off"
                  placeholder="A second bot from @BotFather, different from the new agent's"
                  value={mainBotToken}
                  onChange={(e) => setMainBotToken(e.target.value)}
                  disabled={busy !== null}
                />
                <p className="text-xs text-muted-foreground">
                  Gives {agentName} a Telegram bot of its own on the server. A different bot from
                  the new agent, and from any bot on the Connections page.
                </p>
              </div>
            </>
          )}

          <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Press Add agent. The instance restarts; wait a minute, then press Check.</li>
            <li>Open the chat page. There is a tab for {agentName} and one for {label}.</li>
            <li>In the {label} tab, ask it something in its role.</li>
            <li>Ask {label} who the owner is. It knows from the shared company brain loaded into its context, seeded from what {agentName} knows.</li>
            <li>Ask {agentName} to ask {label} something and relay the answer. A good answer back means the two are talking.</li>
            <li>Remove the agent when done. That restores the config the box had before; the shared company file is kept.</li>
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
              {busy === "remove" ? "Removing..." : "Remove agent"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy !== null}>
              Close
            </Button>
            <Button onClick={add} disabled={busy !== null || !canAdd}>
              {busy === "add" ? "Adding..." : name.trim() ? `Add ${label}` : "Add test agent"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
