import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Direct-line conversations with a named agent, kept so they last (migration 0034).
//
// Every write here is best effort. Saving a conversation is a courtesy on top of the reply; a
// database that is down, or a table not created yet, must never stop someone talking to their
// agent. So a failed write logs and returns null, and the chat carries on unsaved.

export interface AgentThread {
  id: string;
  agent_key: string;
  title: string | null;
  updated_at: string;
}

export interface AgentThreadMessage {
  role: "user" | "assistant";
  content: string;
}

const TITLE_MAX = 80;

function warn(what: string, err: { message?: string } | null | undefined) {
  if (err) console.error(`[agent-threads:${what}]`, err.message);
}

/** The person's conversations on one instance, most recent first. Empty on any failure. */
export async function listThreads(instanceId: string, userId: string): Promise<AgentThread[]> {
  const { data, error } = await createAdminClient()
    .from("agent_threads")
    .select("id, agent_key, title, updated_at")
    .eq("agent37_id", instanceId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(200);
  warn("list", error);
  return (data ?? []) as AgentThread[];
}

/** One conversation, only if it is this person's on this instance. */
export async function getThread(instanceId: string, userId: string, threadId: string): Promise<AgentThread | null> {
  if (!/^[0-9a-f-]{36}$/i.test(threadId)) return null;
  const { data, error } = await createAdminClient()
    .from("agent_threads")
    .select("id, agent_key, title, updated_at")
    .eq("id", threadId)
    .eq("agent37_id", instanceId)
    .eq("user_id", userId)
    .maybeSingle();
  warn("get", error);
  return (data as AgentThread | null) ?? null;
}

export async function getThreadMessages(threadId: string): Promise<AgentThreadMessage[]> {
  const { data, error } = await createAdminClient()
    .from("agent_thread_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("id", { ascending: true })
    .limit(1000);
  warn("messages", error);
  return (data ?? []) as AgentThreadMessage[];
}

/** Start a conversation, titled by its opening line. `id` is chosen by the caller so the gateway
 *  session can be named before the row exists. Null when it could not be saved. */
export async function createThread(
  id: string,
  instanceId: string,
  userId: string,
  agentKey: string,
  firstMessage: string
): Promise<AgentThread | null> {
  const title = firstMessage.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX) || null;
  const { data, error } = await createAdminClient()
    .from("agent_threads")
    .insert({ id, agent37_id: instanceId, user_id: userId, agent_key: agentKey, title })
    .select("id, agent_key, title, updated_at")
    .single();
  warn("create", error);
  return (data as AgentThread | null) ?? null;
}

/** Add a message and move the thread to the top of the list. */
export async function appendMessage(threadId: string, role: "user" | "assistant", content: string): Promise<void> {
  if (!content.trim()) return;
  const db = createAdminClient();
  const { error } = await db.from("agent_thread_messages").insert({ thread_id: threadId, role, content });
  warn("append", error);
  const { error: touchErr } = await db
    .from("agent_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);
  warn("touch", touchErr);
}

export async function renameThread(threadId: string, title: string): Promise<boolean> {
  const { error } = await createAdminClient()
    .from("agent_threads")
    .update({ title: title.trim().slice(0, 200) })
    .eq("id", threadId);
  warn("rename", error);
  return !error;
}

export async function deleteThread(threadId: string): Promise<boolean> {
  // Messages go with it (on delete cascade).
  const { error } = await createAdminClient().from("agent_threads").delete().eq("id", threadId);
  warn("delete", error);
  return !error;
}
