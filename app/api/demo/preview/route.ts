import { requirePlatformAdmin } from "@/lib/admin";
import { getAgentType } from "@/config/agent-types";
import { GENERATED_FILES } from "@/config/agent-workspace";
import { buildAgentsMd, buildIdentityMd, buildToolsMd } from "@/lib/agent-files";
import { buildUserMd } from "@/lib/provision";
import { personaForAgentType } from "@/config/personas";
import { skillsForType } from "@/config/skills";
import { ApiError, json, readJson, route } from "@/lib/http";

// What the demo shows on its last screen: everything provisioning WOULD write, without
// provisioning anything.
//
// This route is the reason the demo is worth more than a form preview. Walking the questions
// proves the questions exist; this proves they do something - the same six generators that run
// on a real build run here, on the answers just typed, and their output is handed straight back.
//
// IT WRITES NOTHING AND CALLS NOTHING. No Supabase insert, no Agent37 request, no Stripe. The
// generators it uses are pure functions of the answers (lib/agent-files.ts, buildUserMd in
// lib/provision.ts), which is exactly why they can be run somewhere that has no agent. If a
// future generator needs the instance to exist, it does not belong in this list - render a note
// saying so instead, because a demo that quietly diverges from the real build is worse than no
// demo.
//
// Admin-gated, not because the output is sensitive on its own, but because the answers posted to
// it are somebody's business and this endpoint will happily echo whatever it is given.
export const POST = route(async (request: Request) => {
  await requirePlatformAdmin();

  const body = await readJson<{ agent_type?: unknown; answers?: unknown; agent_name?: unknown }>(request);

  const typeId = typeof body.agent_type === "string" ? body.agent_type : "";
  const type = getAgentType(typeId);
  if (!type) throw new ApiError(404, "not_found", "Unknown agent type");

  const answers =
    body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
      ? (body.answers as Record<string, unknown>)
      : null;
  if (!answers) throw new ApiError(400, "invalid_request", "answers must be an object");

  const agentName = typeof body.agent_name === "string" ? body.agent_name.trim() : "";

  // The same four the real build writes, generated the same way. USER.md goes through
  // injectOwnerProfile on a real build rather than writeGeneratedFiles, which is why it is
  // built separately here too - same split, same order the agent reads them in.
  const files = [
    { name: "USER.md", body: buildUserMd(type.label, answers, undefined, type.id) },
    { name: GENERATED_FILES.agents, body: buildAgentsMd(answers) },
    { name: GENERATED_FILES.identity, body: buildIdentityMd(agentName || undefined, answers) },
    { name: GENERATED_FILES.tools, body: buildToolsMd(answers) },
  ];

  const skills = skillsForType(type.id).map((s) => ({ slug: s.slug, emoji: s.emoji, description: s.description }));

  return json({
    type: { id: type.id, label: type.label, template: type.template, monthlyCapUsd: type.monthlyCapUsd },
    agentName,
    files,
    // SOUL.md on a real build. Absent for the Blank Agent by design, and the demo should say so
    // rather than render an empty panel.
    persona: personaForAgentType(type.id) ?? null,
    skills,
  });
});
