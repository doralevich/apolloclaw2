import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { AGENT_TYPES } from "@/config/agent-types";
import { runtimeForTemplate } from "@/config/agents";

// /api/admin/templates — what the Agent37 registry looks like TO THE API KEY THIS
// DEPLOYMENT USES.
//
// The Agent37 web dashboard shows templates for whichever account you happen to be signed
// into, which is not necessarily the one the app provisions with. That difference sent us
// chasing a missing template that was simply in another account. This answers the question
// the app actually cares about.
//
// It also cross-checks the registry against config/agent-types.ts, so a template renamed on
// one side and not the other is visible BEFORE a customer's provision hits it rather than
// after.
export const GET = route(async () => {
  await requirePlatformAdmin();

  const { data } = await agent37.listTemplates();
  const names = new Set(data.map((t) => t.name));

  const templates = data.map((t) => ({
    name: t.name,
    image_ref: t.image_ref ?? null,
    runtime: runtimeForTemplate(t.name),
  }));

  // For each type we can provision: which name will actually be used, and whether the
  // registry has it at all.
  const types = AGENT_TYPES.filter((t) => t.available).map((t) => {
    const resolved = names.has(t.template)
      ? t.template
      : (t.templateAliases ?? []).find((a) => names.has(a)) ?? null;
    return {
      id: t.id,
      label: t.label,
      configured: t.template,
      aliases: t.templateAliases ?? [],
      resolves_to: resolved,
      // true when the registry has the configured name — i.e. the rename is fully landed.
      on_configured_name: resolved === t.template,
      // Nothing matched: a provision of this type would fall back or fail outright.
      missing: resolved === null,
    };
  });

  return json({ templates, types });
});
