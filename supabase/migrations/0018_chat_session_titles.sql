-- Names for chat threads.
--
-- WHY THIS EXISTS, given that the Agents API owns sessions and there is deliberately no local
-- sessions table: OpenClaw has nowhere to put a title. Its session list carries neither `title`
-- nor `preview` (those are Hermes fields), and PATCH /v1/sessions/{id} is not implemented, so
-- renaming a chat failed and every row in the rail read "New chat". A rail where every entry
-- says the same thing shows you that you have conversations without letting you tell them apart,
-- which is most of what a rail is for.
--
-- This is NOT an index of sessions. It stores exactly one fact the runtime cannot hold — the
-- label — and holds no membership, no ordering, no history. The instance stays the source of
-- truth for which sessions exist; a row here for a deleted session is harmless because nothing
-- reads this table except to label a session the instance just listed.
--
-- Titles are also written here when the sessions route derives one from a thread's first message,
-- so that derivation happens once per thread rather than on every rail load.

create table if not exists public.chat_session_titles (
  agent37_id  text not null references public.agents (agent37_id) on delete cascade,
  -- The instance's session id. Text rather than uuid: it's an opaque identifier minted upstream
  -- and its format is not ours to assume.
  session_id  text not null,

  -- What the rail shows. Capped in the route, not here — a check constraint on length would turn
  -- a cosmetic overrun into a failed write.
  title       text not null,

  -- True when a person typed it, false when we derived it from the first message. Kept so a
  -- future re-derivation can refresh generated labels without overwriting anything a customer
  -- deliberately named.
  is_custom   boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (agent37_id, session_id)
);

-- Service-role only, like every other agent-scoped table here: callers have already passed
-- requireAgentAccess, and RLS with no policies means a leaked anon key reaches nothing.
alter table public.chat_session_titles enable row level security;
