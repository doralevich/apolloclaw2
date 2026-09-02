import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { curateModelsResponse } from "@/config/chat-models";
import { agent37 } from "@/lib/agent37";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// /api/admin/agents/{agent37_id}/models — what this instance ACTUALLY offers, uncurated.
//
// Built to settle one question. The composer's model menu was showing "openclaw",
// "openclaw/default" and "openclaw/main" instead of Sonnet, Opus, Haiku and the GPTs, and the
// curation in config/chat-models.ts is not the reason: when nothing in the approved catalog
// matches what the instance reports, curateModelsResponse deliberately returns the raw list
// rather than an empty menu. So the menu was showing the truth about that box.
//
// Which means the answer lives in the instance's own /v1/models, and the only place that can be
// read is a deployment holding AGENT37_API_KEY. Hence a route rather than a script.
//
// `curated` is included beside `raw` on purpose: seeing that the intersection is empty is what
// distinguishes "the filter dropped everything" from "the instance never offered them", and
// those two have completely different fixes.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);
  await requirePlatformAdmin();

  const raw = await agent37.listModels(id);
  const curated = curateModelsResponse(raw);
  const rawIds = (raw.data ?? []).map((m) => m.id);
  const curatedIds = (curated.data ?? []).map((m) => m.id);

  return json({
    agent37_id: id,
    raw_count: rawIds.length,
    raw_ids: rawIds,
    raw_default: raw.default_model ?? null,
    curated_count: curatedIds.length,
    curated_ids: curatedIds,
    // The tell. True means no approved model matched and the customer is seeing the fallback —
    // the instance is not advertising vendor model ids at all.
    fell_back_to_raw: curatedIds.length > 0 && curatedIds.join(",") === rawIds.join(","),
  });
});
