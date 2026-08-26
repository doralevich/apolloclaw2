-- Soft-delete + retention for agents.
--
-- Deleting an agent used to be a hard delete: the `agents` row was dropped and the Agent37 VPS
-- destroyed in the same breath, with no window in between. A real paying customer (Graham) lost
-- their agent that way - $25 of purchased credit on it - and nothing in the product could bring
-- it back, because the row was gone and the instance was gone.
--
-- This adds the columns that turn delete into a two-stage operation:
--   1. Soft-delete now stamps `deleted_at` (and who/why) and sets `purge_after` = now + retention.
--      The row survives, hidden from the product; the VPS is STOPPED, not destroyed. An admin can
--      Restore it inside the window.
--   2. A daily purge cron does the real teardown - agent37.deleteAgent + row/child cleanup - only
--      once `purge_after` has passed.
--
-- All four columns are nullable and default null, so every existing row reads as "live" and no
-- current query changes meaning until callers opt in with `deleted_at is null`.
alter table public.agents
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users (id) on delete set null,
  add column if not exists delete_reason text,
  add column if not exists purge_after timestamptz;

-- The product reads agents by workspace and always wants only live ones; a partial index keeps
-- that hot path off the soft-deleted rows.
create index if not exists agents_live_workspace_idx
  on public.agents (workspace_id)
  where deleted_at is null;

-- The purge cron scans for rows whose retention window has elapsed. Partial index so it only ever
-- touches the (small) set of soft-deleted rows, not the whole table.
create index if not exists agents_purge_after_idx
  on public.agents (purge_after)
  where deleted_at is not null;
