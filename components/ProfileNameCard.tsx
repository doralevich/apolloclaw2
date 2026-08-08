"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { Camera, Loader2, Trash2, Users } from "lucide-react";
import { AVATAR_PRESETS } from "@/config/avatar-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Your own name, which had nowhere to be set until now.
//
// The only writer was Stripe checkout, from the session's metadata. An account created any other
// way carried no name, and the greeting fell back to the email's local part — which is how
// "daveo@designsbydaveo.com" became "Hey Daveo". A name captured wrongly was equally permanent:
// one live account has the last name "Gmail".
//
// router.refresh() after saving, deliberately. userFirstName is resolved in the dashboard's
// SERVER layout, because auth metadata is only readable there — so without it the greeting keeps
// saying the old name until a hard reload, and the save looks like it silently failed.
// Same 2MB client-side cap the agent avatar picker uses. The serverless body limit is the real
// constraint and a 12MB phone photo would fail somewhere far less legible than here.
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function ProfileNameCard({
  initialFirst,
  initialLast,
  initialAvatar,
}: {
  initialFirst: string;
  initialLast: string;
  initialAvatar: string;
}) {
  const router = useRouter();
  const { userEmail } = useWorkspace();
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { busy, run } = useAsyncAction();

  // Saves on click, like the upload does, and closes the grid. Choosing a face is a deliberate
  // act with visible feedback; making it wait behind the Save button meant for the name fields
  // would leave a picture looking chosen but unsaved.
  function choosePreset(src: string) {
    return run(async () => {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: first.trim(),
          last_name: last.trim(),
          avatar_preset: src,
        }),
      });
      setAvatar(src);
      setPicking(false);
      router.refresh();
      toast.success("Picture updated");
    });
  }

  // The picture saves on its own rather than waiting for the Save button. Choosing a file is
  // already a deliberate act with a confirmation step of its own - the OS file dialog - and a
  // picture that sits there looking chosen but unsaved is the kind of thing people close a tab
  // on.
  function onFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("That image is over 2MB. Try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setUploading(true);
      try {
        const res = await apiFetch<{ avatar_url?: string }>("/api/me", {
          method: "PATCH",
          body: JSON.stringify({
            first_name: first.trim(),
            last_name: last.trim(),
            avatar_upload: {
              name: file.name,
              type: file.type || "image/png",
              size: file.size,
              dataBase64: dataUrl.split(",")[1] || "",
            },
          }),
        });
        // The route returns null-as-undefined for a file it would not store, so an unchanged
        // URL here means "that was not an image we accept" rather than a silent success.
        if (!res.avatar_url) {
          toast.error("That file could not be used. PNG, JPEG or WebP.");
          return;
        }
        setAvatar(res.avatar_url);
        setPicking(false);
        router.refresh();
        toast.success("Picture updated");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => toast.error("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    return run(async () => {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ first_name: first.trim(), last_name: last.trim(), avatar_url: "" }),
      });
      setAvatar("");
      router.refresh();
      toast.success("Picture removed");
    });
  }

  const dirty = first !== initialFirst || last !== initialLast;

  function save() {
    return run(async () => {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ first_name: first.trim(), last_name: last.trim() }),
      });
      router.refresh();
      toast.success("Name updated");
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-medium">You</h2>
        <p className="text-sm text-muted-foreground">
          What your agent calls you, and the picture beside your messages. Signed in as {userEmail}.
        </p>
      </div>

      {/* Your picture, beside the name it belongs to. It shows on your own messages in chat -
          the agent has had a face there for a while and you did not. */}
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-secondary text-lg font-semibold text-muted-foreground">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="size-16 object-cover" />
          ) : (
            (first || userEmail || "?").charAt(0).toUpperCase()
          )}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || busy}
            onClick={() => setPicking((p) => !p)}
            aria-expanded={picking}
          >
            <Users className="size-4" />
            {avatar ? "Change picture" : "Choose a picture"}
          </Button>
          {avatar && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={removeAvatar}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
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
      </div>

      {/* The same forty portraits the agent picker offers.
          This card used to go straight to the file dialog, so the only way to have a face here
          was to own a photo and find it - which is a real obstacle for the people most likely to
          want one, and made the presets look like they had gone missing. They are faces of
          people; if they suit an agent they certainly suit a person. */}
      {picking && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Pick a picture</p>
          <div className="mt-2 grid max-h-72 grid-cols-5 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-8">
            {AVATAR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy || uploading}
                onClick={() => choosePreset(p.src)}
                aria-label={p.label}
                className={cn(
                  "size-[68px] overflow-hidden rounded-full border bg-secondary transition-colors hover:border-foreground disabled:opacity-50",
                  avatar === p.src && "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-card"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" className="size-[68px] object-cover" />
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy || uploading}
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            {uploading ? "Saving..." : "Upload your own"}
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="first-name">First name</Label>
          <Input
            id="first-name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last-name">Last name</Label>
          <Input
            id="last-name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={busy || !dirty}>
          {busy ? "Saving..." : "Save"}
        </Button>
        {/* Clearing both is allowed and does something sensible: the greeting drops back to
            "Hey, I'm Nova." rather than guessing from the address. Somebody at info@ who does
            not want to be called Info needs that to be possible. */}
        {!first && !last && (
          <span className="text-xs text-muted-foreground">
            Leave both empty and your agent will greet you without a name.
          </span>
        )}
      </div>
    </div>
  );
}
