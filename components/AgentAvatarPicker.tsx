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
  size = "md",
}: {
  agentId: string;
  currentUrl?: string | null;
  agentName: string;
  /** "lg" is the Start Here greeting, where the mascot is the illustration rather than a chip. */
  size?: "md" | "lg";
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

  // No picture until somebody picks one. Initials instead, David's call.
  //
  // This briefly fell back to the house mascot, which was wrong in a way worth naming: it made
  // every unconfigured agent look like it had been given a face, so the picker's own selected
  // ring was the only thing distinguishing "chose the mascot" from "chose nothing". Initials say
  // what is true - nobody has picked yet - and the picker is one click away.
  const box = size === "lg" ? "h-32 w-32" : "h-14 w-14";
  const initial = agentName.trim().charAt(0).toUpperCase() || "?";

  // ALWAYS A CIRCLE. There was a `portrait` variant here that drew the picture at its natural
  // proportions with no crop and no rounding, built for the full-body mascot PNG - a standing
  // robot looks wrong squeezed into a circle.
  //
  // The presets are headshots now, and that variant left them square: the image is a 256px
  // square, so the circular face inside it met a straight edge on every side. It read as a
  // broken crop because it was one. A headshot belongs in a circle, and so does an uploaded
  // logo, so there is no longer a case the variant serves.

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Change ${agentName}'s picture`}
        aria-expanded={open}
        className={cn(
          "group relative block",
          "overflow-hidden rounded-full bg-secondary",
          box
        )}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className={cn("object-cover", box)} />
        ) : (
          <span
            className={cn(
              "flex items-center justify-center font-semibold text-muted-foreground",
              box,
              size === "lg" ? "text-3xl" : "text-lg"
            )}
          >
            {initial}
          </span>
        )}
        {/* The affordance only appears on hover/focus so the greeting stays a greeting. */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
            "rounded-full bg-black/50"
          )}
        >
          <Camera
            className={cn(
              "size-5",
              "text-white"
            )}
          />
        </span>
      </button>

      {open && (
        <div className={cn("absolute left-0 z-20 w-[22rem] rounded-xl border bg-card p-4 shadow-lg", size === "lg" ? "top-36" : "top-16")}>
          <p className="text-xs font-medium text-muted-foreground">Pick a picture</p>
          {/* Scrolls. Seven poses fitted in a popover; forty portraits do not, and a list that grows
              taller than the viewport puts "Upload your own" somewhere nobody can reach. */}
          {/* Four across at 68px rather than five at 48px. These are photographs of faces now,
              not poses of one robot: at 48px you could tell the mascot tiles apart by silhouette,
              but you cannot tell two dark-haired people apart without seeing the face. Bigger
              tiles are what make a grid of forty choosable rather than a texture. */}
          <div className="mt-2 grid max-h-72 grid-cols-4 gap-2.5 overflow-y-auto pr-1">
            {AVATAR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={saving}
                onClick={() => save({ avatar_preset: p.src })}
                aria-label={p.label}
                className={cn(
                  "size-[68px] overflow-hidden rounded-full border bg-secondary transition-colors hover:border-foreground disabled:opacity-50",
                  currentUrl === p.src && "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-card"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" className="size-[68px] object-cover" />
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
