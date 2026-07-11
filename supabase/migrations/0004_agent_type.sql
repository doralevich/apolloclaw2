-- Track which storefront agent TYPE a row was provisioned as (config/agent-types.ts id).
--
-- The one-agent-per-type-per-workspace cap used to key on `template`, which broke once
-- paid provisioning gained a fallback template (a CFO and a Sales agent could both land on
-- the generic openclaw template). `agent_type` records the intent regardless of which
-- Agent37 template the instance actually got. Nullable: legacy rows predate it, and the cap
-- check falls back to template matching for them.

alter table public.agents add column if not exists agent_type text;

create index if not exists agents_workspace_type_idx
  on public.agents (workspace_id, agent_type);
