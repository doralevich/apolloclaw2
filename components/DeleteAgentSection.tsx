"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { getAgentType } from "@/config/agent-types";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Deleting an agent, moved here out of the quick-actions menu on the agent card.
//
// It used to sit in that dropdown one item below "Stop agent" — an irreversible teardown of
// the thing the customer bought, a single click away from a routine action they might take
// weekly. Settings is where irreversible things live, next to Delete workspace, and getting
// here takes enough deliberate steps that nobody arrives by accident.
//
// The confirm dialog names the agent rather than saying "this agent", because by the time
// someone is looking at a destructive confirmation the useful information is WHICH one.
export function DeleteAgentSection() {
  const { active, role, refresh, setActiveId } = useActiveAgent();
  const [open, setOpen] = useState(false);

  if (!active || role !== "admin") return null;

  const name =
    active.name?.trim() ||
    (active.agent_type ? getAgentType(active.agent_type)?.label : undefined) ||
    "your agent";

  async function remove() {
    if (!active) return;
    await apiFetch(`/api/agents/${active.agent37_id}`, { method: "DELETE" });
    toast.success(`${name} deleted`);
    await refresh();
    // Clear the selection rather than picking a successor: the provider derives `active` as
    // `agents.find(id) ?? agents[0] ?? null`, so an id that matches nothing lands on whatever
    // is left, or null in an emptied workspace. Leaving the deleted id in place would keep
    // the sidebar, Chat and Connections pointed at an instance that no longer exists.
    setActiveId("");
  }

  return (
    <>
      <div className="rounded-lg border border-destructive/40 p-4">
        <h2 className="text-sm font-medium">Delete {name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently tears down this agent, its memory of your business, and its app
          connections. Your workspace and billing stay. This cannot be undone.
        </p>
        <Button variant="destructive" className="mt-3" onClick={() => setOpen(true)}>
          Delete agent
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${name}?`}
        description={`This permanently deletes ${name} and everything it has learned about your business. Setting up a replacement means filling in the questionnaire again. This cannot be undone.`}
        confirmText="Delete agent"
        destructive
        onConfirm={remove}
      />
    </>
  );
}
