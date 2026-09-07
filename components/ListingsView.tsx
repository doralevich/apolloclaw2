"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Home, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { HelpFooter } from "@/components/HelpFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LISTING_STATUSES,
  hasListings,
  statusLabel,
  type ListingSide,
  type ListingStatus,
} from "@/config/listings";

// Listings and deals: the book of business, and the reason it is worth typing in.
//
// IT IS NOT A CRM AND MUST NOT BECOME ONE. Every realtor here already pays for Follow Up Boss or
// kvCORE, and a worse copy of it alongside the real one is worth less than nothing - two places
// to look and one of them stale. What this is instead: the shortest list of facts that lets the
// agent answer "what am I working on" without asking.
//
// Which is the whole justification. The scheduled reports we ship open with "for each of my active
// listings" and "every deal I have under contract", and until now the agent had no idea what
// either was, so a report that should arrive finished began by interviewing its owner. Everything
// saved here is written into a file on the box (LISTINGS.md), so those reports have ground truth.
//
// That also decides the field list: an address, a status, a price and three dates. Anything the
// agent cannot use is a field somebody has to fill in for nothing.

type Listing = {
  id: number;
  address: string;
  side: ListingSide;
  status: ListingStatus;
  priceCents: number | null;
  beds: number | null;
  baths: number | null;
  mlsNumber: string | null;
  listDate: string | null;
  contractDate: string | null;
  closeDate: string | null;
  clientName: string | null;
  notes: string | null;
};

const EMPTY: Omit<Listing, "id"> = {
  address: "",
  side: "listing",
  status: "active",
  priceCents: null,
  beds: null,
  baths: null,
  mlsNumber: null,
  listDate: null,
  contractDate: null,
  closeDate: null,
  clientName: null,
  notes: null,
};

