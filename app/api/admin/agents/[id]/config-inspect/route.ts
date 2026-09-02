import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { dumpInstanceConfig } from "@/lib/instance-defaults";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/agents/{id}/config-inspect — read one instance's OpenClaw config back with every
// secret-looking value redacted. Platform admins only. This is how we learn the real config shape
// (e.g. how the Anthropic chat provider is registered) so a new provider like OpenAI can be added
// by mirroring a known-good, on-box structure instead of guessing it. Read-only; never writes.
//
// Answers GET so an admin can run it by visiting the URL, same as repair-memory. exec on a waking
// box can take a moment, so match the other exec-heavy admin routes.
export const maxDuration = 300;

export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);
  return json(await dumpInstanceConfig(id));
});
