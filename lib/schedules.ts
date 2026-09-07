import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_SKILLS } from "@/config/skills";
import { answerFrom, runTurn } from "@/lib/channels/turn";
import { getChannelConfig } from "@/lib/channels/store";
import * as telegram from "@/lib/channels/telegram";
import * as slack from "@/lib/channels/slack";
import * as whatsapp from "@/lib/channels/whatsapp";
import type { ChannelId } from "@/lib/types";
import { isDue, localNow } from "@/lib/schedule-timing";

// Running a skill on a clock, and delivering what comes back.
//
// This is the other half of skills. A skill says HOW to produce a morning brief; nothing in it
// can make one arrive at 8am. That takes something outside the agent waking up and asking — an
// hourly cron, this file, and a channel to deliver into.
//
// The whole feature therefore depends on Channels. An agent with no connected chat app has
// nowhere for a scheduled brief to go, and rather than inventing a destination (email we'd have
// to build, a dashboard nobody opens at 8am) a schedule on such an agent simply doesn't fire and
// says so in last_status. Connect Telegram and it starts working.

/** Skills that make sense on a clock. The rest are things you ask for, not things that arrive. */
export const SCHEDULABLE = new Set(["daily-brief", "eod-summary", "weekly-planning"]);

export interface ScheduleRow {
  id: number;
  agent37_id: string;
  skill: string;
  hour: number;
  days: string;
  timezone: string;
  enabled: boolean;
  last_run_on: string | null;
  last_status: string | null;
  last_error: string | null;
  /** The customer's own instruction. When set, this is what the scheduled turn asks for, and
   *  `skill` is a `custom:<slug>` identifier rather than one of ours. */
  prompt: string | null;
  /** What a custom report is called in the dashboard. Null for the built-in three. */
  title: string | null;
}

/** Custom rows are identified by their skill prefix alone, so the sweep, the API guard and the UI
 *  can all recognise one without reading the prompt. The database enforces the pairing. */
export const CUSTOM_PREFIX = "custom:";

export function isCustomSchedule(skill: string): boolean {
  return skill.startsWith(CUSTOM_PREFIX);
}

/** A title to a stable skill key. Lowercase, hyphenated, trimmed to something a column and a URL
 *  can both hold. Two reports with the same name collide on the unique constraint, which is the
 *  intended answer rather than a bug: they are the same report. */
export function customSkillKey(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${CUSTOM_PREFIX}${slug}`;
}

export { isDue } from "@/lib/schedule-timing";

/** Deliver text to whichever chat channel this agent has connected. */
async function deliver(agentId: string, text: string): Promise<ChannelId | null> {
  // Order is preference, not capability: if someone has connected two, the one they set up first
  // for conversation is the one a brief should arrive in.
  for (const channel of ["telegram", "whatsapp", "slack"] as const) {
    const config = await getChannelConfig(agentId, channel).catch(() => null);
    // ownerChatId is the real test, not merely "connected" — until somebody has messaged the bot
    // we have no address to send to. A connected channel nobody has spoken to yet cannot receive.
    if (!config?.ownerChatId) continue;

    if (channel === "telegram") {
      await telegram.sendMessage(config.token, config.ownerChatId, text);
    } else if (channel === "slack") {
      await slack.postMessage(config.token, config.ownerChatId, text);
    } else if (channel === "whatsapp") {
      if (!config.externalId) continue;
      await whatsapp.sendMessage(config.externalId, config.token, config.ownerChatId, text);
    }
    return channel;
  }
  return null;
}

/**
 * Run one schedule: invoke the skill, deliver the result, record what happened.
 *
 * The prompt names the skill explicitly rather than describing the task. The skill file already
 * holds the method — restating it here would create a second copy that drifts from the first, and
 * the whole point of installing skills is that the instructions live in one place.
 */
export async function runSchedule(row: ScheduleRow): Promise<string> {
  const db = createAdminClient();
  const today = localNow(row.timezone)?.date ?? null;

  const finish = async (status: string, error?: string) => {
    await db
      .from("agent_schedules")
      .update({
        last_run_on: today,
        last_status: status,
        last_error: error ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return status;
  };

  try {
    // A custom report sends the customer's own instruction. The trailing line is the same in both
    // cases and is the whole reason it is appended rather than left to the customer to remember:
    // "give me a rundown of X" written into a box at 11pm does not anticipate arriving as a
    // Telegram message at 8am, and without this every custom report opens with a paragraph about
    // being a scheduled report.
    const instruction = row.prompt
      ? `${row.prompt.trim()}\n\nThis is a scheduled report, so lead with the content - no preamble about it being scheduled, and no restating the request back to me.`
      : `Run your ${row.skill} skill now and give me the result. This is the scheduled run, so lead with the content - no preamble about it being scheduled.`;

    const result = await runTurn(
      row.agent37_id,
      instruction,
      // No session id: a scheduled brief starts clean rather than continuing yesterday's chat,
      // which would drag a week of unrelated context into every morning.
      null
    );

    const text = answerFrom(result);
    const channel = await deliver(row.agent37_id, text);

    // A brief with nowhere to go is not a failure of the agent, and saying so precisely is what
    // lets the dashboard tell someone to connect a channel rather than "something went wrong".
    if (!channel) return finish("no_channel");
    return finish(`delivered:${channel}`);
  } catch (err) {
    const message = (err as Error).message;
    console.error("[schedules] run failed", row.agent37_id, row.skill, message);
    return finish("error", message.slice(0, 500));
  }
}

/**
 * The hourly sweep. Reads every enabled schedule, runs the due ones, returns a summary.
 *
 * Sequential. Each run is an agent turn — seconds to minutes — and a fleet of them in parallel
 * would be a lot of simultaneous load on the control plane at exactly the times everyone's
 * schedules cluster, which is 8am.
 */
export async function sweepSchedules(): Promise<{
  considered: number;
  due: number;
  outcomes: Record<string, number>;
}> {
  const db = createAdminClient();
  const { data, error } = await db.from("agent_schedules").select("*").eq("enabled", true);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as ScheduleRow[];
  const due = rows.filter((r) => isDue(r));

  const outcomes: Record<string, number> = {};
  for (const row of due) {
    const status = await runSchedule(row);
    const key = status.split(":")[0];
    outcomes[key] = (outcomes[key] ?? 0) + 1;
  }

  return { considered: rows.length, due: due.length, outcomes };
}

/** Guard for the API: only skills we ship, and only ones that make sense on a clock. */
export function isSchedulableSkill(slug: string): boolean {
  return SCHEDULABLE.has(slug) && AGENT_SKILLS.some((s) => s.slug === slug);
}