function money(cents: number | null): string {
  if (cents === null) return "";
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

/** What somebody typed into a price box, as cents. Tolerant on purpose: "915,625", "$915,625"
 *  and "915625" are the same number, and rejecting two of the three teaches people to distrust
 *  the form rather than to type differently. */
function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

export function ListingsView() {
  const { active, loading } = useActiveAgent();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [editing, setEditing] = useState<Listing | Omit<Listing, "id"> | null>(null);

  const agentId = active?.agent37_id;

  const load = useCallback(() => {
    if (!agentId) return;
    apiFetch<{ listings: Listing[] }>(`/api/agents/${agentId}/listings`)
      .then((res) => setListings(res.listings))
      .catch(() => setListings([]));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Home className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          You don&apos;t have an agent yet. Create one and you can keep your listings here.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/settings/agent">Go to My Agent</Link>
        </Button>
      </div>
    );
  }

  // Reachable by typing the URL on an agent that has no listings feature. Hiding the rail row is
  // not the same as blocking the page, and a table nobody's agent reads is worse than a sentence
  // saying so.
  if (!hasListings(active.agent_type)) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Listings are part of the Real Estate Agent. {active.name || "This agent"} doesn&apos;t
          use them.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Listings and deals</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            What you&apos;re working on right now. Your agent reads this, so anything here is what
            it means by &quot;your listings&quot; in a brief or a report.
          </p>
        </div>
        {editing === null && (
          <Button className="shrink-0" onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {editing !== null && (
        <ListingForm
          agentId={active.agent37_id}
          initial={editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {listings === null && <p className="text-sm text-muted-foreground">Loading...</p>}

      {listings !== null && listings.length === 0 && editing === null && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Home className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing here yet. Add a listing or a deal and your agent will know about it the next
            time you ask.
          </p>
        </div>
      )}

      {/* Grouped by status, live work first. A flat list sorted by date buries the two things
          under contract among forty closed ones, and the two under contract are the job. */}
      {LISTING_STATUSES.map((status) => {
        const group = (listings ?? []).filter((l) => l.status === status);
        if (!group.length) return null;
        return (
          <section key={status} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {statusLabel(status)} ({group.length})
            </h3>
            {group.map((listing) => (
              <ListingCard
                key={listing.id}
                agentId={active.agent37_id}
                listing={listing}
                onEdit={() => setEditing(listing)}
                onChanged={load}
              />
            ))}
          </section>
        );
      })}

      <HelpFooter className="max-w-4xl" />
    </div>
  );
}

function ListingCard({
  agentId,
  listing,
  onEdit,
  onChanged,
}: {
  agentId: string;
  listing: Listing;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const facts = [
    listing.side === "buyer" ? "Buyer side" : null,
    money(listing.priceCents) || null,
    listing.beds !== null || listing.baths !== null
      ? `${listing.beds ?? "?"} bd / ${listing.baths ?? "?"} ba`
      : null,
    listing.clientName,
  ].filter(Boolean);

  const dates = [
    listing.listDate ? `Listed ${listing.listDate}` : null,
    listing.contractDate ? `Contract ${listing.contractDate}` : null,
    listing.closeDate ? `Closing ${listing.closeDate}` : null,
  ].filter(Boolean);

  function remove() {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/listings?listingId=${listing.id}`, { method: "DELETE" })
      .then(() => onChanged())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{listing.address}</p>
          {facts.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">{facts.join(" · ")}</p>
          )}
          {dates.length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">{dates.join(" · ")}</p>
          )}
          {listing.notes && (
            <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
              {listing.notes}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            title="Delete"
            onClick={remove}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ListingForm({
  agentId,
  initial,
  onDone,
  onCancel,
}: {
  agentId: string;
  initial: Listing | Omit<Listing, "id">;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [priceText, setPriceText] = useState(money(initial.priceCents));
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Omit<Listing, "id">>(key: K, value: Listing[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function save() {
    setBusy(true);
    apiFetch(`/api/agents/${agentId}/listings`, {
      method: "PUT",
      body: JSON.stringify({
        ...("id" in form ? { id: form.id } : {}),
        address: form.address,
        side: form.side,
        status: form.status,
        priceCents: parsePrice(priceText),
        beds: form.beds,
        baths: form.baths,
        mlsNumber: form.mlsNumber,
        listDate: form.listDate,
        contractDate: form.contractDate,
        closeDate: form.closeDate,
        clientName: form.clientName,
        notes: form.notes,
      }),
    })
      .then(() => onDone())
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setBusy(false));
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h3 className="text-base font-semibold">
        {"id" in form ? "Edit" : "Add a listing or deal"}
      </h3>

      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="l-address">Address</Label>
          <Input
            id="l-address"
            value={form.address}
            maxLength={300}
            placeholder="123 Camelback Rd, Scottsdale AZ"
            onChange={(e) => set("address", e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="l-status">Status</Label>
            <select
              id="l-status"
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ListingStatus)}
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-side">Side</Label>
            <select
              id="l-side"
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={form.side}
              onChange={(e) => set("side", e.target.value as ListingSide)}
            >
              <option value="listing">I have the listing</option>
              <option value="buyer">I represent the buyer</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-price">Price</Label>
            <Input
              id="l-price"
              value={priceText}
              inputMode="numeric"
              placeholder="$915,625"
              onChange={(e) => setPriceText(e.target.value)}
              onBlur={() => setPriceText(money(parsePrice(priceText)))}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="l-beds">Beds</Label>
            <Input
              id="l-beds"
              type="number"
              min={0}
              step={1}
              value={form.beds ?? ""}
              onChange={(e) => set("beds", e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-baths">Baths</Label>
            <Input
              id="l-baths"
              type="number"
              min={0}
              step={0.5}
              value={form.baths ?? ""}
              onChange={(e) => set("baths", e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="l-client">Client</Label>
            <Input
              id="l-client"
              value={form.clientName ?? ""}
              maxLength={200}
              placeholder="The Hendersons"
              onChange={(e) => set("clientName", e.target.value || null)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="l-list">Listed</Label>
            <Input
              id="l-list"
              type="date"
              value={form.listDate ?? ""}
              onChange={(e) => set("listDate", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-contract">Under contract</Label>
            <Input
              id="l-contract"
              type="date"
              value={form.contractDate ?? ""}
              onChange={(e) => set("contractDate", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-close">Closing</Label>
            <Input
              id="l-close"
              type="date"
              value={form.closeDate ?? ""}
              onChange={(e) => set("closeDate", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-mls">MLS #</Label>
            <Input
              id="l-mls"
              value={form.mlsNumber ?? ""}
              maxLength={60}
              onChange={(e) => set("mlsNumber", e.target.value || null)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="l-notes">Anything your agent should know</Label>
          <Textarea
            id="l-notes"
            rows={3}
            maxLength={4000}
            value={form.notes ?? ""}
            placeholder="Sellers are relocating in June and will take a rent-back. Roof was flagged at inspection."
            onChange={(e) => set("notes", e.target.value || null)}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button disabled={busy || !form.address.trim()} onClick={save}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
