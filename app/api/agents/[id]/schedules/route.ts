import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CUSTOM_PREFIX,
  customSkillKey,
  isSchedulableSkill,
  type ScheduleRow,
} from "@/lib/schedules";
import { isScheduleDays } from "@/lib/schedule-timing";

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
    // Exposed so the dashboard can say WHY a run failed rather than showing nothing, which is
    // what it did: a schedule whose turn threw looked exactly like one that had never run.
    // Truncated because this is an upstream error string, not copy - it is a clue, not a story.
    lastError: row.last_error ? row.last_error.slice(0, 200) : null,
    prompt: row.prompt,
    title: row.title,
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
    /** A custom report: the customer's own instruction, plus what to call it. Sending either of
     *  these switches this from "schedule one of our skills" to "schedule this request". */
    prompt?: string;
    title?: string;
  }>(request);

  // Two shapes through one endpoint, because from the UI's point of view they are the same
  // question - what should the agent send me, and when.
  const wantsCustom = typeof body.prompt === "string" || typeof body.title === "string";

  let skill: string;
  let prompt: string | null = null;
  let title: string | null = null;

  if (wantsCustom) {
    title = (body.title ?? "").trim();
    prompt = (body.prompt ?? "").trim();
    if (!title) throw new ApiError(400, "invalid_request", "Give the report a name");
    if (title.length > 60) throw new ApiError(400, "invalid_request", "Name must be 60 characters or fewer");
    if (!prompt) throw new ApiError(400, "invalid_request", "Say what the report should contain");
    // Bounded because it is sent as an agent turn every time it fires. A prompt long enough to
    // matter here is a document, and documents belong in the conversation, not the clock.
    if (prompt.length > 2000) {
      throw new ApiError(400, "invalid_request", "Keep the request under 2000 characters");
    }
    skill = customSkillKey(title);
    // A title of nothing but punctuation slugs to an empty key, which would collide with every
    // other such title and read as `custom:` in the database.
    if (skill === `${CUSTOM_PREFIX}`) {
      throw new ApiError(400, "invalid_request", "Give the report a name with letters or numbers in it");
    }
  } else {
    if (!body.skill || !isSchedulableSkill(body.skill)) {
      throw new ApiError(400, "invalid_request", "Unknown or unschedulable skill");
    }
    skill = body.skill;
  }
  if (typeof body.hour !== "number" || body.hour < 0 || body.hour > 23) {
    throw new ApiError(400, "invalid_request", "Hour must be between 0 and 23");
  }
  // Validated by asking Intl, which is the only authority that matters — the value is fed
  // straight back to it every hour, and a name it rejects would break the sweep for this row.
  if (!body.timezone || !isValidTimeZone(body.timezone)) {
    throw new ApiError(400, "invalid_request", "A valid timezone is required");
  }

  // Validated against the one list the timing logic actually implements, rather than a copy that
  // had drifted narrower than it: this used to stop at Friday, so a realtor could not schedule
  // anything on a Saturday even though dayMatches would have handled it correctly.
  const days = body.days ?? "weekdays";
  if (!isScheduleDays(days)) {
    throw new ApiError(400, "invalid_request", "Unsupported day selection");
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("agent_schedules")
    .upsert(
      {
        agent37_id: id,
        skill,
        hour: body.hour,
        days,
        timezone: body.timezone,
        enabled: body.enabled ?? true,
        prompt,
        title,
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
