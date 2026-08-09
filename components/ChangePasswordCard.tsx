"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Change your password while signed in.
//
// Until this existed the only path was logging OUT and clicking "Forgot password?" - which
// works, and is a strange thing to tell a paying customer. This is the ordinary path: prove
// you know the current password, choose a new one, stay signed in.
//
// The current password is verified with a real sign-in rather than trusted from the form.
// Supabase's updateUser does not require it - any live session may set a password - so without
// this check, anyone at an unlocked laptop could quietly take over the account. Same floor and
// ceiling as /api/onboard/set-password: Supabase enforces the minimum; 72 bytes is where bcrypt
// silently truncates, and a password that does not mean what it looks like is refused.
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

export function ChangePasswordCard({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < MIN_PASSWORD) {
      toast.error(`Please choose a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (new TextEncoder().encode(next).length > MAX_PASSWORD) {
      toast.error("That password is too long. Please choose a shorter one.");
      return;
    }
    if (next !== confirm) {
      toast.error("The new passwords don't match.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (verifyError) {
        toast.error("Your current password isn't right.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        // Supabase's own floor ("same as the old password", project minimums) surfaces here.
        toast.error(error.message);
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Password</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Changing it here keeps you signed in on this device.
      </p>
      <div className="mt-4 grid gap-3 sm:max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="pw-current">Current password</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-next">New password</Label>
          <Input
            id="pw-next"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-confirm">New password, again</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" className="mt-4" disabled={busy || !current || !next || !confirm}>
        {busy ? "Changing..." : "Change password"}
      </Button>
    </form>
  );
}
