-- Purchased credit, tracked by US because Agent37 won't hold it for us.
--
-- Agent37 gives one writable knob per instance - monthly_cap_micros - and no per-instance credit
-- bucket (its `credit_remaining_micros` is the account wallet, which our Stripe payments can't
-- reach; every /instances/{id}/credit|topup|wallet path is a 404). So a one-time top-up is
-- delivered by RAISING the instance's cap, and this table is the ledger that keeps that honest.
--
-- Credit remaining is COMPUTED, not stored: sum(delivered top-ups in wallet_transactions) minus
-- `drawn_micros`. That makes delivery idempotent - a retried webhook can't double-grant, because
-- the sum of delivered rows is stable - and lets the cap self-heal on any budget read. The
-- effective Agent37 cap is always base_cap + (purchased - drawn); as a month's usage exceeds the
-- base, that overage is added to drawn at the month rollover, so a $25 top-up is spent once and
-- gone rather than a permanent cap raise.

create table if not exists public.agent_credit (
  agent37_id text primary key references public.agents (agent37_id) on delete cascade,
  -- The plan's monthly allowance, captured from the instance's cap the first time credit is
  -- added (before any credit is layered on). Everything else sits on top of this.
  base_cap_micros bigint,
  -- Total purchased credit consumed so far, accumulated at each month rollover from the prior
  -- month's over-base usage. credit_remaining = sum(delivered top-ups) - drawn_micros.
  drawn_micros bigint not null default 0 check (drawn_micros >= 0),
  -- The Agent37 monthly_period we last reconciled against, and the consumed figure at that time -
  -- together they let a rollover add the prior month's over-base usage to drawn exactly once.
  period text,
  consumed_snapshot_micros bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Service-role only, same as wallet_transactions: the API authenticates the member and reads
-- through the admin client, RLS on with no policy so a leaked anon key sees nothing.
alter table public.agent_credit enable row level security;

comment on table public.agent_credit is
  'Per-instance purchased-credit ledger. Agent37 has no credit bucket we can fill, so credit is delivered as a cap raise and depleted here. base_cap + (sum(delivered top-ups) - drawn_micros) = the instance cap. Server-only (RLS on, no policy).';
