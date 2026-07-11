-- Post-purchase setup questionnaire answers (/onboard/[agent]), keyed by workspace +
-- agent type. Written by the service role only (the /api/agent-setup route authenticates
-- the member first); injected into the instance as USER.md either when the questionnaire
-- is submitted (agent already provisioned) or at provision time (webhook path), whichever
-- happens second. injected_at records that the write landed.

create table if not exists public.agent_setup (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  agent_type   text not null,
  answers      jsonb not null,
  submitted_by uuid references auth.users (id) on delete set null,
  injected_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (workspace_id, agent_type)
);

-- Service-role only: no policies, no grants. RLS on so anon/authenticated see nothing.
alter table public.agent_setup enable row level security;
