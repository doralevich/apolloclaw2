"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { Button } from "@/components/ui/button";

// Plan — the page about the MONEY, which the settings area never had.
//
// David's review put it plainly: the thing called Billing showed one agent's $25 token
// allowance and nothing about the actual bill - the license, the hosting seats, the next
// invoice, the card. Credits stayed where every low-balance link already points; this page is
// the subscription, and the Stripe customer portal handles what Stripe already does better
// than a rebuild would: invoices, the card on file, cancellation.
//
// Admin-only content by construction - the seats endpoint refuses members - and the member
// fallback says who to ask rather than showing an error.

// From the catalog's cents so a reprice cannot leave this page lying.
const SEAT_PRICE = 189; // == HOSTING_PLAN.amountCents / 100; hardcoded because the catalog is server-only

export function PlanView() {
  const { current } = useWorkspace();
  const [seats, setSeats] = useState<number | null | undefined>(undefined);
  const [denied, setDenied] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

  const workspaceId = current?.id;
  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    apiFetch<{ seats: number | null }>(`/api/workspaces/${workspaceId}/seats`)
      .then((res) => {
        if (!cancelled) setSeats(res.seats);
      })
      .catch((e) => {
        if (cancelled) return;
        const err = e as Error & { status?: number };
        if (err.status === 403) setDenied(true);
        else toast.error(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function openPortal() {
    if (!workspaceId) return;
    setPortalBusy(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/workspaces/${workspaceId}/billing-portal`, {
        method: "POST",
      });
      window.location.assign(url);
    } catch (e) {
      toast.error((e as Error).message);
      setPortalBusy(false);
    }
  }

  if (!current) return <p className="text-sm text-muted-foreground">No workspace selected.</p>;

  if (denied) {
    return (
      <div className="max-w-xl rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Billing for this workspace is managed by its admins. If something about the plan needs
        changing, they are the ones who can.
      </div>
    );
  }

  const seatCount = seats ?? null;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What this workspace pays for, and where to manage it.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">ApolloClaw Agent License</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Owned. Paid once - it does not renew, and adding agents never charges it again.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Agent hosting</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              One seat per agent, on one subscription and one invoice.
            </p>
          </div>
          {seats === undefined ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : seatCount === null ? (
            <span className="text-sm text-muted-foreground">Billed directly</span>
          ) : (
            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums">
                ${(seatCount * SEAT_PRICE).toLocaleString("en-US")}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {seatCount} seat{seatCount === 1 ? "" : "s"} × ${SEAT_PRICE}/mo
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
          Each seat includes $25/mo of usage credit. Adding an agent adds a seat pro-rated from
          that day; deleting one credits the seat back automatically.
        </p>
      </div>

      {seatCount !== null && (
        <div className="flex items-center justify-between rounded-xl border bg-card p-5">
          <div>
            <h2 className="font-semibold">Invoices &amp; payment method</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Past invoices, the card on file, and cancellation - in Stripe&apos;s secure portal.
            </p>
          </div>
          <Button onClick={openPortal} disabled={portalBusy || seats === undefined}>
            {portalBusy ? "Opening..." : "Manage billing"}
            <ExternalLink className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
