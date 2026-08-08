-- One questionnaire per AGENT, not per (workspace, type).
--
-- agent_setup's primary key was (workspace_id, agent_type). Every ApolloClaw agent is the same
-- type, so a workspace with two agents had one answers row between them: the second person to
-- submit overwrote the first, and the agent37_id stamp then moved with it, orphaning the first
-- agent's answers. Silent, and unrecoverable.
--
-- This was already latent under seats - a colleague's agent is the same type as the founder's -
-- and became load-bearing the moment somebody could add a second agent for themselves.
--
-- A surrogate key, plus two PARTIAL uniques that keep both lifecycle stages honest:
--   * before an agent exists (the licence flow writes answers, then provisions) a workspace may
--     hold one unclaimed row per type - which is what makes that write idempotent on retry;
--   * once stamped, one row per agent, forever.

alter table public.agent_setup add column if not exists id uuid not null default gen_random_uuid();

alter table public.agent_setup drop constraint if exists agent_setup_pkey;
alter table public.agent_setup add primary key (id);

create unique index if not exists agent_setup_agent_uniq
  on public.agent_setup (agent37_id) where agent37_id is not null;

create unique index if not exists agent_setup_pending_uniq
  on public.agent_setup (workspace_id, agent_type) where agent37_id is null;

comment on column public.agent_setup.id is
  'Surrogate key. The real identity is agent37_id once the agent exists; before that it is (workspace_id, agent_type), enforced by two partial unique indexes.';
