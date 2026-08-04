-- The customer's own logo.
--
-- Everything in the dashboard is currently ApolloClaw's branding, which is right for us and
-- slightly wrong for them: they bought a private agent for their business, and the room it
-- lives in belongs to somebody else. A logo in the sidebar is the cheapest way to make it
-- theirs.
--
-- Nullable, and stays that way. Most customers will never upload one, and the fallback (our
-- mark plus the workspace name) has to remain a first-class state rather than a gap.

alter table public.workspaces
  add column if not exists logo_url text;

comment on column public.workspaces.logo_url is
  'Public URL of the customer''s uploaded logo (workspace-logos bucket). Null = show the default ApolloClaw mark.';
