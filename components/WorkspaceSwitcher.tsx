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
  const { workspaces, current, setCurrentId, refresh } = useWorkspace();

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

  // Hidden entirely when there's one workspace — which is every customer.
  //
  // David's call, and it's the right one: a second workspace does nothing for a customer. They
  // buy one licence, which provisions one agent into one workspace; an extra workspace would be
  // an empty room with no agent in it and no way to get one. So self-serve creation isn't a
  // feature we're hiding, it's a dead end we're closing.
  //
  // The "New workspace" action stays INSIDE this dropdown rather than moving elsewhere, which
  // means it's reachable exactly by the people who can already see the switcher — anyone with
  // two or more, i.e. platform admins. A customer never meets it.
  if (workspaces.length <= 1) return null;

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
