import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptForStorage } from "@/lib/crypto/byo";
import type { Channel, ChannelId, ChannelState } from "@/lib/types";

// Reading and writing agent_channels.
//
// Service-role throughout, the same as every other agent-scoped table here: the caller has
// already passed requireAgentAccess, and RLS on this table has no policies precisely so that a
// leaked anon key reaches nothing.
//
// The one rule this file exists to enforce: bot_token and secret go out to the browser NEVER.
// `toChannel` is the only thing routes should return, and it has no field for either to forget to
// strip. The single deliberate exception is WhatsApp's verify token, which the customer has to
// paste into Meta's console — see below.

export interface ChannelRow {
  agent37_id: string;
  channel: string;
  bot_token: string | null;
  account: string | null;
  /** Telegram echoes this on every delivery; it's what authenticates the webhook. */
  secret: string | null;
  /** The agent session this channel talks in, so the thread continues across messages. */
  session_id: string | null;
  /** When the current session was opened, for the age cap in sessionToContinue. */
  session_started_at: string | null;
  /** Bound on the first message. Anyone else talking to the bot is ignored. */
  owner_chat_id: string | null;
  /** Provider-side id a reply must be addressed through. WhatsApp's Phone Number ID. */
  external_id: string | null;
  /** Echoed back once, when the provider verifies our callback URL. WhatsApp only. */
  verify_token: string | null;
  state: string;
  message: string | null;
  updated_at: string | null;
}

/** The browser-safe view of a row. No credential, by construction. */
export function toChannel(row: ChannelRow): Channel {
  return {
    channel: row.channel as ChannelId,
    state: (row.state as ChannelState) || "disconnected",
    account: row.account,
    message: row.message,
    // Deliberately exposed, and only this one: Meta's webhook form asks the customer for it, so a
    // verify token they cannot read is a setup they cannot finish. It proves a callback URL is
    // ours during a one-time handshake and unlocks nothing else.
    verifyToken: decryptSecret(row.verify_token),
    // Whether anybody has actually messaged it yet - NOT who, which is why this is a boolean and
    // not the chat id.
    //
    // It matters because a channel is "connected" the moment a token validates, and it does not
    // work until the first message binds an owner. The card said Connected for both, so somebody
    // who pasted a token and closed the tab had a channel that looked finished and answered
    // nobody. This is what lets the card tell the two apart.
    linked: !!row.owner_chat_id,
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : null,
  };
}

export async function listChannelRows(agentId: string): Promise<ChannelRow[]> {
  const db = createAdminClient();
  const { data, error } = await db.from("agent_channels").select("*").eq("agent37_id", agentId);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChannelRow[];
}

export async function getChannelRow(agentId: string, channel: ChannelId): Promise<ChannelRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("agent_channels")
    .select("*")
    .eq("agent37_id", agentId)
    .eq("channel", channel)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ChannelRow) ?? null;
}

/** The stored credential, decrypted. Server-side callers only — this is the actual secret. */
export async function getChannelToken(agentId: string, channel: ChannelId): Promise<string | null> {
  const row = await getChannelRow(agentId, channel);
  return decryptSecret(row?.bot_token ?? null);
}

/**
 * Everything a webhook receiver needs, decrypted, in one read.
 *
 * Separate from getChannelToken because a receiver runs on every inbound message and wants the
 * secret, the session and the bound owner as well — three more round trips otherwise, on the one
 * path where latency is a person waiting for a reply.
 *
 * `secret` means whatever authenticates that channel's deliveries: Telegram's secret_token, which
 * we generate, or Slack's signing secret, which the customer pastes.
 */
export async function getChannelConfig(
  agentId: string,
  channel: ChannelId
): Promise<{
  token: string;
  secret: string | null;
  sessionId: string | null;
  /** When the row was last written (ms), i.e. the last message on this channel. Null if never.
   *  Used to decide whether the stored session is still live or has gone cold — see
   *  sessionToContinue in lib/channels/turn.ts. */
  updatedAt: number | null;
  /** When the current session was opened (ms), for the age cap. Null if never/untracked. */
  sessionStartedAt: number | null;
  ownerChatId: string | null;
  externalId: string | null;
  verifyToken: string | null;
} | null> {
  const row = await getChannelRow(agentId, channel);
  const token = decryptSecret(row?.bot_token ?? null);
  if (!row || !token) return null;
  return {
    token,
    secret: decryptSecret(row.secret),
    sessionId: row.session_id,
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : null,
    sessionStartedAt: row.session_started_at ? Date.parse(row.session_started_at) : null,
    ownerChatId: row.owner_chat_id,
    externalId: row.external_id,
    verifyToken: decryptSecret(row.verify_token),
  };
}

export async function upsertChannel(
  agentId: string,
  channel: ChannelId,
  fields: {
    botToken?: string | null;
    account?: string | null;
    secret?: string | null;
    sessionId?: string | null;
    sessionStartedAt?: string | null;
    ownerChatId?: string | null;
    externalId?: string | null;
    verifyToken?: string | null;
    state: ChannelState;
    message?: string | null;
  }
): Promise<ChannelRow> {
  const db = createAdminClient();
  const payload: Record<string, unknown> = {
    agent37_id: agentId,
    channel,
    state: fields.state,
    message: fields.message ?? null,
    updated_at: new Date().toISOString(),
  };
  // Only overwrite the fields the caller actually supplied: a state-only update (marking a
  // channel broken, say) must not blank the token that would let us fix it.
  if (fields.botToken !== undefined) payload.bot_token = encryptForStorage(fields.botToken);
  if (fields.account !== undefined) payload.account = fields.account;
  // The webhook secret is a credential too — it is the only thing standing between a public URL
  // and anyone who guesses it, so it gets the same envelope as the bot token.
  if (fields.secret !== undefined) payload.secret = encryptForStorage(fields.secret);
  if (fields.sessionId !== undefined) payload.session_id = fields.sessionId;
  if (fields.sessionStartedAt !== undefined) payload.session_started_at = fields.sessionStartedAt;
  if (fields.ownerChatId !== undefined) payload.owner_chat_id = fields.ownerChatId;
  if (fields.externalId !== undefined) payload.external_id = fields.externalId;
  // Encrypted too: anyone holding it could pass Meta's verification for this agent and point the
  // callback URL at themselves.
  if (fields.verifyToken !== undefined) payload.verify_token = encryptForStorage(fields.verifyToken);

  const { data, error } = await db
    .from("agent_channels")
    .upsert(payload, { onConflict: "agent37_id,channel" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ChannelRow;
}

/** Forget a channel entirely, credential included. What disconnect does once the provider is told. */
export async function deleteChannel(agentId: string, channel: ChannelId): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("agent_channels")
    .delete()
    .eq("agent37_id", agentId)
    .eq("channel", channel);
  if (error) throw new Error(error.message);
}
