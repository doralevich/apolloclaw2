-- Seats: an agent belongs to a PERSON, not just to a workspace.
--
-- Until now a workspace had agents and members, and nothing connected the two. That was correct
-- while every workspace was one person who had bought one agent. It stops being correct the
-- moment a company buys a second agent for someone in the office: without an owner, every
-- member sees every agent in the workspace, so the office manager can open the founder's agent
-- and read their chat threads. Chat history lives on the instance, so this is the only place
-- that separation can be expressed.
--
-- Three columns, no new tables. Everything here is additive and nullable, so existing rows stay
-- valid and existing code keeps working while the app catches up.

-- ── 1. Whose agent is this? ───────────────────────────────────────────────────
--
-- Distinct from created_by, which records who pressed the button. An admin provisions a seat
-- FOR somebody else, so the two are routinely different people and collapsing them would make
-- "my agent" mean "the agent I happened to create".
--
-- ON DELETE SET NULL rather than CASCADE: removing a person from the workspace must never
-- delete a running VPS. An ownerless agent falls back to workspace-wide visibility, which is
-- exactly where it was before this migration.
alter table public.agents
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

comment on column public.agents.owner_id is
  'The person this agent belongs to. Members see only their own; admins see all. NULL means workspace-wide, which is how every agent created before seats behaves.';

-- Existing agents belong to whoever created them. Every workspace today is a single person, so
-- this is right rather than merely convenient - and it means the ownership filter does not
-- suddenly hide anyone from their own agent the moment it ships.
update public.agents set owner_id = created_by where owner_id is null and created_by is not null;

create index if not exists agents_owner_idx on public.agents (owner_id);

-- ── 2. Answers per agent, not per workspace ───────────────────────────────────
--
-- agent_setup was keyed (workspace_id, agent_type). One answers row per company, which is what
-- the checklist and USER.md are built from - so a second person's agent would be built around
-- the FIRST person's answers: their calendar, their team, their way of working.
--
-- Nullable, and the lookup prefers a matching agent37_id before falling back to the
-- workspace-level row. Legacy rows have no agent id and keep behaving exactly as they did.
alter table public.agent_setup
  add column if not exists agent37_id text references public.agents (agent37_id) on delete cascade;

comment on column public.agent_setup.agent37_id is
  'The agent these answers built. NULL on rows written before seats, which are workspace-level and still read as the fallback.';

create index if not exists agent_setup_agent_idx on public.agent_setup (agent37_id);

-- ── 3. Invitations know who they are for ──────────────────────────────────────
--
-- invitations carried a token, a workspace and a role, and no address: an invite was a link the
-- admin copied and delivered themselves. That cannot support "only people at your company",
-- because there is nothing to compare a domain against, and it cannot support provisioning a
-- seat for a named person.
--
-- Nullable, so link-style invites already outstanding still accept.
alter table public.invitations
  add column if not exists email text;

comment on column public.invitations.email is
  'Who the invitation is for, lowercased. NULL on link-style invitations created before seats.';

-- Whether this invitation comes with an agent of its own. Recorded on the invitation rather
-- than decided at accept time, because it is the ADMIN's decision - they are the one paying for
-- it - and an invitee must never be able to mint a VPS by choosing an option on a form.
alter table public.invitations
  add column if not exists with_agent boolean not null default false;

comment on column public.invitations.with_agent is
  'The admin asked for this person to get their own agent. Provisioning spends real money, so it is decided by the payer at invite time, never by the invitee at accept time.';

create index if not exists invitations_email_idx on public.invitations (email);
