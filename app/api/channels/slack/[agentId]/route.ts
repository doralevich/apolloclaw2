import { after } from "next/server";
import * as slack from "@/lib/channels/slack";
import { getChannelConfig, upsertChannel } from "@/lib/channels/store";
import { answerFrom, runTurn } from "@/lib/channels/turn";

type Ctx = { params: Promise<{ agentId: string }> };

// Slack delivers here, the same shape as the Telegram receiver next door.
//
// Authentication is Slack's request signature over the raw body, which is why this reads text()
// before parsing — re-serialising the JSON changes the bytes and the signature stops matching.
//
// TWO THINGS SLACK DOES THAT TELEGRAM DOESN'T:
//
//   1. It verifies the URL before it will save it. The customer pastes this endpoint into Event
//      Subscriptions and Slack immediately POSTs a `url_verification` challenge expecting the
//      challenge string echoed back. That happens BEFORE they have connected here, so there is no
//      signing secret stored yet to verify against — the challenge is answered unsigned. It
//      carries nothing and reveals nothing, which is why that is safe.
//   2. It hears its own messages. Every reply we post comes back as another event, so a receiver
//      that doesn't filter its own bot talks to itself forever.

export const maxDuration = 300;

export async function POST(request: Request, { params }: Ctx) {
  const { agentId } = await params;
  const ok = () => new Response("ok", { status: 200 });

  const rawBody = await request.text();
  let body: {
    type?: string;
    challenge?: string;
    event?: {
      type?: string;
      subtype?: string;
      bot_id?: string;
      channel?: string;
      channel_type?: string;
      user?: string;
      text?: string;
    };
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return ok();
  }

  // Answered before anything else, and deliberately without a signature — see above.
  if (body.type === "url_verification" && body.challenge) {
    return new Response(body.challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const config = await getChannelConfig(agentId, "slack").catch(() => null);
  if (!config?.secret) return ok();

  const valid = slack.verifySignature({
    signingSecret: config.secret,
    signature: request.headers.get("x-slack-signature"),
    timestamp: request.headers.get("x-slack-request-timestamp"),
    rawBody,
  });
  if (!valid) {
    console.warn("[channels:slack] rejected delivery with bad signature", { agentId });
    return ok();
  }

  const event = body.event;
  // Direct messages only, and never our own. `bot_id` catches the replies we just posted;
  // `subtype` catches edits, joins and the rest of Slack's message-shaped events.
  if (
    body.type !== "event_callback" ||
    event?.type !== "message" ||
    event.channel_type !== "im" ||
    event.bot_id ||
    event.subtype ||
    !event.channel ||
    !event.text?.trim()
  ) {
    return ok();
  }

  const channel = event.channel;
  const text = event.text.trim();

  // First person to DM the app owns it. Everyone else in the workspace gets silence.
  if (config.ownerChatId && config.ownerChatId !== channel) return ok();

  after(async () => {
    try {
      if (!config.ownerChatId) {
        await upsertChannel(agentId, "slack", {
          ownerChatId: channel,
          state: "connected",
          message: null,
        });
      }

      const result = await runTurn(agentId, text, config.sessionId);

      if (result.session_id && result.session_id !== config.sessionId) {
        await upsertChannel(agentId, "slack", {
          sessionId: result.session_id,
          state: "connected",
          message: null,
        });
      }

      await slack.postMessage(config.token, channel, answerFrom(result));
    } catch (e) {
      const message = (e as Error).message;
      console.error("[channels:slack] turn failed", { agentId, message });
      await slack
        .postMessage(config.token, channel, "Sorry - something went wrong on my end.")
        .catch(() => {});
      await upsertChannel(agentId, "slack", { state: "error", message }).catch(() => {});
    }
  });

  return ok();
}
