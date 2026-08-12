-- Coupon redemptions on the dashboard add-agent path.
--
-- The public checkout lets Stripe apply the promotion code, so Stripe counts the use and
-- enforces max_redemptions for us. The dashboard add-agent charge does NOT: it bills through
-- invoice items and computes the coupon's discount itself (so a build failure can reverse the
-- fee to the penny), which means Stripe never sees a dashboard use and never increments the
-- code's times_redeemed. Without a record of our own, a capped code would be unlimited here.
--
-- This is that record. One row per dashboard redemption, written only after the agent is built
-- and billed. The seats route caps a code against Stripe's times_redeemed (the public-checkout
-- uses) PLUS the count of rows here (the dashboard uses), so a shared code is capped across both
-- surfaces and a dashboard-only code by this ledger alone.

create table if not exists public.coupon_redemptions (
  id                bigint generated always as identity primary key,
  -- The Stripe promotion code (promo_...) the customer typed. The cap lives on this object, so
  -- it is what we count against.
  promotion_code_id text not null,
  -- The customer-facing code, kept for readability when reconciling by eye.
  code              text not null,
  -- The coupon (coupon_...) the promotion code points at, for cross-referencing in Stripe.
  coupon_id         text,
  workspace_id      uuid not null references public.workspaces (id) on delete cascade,
  -- The agent whose one-time fee this redemption discounted. Text, matching agents.agent37_id.
  agent37_id        text,
  redeemed_by       uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

-- The cap check counts by promotion code.
create index if not exists coupon_redemptions_promo_idx
  on public.coupon_redemptions (promotion_code_id);

-- Service-role only: no policies, no grants, same as wallet_transactions. The seats route
-- authenticates the admin first and reads/writes through the admin client. A redemption ledger
-- is not something a client should be able to read or, worse, filter.
alter table public.coupon_redemptions enable row level security;

comment on table public.coupon_redemptions is
  'Dashboard add-agent coupon uses. Stripe does not count these (we apply the discount ourselves), so the seats route caps a code against Stripe times_redeemed plus rows here. Server-only (RLS on, no policy).';
