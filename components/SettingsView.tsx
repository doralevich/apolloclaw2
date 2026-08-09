"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WorkspaceLogoUpload } from "@/components/WorkspaceLogoUpload";
import { ThemePicker } from "@/components/ThemePicker";

export function SettingsView() {
  const { current, refresh, setCurrentId } = useWorkspace();
  const [name, setName] = useState(current?.name ?? "");
  const [deleting, setDeleting] = useState(false);
  const { busy, run } = useAsyncAction();

  useEffect(() => {
    setName(current?.name ?? "");
  }, [current?.id, current?.name]);

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;

  const isAdmin = current.role === "admin";

  function save() {
    if (!current) return;
    return run(async () => {
      await apiFetch(`/api/workspaces/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      await refresh();
      toast.success("Workspace renamed");
    });
  }

  async function remove() {
    if (!current) return;
    await apiFetch(`/api/workspaces/${current.id}`, { method: "DELETE" });
    const ws = await refresh();
    setCurrentId(ws[0]?.id ?? "");
    toast.success("Workspace deleted");
    window.location.href = "/dashboard";
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">General</h1>
        <p className="text-sm text-muted-foreground">{current.name}</p>
      </div>

      <WorkspaceLogoUpload />

      <ThemePicker />

      <div className="space-y-2">
        <Label htmlFor="ws-name">Workspace name</Label>
        <div className="flex gap-2">
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
          />
          {isAdmin && (
            <Button onClick={save} disabled={busy || !name.trim() || name.trim() === current.name}>
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Workspace ID</Label>
        <div className="flex gap-2">
          <Input readOnly value={current.id} className="font-mono text-xs" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(current.id);
              toast.success("Copied");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Danger zone
          </h2>
          {/* The agent first: deleting one is the recoverable-ish mistake (buy another,
              answer the questionnaire again), and deleting the workspace takes everything
              including this agent with it. */}
          {/* Delete agent left this page in stage 2 of the settings rework. It deleted
              whichever agent the HIDDEN sidebar switcher had active - in a two-agent
              workspace, a roulette wheel. It lives on each agent's own card now, where the
              card names what the button destroys. */}

          <div className="rounded-lg border border-destructive/40 p-4">
            <h2 className="text-sm font-medium">Delete workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently deletes this workspace and all of its agents. Only the workspace owner
              can do this.
            </p>
            <Button variant="destructive" className="mt-3" onClick={() => setDeleting(true)}>
              Delete workspace
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete workspace?"
        description="This deletes the workspace and tears down all of its agents. This cannot be undone."
        confirmText="Delete workspace"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
