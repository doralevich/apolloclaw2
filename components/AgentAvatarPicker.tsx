"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { AVATAR_PRESETS } from "@/config/avatar-presets";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { cn } from "@/lib/utils";

// Change your agent's picture, after setup.
//
// It could previously only be chosen during the onboarding questionnaire — one shot, at the
// least informed moment there is, before you had ever spoken to the thing. Now the avatar on
// Start Here is a button.
//
// Uploads are capped client-side at 2MB. The serverless body limit is the real constraint and
// a 12MB photo from someone's phone would fail somewhere far less legible than here.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function AgentAvatarPicker({
  agentId,
  currentUrl,
  agentName,
}: {
  agentId: string;
  currentUrl?: string | null;
  agentName: string;
}) {
  const { refresh } = useActiveAgent();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function save(body: Record<string, unknown>) {
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/agents/${agentId}`, { method: "PATCH", body: JSON.stringify(body) });
      // The agent list is what every avatar on screen reads from, so refetch rather than
      // patching local state — one source, and the sidebar updates with everything else.
      await refresh();
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't update the picture.");
    } finally {
      setSaving(false);
    }
  }

  function onFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("That image is over 2MB. Try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      void save({
        avatar_upload: {
          name: file.name,
          type: file.type || "image/png",
          size: file.size,
          dataBase64: dataUrl.split(",")[1] || "",
        },
      });
    };
    reader.onerror = () => toast.error("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Change ${agentName}'s picture`}
        aria-expanded={open}
        className="group relative block h-14 w-14 overflow-hidden rounded-full bg-secondary"
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className="h-14 w-14 object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center text-lg font-semibold text-muted-foreground">
            {agentName.slice(0, 1).toUpperCase()}
          </span>
        )}
        {/* The affordance only appears on hover/focus so the greeting stays a greeting. */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5 text-white" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-20 w-72 rounded-xl border bg-card p-4 shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">Pick a picture</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATAR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={saving}
                onClick={() => save({ avatar_preset: p.src })}
                aria-label={p.label}
                className={cn(
                  "size-12 overflow-hidden rounded-full border bg-secondary transition-colors hover:border-foreground disabled:opacity-50",
                  currentUrl === p.src && "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-card"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" className="size-12 object-cover" />
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            {saving ? "Saving…" : "Upload your own"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0] ?? null);
              e.currentTarget.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
