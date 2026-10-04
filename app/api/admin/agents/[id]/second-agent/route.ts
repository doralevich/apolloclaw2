import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { agentIdFromName, revertSecondAgent, setupSecondAgent, verifySecondAgent, type AgentSpec } from "@/lib/multi-agent-test";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// /api/admin/agents/{id}/second-agent - a second agent on one box, run from the Fleet page.
//
//   POST   { botToken?, telegramUser?, mainBotToken? }
//                add Atlas (second agent, agent-to-agent, the gateway's chat endpoint for the
//                per-agent chat tabs) and restart. Telegram is optional: with a bot token and
//                a user id, Atlas gets a bot of its own as well.
//   GET          read back what the box has, including the gateway's own list
//   DELETE       restore the pre-test config, remove Atlas, restart
//
// The on-box steps retry for up to ~90s while a sleeping box wakes, so match the other exec-heavy
// admin routes rather than the platform default timeout.
export const maxDuration = 300;

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);

  const body = await readJson<{
    name?: unknown;
    role?: unknown;
    persona?: unknown;
    botToken?: unknown;
    telegramUser?: unknown;
    mainBotToken?: unknown;
  }>(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";
  const botToken = typeof body.botToken === "string" ? body.botToken.trim() : "";
  const mainBotToken = typeof body.mainBotToken === "string" ? body.mainBotToken.trim() : "";
  const telegramUser = typeof body.telegramUser === "string" ? body.telegramUser.trim() : "";

  // The agent to create. When a name is given this is a real intake agent; with no name the
  // Atlas test agent is used, which is what the original proof and a quick check still run.
  let agent: AgentSpec | undefined;
  if (name) {
    const agentId = agentIdFromName(name);
    if (!agentId) {
      throw new ApiError(400, "invalid_request", "Give the agent a name with some letters or digits, not just symbols, and not \"main\".");
    }
    if (!role) throw new ApiError(400, "invalid_request", "Give the agent a role, such as CFO or Scheduler.");
    agent = { id: agentId, name, role, persona };
  }
  // A BotFather token is "<numeric bot id>:<35-ish chars>". Checked here so a pasted username or
  // a trailing word never lands in a config file that then has to be reverted.
  const TOKEN = /^\d+:[A-Za-z0-9_-]{20,}$/;
  if (botToken && !TOKEN.test(botToken)) {
    throw new ApiError(400, "invalid_request", "That does not look like a bot token from @BotFather (digits, a colon, then letters).");
  }
  if (mainBotToken && !botToken) {
    throw new ApiError(400, "invalid_request", "A bot for the first agent needs a bot for Atlas as well.");
  }
  if (mainBotToken && !TOKEN.test(mainBotToken)) {
    throw new ApiError(400, "invalid_request", "The first agent's bot token does not look like one from @BotFather.");
  }
  if (mainBotToken && mainBotToken === botToken) {
    throw new ApiError(400, "invalid_request", "The two agents need two different bots; Telegram lets one bot talk to one listener.");
  }
  if (botToken && !/^\d+$/.test(telegramUser)) {
    throw new ApiError(400, "invalid_request", "The Telegram user id is a number (ask @userinfobot or @getmyid_bot).");
  }

  const result = await setupSecondAgent(id, {
    agent,
    botToken: botToken || undefined,
    telegramUser: telegramUser || undefined,
    mainBotToken: mainBotToken || undefined,
  });
  // The token stays out of the audit log; the user id is fine, it is what the allow list holds.
  await logAudit({
    actorEmail: user.email,
    action: "agent.second_agent_added",
    target: id,
    metadata: { ok: result.ok, agent: agent ? { id: agent.id, name: agent.name, role: agent.role } : "atlas-test", backedUp: result.backedUp, restarted: result.restarted, telegram: Boolean(botToken), telegramUser: telegramUser || null, mainBot: Boolean(mainBotToken), note: result.note ?? null },
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
