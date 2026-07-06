"use client";

import { useMemo, useState } from "react";
import { Bot, Briefcase, GraduationCap, Plus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { AGENT_TYPES } from "@/config/agent-types";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Agent } from "@/lib/types";

// Registry icons are stored as lucide icon NAMES (plain strings, so the config stays
// server-safe); resolve them here with a generic fallback.
const TYPE_ICONS: Record<string, LucideIcon> = { GraduationCap, Briefcase };

// Self-serve "Create Agent" dialog: one card per registry type, an optional name, and a
// POST /api/agents { workspace_id, type, name }. The server enforces the real gates
// (membership, entitlement, one-per-type cap) — the UI just mirrors them: types the
// workspace already has render disabled with an "Already created" hint, and coming-soon
// types are never selectable.
export function CreateAgentModal({
  onCreated,
  triggerVariant,
  triggerSize,
}: {
  onCreated?: () => void;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  const { current } = useWorkspace();
  const { agents, refresh, setActiveId } = useActiveAgent();
  const { busy, run } = useAsyncAction();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");

  // Templates this workspace already runs — drives the "Already created" state.
  const existingTemplates = useMemo(
    () => new Set(agents.map((a) => a.template).filter((t): t is string => !!t)),
    [agents]
  );

  const selectedType = AGENT_TYPES.find((t) => t.id === selected) ?? null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Fresh form on every open, preselecting the first type that can actually be created.
      setName("");
      setSelected(AGENT_TYPES.find((t) => t.available && !existingTemplates.has(t.template))?.id ?? null);
    }
  }

  function submit() {
    if (!current || !selectedType) return;
    return run(async () => {
      const created = await apiFetch<Agent>("/api/agents", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: current.id,
          type: selectedType.id,
          name: name.trim() || undefined,
        }),
      });
      toast.success(`${created.name || selectedType.label} is provisioning`);
      setOpen(false);
      // Refresh the global agent list and make the new agent the active one so Chat /
      // Integrations / Credits point at it immediately.
      await refresh();
      if (created?.id) setActiveId(created.id);
      onCreated?.();
    });
  }

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an agent</DialogTitle>
          <DialogDescription>
            Pick an agent type for {current.name}. Each workspace can have one agent per type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {AGENT_TYPES.map((t) => {
            const Icon = (t.icon && TYPE_ICONS[t.icon]) || Bot;
            const alreadyCreated = t.available && existingTemplates.has(t.template);
            const disabled = !t.available || alreadyCreated;
            const isSelected = selectedType?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelected(t.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  isSelected ? "border-primary ring-1 ring-primary" : "border-border",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{t.label}</span>
                    {t.comingSoon && <Badge variant="muted">Coming soon</Badge>}
                    {alreadyCreated && <Badge variant="muted">Already created</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-agent-name">Name (optional)</Label>
          <Input
            id="create-agent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedType?.label ?? "Agent name"}
            maxLength={80}
            disabled={!selectedType}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !selectedType}>
            {busy ? "Creating..." : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
