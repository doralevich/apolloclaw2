"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// Sign out, on the account page where somebody looks for it deliberately - the rail's account
// card still carries its own copy for the quick exit.
export function SignOutRow() {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-5">
      <div>
        <h2 className="font-semibold">Sign out</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">On this device only.</p>
      </div>
      <Button variant="outline" onClick={() => void signOut()}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
