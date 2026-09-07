-- What the agent surfaced that still needs somebody.
--
-- THE AGENT ALREADY PRODUCES THESE AND WE THROW THEM ALL AWAY. The daily brief has a "waiting on
-- you" block and an "if you only do one thing" line. The follow-up chaser produces drafts sitting
-- on approval. The end-of-day summary lists what slipped. Every one of those is a task, all of it
-- lands in a Telegram message at 8am, and nothing survives the scroll.
--
-- So this is not a new capability asked of the agent - it has no way to write to us at all, no
-- callback and no tool. It is a place to keep what the scheduled runs already say.
--
-- DEDUPE IS THE WHOLE DESIGN PROBLEM. A brief every weekday morning that says "chase Henderson
-- about the financing" would otherwise create five identical tasks a week, and a list that grows
-- faster than anyone can clear it is worse than no list. The fingerprint is a normalised form of
-- the title, unique among OPEN tasks for one agent: the same thing surfacing again on Tuesday
-- updates Monday's row rather than adding to it, and once it is done or dismissed the constraint
-- lets it come back if it genuinely recurs.

create table if not exists public.agent_tasks (
  id            bigint generated always as identity primary key,
  agent37_id    text not null references public.agents (agent37_id) on delete cascade,

  -- One line, as the agent wrote it. This is what somebody reads in a list.
  title         text not null check (length(btrim(title)) > 0),
  -- Optional context: why, or who, or by when. Not required, and not a place for the whole brief.
  detail        text,

  -- Where it came from: 'schedule:daily-brief', 'schedule:custom:monday-showings', 'manual'.
  -- Kept as free text rather than an enum so a new source does not need a migration - the same
  -- reasoning as the skill column on agent_schedules.
  source        text not null default 'manual',

  status        text not null default 'open' check (status in ('open', 'done', 'dismissed')),

  -- Normalised title, for the dedupe below. Written by the app, not derived here, because the
  -- normalisation belongs next to the parsing that produces it.
  fingerprint   text not null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- When it left the list, either way. Kept so "what did my agent get done" has an answer later.
  closed_at     timestamptz
);

-- The same thing, still open, only once. Partial so a task that was done in March can legitimately
-- come back in April - recurring work is real, and the constraint should not pretend otherwise.
create unique index if not exists agent_tasks_open_fingerprint_idx
  on public.agent_tasks (agent37_id, fingerprint)
  where status = 'open';

-- The list anyone actually loads: one agent's open tasks, newest first.
create index if not exists agent_tasks_agent_status_idx
  on public.agent_tasks (agent37_id, status, created_at desc);

alter table public.agent_tasks enable row level security;

-- Read and write go through the API, which checks workspace membership on the agent first. No
-- policy here means no direct client access, which is the same posture as agent_schedules.
