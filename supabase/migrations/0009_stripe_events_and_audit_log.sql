-- Playbook Item 6 (webhook idempotency) and §5 (audit logging).

-- ─── stripe_events ───────────────────────────────────────────────────────────
-- Stripe retries a webhook until it gets a 2xx, so every handler must tolerate seeing the same
-- event twice. Today the only thing standing between a retry and a duplicate is the
-- one-agent-per-type-per-workspace cap inside provisionTypedAgent, which turns the second
-- provisioning attempt into a 409. That covers provisioning, but NOT the side effects that run
-- afterwards: a retry currently re-sends the "New ApolloClaw sale" email and the Telegram alert.
--
-- Claiming the event id up front makes the whole handler idempotent rather than just the part
-- that happens to have a unique constraint.
create table if not exists public.stripe_events (
  id           text        primary key,   -- Stripe's evt_... id
  type         text        not null,
  processed_at timestamptz not null default now()
);

-- Server-only: RLS on, no policy. Only the service role (the webhook) ever touches this.
alter table public.stripe_events enable row level security;

comment on table public.stripe_events is
  'Processed Stripe webhook event ids, for idempotency. Server-only (RLS on, no policy). A row is deleted if its handler throws, so a genuine retry can reprocess.';

-- ─── audit_log ───────────────────────────────────────────────────────────────
-- An append-only trail of sensitive actions. Deliberately not wired to anything in this
-- migration: the table exists so that the admin surfaces can start writing to it without a
-- second migration, and so a compliance reviewer has something to point at.
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_email text,
  action      text        not null,
  target      text,
  metadata    jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Reads are by operators through the service role, and always time-ordered.
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_idx      on public.audit_log (actor_email, created_at desc);

comment on table public.audit_log is
  'Append-only record of sensitive actions. Server-only (RLS on, no policy). Writes must never block the action they describe.';
