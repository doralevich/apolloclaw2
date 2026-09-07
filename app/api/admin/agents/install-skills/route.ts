import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_SKILLS, skillsForType } from "@/config/skills";
import { installAgentSkills, listAgentSkills, pruneAgentSkills } from "@/lib/provision";

// /api/admin/agents/install-skills — push the current skill set onto agents that already exist.
//
// WHY THIS IS NEEDED AT ALL. Skills install at provision, so an agent created before a skill was
// written never gets it, and an agent created before a skill was IMPROVED keeps the old text
// forever. Without this, every edit to config/skills only ever reaches customers who sign up
// afterwards — which quietly gets worse with every agent sold.
//
// Modelled on repair-memory next door, deliberately: same auth, same GET-so-an-admin-can-just-
// visit-it, same ?id= scoping. Two operator actions that exec inside customer instances should
// not have two different shapes.
//
// PER TYPE, since skills stopped being one list for everyone. This route reads each agent's
// `agent_type` and installs the set that type should have, which is the only way a fleet run can
// be correct now: installing the full catalogue on a real estate agent would hand back the
// thirty-odd skills we just decided it should not carry, and this route is exactly the thing an
// operator would reach for to APPLY that decision.
//
// AND IT PRUNES. Installing alone cannot remove anything, so on an agent that already holds the
// old full set a re-run would write 34 files and leave 24 stale directories listed in
// available_skills. pruneAgentSkills only ever deletes slugs from our own catalogue, so
// OpenClaw's built-ins are safe by construction.
//
// Idempotent. The files are rewritten whatever was there and the content is ours alone — no
// customer edits to preserve, unlike the fenced blocks in the workspace files.
const install = route(async (request: Request) => {
  await requirePlatformAdmin();

  const params = new URL(request.url).searchParams;
  // ?id=abc&id=def limits the run to named instances; no ids visits every agent we know about.
  const ids = params.getAll("id").filter(Boolean);
  const targets = await agentsToVisit(ids);

  // ?inspect=1 reports what is installed WITHOUT writing anything — the safe first move on a
  // customer's box, and the only way to tell "the skill is missing" from "the skill is there and
  // the agent ignored it". Names only; a skill body is ours, but the directory listing is the
  // fact in question.
  //
  // `expected` is now per agent rather than one list at the top, because two agents in the same
  // run legitimately expect different sets. `stale` is the answer to the question this route
  // exists to settle: which of ours is on the box that should not be.
  if (params.get("inspect") === "1") {
    const results = await Promise.all(
      targets.map(async ({ id, type }) => {
        const expected = setFor(type).map((s) => s.slug);
        const found = await listAgentSkills(id);
        const has = new Set(found);
        const ours = new Set(AGENT_SKILLS.map((s) => s.slug));
        return {
          id,
          type,
          expected,
          skills: found,
          missing: expected.filter((slug) => !has.has(slug)),
          stale: found.filter((slug) => ours.has(slug) && !expected.includes(slug)),
        };
      })
    );
    return json({ inspect: true, visited: results.length, results });
  }

  // Sequentially. Each agent is several execs, and a fleet-wide run hammering the control plane
  // in parallel is how a maintenance action becomes an outage.
  const results: Array<{
    id: string;
    type: string | null;
    expected: number;
    installed: string[];
    removed: string[];
  }> = [];
  for (const { id, type } of targets) {
    const expected = setFor(type).map((s) => s.slug);
    const installed = await installAgentSkills(id, type);
    // After, not before: a prune that ran first would leave the agent briefly holding nothing if
    // the install then failed, and an agent with no skills is worse than one with stale ones.
    const removed = await pruneAgentSkills(id, expected);
    results.push({ id, type, expected: expected.length, installed, removed });
  }

  const summary = results.reduce<Record<string, number>>((acc, r) => {
    const key =
      r.installed.length === r.expected ? "complete" : r.installed.length ? "partial" : "none";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return json({
    visited: results.length,
    removed: results.reduce((n, r) => n + r.removed.length, 0),
    summary,
    results,
  });
});

/** The set an agent of this type should hold. No type recorded means the generic set. */
function setFor(type: string | null) {
  return type ? skillsForType(type) : AGENT_SKILLS;
}

/**
 * The agents to act on, each with its type.
 *
 * Scoped or not, the type comes from the same query, so an operator running this against one
 * instance id gets the same per-type behaviour as a fleet run. An id that is not in our database
 * still gets visited, with a null type and therefore the generic set: this route is the tool you
 * reach for when an instance is in a strange state, and refusing to touch one we have no row for
 * would take the tool away exactly then.
 */
async function agentsToVisit(ids: string[]): Promise<Array<{ id: string; type: string | null }>> {
  const db = createAdminClient();
  let query = db.from("agents").select("agent37_id, agent_type").is("deleted_at", null);
  if (ids.length) query = query.in("agent37_id", ids);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{ agent37_id: string; agent_type: string | null }>;
  const known = new Map(rows.map((r) => [r.agent37_id, r.agent_type]));
  const wanted = ids.length ? ids : rows.map((r) => r.agent37_id);

  return wanted.map((id) => ({ id, type: known.get(id) ?? null }));
}

export const POST = install;
export const GET = install;

// Each agent is a handful of execs against the control plane, and a fleet of them adds up. This
// is a rare admin action, not something on a request path.
export const maxDuration = 300;
