"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
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
export function ProfileNameCard({
  initialFirst,
  initialLast,
}: {
  initialFirst: string;
  initialLast: string;
}) {
  const router = useRouter();
  const { userEmail } = useWorkspace();
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const { busy, run } = useAsyncAction();

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
        <h2 className="font-medium">Your name</h2>
        <p className="text-sm text-muted-foreground">
          What your agent calls you. Signed in as {userEmail}.
        </p>
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
