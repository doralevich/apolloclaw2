"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { CREDIT_PACKS } from "@/lib/pricing/catalog";
import { Button } from "@/components/ui/button";

// Buying half of the Credits tab: pick a pack, go to Stripe, come back. Nothing is granted
// here — the webhook records the purchase and hands it to the runtime, so this component's
// only job is to start checkout and then show what happened.

interface Purchase {
  id: number;
  amountCents: number;
  packName: string;
  status: "pending" | "delivered" | "failed";
  createdAt: string;
}

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function BuyCredits({ agentId, workspaceId }: { agentId: string | null; workspaceId: string | null }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    apiFetch<{ purchases: Purchase[] }>(`/api/credits?workspace_id=${encodeURIComponent(workspaceId)}`)
      .then((res) => {
        if (!cancelled) setPurchases(res.purchases);
      })
      // History is supporting detail — a failure here must not take over the page.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Stripe sends the customer back with ?purchased=1. The webhook may still be in flight, so
  // this says "on its way" rather than claiming a balance that hasn't landed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchased") === "1") {
      toast.success("Payment received - your credits are being applied.");
    } else if (params.get("canceled") === "1") {
      toast("Checkout canceled - nothing was charged.");
    }
    if (params.has("purchased") || params.has("canceled")) {
      params.delete("purchased");
      params.delete("canceled");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
  }, []);

  async function buy(catalogKey: string) {
    if (!agentId || busy) return;
    setBusy(catalogKey);
    try {
      const { url } = await apiFetch<{ url: string }>("/api/credits/checkout", {
        method: "POST",
        body: JSON.stringify({ agent_id: agentId, pack: catalogKey }),
      });
      window.location.assign(url);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't start checkout.");
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Buy credits</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        One-time top-ups on top of your monthly allowance. They don&apos;t expire.{" "}
        {/* Said out loud, because the card is saved for off-session use and that is not
            something to do quietly. It is also the thing that unlocks auto-recharge. */}
        Your card is saved so you can turn on auto-recharge.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CREDIT_PACKS.map((pack) => (
          <div key={pack.catalogKey} className="flex flex-col rounded-lg border p-4">
            {/* Price only. What reaches the runtime is the price net of our margin, and that
                figure is not the customer's business at the point of choosing a pack. */}
            <div className="text-lg font-semibold tabular-nums">{money(pack.amountCents)}</div>
            <div className="text-xs text-muted-foreground">top-up</div>
            <p className="mt-2 flex-1 text-xs text-muted-foreground">{pack.blurb}</p>
            <Button
              size="sm"
              className="mt-4"
              disabled={!agentId || busy !== null}
              onClick={() => buy(pack.catalogKey)}
            >
              {busy === pack.catalogKey ? "Starting…" : "Buy"}
            </Button>
          </div>
        ))}
      </div>

      {purchases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-medium text-muted-foreground">Purchase history</h3>
          <div className="mt-2 overflow-hidden rounded-lg border">
            {purchases.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${i > 0 ? "border-t" : ""}`}
              >
                <div className="min-w-0">
                  <div className="truncate">{p.packName}</div>
                  <div className="text-xs text-muted-foreground">{shortDate(p.createdAt)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {p.status !== "delivered" && (
                    <span className="text-xs text-muted-foreground">
                      {p.status === "pending" ? "Applying…" : "Needs attention"}
                    </span>
                  )}
                  <span className="tabular-nums">{money(p.amountCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
