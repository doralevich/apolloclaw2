"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import type { WorkspaceWithRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WorkspaceSwitcher() {
  const { workspaces, current, setCurrentId, refresh, isPlatformAdmin } = useWorkspace();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const { busy, run } = useAsyncAction();

  function createWorkspace() {
    if (!name.trim()) return;
    return run(async () => {
      const { workspace } = await apiFetch<{ workspace: WorkspaceWithRole }>("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      await refresh();
      setCurrentId(workspace.id);
      setName("");
      setCreating(false);
      toast.success("Workspace created");
    });
  }

  // One workspace: the NAME, not a dropdown.
  //
  // The switcher is still pointless with nothing to switch to — a second workspace does nothing
  // for a customer, since one licence provisions one agent into one workspace and an extra is an
  // empty room with no way to put an agent in it. So self-serve creation stays closed, and "New
  // workspace" stays inside the dropdown where only people who already have two can reach it.
  //
  // But hiding the control entirely also removed the only place the workspace name appeared, and
  // a customer with exactly one workspace then saw no workspace anywhere in the UI — which reads
  // as "I don't have one" rather than "there is nothing to switch to". David hit precisely that
  // and reasonably concluded his account was broken.
  //
  // So: static text at the same size and position the trigger occupied. You lose the useless
  // menu; you keep knowing where you are.
  // Styled as the card the mockup puts at the top of the rail rather than a line of grey text:
  // this is the answer to "whose account am I in", and it was reading as a disabled field.
  //
  // Platform admins get this same static tile even though they belong to MANY workspaces
  // (David's call): they no longer switch from here, they drop into a customer's workspace via
  // Super Admin's "Open in ApolloClaw" (which sets the current workspace and opens /dashboard).
  // The interactive dropdown was a second, redundant way to switch — but the NAME is still worth
  // keeping, because when you land in "Graham Grieve's Workspace" from the god-view this tile is
  // what confirms which account you're now acting in.
  if (workspaces.length <= 1 || isPlatformAdmin) {
    const name = current?.name ?? "No workspace";
    return (
      <div className="flex w-full items-center gap-2.5 rounded-lg border bg-card p-2">
        {/* text-white, not text-primary-foreground: this tile only ever renders inside the navy
            rail, where primary-foreground IS the navy — the initial would be dark on dark. */}
        <span className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
          {(name[0] || "?").toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">{current?.name ?? "Select workspace"}</span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((w) => (
            <DropdownMenuItem key={w.id} onClick={() => setCurrentId(w.id)}>
              <span className="flex-1 truncate">{w.name}</span>
              {w.id === current?.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>Workspaces keep agents and members separate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Production"
              onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={createWorkspace} disabled={busy || !name.trim()}>
              {busy ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
