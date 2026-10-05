import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { agent37 } from "@/lib/agent37";
import { INSTANCE_SIZES, type InstanceSizeId } from "@/config/agents";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/resize — move a customer's box to one of the preset sizes.
//
// The customer-facing /api/agents/[id]/resize already exists and takes raw cpu/memory/disk, but
// it is gated on workspace membership, which a platform admin deliberately is not, and nothing
// in the product calls it. This is the Super Admin door: a preset id in, the same Agent37 call,
// and the agents row kept in step so the workspace view's Resources column stays true.
//
// Presets only, no free-form numbers. The sizes we are willing to host are a decision made
// once in config/agents.ts, and a typo in a text field is how a box ends up at 64 GB.
//
// Disk is checked against the live size before anything is sent. Agent37 can grow a disk but
// not shrink one (the filesystem would have to be rebuilt), so a move to a preset with a
// smaller disk is refused here with a plain message rather than letting it fail downstream.
//
// No price attached, by design (David, Oct 5 2026). The first use is his own instance, to find
// out whether a bigger box is faster enough to be worth putting on the pricing page.
export const maxDuration = 120;

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);

  const body = await readJson<{ size?: unknown }>(request);
  const sizeId = typeof body.size === "string" ? body.size : "";
  if (!(sizeId in INSTANCE_SIZES)) {
    throw new ApiError(
      400,
      "invalid_request",
      `Pass one of: ${Object.keys(INSTANCE_SIZES).join(", ")}.`
    );
  }
  const size = INSTANCE_SIZES[sizeId as InstanceSizeId];

  // Live size first: the row's copy can be stale, and the disk rule below has to be judged
  // against what the box actually has.
  let before: { cpu: number; memory: number; disk: number } | null = null;
  try {
    const { data } = await agent37.listAgents();
    before = data.find((a) => a.id === id)?.resources ?? null;
  } catch {
    // Unreachable Agent37 fails on the resize call itself, with its own message.
  }
  if (before && size.disk < before.disk) {
    throw new ApiError(
      400,
      "invalid_request",
      `${size.label} has a ${size.disk} GB disk and this box has ${before.disk} GB. A disk can grow but not shrink, so pick a size with at least ${before.disk} GB.`
    );
  }
  if (before && before.cpu === size.cpu && before.memory === size.memory && before.disk === size.disk) {
    throw new ApiError(400, "invalid_request", `This box is already ${size.label}.`);
  }

  const result = await agent37.resize(id, { cpu: size.cpu, memory: size.memory, disk: size.disk });

  // Keep our row in step. A box with no row (an orphan) still resizes; there is just nothing
  // to record, and the overview reads the live size anyway.
  const db = createAdminClient();
  await db
    .from("agents")
    .update({
      cpu: result.resources.cpu,
      memory: result.resources.memory,
      disk: result.resources.disk,
      status: result.status,
    })
    .eq("agent37_id", id);

  await logAudit({
    actorEmail: user.email,
    action: "agent.resized",
    target: id,
    metadata: { size: sizeId, before, after: result.resources, status: result.status },
    request,
  });
  return json({ size: sizeId, label: size.label, before, after: result.resources, status: result.status });
});
