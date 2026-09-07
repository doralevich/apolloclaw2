import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Turning what a scheduled report already says into a list that survives it.
//
// The agent cannot write to us - there is no callback, no tool, no endpoint - so nothing here
// asks it to. What it does instead is read the report it was going to send anyway. Every
// scheduled run produces task-shaped content already: "waiting on you", "still open", "if you
// only do one thing". This keeps it.

/** How the agent is asked to mark them, and how we find them again. Chosen to be unlikely in
 *  ordinary prose and obvious in a transcript when something goes wrong. */
const OPEN = "<<<TASKS>>>";
const CLOSE = "<<<END TASKS>>>";

/**
 * Appended to every scheduled instruction.
 *
 * Deliberately permissive about the report itself and strict about the block: the value of a
 * daily brief is the writing, and a format demand that fights it would cost more than the list is
 * worth. So the report stays exactly as it was, and this is a postscript.
 *
 * "Only things needing THEM" is the line that matters. Without it this fills with what the agent
 * did, which is a diary, and the customer asked for a list of what to do.
 */
export const TASK_BLOCK_INSTRUCTION = `

Then, after the report, add a block in exactly this form:

${OPEN}
- One line per thing that needs your owner to act
${CLOSE}

Rules for the block: only things needing THEM, not things you did or will do. One line each, under
100 characters, starting with a verb where it reads naturally. Name the person or the thing - "chase
Henderson on the financing" beats "follow up on outstanding item". At most five, fewest is better,
and no block at all if nothing genuinely needs them. Never explain the block or mention it in the
report.`;

export type ParsedTasks = { report: string; tasks: string[] };

/**
 * Split the block off the report.
 *
 * The report is what the customer receives, so the block MUST come out of it - a Telegram message
 * ending in a machine marker is worse than having no task list at all. A missing or malformed
 * block is not an error: the agent is a language model, some days it will skip it, and a brief
 * that arrives without a list is still a brief.
 */
export function parseTaskBlock(text: string): ParsedTasks {
  const start = text.indexOf(OPEN);
  if (start === -1) return { report: text.trim(), tasks: [] };

  const end = text.indexOf(CLOSE, start);
  // An opening marker with no close means the model was cut off mid-block. Everything from the
  // marker on is unreliable, so it goes - better a short report than one trailing into scaffolding.
  const body = end === -1 ? text.slice(start + OPEN.length) : text.slice(start + OPEN.length, end);
  const report = (text.slice(0, start) + (end === -1 ? "" : text.slice(end + CLOSE.length))).trim();

  const tasks = body
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean)
    // A model that ignores "under 100 characters" and returns a paragraph should not put a
    // paragraph in a list. Truncating would hide it; dropping it is visible in the count.
    .filter((line) => line.length <= 200)
    .slice(0, 5);

  return { report, tasks };
}

/**
 * The dedupe key.
 *
 * Case, punctuation and filler words removed, because the same task surfacing on Tuesday will not
 * be worded identically to Monday's - "Chase Henderson on the financing" and "chase Henderson
 * about financing" are one task, and a list that shows both is the reason nobody trusts it.
 *
 * Not clever. A stemmer or an embedding would collapse more, and would also collapse things that
 * are genuinely different, which is the failure that loses a task rather than duplicating one.
 */
export function fingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !["the", "a", "an", "on", "about", "with", "to", "for", "of", "re"].includes(w))
    .join(" ")
    .slice(0, 200);
}

/**
 * Store what a run surfaced.
 *
 * Best-effort, and never throws: this runs inside the schedule sweep, after the report has been
 * written and before it is delivered. A failure here must not cost somebody their morning brief.
 *
 * Upsert on the partial unique index, so the same task surfacing again touches the existing row
 * rather than adding a second. `updated_at` moving is the only visible effect, which is right -
 * "still open, mentioned again today" is the truth.
 */
export async function recordTasks(
  agentId: string,
  source: string,
  titles: string[]
): Promise<number> {
  if (!titles.length) return 0;

  const rows = titles
    .map((title) => ({ title: title.slice(0, 300), fingerprint: fingerprint(title) }))
    .filter((r) => r.fingerprint)
    .map((r) => ({
      agent37_id: agentId,
      title: r.title,
      fingerprint: r.fingerprint,
      source,
      status: "open",
      updated_at: new Date().toISOString(),
    }));

  if (!rows.length) return 0;

  try {
    const { error } = await createAdminClient()
      .from("agent_tasks")
      .upsert(rows, { onConflict: "agent37_id,fingerprint", ignoreDuplicates: false });
    if (error) {
      console.error("[tasks] store failed", agentId, source, error.message);
      return 0;
    }
    console.log("[tasks] stored", agentId, source, rows.length);
    return rows.length;
  } catch (err) {
    console.error("[tasks] store threw", agentId, source, (err as Error).message);
    return 0;
  }
}
