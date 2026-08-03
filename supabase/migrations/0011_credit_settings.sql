-- Per-agent credit safety net: the low-balance warning and auto-recharge.
--
-- Both exist for one failure mode. Credit lives on the Agent37 instance and is spent by the
-- agent unattended; when it runs out the agent simply stops answering. Nobody is told. The
-- customer finds out by asking their agent something and getting nothing back — which reads
-- as "the product is broken", not "the balance is empty".
--
-- So: warn them before it happens, and (if they opt in) buy the next pack automatically.
--
-- One row per instance, not per workspace: the balance is the instance's, and a workspace
-- with two agents has two balances that run down at different rates.

create table if not exists public.credit_settings (
  agent37_id   text primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,

  -- ── Low-balance warning ────────────────────────────────────────────────────
  warn_enabled      boolean not null default true,
  -- Micros, matching the runtime (1 USD = 1_000_000). $5 by default: roughly a day or two
  -- of ordinary use, which is enough notice to act without being a nag.
  warn_below_micros bigint not null default 5000000 check (warn_below_micros > 0),
  -- When we last told them, and at what balance. Both are needed: the timestamp stops a
  -- daily email about a balance they've decided to live with, and the balance lets a FRESH
  -- drop (they topped up, then fell below again) warn immediately instead of waiting out
  -- the cooldown.
  last_warned_at             timestamptz,
  last_warned_balance_micros bigint,

  -- ── Auto-recharge ──────────────────────────────────────────────────────────
  -- Off by default, always. Charging a saved card without an explicit opt-in is not
  -- something to default anyone into.
  autorecharge_enabled      boolean not null default false,
  autorecharge_below_micros bigint not null default 5000000 check (autorecharge_below_micros > 0),
  -- Which pack to buy, as a catalog_key from lib/pricing/catalog.ts. Null until they pick one;
  -- auto-recharge won't fire without it.
  autorecharge_pack_key     text,
  -- The Stripe customer whose saved card gets charged. Captured at their last checkout,
  -- where the payment method was saved for off-session use.
  stripe_customer_id        text,
  last_recharge_at          timestamptz,

  -- ── Failure handling ───────────────────────────────────────────────────────
  -- A card that declines will decline again. Three strikes and auto-recharge switches itself
  -- off with the reason recorded, rather than retrying a dead card every hour forever and
  -- collecting a Stripe fraud signal on the way.
  failed_charges  integer not null default 0 check (failed_charges >= 0),
  disabled_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The hourly sweep asks one question: which agents are being watched at all? Everything
-- else it needs comes from the runtime, one instance at a time.
create index if not exists credit_settings_watched_idx
  on public.credit_settings (agent37_id)
  where warn_enabled or autorecharge_enabled;

create index if not exists credit_settings_workspace_idx
  on public.credit_settings (workspace_id);

-- Service-role only, same as wallet_transactions: RLS on with no policy, and the API routes
-- authenticate the workspace member first and read through the admin client. These rows
-- decide when to charge somebody's card, which is not a thing a browser gets to filter.
alter table public.credit_settings enable row level security;

comment on table public.credit_settings is
  'Per-instance low-balance warning and auto-recharge settings. Server-only (RLS on, no policy).';
