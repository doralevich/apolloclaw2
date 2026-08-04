import { requireAgentAccess } from "@/lib/auth";
import { getCreditSettings, updateCreditSettings } from "@/lib/credit-settings";
import { ApiError, json, readJson, route } from "@/lib/http";

// GET/PUT /api/agents/[id]/credit-settings
//
// The low-balance warning and auto-recharge for one instance. Same ownership gate as buying
// credits: the right to spend this balance is the right to decide what happens when it runs
// low.

type Params = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, { params }: Params) => {
  const { id } = await params;
  // Readable by any member — the credits page shows these. Only CHANGING them spends money,
  // so the write below is the one that needs admin.
  const { row: agent } = await requireAgentAccess(id, "member");
  const settings = await getCreditSettings(agent.agent37_id, agent.workspace_id);
  return json({
    ...settings,
    // Auto-recharge needs a card we're allowed to charge without them present, and that only
    // exists once they've been through checkout at least once. The UI uses this to explain
    // why the switch is unavailable instead of just disabling it.
    canAutorecharge: !!settings.stripeCustomerId,
  });
});

export const PUT = route(async (request: Request, { params }: Params) => {
  const { id } = await params;
  const { row: agent } = await requireAgentAccess(id, "admin");

  const body = await readJson<{
    warn_enabled?: boolean;
    warn_below_micros?: number;
    autorecharge_enabled?: boolean;
    autorecharge_below_micros?: number;
    autorecharge_pack_key?: string | null;
  }>(request);

  const settings = await getCreditSettings(agent.agent37_id, agent.workspace_id);

  // Arming auto-recharge without a saved card would set a switch that can only ever fail —
  // three times, and then turn itself off. Refuse it here rather than let the sweep discover it.
  if (body.autorecharge_enabled === true && !settings.stripeCustomerId) {
    throw new ApiError(
      400,
      "no_saved_card",
      "Buy a credit pack once first — that saves your card, which is what auto-recharge charges."
    );
  }

  const updated = await updateCreditSettings(agent.agent37_id, agent.workspace_id, {
    warnEnabled: body.warn_enabled,
    warnBelowMicros: body.warn_below_micros,
    autorechargeEnabled: body.autorecharge_enabled,
    autorechargeBelowMicros: body.autorecharge_below_micros,
    autorechargePackKey: body.autorecharge_pack_key,
  });

  return json({ ...updated, canAutorecharge: !!updated.stripeCustomerId });
});
