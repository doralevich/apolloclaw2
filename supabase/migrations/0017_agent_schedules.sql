-- Scheduled skills: the agent starting a conversation, rather than answering one.
--
-- WHY THIS IS A TABLE AND NOT A SKILL. A skill is a document the runtime consults when it judges
-- the skill relevant; it has no trigger and no clock. "Brief me every morning at 8" cannot be
-- written as a skill — the file would read perfectly and never fire. It needs something outside
-- the agent to wake up and ask, which is this plus an hourly cron.
--
-- TIMEZONE IS STORED PER SCHEDULE, not per workspace, and it is not optional. The onboarding
-- questionnaire never collected one, so there is nothing to inherit; and 8am with no timezone
-- means 8am UTC, which is the middle of the night for most of the customer base. A brief that
-- arrives at 3am is worse than no brief.

create table if not exists public.agent_schedules (
  id           bigint generated always as identity primary key,
  agent37_id   text not null references public.agents (agent37_id) on delete cascade,

  -- Which skill to invoke. Matches a slug in config/skills — validated there rather than as a
  -- check constraint, so adding a schedulable skill doesn't need a migration.
  skill        text not null,

  -- Local hour, 0-23, in `timezone`. Hour granularity because the cron runs hourly; minutes
  -- would be a promise the mechanism can't keep.
  hour         integer not null check (hour between 0 and 23),
  -- "daily" | "weekdays" | "monday" … whichever days this should fire on.
  days         text not null default 'weekdays',
  -- IANA name, e.g. "America/New_York". Collected in the UI from the browser.
  timezone     text not null,

  enabled      boolean not null default true,

  -- The local date (YYYY-MM-DD in `timezone`) this last fired on. The guard against double
  -- firing: the cron runs every hour, so without it a schedule would re-run on the same hour of
  -- a retry, and DST would fire some schedules twice in a night.
  last_run_on  date,
  last_status  text,
  last_error   text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- One schedule per skill per agent. Two daily briefs is a bug, not a feature.
  unique (agent37_id, skill)
);

create index if not exists agent_schedules_due_idx
  on public.agent_schedules (enabled, hour);

alter table public.agent_schedules enable row level security;
