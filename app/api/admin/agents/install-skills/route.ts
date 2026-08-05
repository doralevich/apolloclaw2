import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_SKILLS } from "@/config/skills";
import { installAgentSkills, listAgentSkills } from "@/lib/provision";

// /api/admin/agents/install-skills — push the current skill set onto agents that already exist.
//
// WHY THIS IS NEEDED AT ALL. Skills install at provision, so an agent created before a skill was
// written never gets it, and an agent created before a skill was IMPROVED keeps the old text
// forever. Without this, every edit to config/skills.ts only ever reaches customers who sign up
// afterwards — which quietly gets worse with every agent sold.
//
// Modelled on repair-memory next door, deliberately: same auth, same GET-so-an-admin-can-just-
// visit-it, same ?id= scoping. Two operator actions that exec inside customer instances should
// not have two different shapes.
//
// Idempotent. installAgentSkills rewrites the files whatever was there, and the content is ours
// alone — no customer edits to preserve, unlike the fenced blocks in the workspace files.
const install = route(async (request: Request) => {
  await requirePlatformAdmin();

  const params = new URL(request.url).searchParams;
  // ?id=abc&id=def limits the run to named instances; no ids visits every agent we know about.
  const ids = params.getAll("id").filter(Boolean);

  // ?inspect=1 reports what is installed WITHOUT writing anything — the safe first move on a
  // customer's box, and the only way to tell "the skill is missing" from "the skill is there and
  // the agent ignored it". Names only; a skill body is ours, but the directory listing is the
  // fact in question.
  if (params.get("inspect") === "1") {
    const targets = ids.length ? ids : await allAgentIds();
    const results = await Promise.all(
      targets.map(async (id) => ({ id, skills: await listAgentSkills(id) }))
    );
    return json({
      inspect: true,
      expected: AGENT_SKILLS.map((s) => s.slug),
      visited: results.length,
      results,
    });
  }

  const targets = ids.length ? ids : await allAgentIds();

  // Sequentially. Each agent is several execs, and a fleet-wide run hammering the control plane
  // in parallel is how a maintenance action becomes an outage.
  const results: Array<{ id: string; installed: string[] }> = [];
  for (const id of targets) {
    results.push({ id, installed: await installAgentSkills(id) });
  }

  const summary = results.reduce<Record<string, number>>((acc, r) => {
    const key = r.installed.length === AGENT_SKILLS.length ? "complete" : r.installed.length ? "partial" : "none";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return json({ visited: results.length, expected: AGENT_SKILLS.length, summary, results });
});

async function allAgentIds(): Promise<string[]> {
  const db = createAdminClient();
  const { data, error } = await db.from("agents").select("agent37_id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.agent37_id as string);
}

export const POST = install;
export const GET = install;

// Each agent is a handful of execs against the control plane, and a fleet of them adds up. This
// is a rare admin action, not something on a request path.
export const maxDuration = 300;
