-- What we have already sent each customer in the onboarding series.
--
-- The series runs from an hourly cron, which means every step is evaluated over and over for
-- the same person. Without a record of what went out, a customer who takes three days to set
-- their password gets the same nudge seventy-two times. This table is that record, and the
-- primary key is the guarantee: one row per (email, step), inserted before nothing and after
-- the send.
--
-- Keyed by email rather than user_id on purpose. The welcome step is written by the Stripe
-- webhook, which knows the buyer's address for certain and may be racing the creation of the
-- auth user; email is the one identifier that exists at every point in the flow. It matches
-- how entitlements is keyed, for the same reason.
--
-- Server-only: RLS on with no policy, so nothing reaches this except the service role. There
-- is no customer-facing view of "which emails did I get".

create table if not exists public.onboarding_emails (
  email      text        not null,
  step       text        not null,
  sent_at    timestamptz not null default now(),
  primary key (email, step)
);

comment on table public.onboarding_emails is
  'One row per onboarding email actually sent. The (email, step) primary key is what stops an hourly cron from re-sending the same nudge every hour. Server-only (RLS on, no policy).';

comment on column public.onboarding_emails.step is
  'Step id from lib/onboarding-series.ts. Recorded even when a step is deliberately skipped as no-longer-relevant, so a customer who finishes early is never nudged about it afterwards.';

alter table public.onboarding_emails enable row level security;

-- The sweep reads "everything already sent to this address" once per customer per run.
create index if not exists onboarding_emails_email_idx
  on public.onboarding_emails (email);
