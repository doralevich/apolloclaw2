import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMatterStatus } from "@/config/matters";
import { listMatters, syncMattersAfterChange, type MatterRow } from "@/lib/matters";

type Ctx = { params: Promise<{ id: string }> };

// One practice's matters.
//
// Service-role behind requireAgentAccess, the same as agent_listings and agent_schedules.
//
// Every mutation syncs the file on the box, after the response rather than inside it. A row
// written here and not pushed is a row the agent will contradict at 7am.

function toApi(row: MatterRow) {
  return {
    id: row.id,
    title: row.title,
    matterNumber: row.matter_number,
    clientName: row.client_name,
    practiceArea: row.practice_area,
    status: row.status,
    jurisdiction: row.jurisdiction,
    opposingParty: row.opposing_party,
    openedOn: row.opened_on,
    nextActionOn: row.next_action_on,
    nextAction: row.next_action,
    closedOn: row.closed_on,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

type Body = {
  id?: number;
  title?: string;
  matterNumber?: string | null;
  clientName?: string | null;
  practiceArea?: string | null;
  status?: string;
  jurisdiction?: string | null;
  opposingParty?: string | null;
  openedOn?: string | null;
  nextActionOn?: string | null;
  nextAction?: string | null;
  closedOn?: string | null;
  notes?: string | null;
};

/** Empty string to null, so clearing a field in the form clears the column rather than storing
 *  "" and rendering a blank line in the file the agent reads. */
function text(value: string | null | undefined, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/** A date the database will accept, or null. Rejected rather than coerced: a bad date here
 *  becomes a deadline the agent reports wrongly, which is the failure this whole feature exists
 *  to prevent. */
function date(value: string | null | undefined, field: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, "invalid_request", `${field} must be a date`);
  }
  return value;
}

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  return json({ matters: (await listMatters(id)).map(toApi) });
});

export const PUT = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const body = await readJson<Body>(request);

  const title = text(body.title, 300);
  if (!title) throw new ApiError(400, "invalid_request", "Give the matter a name");

  const status = body.status ?? "active";
  if (!isMatterStatus(status)) throw new ApiError(400, "invalid_request", "Unknown status");

  const row = {
    agent37_id: id,
    title,
    matter_number: text(body.matterNumber, 60),
    client_name: text(body.clientName, 200),
    practice_area: text(body.practiceArea, 120),
    status,
    jurisdiction: text(body.jurisdiction, 120),
    opposing_party: text(body.opposingParty, 200),
    opened_on: date(body.openedOn, "Opened"),
    next_action_on: date(body.nextActionOn, "Next action date"),
    next_action: text(body.nextAction, 300),
    closed_on: date(body.closedOn, "Closed"),
    notes: text(body.notes, 4000),
    updated_at: new Date().toISOString(),
  };

  const db = createAdminClient();

  if (body.id !== undefined) {
    // Scoped to the agent as well as the id. The id alone is a global sequence, and access was
    // only ever checked against the agent in the URL - without the second condition a row from
    // another firm would be editable by anyone who could guess a number.
    const { data, error } = await db
      .from("agent_matters")
      .update(row)
      .eq("id", body.id)
      .eq("agent37_id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new ApiError(404, "not_found", "That matter is gone");

    syncMattersAfterChange(id);
    return json(toApi(data as MatterRow));
  }

  const { data, error } = await db.from("agent_matters").insert(row).select().single();
  if (error) throw new Error(error.message);

  syncMattersAfterChange(id);
  return json(toApi(data as MatterRow));
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const matterId = Number(new URL(request.url).searchParams.get("matterId"));
  if (!Number.isSafeInteger(matterId)) {
    throw new ApiError(400, "invalid_request", "matterId is required");
  }

  const db = createAdminClient();
  const { error } = await db
    .from("agent_matters")
    .delete()
    .eq("id", matterId)
    .eq("agent37_id", id);
  if (error) throw new Error(error.message);

  syncMattersAfterChange(id);
  return json({ id: matterId, deleted: true });
});
