"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// "Another agent, for me."
//
// The third of three ways to end up with an agent, and the last one missing:
//   * a colleague gets one through Members, as a seat;
//   * somebody who deleted theirs rebuilds from Welcome, at zero agents;
//   * and this - you already have one and want a second, for different work.
//
// It runs through the SEATS endpoint rather than POST /api/agents, and that is the whole point.
// /api/agents provisions without touching billing, which is right for a rebuild (they are
// already paying for one) and wrong here: a second agent is a second VPS with its own token
// budget, and it has to appear on the bill the moment it appears in the sidebar. Seats already
// bills, provisions, rolls back a failed build and assigns an owner; pointing it at yourself
// instead of an invitee is the only difference.
//
// `additional: true` is required because that endpoint refuses to give somebody a second agent
// by default - a guard against an admin double-charging for a colleague by pressing twice. That
// is an accident; this is the same request made deliberately, and the two are indistinguishable
// at the API layer, so the caller has to say which it is.
export function AddAgentButton({ trigger }: { trigger?: React.ReactNode } = {}) {
  const router = useRouter();
  const { current, userEmail } = useWorkspace();
  const { refresh, setActiveId } = useActiveAgent();
  const { busy, run } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  if (!current) return null;

  function submit() {
    if (!current) return;
    return run(async () => {
      const res = await apiFetch<{ agent_id: string }>(`/api/workspaces/${current.id}/seats`, {
        method: "POST",
        body: JSON.stringify({
          // Your own address: this is an agent for you, so there is no invitation and no
          // handover - the endpoint finds you as an existing member and assigns it directly.
          email: userEmail,
          name: name.trim() || undefined,
          additional: true,
          // Your own domain by definition, so the outside-company confirm can never apply.
          allow_external: true,
        }),
      });

      setOpen(false);
      setName("");
      await refresh();
      if (res.agent_id) setActiveId(res.agent_id);
      toast.success("Your new agent is building");

      // Straight into its own questionnaire, carrying the agent id.
      //
      // The id matters here in a way it never did before: this workspace now holds two agents of
      // the same type, so "the agent of this type" has stopped being a single answer. Without it
      // these answers would land on whichever row the lookup found first - which is the older
      // agent, and would overwrite the answers it was built from.
      router.push(
        `/onboard/${LICENSE_AGENT_TYPE_ID}?ws=${encodeURIComponent(current.id)}&agent=${encodeURIComponent(res.agent_id)}`
      );
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The default trigger is the labelled button on Settings > My Agent. The sidebar passes
          its own - an icon beside the agent's name, where David asked for it - because that rail
          has no room for a five-word button and the dialog states the charge either way. */}
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Add another agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add another agent</DialogTitle>
          <DialogDescription>
            A second agent of your own, with its own connections, its own chat history and its own
            credit. Useful when the work is genuinely separate - a different business, or a
            different job you would not want sharing a mailbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="new-agent-name">Name it (optional)</Label>
          <Input
            id="new-agent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="You can change this later"
            autoComplete="off"
          />
        </div>

        {/* The charge, stated before the button that makes it. This and the seat checkbox in
            Members are the only two controls in the dashboard that bill a card, and neither
            should ever be pressed without the number in view. */}
        <div className="rounded-lg border border-dashed bg-secondary/40 p-3 text-sm">
          <p className="font-medium text-foreground">Adds $189/month to your hosting</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pro-rated from today, on the same subscription and the same invoice - one line that
            goes up by one. No second licence fee: you have already bought that.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Building..." : "Add agent - $189/mo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
