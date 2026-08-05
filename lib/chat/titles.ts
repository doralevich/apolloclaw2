import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Reading and writing chat_session_titles — the one fact about a conversation the runtime can't
// hold. See the migration for why this table exists at all.
//
// Service-role throughout, like every other agent-scoped table here: the caller has already
// passed requireAgentAccess, and RLS on this table has no policies so a leaked anon key reaches
// nothing.
//
// Every write here is best-effort. A title is a nicety layered over a conversation that already
// exists and has already been sent; a failed write must never fail the request that carried it.

/** The longest a stored title can be. Truncated rather than rejected. */
export const MAX_TITLE = 200;

export function normalizeTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE);
}

/** session_id -> title, for the sessions this agent just listed. */
export async function getTitles(
  agent37Id: string,
  sessionIds: string[]
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (sessionIds.length === 0) return out;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chat_session_titles")
    .select("session_id, title")
    .eq("agent37_id", agent37Id)
    .in("session_id", sessionIds);

  // A rail with no names is a worse page. A rail that fails to load is no page at all.
  if (error || !data) return out;

  for (const row of data) out.set(row.session_id, row.title);
  return out;
}

export async function setTitle(
  agent37Id: string,
  sessionId: string,
  title: string,
  // A person typed it, as opposed to us deriving it from the first message.
  isCustom: boolean
): Promise<void> {
  const clean = normalizeTitle(title);
  if (!clean) return;

  const supabase = createAdminClient();
  await supabase.from("chat_session_titles").upsert(
    {
      agent37_id: agent37Id,
      session_id: sessionId,
      title: clean,
      is_custom: isCustom,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "agent37_id,session_id" }
  );
}

/**
 * Store a derived title, but never over one somebody typed.
 *
 * The sessions route calls this when it has read a thread's first message. Without the guard, a
 * customer's chosen name would be silently replaced by the opening line of the conversation on
 * the next load — the exact thing renaming exists to avoid.
 */
export async function setDerivedTitle(
  agent37Id: string,
  sessionId: string,
  title: string
): Promise<void> {
  const clean = normalizeTitle(title);
  if (!clean) return;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("chat_session_titles")
    .select("is_custom")
    .eq("agent37_id", agent37Id)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (data?.is_custom) return;
  await setTitle(agent37Id, sessionId, clean, false);
}

export async function deleteTitle(agent37Id: string, sessionId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("chat_session_titles")
    .delete()
    .eq("agent37_id", agent37Id)
    .eq("session_id", sessionId);
}
