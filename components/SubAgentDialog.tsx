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

// Add or edit one agent on an instance, from the My Agent page. An agent has a name, a role, a
// persona, and an image. The name is set once (it is the agent's id on the box); editing changes
// the role, persona, or image.

type ImageUpload = { name: string; type: string; size: number; dataBase64: string };

function readImage(file: File): Promise<ImageUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve({ name: file.name, type: file.type, size: file.size, dataBase64: comma >= 0 ? result.slice(comma + 1) : result });
    };
    reader.readAsDataURL(file);
  });
}

export type EditingAgent = { id: string; name: string; role: string | null; avatarUrl: string | null };

export function SubAgentDialog({
  instanceId,
  mainName,
  editing,
  open,
  onOpenChange,
  onDone,
}: {
  instanceId: string;
  mainName: string;
  /** The agent being edited, or null to add a new one. */
  editing: EditingAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const isEdit = !!editing;
  const [name, setName] = useState(editing?.name ?? "");
  const [role, setRole] = useState(editing?.role ?? "");
  const [persona, setPersona] = useState("");
  const [avatar, setAvatar] = useState<ImageUpload | null>(null);
  const [preview, setPreview] = useState<string | null>(editing?.avatarUrl ?? null);
  const [busy, setBusy] = useState(false);

  const canSave = (isEdit || name.trim().length > 0) && role.trim().length > 0;

  async function save() {
    setBusy(true);
    try {
      const avatarField = avatar ? { avatar } : {};
      if (isEdit && editing) {
        await apiFetch(`/api/agents/${instanceId}/subagents/${encodeURIComponent(editing.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ role: role.trim(), persona: persona.trim(), ...avatarField }),
        });
        toast.success(`${editing.name} updated. The instance is restarting; give it a minute.`);
      } else {
        await apiFetch(`/api/agents/${instanceId}/subagents`, {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), role: role.trim(), persona: persona.trim(), ...avatarField }),
        });
        toast.success(`${name.trim()} added. The instance is restarting; give it a minute, then open its tab.`);
      }
      onOpenChange(false);
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${editing?.name}` : "Add an agent"}</DialogTitle>
          <DialogDescription>
            A second agent on this instance with its own name, role, and face. It shares the
            company brain {mainName} has, so it knows the business while keeping its own job. It
            shows up as a tab in chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">Name</Label>
            <Input
              id="sub-name"
              placeholder="Dispatch, Atlas, Nova..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy || isEdit}
            />
            {isEdit && <p className="text-xs text-muted-foreground">The name is set when the agent is created and stays put.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-role">Role</Label>
            <Input
              id="sub-role"
              placeholder="CFO, Scheduler, Support lead..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-image">Image</Label>
            <div className="flex items-center gap-3">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="size-12 rounded-full border object-cover" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-full border bg-muted text-base font-semibold text-muted-foreground">
                  {(name.trim() || "A").slice(0, 1).toUpperCase()}
                </span>
              )}
              <input
                id="sub-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    toast.error("Image is over 3 MB. Pick a smaller one.");
                    return;
                  }
                  try {
                    setAvatar(await readImage(file));
                    setPreview(URL.createObjectURL(file));
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }}
                className="text-xs file:mr-2 file:rounded-md file:border file:bg-secondary file:px-2 file:py-1 file:text-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG or WebP, up to 3 MB. Optional.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-persona">Persona</Label>
            <textarea
              id="sub-persona"
              rows={3}
              placeholder="A few sentences on how this agent should act and what it handles."
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              disabled={busy}
              className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            {isEdit && <p className="text-xs text-muted-foreground">Leave blank to keep a default. Saving rewrites the agent&apos;s character.</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !canSave}>
            {busy ? "Saving..." : isEdit ? "Save changes" : "Add agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
