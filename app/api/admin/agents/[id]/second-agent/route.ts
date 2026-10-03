import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { revertSecondAgent, setupSecondAgent, verifySecondAgent } from "@/lib/multi-agent-test";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// /api/admin/agents/{id}/second-agent - the two-agents-on-one-box test, run from the Fleet page.
//
//   POST   { botToken, telegramUser }  add Atlas (second agent + its bot + agent-to-agent), restart
//   GET                                read back what the box has, including the gateway's own list
//   DELETE                             restore the pre-test config, remove Atlas, restart
//
// The on-box steps retry for up to ~90s while a sleeping box wakes, so match the other exec-heavy
// admin routes rather than the platform default timeout.
export const maxDuration = 300;

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);

  const body = await readJson<{ botToken?: unknown; telegramUser?: unknown }>(request);
  const botToken = typeof body.botToken === "string" ? body.botToken.trim() : "";
  const telegramUser = typeof body.telegramUser === "string" ? body.telegramUser.trim() : "";
  // A BotFather token is "<numeric bot id>:<35-ish chars>". Checked here so a pasted username or
  // a trailing word never lands in a config file that then has to be reverted.
  if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken)) {
    throw new ApiError(400, "invalid_request", "That does not look like a bot token from @BotFather (digits, a colon, then letters).");
  }
  if (!/^\d+$/.test(telegramUser)) {
    throw new ApiError(400, "invalid_request", "The Telegram user id is a number (ask @userinfobot or @getmyid_bot).");
  }

  const result = await setupSecondAgent(id, { botToken, telegramUser });
  // The token stays out of the audit log; the user id is fine, it is what the allow list holds.
  await logAudit({
    actorEmail: user.email,
    action: "agent.second_agent_added",
    target: id,
    metadata: { ok: result.ok, backedUp: result.backedUp, restarted: result.restarted, telegramUser, note: result.note ?? null },
    request,
  });
  return json(result);
});

export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  await assertNotOtherApp(id);
  return json(await verifySecondAgent(id));
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  await assertNotOtherApp(id);

  const result = await revertSecondAgent(id);
  await logAudit({
    actorEmail: user.email,
    action: "agent.second_agent_removed",
    target: id,
    metadata: { ...result },
    request,
  });
  return json(result);
});
