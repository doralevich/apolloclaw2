-- One-shot record that a paid checkout session has been spent setting the buyer's first password.
--
-- WHY THIS EXISTS. lib/license-session.ts is explicit that a Stripe checkout id is deliberately
-- weaker than a login: holding one lets you submit onboarding for that single purchase and read
-- that purchase's build status, and nothing else. Setting a password crosses that line, because
-- a password IS the account. The id also travels in the URL (Stripe's success redirect carries
-- ?session_id=), so it survives in browser history and in the referrer of anything the page
-- loads.
--
-- This table is what keeps the crossing bounded. The primary key makes the claim atomic: the
-- route inserts here BEFORE it touches the password, so a replay or a race loses on the unique
-- violation rather than after the credential has already changed. The grant is therefore worth
-- exactly one use, to whoever redeems it first — and the route additionally refuses any account
-- that has ever been signed into, so a leaked id can never overwrite a password its owner is
-- already using. After either check trips, the id is inert.

create table if not exists public.license_password_claims (
  -- The Stripe checkout session id. Text rather than uuid: it is minted upstream and its
  -- format is not ours to assume.
  stripe_session_id text primary key,

  -- Whose password was set. Kept for tracing a disputed account back to the purchase that
  -- opened it; the cascade means it disappears with the user rather than dangling.
  user_id           uuid not null references auth.users (id) on delete cascade,

  claimed_at        timestamptz not null default now()
);

-- Service-role only, like every other table here. RLS with no policies means a leaked anon key
-- reaches nothing, and nothing outside the set-password route has any business reading it.
alter table public.license_password_claims enable row level security;
