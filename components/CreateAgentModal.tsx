"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Briefcase,
  Calculator,
  GraduationCap,
  Home,
  Plus,
  Scale,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AGENT_TYPES } from "@/config/agent-types";
import { BUNDLE_PRICE_LABEL } from "@/lib/pricing/catalog";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Agent } from "@/lib/types";

// Registry icons are stored as lucide icon NAMES (plain strings, so the config stays
// server-safe); resolve them here with a generic fallback.
const TYPE_ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  Briefcase,
  Calculator,
  Scale,
  Stethoscope,
  ShieldCheck,
  Home,
  TrendingUp,
};

// Self-serve "Create Agent" dialog: one card per registry type. Free types (College
// Agent) POST /api/agents { workspace_id, type } directly; PAID types (planKey set) POST
// /api/build/checkout and redirect to Stripe — the webhook provisions after payment.
// Naming/avatar personalization happens post-payment, in the onboarding questionnaire's
// Personalize step (components/onboard/OnboardingForm.tsx) — not here. The server
// enforces the real gates (membership, entitlement, payment, one-per-type cap) — the UI
// just mirrors them: types the workspace already has render disabled with an "Already
// created" hint, and coming-soon types are never selectable.
export function CreateAgentModal({
  onCreated,
  triggerVariant,
  triggerSize,
}: {
  onCreated?: () => void;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  const { current, isPlatformAdmin } = useWorkspace();
  const { agents, refresh, setActiveId } = useActiveAgent();
  const { busy, run } = useAsyncAction();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Types this workspace already runs — drives the "Already created" state. Matched by
  // agent_type when the row has one, with template as the legacy fallback (paid agents can
  // share a fallback template, so template alone isn't enough).
  const existing = useMemo(
    () =>
      new Set(
        agents.flatMap((a) => [a.agent_type, a.template]).filter((t): t is string => !!t)
      ),
    [agents]
  );
  const alreadyHas = (t: (typeof AGENT_TYPES)[number]) =>
    existing.has(t.id) || existing.has(t.template);

  // Two filters, for two different reasons.
  //
  // `externalUrl` types are sold on another site — The College Agent, at thecollegeagent.ai.
  // Nothing in this app can create one: POST /api/agents rejects them outright (app/api/agents
  // /route.ts). So the card was never an option, only a door out to somebody else's checkout,
  // and standing on the ApolloClaw dashboard being asked to choose between your own product
  // and a college agent is a question with one answer. Excluded for everyone, admins included.
  //
  // `internal` types (the license build) are provisioned by the platform after checkout rather
  // than picked from a card, so they're filtered out for customers — "you cannot choose this"
  // and "this is not a thing you choose" are different messages. Platform admins DO see them,
  // because otherwise testing a provisioning change means having no way to provision.
  //
  // EXCEPT WHEN THE WORKSPACE HAS NONE, which is the dead end David found: delete your agent to
  // start over and there is no way back. The license type was the only thing this modal could
  // have offered, `internal` hid it, and the customer was left on a dashboard they are still
  // paying $189/mo for with nothing in it and no button. Their only route was to email us.
  //
  // This is a REBUILD, not a purchase. It appears only at zero agents, so it cannot be used to
  // add a second one - that is what seats are for, priced and behind Members. They have already
  // bought the licence and are still paying the hosting; giving it back to them is not a new
  // sale, and the server agrees: POST /api/agents already provisions this type for an entitled
  // admin, so the only thing that stood in the way was this filter.
  const hasNoAgents = agents.length === 0;
  const pickableTypes = AGENT_TYPES.filter(
    (t) => !t.externalUrl && (isPlatformAdmin || !t.internal || hasNoAgents)
  );

  // One option is not a choice. With the College Agent gone from the list this is the normal
  // case, so the dialog states what it is about to build instead of rendering a list of one
  // and asking you to select it first.
  const soloType = pickableTypes.length === 1 ? pickableTypes[0] : null;

  const selectedType = pickableTypes.find((t) => t.id === selected) ?? null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Fresh form on every open, preselecting the first type that can actually be created.
      setSelected(pickableTypes.find((t) => t.available && !alreadyHas(t))?.id ?? null);
    }
  }

  function submit() {
    if (!current || !selectedType) return;
    return run(async () => {
      // Paid agents: hand off to Stripe Checkout. The webhook provisions after payment
      // and the buyer lands back on the dashboard with ?checkout=success.
      if (selectedType.planKey) {
        const { url } = await apiFetch<{ url: string }>("/api/build/checkout", {
          method: "POST",
          body: JSON.stringify({ workspace_id: current.id, type: selectedType.id }),
        });
        window.location.assign(url);
        return;
      }

      const created = await apiFetch<Agent>("/api/agents", {
        method: "POST",
        body: JSON.stringify({ workspace_id: current.id, type: selectedType.id }),
      });
      toast.success(`${created.name || selectedType.label} is provisioning`);
      setOpen(false);
      // Refresh the global agent list and make the new agent the active one so Chat /
      // Integrations / Credits point at it immediately.
      await refresh();
      if (created?.id) setActiveId(created.id);
      onCreated?.();
    });
  }

  if (!current) return null;

  // Nothing left to pick — for a customer, both registry entries are internal: the Apollo
  // Agent arrives with the licence and the College Agent is another product on another site.
  // Render no trigger at all rather than a button that opens an empty dialog. Admins never
  // reach this, since internal types are pickable for them.
  if (pickableTypes.length === 0) return null;

  const soloAlreadyCreated = !!soloType && alreadyHas(soloType);
  const SoloIcon = (soloType?.icon && TYPE_ICONS[soloType.icon]) || Bot;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </DialogTrigger>
      {/* The card list scrolls internally against a capped dialog height, so the create /
          checkout button stays visible however many types the registry grows back to. */}
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>{soloType ? `Create your ${soloType.label}` : "Create an agent"}</DialogTitle>
          <DialogDescription>
            {soloType
              ? `A new ${soloType.label} for ${current.name}.`
              : `Pick an agent type for ${current.name}. Each workspace can have one agent per type.`}
          </DialogDescription>
        </DialogHeader>

        {soloType ? (
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <SoloIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{soloType.label}</span>
                {soloAlreadyCreated && <Badge variant="muted">Already created</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{soloType.description}</p>
              {soloType.planKey && !soloAlreadyCreated && (
                <p className="mt-1 text-xs font-medium">{BUNDLE_PRICE_LABEL}</p>
              )}
              {soloAlreadyCreated && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {current.name} already has one. Each workspace can have one agent per type.
                </p>
              )}
            </div>
          </div>
        ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {pickableTypes.map((t) => {
            const Icon = (t.icon && TYPE_ICONS[t.icon]) || Bot;
            const alreadyCreated = t.available && alreadyHas(t);
            const disabled = !t.available || alreadyCreated;
            const isSelected = selectedType?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelected(t.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  isSelected ? "border-primary ring-1 ring-primary" : "border-border",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{t.label}</span>
                    {t.comingSoon && <Badge variant="muted">Coming soon</Badge>}
                    {alreadyCreated && <Badge variant="muted">Already created</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  {t.planKey && !alreadyCreated && (
                    <p className="mt-1 text-xs font-medium">{BUNDLE_PRICE_LABEL}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !selectedType}>
            {selectedType?.planKey
              ? busy
                ? "Redirecting to checkout..."
                : "Continue to Checkout"
              : busy
                ? "Creating..."
                : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
