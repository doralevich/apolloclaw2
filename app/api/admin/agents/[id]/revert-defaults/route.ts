import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { inspectInstanceDefaults, revertInstanceDefaults } from "@/lib/instance-defaults";
import { logAudit } from "@/lib/audit";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// The openclaw.json keys applyInstanceDefaults writes came from docs, not a live box, and a wrong
// one took an instance's agent runtime down ("The 'openclaw' harness is not available on this
// instance"). This route is the recovery + the diagnosis:
//
//   GET  ?inspect=1  — report the shape of our keys on the box (never the contents or the Tavily
//                      key), so the real schema can be read off a known-good instance.
//   POST             — surgically remove exactly the keys we set and restart, bringing a bricked
//                      box's harness back. Idempotent.
//
// applyInstanceDefaults retries for ~90s while a sleeping box wakes, then restarts; match the
// other exec-heavy admin routes so a slow box is not cut off mid-flight.
export const maxDuration = 300;

export const GET = route(async (request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);
  const inspect = new URL(request.url).searchParams.get("inspect") === "1";
  if (!inspect) {
    return json({ hint: "POST to revert the defaults on this instance, or GET ?inspect=1 to read its keys." });
  }
  const result = await inspectInstanceDefaults(id);
  return json(result);
});

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);

  const result = await revertInstanceDefaults(id, { restart: true });
  await logAudit({
    actorEmail: user.email,
    action: "agent.defaults_reverted",
    target: id,
    metadata: { ...result },
    request,
  });
  return json(result);
});
