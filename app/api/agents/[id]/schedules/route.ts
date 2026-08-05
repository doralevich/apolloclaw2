import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSchedulableSkill, type ScheduleRow } from "@/lib/schedules";

type Ctx = { params: Promise<{ id: string }> };

// The customer's own schedules for one agent.
//
// Service-role behind requireAgentAccess, the same as every other agent-scoped table here.

function toApi(row: ScheduleRow) {
  return {
    skill: row.skill,
    hour: row.hour,
    days: row.days,
    timezone: row.timezone,
    enabled: row.enabled,
    lastRunOn: row.last_run_on,
    lastStatus: row.last_status,
  };
}

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const db = createAdminClient();
  const { data, error } = await db.from("agent_schedules").select("*").eq("agent37_id", id);
  if (error) throw new Error(error.message);

  return json({ schedules: ((data ?? []) as ScheduleRow[]).map(toApi) });
});

// Create or update one schedule. Upsert rather than separate POST/PATCH: from the UI's point of
// view there is one row per skill and the question is only what it should say.
export const PUT = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const body = await readJson<{
    skill?: string;
    hour?: number;
    days?: string;
    timezone?: string;
    enabled?: boolean;
  }>(request);

  if (!body.skill || !isSchedulableSkill(body.skill)) {
    throw new ApiError(400, "invalid_request", "Unknown or unschedulable skill");
  }
  if (typeof body.hour !== "number" || body.hour < 0 || body.hour > 23) {
    throw new ApiError(400, "invalid_request", "Hour must be between 0 and 23");
  }
  // Validated by asking Intl, which is the only authority that matters — the value is fed
  // straight back to it every hour, and a name it rejects would break the sweep for this row.
  if (!body.timezone || !isValidTimeZone(body.timezone)) {
    throw new ApiError(400, "invalid_request", "A valid timezone is required");
  }

  const days = body.days ?? "weekdays";
  if (!["daily", "weekdays", "monday", "tuesday", "wednesday", "thursday", "friday"].includes(days)) {
    throw new ApiError(400, "invalid_request", "Unsupported day selection");
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("agent_schedules")
    .upsert(
      {
        agent37_id: id,
        skill: body.skill,
        hour: body.hour,
        days,
        timezone: body.timezone,
        enabled: body.enabled ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agent37_id,skill" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);

  return json(toApi(data as ScheduleRow));
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const skill = new URL(request.url).searchParams.get("skill");
  if (!skill) throw new ApiError(400, "invalid_request", "skill is required");

  const db = createAdminClient();
  const { error } = await db
    .from("agent_schedules")
    .delete()
    .eq("agent37_id", id)
    .eq("skill", skill);
  if (error) throw new Error(error.message);

  return json({ skill, deleted: true });
});

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
