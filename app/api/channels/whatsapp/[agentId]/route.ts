import { after } from "next/server";
import { timingSafeEqual } from "crypto";
import * as whatsapp from "@/lib/channels/whatsapp";
import { getChannelConfig, upsertChannel } from "@/lib/channels/store";
import { answerFrom, runTurn, sessionToContinue } from "@/lib/channels/turn";

type Ctx = { params: Promise<{ agentId: string }> };

// WhatsApp delivers here, via Meta's Cloud API.
//
// Same shape as the other two receivers, with one extra step: Meta will not save a callback URL
// until the endpoint proves it is ours, and it does that with a GET rather than a POST. Hence two
// handlers.
//
// Sending needs the Phone Number ID as well as the token — the endpoint is
// /{phone_number_id}/messages — which is why this channel stores an external_id and the others
// don't.

export const maxDuration = 300;

/**
 * Meta's webhook verification.
 *
 * When the customer saves the callback URL, Meta GETs it with hub.mode, hub.verify_token and
 * hub.challenge, and expects the challenge echoed back in plain text if the token matches the one
 * they typed in. Unlike Slack's challenge this one IS authenticated — the verify token is
 * generated at connect and shown on the card for them to paste, so by the time Meta calls, there
 * is something real to compare against.
 */
export async function GET(request: Request, { params }: Ctx) {
  const { agentId } = await params;
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new Response("bad request", { status: 400 });
  }

  const config = await getChannelConfig(agentId, "whatsapp").catch(() => null);
  if (!config?.verifyToken || !constantTimeEqual(token, config.verifyToken)) {
    // 403 is what Meta expects for a mismatch, and it shows the customer a clear failure in their
    // own console rather than a silent non-save.
    console.warn("[channels:whatsapp] verification failed", { agentId });
    return new Response("forbidden", { status: 403 });
  }

  return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request, { params }: Ctx) {
  const { agentId } = await params;
  const ok = () => new Response("ok", { status: 200 });

  const rawBody = await request.text();

  const config = await getChannelConfig(agentId, "whatsapp").catch(() => null);
  if (!config?.secret || !config.externalId) return ok();

  const valid = whatsapp.verifySignature({
    appSecret: config.secret,
    signature: request.headers.get("x-hub-signature-256"),
    rawBody,
  });
  if (!valid) {
    console.warn("[channels:whatsapp] rejected delivery with bad signature", { agentId });
    return ok();
  }

  const message = readMessage(rawBody);
  if (!message) return ok();

  // First number to message it owns it. Meta delivers status callbacks and other people's
  // messages down the same webhook, so this matters more here than elsewhere.
  if (config.ownerChatId && config.ownerChatId !== message.from) return ok();

  after(async () => {
    try {
      if (!config.ownerChatId) {
        await upsertChannel(agentId, "whatsapp", {
          ownerChatId: message.from,
          state: "connected",
          message: null,
        });
      }

      const result = await runTurn(agentId, message.text, sessionToContinue(config.sessionId, config.updatedAt));

      if (result.session_id && result.session_id !== config.sessionId) {
        await upsertChannel(agentId, "whatsapp", {
          sessionId: result.session_id,
          state: "connected",
          message: null,
        });
      }

      await whatsapp.sendMessage(
        config.externalId!,
        config.token,
        message.from,
        answerFrom(result)
      );
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[channels:whatsapp] turn failed", { agentId, message: msg });
      await whatsapp
        .sendMessage(
          config.externalId!,
          config.token,
          message.from,
          "Sorry - something went wrong on my end."
        )
        .catch(() => {});
      await upsertChannel(agentId, "whatsapp", { state: "error", message: msg }).catch(() => {});
    }
  });

  return ok();
}

/**
 * Dig the one text message out of Meta's envelope.
 *
 * The payload is entry[] → changes[] → value.messages[], and most deliveries carry no message at
 * all — `statuses` (sent, delivered, read) comes down the same webhook and is by far the more
 * common event. Anything that isn't a plain inbound text is ignored: images, reactions and
 * receipts all arrive here too.
 */
function readMessage(rawBody: string): { from: string; text: string } | null {
  let body: {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{ from?: string; type?: string; text?: { body?: string } }>;
        };
      }>;
    }>;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== "text" || !msg.from || !msg.text?.body?.trim()) return null;
  return { from: msg.from, text: msg.text.body.trim() };
}

function constantTimeEqual(sent: string, expected: string): boolean {
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
