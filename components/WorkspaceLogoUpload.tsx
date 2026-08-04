"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { Button } from "@/components/ui/button";

// The customer's own logo, in their own dashboard.
//
// Everything in here is our branding, which is right for us and slightly wrong for them: they
// bought a private agent for their business and the room it lives in belongs to somebody else.
// This is the cheapest way to make it theirs.
//
// Capped at 3MB to match the storage helper. Checked here as well as there so the message is
// "that file is too big" rather than a generic failure after a pointless upload.
const MAX_BYTES = 3 * 1024 * 1024;

export function WorkspaceLogoUpload() {
  const { current, refresh } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!current) return null;
  const isAdmin = current.role === "admin";

  async function save(body: Record<string, unknown>, message: string) {
    if (!current || busy) return;
    setBusy(true);
    try {
      await apiFetch(`/api/workspaces/${current.id}`, { method: "PATCH", body: JSON.stringify(body) });
      await refresh();
      toast.success(message);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't update the logo.");
    } finally {
      setBusy(false);
    }
  }

  function onFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 3MB. Try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      void save(
        {
          logo_upload: {
            name: file.name,
            type: file.type || "image/png",
            size: file.size,
            dataBase64: String(reader.result).split(",")[1] || "",
          },
        },
        "Logo updated"
      );
    reader.onerror = () => toast.error("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Your logo</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Shown in the sidebar in place of ours. PNG, JPEG or WebP, under 3MB.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {current.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.logo_url} alt="" className="h-16 w-16 object-contain" />
          ) : (
            <ImageUp className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={!isAdmin || busy} onClick={() => fileRef.current?.click()}>
            {busy ? <Loader2 className="animate-spin" /> : <ImageUp />}
            {current.logo_url ? "Replace" : "Upload a logo"}
          </Button>
          {current.logo_url && (
            <Button
              variant="ghost"
              size="sm"
              disabled={!isAdmin || busy}
              onClick={() => save({ logo_url: null }, "Logo removed")}
            >
              <Trash2 /> Remove
            </Button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <p className="mt-3 text-xs text-muted-foreground">Only workspace admins can change this.</p>
      )}

      {/* SVG is deliberately not accepted. It is the format most companies HAVE their logo in,
          and the one we can't serve from a public bucket without care — an SVG is a document,
          it can carry script, and a browser will run it if the file is opened directly. */}
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
  );
}
