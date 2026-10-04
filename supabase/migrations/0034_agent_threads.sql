-- Conversations on the direct line, so they last.
--
-- An instance with more than one agent talks to each of them over the gateway's own chat endpoint
-- (lib/gateway-chat.ts), because Agent37's chat API cannot name an agent. Agent37 keeps a thread
-- list for its own chat; nothing kept one for these, so a conversation with the SEO agent lived in
-- the open tab and was gone on reload, and the Chats list only ever showed the main agent's.
--
-- One row per conversation, and one row per message. The gateway keeps the model's context under
-- a session derived from the thread id, so a thread reopened tomorrow carries on where it stopped;
-- these tables keep what the person sees.
--
-- Per person, not per workspace: the gateway session is keyed by user, so a thread belongs to the
-- one who started it, the same as their agent's own chat history.

create table if not exists public.agent_threads (
  id          uuid primary key default gen_random_uuid(),
  agent37_id  text not null references public.agents (agent37_id) on delete cascade,
  -- The OpenClaw agent on the instance: "main", or the id of another agent on the box.
  agent_key   text not null check (agent_key ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- The opening line, until somebody renames it.
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists agent_threads_rail_idx
  on public.agent_threads (agent37_id, user_id, updated_at desc);

create table if not exists public.agent_thread_messages (
  id          bigint generated always as identity primary key,
  thread_id   uuid not null references public.agent_threads (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists agent_thread_messages_thread_idx
  on public.agent_thread_messages (thread_id, id);

alter table public.agent_threads enable row level security;
alter table public.agent_thread_messages enable row level security;
-- No policies: no direct client access. The thread routes check the agent and the person.

comment on table public.agent_threads is 'Direct-line conversations with a named agent on an instance (one row per thread, per person). Server-only (RLS on, no policy).';
comment on table public.agent_thread_messages is 'Messages in agent_threads, in order. Server-only (RLS on, no policy).';
