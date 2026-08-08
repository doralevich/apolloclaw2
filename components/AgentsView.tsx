"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { AgentVitals } from "@/components/AgentVitals";
import { CreateAgentModal } from "@/components/CreateAgentModal";
import { AddAgentButton } from "@/components/AddAgentButton";
import { SetupBanner } from "@/components/SetupPrompt";

// My Agent reads the SAME list as the sidebar switcher (ActiveAgentProvider), so
// lifecycle actions here — create/start/stop/delete/rename — immediately update Chat,
// Integrations, and Credits too. The provider also owns the transitional-status poll.
export function AgentsView() {
  const { current, isPlatformAdmin } = useWorkspace();
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
      toast.success("Payment received - your agent is being provisioned and will appear here shortly.");
      const timers = [5_000, 15_000, 30_000].map((ms) => setTimeout(() => void refresh(), ms));
      params.delete("checkout");
      params.delete("type");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      return () => timers.forEach(clearTimeout);
    }
    if (checkout === "cancelled") {
      toast.info("Checkout cancelled - you weren't charged.");
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
          <h1 className="text-2xl font-semibold tracking-tight">{agents.length > 1 ? "My Agents" : "My Agent"}</h1>
          <p className="text-sm text-muted-foreground">{current.name}</p>
        </div>
        {/* Two different acts, so two different controls.
            CreateAgentModal is the REBUILD: it renders only at zero agents and spends nothing
            beyond what they already pay. AddAgentButton is a PURCHASE - a second agent, its own
            VPS, its own credit, +$189/mo - so it only shows once there is something to add to,
            and it states the charge before it makes it. */}
        {agents.length === 0 ? <CreateAgentModal triggerSize="sm" /> : <AddAgentButton />}
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
        /* A card each, not a table. A customer has exactly one agent, so the table rendered
           a header row over a single row — and two of its columns (Type, Resources) answered
           questions nobody asked. Several cards still read fine for the admin case. */
        <div className="space-y-4">
          {agents.map((a) => (
            <AgentCard
              key={a.agent37_id}
              agent={a}
              role={role}
              isPlatformAdmin={isPlatformAdmin}
              onChanged={refresh}
            />
          ))}

          {/* Under the card, because both answer follow-ups to what the card says. The badge
              says the container is running; these say whether it is about to run out of credit
              and whether anybody is actually talking to it. */}
          {agents.length === 1 && <AgentVitals agentId={agents[0].agent37_id} />}

        </div>
      )}
    </div>
  );
}
