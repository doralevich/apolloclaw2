"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { Button } from "@/components/ui/button";

export function CreateAgentButton({
  workspaceId,
  onCreated,
}: {
  workspaceId: string;
  onCreated: () => void;
}) {
  const { busy, run } = useAsyncAction();

  function create() {
    return run(async () => {
      await apiFetch("/api/agents", {
        method: "POST",
        body: JSON.stringify({ workspace_id: workspaceId }),
      });
      toast.success("Your agent is provisioning");
      onCreated();
    });
  }

  return (
    <Button onClick={create} disabled={busy}>
      <Plus className="h-4 w-4" />
      {busy ? "Creating..." : "Create agent"}
    </Button>
  );
}
