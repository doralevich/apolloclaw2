-- Which agent plan a workspace is on: how many agents it may run.
--
-- The tiers themselves (Basic 1, Medium 3, Large 7) live in config/agent-plans.ts so they can be
-- renamed or recounted without a migration. This table only says which one a workspace is on,
-- plus an optional number of its own for a deal that does not fit a tier.
--
-- A TABLE OF ITS OWN, not a column on workspaces. A workspace admin may update their workspaces
-- row through RLS (rename it, upload a logo), so a plan column there would let a customer raise
-- their own limit from the browser console. Here RLS is on with no policies: only the server,
-- with the service role, reads or writes it, and Super Admin is the only thing that sets it.
--
-- No row means the default tier. The app reads this table defensively, so until this migration
-- is applied every workspace simply reads as the default.

create table if not exists public.workspace_agent_plans (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  -- An id from AGENT_TIERS. Free text rather than an enum so a tier added in config needs no
  -- migration; the app falls back to the default for an id it does not know.
  plan         text not null default 'basic',
  -- A per-workspace number that wins over the tier's, when set.
  agent_limit  integer check (agent_limit is null or agent_limit between 1 and 100),
  updated_at   timestamptz not null default now(),
  updated_by   text
);

alter table public.workspace_agent_plans enable row level security;
-- No policies: no direct client access, the same posture as agent_tasks and agent_matters.

comment on table public.workspace_agent_plans is 'Which agent plan (config/agent-plans.ts) a workspace is on, plus an optional custom agent limit. Set from Super Admin only. Server-only (RLS on, no policy).';
