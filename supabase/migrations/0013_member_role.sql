-- A second role, so "invite a teammate" stops meaning "hand over the workspace".
--
-- Both tables were pinned to a single value — check (role = 'admin') — so every person ever
-- invited became a full admin: able to rename or delete the workspace, buy credits, invite
-- others, and remove the person who invited them. Fine while the only user was us. Not fine
-- the moment a customer adds their office manager.
--
-- Only the CHECK constraints were in the way. is_workspace_admin() already tests
-- `role = 'admin'` rather than mere membership, and every RLS policy that should be
-- admin-only already calls it, so the policies have been correct for a two-role world since
-- 0001 — they simply had no second role to distinguish. accept_invitation() likewise already
-- copies the invitation's role onto the membership verbatim.
--
-- Widening a CHECK is backward compatible: every existing row is 'admin' and stays valid,
-- and code that writes 'admin' keeps working. Safe to apply before the code that uses it.

alter table public.memberships drop constraint if exists memberships_role_check;
alter table public.memberships
  add constraint memberships_role_check check (role in ('admin', 'member'));

alter table public.invitations drop constraint if exists invitations_role_check;
alter table public.invitations
  add constraint invitations_role_check check (role in ('admin', 'member'));

comment on column public.memberships.role is
  'admin = full control (workspace settings, billing, invites, agent lifecycle). member = day-to-day use: chat, connections, reading usage.';

comment on column public.invitations.role is
  'Role the invitee receives on accept. Copied verbatim onto the membership by accept_invitation().';
