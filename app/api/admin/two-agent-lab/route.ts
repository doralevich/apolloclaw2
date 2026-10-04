import { requirePlatformAdmin } from "@/lib/admin";
import { askLab, createLabBox, deleteLabBox, findLabBox, LAB_QUESTIONS, resetupLabBox } from "@/lib/multi-agent-lab";
import { probeGateway } from "@/lib/gateway-chat";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

// /api/admin/two-agent-lab - the throwaway two-agent proof, from the Fleet page.
//
//   GET                         the lab box that exists now, and the questions
//   POST { action: "create" }   create the box with Atlas on it, restart it
//   POST { action: "ask", id, key }  ask one agent one question over the gateway's chat endpoint
//   POST { action: "probe", id }     can the app reach the box's gateway through the edge, which way
//   POST { action: "setup", id }     run the two-agent setup again on the box and restart it
//   POST { action: "delete", id }    delete the box
//
// Create waits for the box to boot and ask waits on a model answer, so both need the long
// limit the other exec-heavy admin routes use.
export const maxDuration = 300;

export const GET = route(async () => {
  await requirePlatformAdmin();
  return json({ box: await findLabBox(), questions: LAB_QUESTIONS });
});

export const POST = route(async (request: Request) => {
  const { user } = await requirePlatformAdmin();
  const body = await readJson<{ action?: unknown; id?: unknown; key?: unknown }>(request);
  const action = typeof body.action === "string" ? body.action : "";
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const key = typeof body.key === "string" ? body.key.trim() : "";

  if (action === "create") {
    try {
      const result = await createLabBox();
      await logAudit({ actorEmail: user.email, action: "lab.two_agent_created", target: result.box.id, metadata: { ...result.setup }, request });
      return json(result);
    } catch (e) {
      if ((e as { code?: string }).code === "lab_exists") throw new ApiError(409, "lab_exists", (e as Error).message);
      throw e;
    }
  }
  if (action === "ask") {
    if (!id) throw new ApiError(400, "invalid_request", "Pass the lab box id.");
    try {
      const answer = await askLab(id, key);
      await logAudit({ actorEmail: user.email, action: "lab.two_agent_asked", target: id, metadata: { key, status: answer.status, ms: answer.ms }, request });
      return json(answer);
    } catch (e) {
      if ((e as { code?: string }).code === "bad_question") throw new ApiError(400, "invalid_request", (e as Error).message);
      throw e;
    }
  }
  // Can the app itself reach the box's gateway through an Agent37 signed URL? The question the
  // per-agent chat tabs depend on; the ask action runs from inside the box and cannot answer it.
  if (action === "probe") {
    if (!id) throw new ApiError(400, "invalid_request", "Pass the lab box id.");
    const result = await probeGateway(id);
    await logAudit({ actorEmail: user.email, action: "lab.two_agent_probed", target: id, metadata: { ok: result.ok, status: result.status, port: result.port, via: result.via }, request });
    return json(result);
  }
  // Run the setup again on the existing box (config merge plus restart), for a box created
  // before the setup changed.
  if (action === "setup") {
    if (!id) throw new ApiError(400, "invalid_request", "Pass the lab box id.");
    try {
      const result = await resetupLabBox(id);
      await logAudit({ actorEmail: user.email, action: "lab.two_agent_resetup", target: id, metadata: { ...result }, request });
      return json(result);
    } catch (e) {
      if ((e as { code?: string }).code === "not_lab") throw new ApiError(403, "not_lab", (e as Error).message);
      throw e;
    }
  }
  if (action === "delete") {
    if (!id) throw new ApiError(400, "invalid_request", "Pass the lab box id.");
    try {
      const result = await deleteLabBox(id);
      await logAudit({ actorEmail: user.email, action: "lab.two_agent_deleted", target: id, metadata: { ...result }, request });
      return json(result);
    } catch (e) {
      if ((e as { code?: string }).code === "not_lab") throw new ApiError(403, "not_lab", (e as Error).message);
      throw e;
    }
  }
  throw new ApiError(400, "invalid_request", "action must be create, ask, probe, setup or delete.");
});
