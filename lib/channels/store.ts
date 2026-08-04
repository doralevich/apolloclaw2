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
// The one rule this file exists to enforce: bot_token goes out to the browser NEVER. `toChannel`
// is the only thing routes should return, and it has no token field to forget to strip.

export interface ChannelRow {
  agent37_id: string;
  channel: string;
  bot_token: string | null;
  account: string | null;
  /** Telegram echoes this on every delivery; it's what authenticates the webhook. */
  secret: string | null;
  /** The agent session this channel talks in, so the thread continues across messages. */
  session_id: string | null;
  /** Bound on the first message. Anyone else talking to the bot is ignored. */
  owner_chat_id: string | null;
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
 * Everything the Telegram webhook receiver needs, decrypted, in one read.
 *
 * Separate from getChannelToken because the receiver runs on every inbound message and wants the
 * secret, the session and the bound owner as well — three more round trips otherwise, on the one
 * path where latency is a person waiting for a reply.
 */
export async function getTelegramConfig(agentId: string): Promise<{
  token: string;
  secret: string | null;
  sessionId: string | null;
  ownerChatId: string | null;
} | null> {
  const row = await getChannelRow(agentId, "telegram");
  const token = decryptSecret(row?.bot_token ?? null);
  if (!row || !token) return null;
  return {
    token,
    secret: decryptSecret(row.secret),
    sessionId: row.session_id,
    ownerChatId: row.owner_chat_id,
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
    ownerChatId?: string | null;
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
  if (fields.ownerChatId !== undefined) payload.owner_chat_id = fields.ownerChatId;

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
