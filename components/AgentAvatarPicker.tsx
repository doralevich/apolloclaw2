"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { AVATAR_PRESETS, MASCOT_FULL } from "@/config/avatar-presets";
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
  portrait = false,
}: {
  agentId: string;
  currentUrl?: string | null;
  agentName: string;
  /** "lg" is the Start Here greeting, where the mascot is the illustration rather than a chip. */
  size?: "md" | "lg";
  /**
   * Show the full-body mascot at its own proportions instead of a circular crop, the way the
   * reference does. Only applies while nobody has chosen a picture: the moment somebody uploads
   * a logo or picks a pose, that is what belongs here, and a headshot in a circle is the shape
   * that suits an arbitrary image.
   */
  portrait?: boolean;
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

  // Fall back to the house mascot rather than an initial.
  //
  // Nothing sets avatar_url at provisioning, so until somebody opened this picker their agent
  // was a grey circle with one letter in it — which on Start Here, where this is meant to be
  // the agent's PORTRAIT, read as a missing image rather than as a default. The preset is only
  // shown, never saved: an avatar_url still means somebody chose it, so the popover's selected
  // ring stays honest and picking pose 1 deliberately is still a real change.
  const shownUrl = currentUrl || AVATAR_PRESETS[0].src;
  const box = size === "lg" ? "h-28 w-28" : "h-14 w-14";

  // The full-body render the seven presets were cropped from. Standing at its own aspect rather
  // than squeezed into a circle — a whole robot in a disc is the unreadable smudge those crops
  // exist to avoid, and at this size there is room for the whole character.
  const asPortrait = portrait && !currentUrl;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Change ${agentName}'s picture`}
        aria-expanded={open}
        className={cn(
          "group relative block",
          asPortrait ? "w-auto" : cn("overflow-hidden rounded-full bg-secondary", box)
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asPortrait ? MASCOT_FULL : shownUrl}
          alt=""
          className={cn(asPortrait ? "h-32 w-auto sm:h-40" : cn("object-cover", box))}
        />
        {/* The affordance only appears on hover/focus so the greeting stays a greeting. */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
            // No dark scrim over the portrait: the PNG is transparent, so a full-bleed overlay
            // would darken the card behind it rather than the robot. The icon alone carries it.
            asPortrait ? "items-end pb-2" : "rounded-full bg-black/50"
          )}
        >
          <Camera
            className={cn(
              "size-5",
              asPortrait ? "rounded-full bg-foreground/80 p-1 text-background" : "text-white"
            )}
          />
        </span>
      </button>

      {open && (
        <div className={cn("absolute left-0 z-20 w-72 rounded-xl border bg-card p-4 shadow-lg", asPortrait ? "top-36 sm:top-44" : size === "lg" ? "top-32" : "top-16")}>
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
