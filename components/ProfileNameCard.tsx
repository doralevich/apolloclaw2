"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const { busy, run } = useAsyncAction();

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
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {avatar ? "Change picture" : "Upload a picture"}
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
