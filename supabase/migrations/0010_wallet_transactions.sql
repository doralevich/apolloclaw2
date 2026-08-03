-- API credit purchases (Buy Credits on the dashboard's Credits tab).
--
-- Credit lives on the Agent37 instance, not here: the runtime meters LLM/search/tool spend
-- against a per-instance balance, and this table is the record of what we sold and whether
-- it was delivered. Two separate facts, deliberately kept apart — Stripe can confirm a
-- payment while the runtime call to apply it fails, and when that happens we must still know
-- the customer paid.
--
-- So a purchase is written PENDING the moment the webhook confirms payment, and only flipped
-- to DELIVERED once the runtime has actually taken the credit. Anything left pending is money
-- we owe, and can be retried without re-charging.

create table if not exists public.wallet_transactions (
  id             bigint generated always as identity primary key,
  workspace_id   uuid not null references public.workspaces (id) on delete cascade,
  agent37_id     text not null,
  -- 'topup'   -> a purchased credit pack
  -- 'starter' -> reserved for a future included/promotional grant (see the UX brief §8)
  kind           text not null default 'topup' check (kind in ('topup', 'starter')),
  -- Micros, matching the runtime's own unit (1 USD = 1_000_000 micros). Integer, because
  -- money in floating point is how ledgers go wrong.
  amount_micros  bigint not null check (amount_micros > 0),
  amount_cents   integer not null check (amount_cents >= 0),
  catalog_key    text,
  -- Stripe's checkout session id. Unique so a webhook retry (or a double-delivered event)
  -- records the purchase exactly once.
  stripe_session_id text unique,
  status         text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  delivered_at   timestamptz,
  last_error     text,
  purchased_by   uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Retry sweeps look for undelivered rows; the dashboard reads a workspace's history.
create index if not exists wallet_transactions_pending_idx
  on public.wallet_transactions (status)
  where status <> 'delivered';

create index if not exists wallet_transactions_workspace_idx
  on public.wallet_transactions (workspace_id, created_at desc);

-- Service-role only: no policies, no grants. The API routes authenticate the member first
-- and read through the admin client, same as agent_setup. RLS on so anon/authenticated see
-- nothing — a ledger is not something to expose to a client that could filter it itself.
alter table public.wallet_transactions enable row level security;

comment on table public.wallet_transactions is
  'Purchased API credit packs. Written pending on paid webhook, flipped to delivered once the runtime accepts the top-up. Server-only (RLS on, no policy).';
