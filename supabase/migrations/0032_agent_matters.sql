-- A legal practice's open matters, in a place the agent can read.
--
-- Same reasoning as agent_listings, one role over. The scheduled reports we ship for the Law
-- Agent open with "go through my open matters" and "everything I have drafted that is waiting on
-- my sign-off", and the agent has no idea what any of that is. This is the ground truth those
-- reports read, and the deadline columns are the reason it is worth typing in: a missed showing
-- costs a Saturday, a missed notice window renews a contract for a year.
--
-- NOT A PRACTICE MANAGEMENT SYSTEM. Clio and Smokeball exist and firms pay for them. There is no
-- time entry here, no billing, no document store and no trust accounting, because a worse copy of
-- the system of record is worth less than nothing. The test each column had to pass is the same
-- one as for listings: does a scheduled report or a skill need it?
--
-- WHAT IS DELIBERATELY ABSENT, and this one is not a scoping decision. There is no field for
-- matter substance, advice given, or privileged analysis. A row here is an index entry - who,
-- what kind, what is due - and the file it generates lands in the agent's workspace where the
-- confidentiality rules in its skills apply. Somewhere to paste privileged detail into a
-- dashboard is a liability dressed as a feature, so `notes` is documented as logistics rather
-- than as a case file and nothing invites more.

create table if not exists public.agent_matters (
  id             bigint generated always as identity primary key,
  agent37_id     text not null references public.agents (agent37_id) on delete cascade,

  -- The one required field. Everything else can be filled in later or never, because a half
  -- entered matter the agent knows about beats a complete one nobody bothered to type.
  title          text not null check (length(btrim(title)) > 0),

  -- The firm's own reference. Free text: every practice numbers matters differently and none of
  -- them wants to be told how.
  matter_number  text,

  -- Who it is for. May be an internal team on an in-house agent, which is why it is not
  -- "client_name" with a company shape.
  client_name    text,

  -- Free text against the practice areas in the intake rather than an enum, so a firm that does
  -- something we did not list is not stuck. The reports group on it loosely, if at all.
  practice_area  text,

  status         text not null default 'active'
                 check (status in ('intake', 'active', 'on_hold', 'awaiting_client', 'closed')),

  -- Which law governs. The one field the research and review skills must not guess at: a clause
  -- that is unremarkable in one state is unenforceable in another.
  jurisdiction   text,

  -- Named so the conflicts question has something to check against. Not a conflicts system.
  opposing_party text,

  -- The dates the reports actually ask about. next_action_on is the one that does the work:
  -- "Deadlines this week" and "Renewals ahead" both read it, and it is the date to ACT rather
  -- than the date something expires, because a thirty day window found on day twenty-nine is a
  -- window that closed.
  opened_on      date,
  next_action_on date,
  next_action    text,
  closed_on      date,

  -- Logistics the agent should know: who owes the next move, what it is waiting on, which
  -- template applies. NOT a case file - see the note above.
  notes          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- NO UNIQUE CONSTRAINT ON matter_number. Firms reuse and renumber, an in-house team may not
-- number at all, and a duplicate is the customer's to resolve rather than the database's to
-- refuse at the moment they are trying to type one in.

-- The list every page and every report loads: one agent's open matters, soonest deadline first.
create index if not exists agent_matters_agent_status_idx
  on public.agent_matters (agent37_id, status, next_action_on nulls last);

alter table public.agent_matters enable row level security;

-- Read and write go through the API, which checks workspace membership on the agent first. No
-- policy here means no direct client access, the same posture as agent_listings and agent_tasks.
