"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { statusVariant } from "@/lib/format";
import { getAgentType } from "@/config/agent-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentActionsMenu } from "@/components/AgentActionsMenu";
import { AgentNameCell } from "@/components/AgentNameCell";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { SetupBanner, SetupCell } from "@/components/SetupPrompt";

// The Agents table reads the SAME list as the sidebar switcher (ActiveAgentProvider), so
// lifecycle actions here — create/start/stop/delete/rename — immediately update Chat,
// Integrations, and Credits too. The provider also owns the transitional-status poll.
export function AgentsView() {
  const { current } = useWorkspace();
  const { agents, role, loading, error, refresh } = useActiveAgent();

  // Storefront deep link (/agents -> /dashboard?buy=cfo, surviving login): as soon as the
  // workspace is known, start checkout for the requested type and hand off to Stripe. The
  // param is stripped first so a failed attempt doesn't loop on refresh.
  const buyFired = useRef(false);
  useEffect(() => {
    if (!current || buyFired.current) return;
    const params = new URLSearchParams(window.location.search);
    const buy = params.get("buy");
    if (!buy) return;
    buyFired.current = true;
    params.delete("buy");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    toast.info("Taking you to checkout...");
    apiFetch<{ url: string }>("/api/build/checkout", {
      method: "POST",
      body: JSON.stringify({ workspace_id: current.id, type: buy }),
    })
      .then(({ url }) => window.location.assign(url))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Couldn't start checkout"));
  }, [current]);

  // Landing back from Stripe Checkout (?checkout=success|cancelled). Provisioning happens
  // in the webhook, so on success the new agent appears once it lands — poll the list a
  // few times rather than making the user mash refresh. window.location (not
  // useSearchParams) keeps this page statically prerenderable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    if (checkout === "success") {
      toast.success("Payment received — your agent is being provisioned and will appear here shortly.");
      const timers = [5_000, 15_000, 30_000].map((ms) => setTimeout(() => void refresh(), ms));
      params.delete("checkout");
      params.delete("type");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      return () => timers.forEach(clearTimeout);
    }
    if (checkout === "cancelled") {
      toast.info("Checkout cancelled — you weren't charged.");
      params.delete("checkout");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Agents</h1>
          <p className="text-sm text-muted-foreground">{current.name}</p>
        </div>
        {/* Visible to every member — the server enforces entitlement + the per-type cap. */}
        <CreateAgentModal triggerSize="sm" />
      </div>

      {/* Nothing used to tell a customer their agent was unconfigured. */}
      <SetupBanner agents={agents} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : agents.length === 0 && error ? (
        // Fetch failed with nothing cached — don't masquerade as an empty workspace.
        <div className="flex items-center justify-between gap-3 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this workspace&apos;s agents just now. It usually comes right back.
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          {/* There is nothing to press when no type is self-serve: an Apollo Agent arrives
              with the license, so an empty workspace is a billing state, not a missing click.
              CreateAgentModal renders nothing in that case and this text carries the answer. */}
          <p className="text-sm text-muted-foreground">
            No agents in this workspace yet. Your Apollo Agent is created for you once your
            license purchase and setup questionnaire are complete.
          </p>
          <div className="mt-4 flex justify-center">
            <CreateAgentModal />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Setup</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Resources</th>
                <th className="px-4 py-2 text-center font-medium">Quick actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.agent37_id} className="border-t [&>td]:align-middle">
                  <td className="px-4 py-3">
                    <AgentNameCell agent={a} canEdit={role === "admin"} onRenamed={refresh} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Badge variant={statusVariant(a.live_status)}>{a.live_status ?? "unknown"}</Badge>
                      {a.past_due && <Badge variant="warning">past due</Badge>}
                    </div>
                    {a.status_reason && (
                      <div
                        className="mt-1 max-w-[16rem] truncate text-xs text-destructive"
                        title={a.status_reason.message}
                      >
                        {a.status_reason.message}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <SetupCell agent={a} />
                  </td>
                  {/* The product name, not the image it was built from. Every Apollo Agent
                      provisions from the `college-agent` template (config/agent-types.ts), so
                      showing the raw template told a paying ApolloClaw customer they had bought
                      something called "college-agent". */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {(a.agent_type ? getAgentType(a.agent_type)?.label : undefined) ?? a.template ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.cpu} vCPU · {a.memory} GB · {a.disk} GB
                  </td>
                  <td className="px-4 py-3">
                    <AgentActionsMenu agent={a} role={role} onChanged={refresh} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
