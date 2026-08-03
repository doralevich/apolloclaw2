import { requirePlatformAdmin } from "@/lib/admin";
import { ApiError, json, route } from "@/lib/http";
import { removeUserMdPointer, repairAgentMemory } from "@/lib/agent-memory";

// /api/admin/agents/repair-memory — put every agent's USER.md where its runtime actually
// reads it, and make sure its SOUL.md points at it. The CLI twin is
// scripts/backfill-agent-memory.mjs; this exists so the repair can be run from a browser
// with the deployment's own key, rather than a live credential on someone's laptop.
//
// Answers GET as well as POST so a logged-in admin can run it by visiting the URL. Idempotent
// (contents compared before copying, pointer marker-guarded), so a repeated visit is a no-op.
//
// Platform admins only. Exec'ing inside every instance on the account is not a thing to leave
// on a route anyone can reach.
const repair = route(async (request: Request) => {
  await requirePlatformAdmin();

  const params = new URL(request.url).searchParams;
  // ?id=abc&id=def limits the run to named instances; no ids visits everything.
  const ids = params.getAll("id").filter(Boolean);

  // ?undo=1 takes the pointer back out instead of putting it in — for instances this
  // account shares with another product, which a fleet-wide repair reaches by accident.
  // Named ids are mandatory here: an undo that defaults to everything is not an undo.
  if (params.get("undo") === "1") {
    if (!ids.length) {
      throw new ApiError(400, "invalid_request", "undo requires at least one ?id= instance");
    }
    const undone = await removeUserMdPointer(ids);
    return json({ undo: true, visited: undone.length, results: undone });
  }

  const results = await repairAgentMemory(ids.length ? ids : undefined);

  const summary = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
    return acc;
  }, {});

  return json({ visited: results.length, summary, results });
});

export const POST = repair;
export const GET = repair;

// Each instance is a round trip to the control plane plus an exec; a fleet of them adds up,
// and this is a rare admin action rather than something on a request path.
export const maxDuration = 300;
