import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { isListingSide, isListingStatus } from "@/config/listings";
import { listListings, syncListingsAfterChange, type ListingRow } from "@/lib/listings";

type Ctx = { params: Promise<{ id: string }> };

// One agent's listings and deals.
//
// Service-role behind requireAgentAccess, the same as agent_schedules and agent_tasks next door.
//
// EVERY MUTATION SYNCS. The point of this table is that the agent reads it, so a row written here
// and not pushed to the box is a row the agent will contradict at 7am. The sync runs after the
// response rather than inside it - see lib/listings.ts for why - so saving stays instant.

function toApi(row: ListingRow) {
  return {
    id: row.id,
    address: row.address,
    side: row.side,
    status: row.status,
    priceCents: row.price_cents,
    beds: row.beds,
    baths: row.baths,
    mlsNumber: row.mls_number,
    listDate: row.list_date,
    contractDate: row.contract_date,
    closeDate: row.close_date,
    clientName: row.client_name,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  return json({ listings: (await listListings(id)).map(toApi) });
});

type Body = {
  id?: number;
  address?: string;
  side?: string;
  status?: string;
  priceCents?: number | null;
  beds?: number | null;
  baths?: number | null;
  mlsNumber?: string | null;
  listDate?: string | null;
  contractDate?: string | null;
  closeDate?: string | null;
  clientName?: string | null;
  notes?: string | null;
};

/** Empty string to null, so clearing a field in the form actually clears the column rather than
 *  storing "" and rendering a blank line in the file the agent reads. */
function text(value: string | null | undefined, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/** A date the database will accept, or null. Anything else is rejected rather than stored, since
 *  a bad date here becomes a deadline the agent reports wrongly. */
function date(value: string | null | undefined, field: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, "invalid_request", `${field} must be a date`);
  }
  return value;
}

// Create or update. One endpoint for both, keyed on whether an id came in, because from the
// form's point of view it is the same question: what does this property look like now.
export const PUT = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const body = await readJson<Body>(request);

  const address = text(body.address, 300);
  if (!address) throw new ApiError(400, "invalid_request", "An address is required");

  const side = body.side ?? "listing";
  if (!isListingSide(side)) throw new ApiError(400, "invalid_request", "Unknown side");

  const status = body.status ?? "active";
  if (!isListingStatus(status)) throw new ApiError(400, "invalid_request", "Unknown status");

  // Rejected rather than clamped: a price that comes back as a different number from the one
  // somebody typed is worse than an error, because they will not notice.
  const price = body.priceCents;
  if (price !== null && price !== undefined) {
    if (!Number.isSafeInteger(price) || price < 0) {
      throw new ApiError(400, "invalid_request", "Price must be a whole number of cents");
    }
  }

  const room = (value: number | null | undefined, field: string): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 999) {
      throw new ApiError(400, "invalid_request", `${field} must be a number`);
    }
    return value;
  };

  const row = {
    agent37_id: id,
    address,
    side,
    status,
    price_cents: price ?? null,
    beds: room(body.beds, "Beds"),
    baths: room(body.baths, "Baths"),
    mls_number: text(body.mlsNumber, 60),
    list_date: date(body.listDate, "List date"),
    contract_date: date(body.contractDate, "Contract date"),
    close_date: date(body.closeDate, "Close date"),
    client_name: text(body.clientName, 200),
    notes: text(body.notes, 4000),
    updated_at: new Date().toISOString(),
  };

  const db = createAdminClient();

  if (body.id !== undefined) {
    // Scoped to the agent as well as the id. Without the second condition an id from another
    // workspace would be editable by anyone who could guess it, since the id alone is a global
    // sequence and access was only ever checked against the agent in the URL.
    const { data, error } = await db
      .from("agent_listings")
      .update(row)
      .eq("id", body.id)
      .eq("agent37_id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new ApiError(404, "not_found", "That listing is gone");

    syncListingsAfterChange(id);
    return json(toApi(data as ListingRow));
  }

  const { data, error } = await db.from("agent_listings").insert(row).select().single();
  if (error) throw new Error(error.message);

  syncListingsAfterChange(id);
  return json(toApi(data as ListingRow));
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const listingId = Number(new URL(request.url).searchParams.get("listingId"));
  if (!Number.isSafeInteger(listingId)) {
    throw new ApiError(400, "invalid_request", "listingId is required");
  }

  const db = createAdminClient();
  const { error } = await db
    .from("agent_listings")
    .delete()
    .eq("id", listingId)
    .eq("agent37_id", id);
  if (error) throw new Error(error.message);

  syncListingsAfterChange(id);
  return json({ id: listingId, deleted: true });
});
