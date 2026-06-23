-- Auto-entitle self-service sign-ups.
--
-- The app now lets anyone self-register (email + password) instead of an
-- invite-only / pre-seeded allowlist. Email confirmation is currently OFF, so a new
-- user is created already-confirmed and should get an active entitlement immediately
-- (landing in the dashboard, not on PendingApproval). The trigger keys off
-- email_confirmed_at, so it stays correct if "Confirm email" is ever re-enabled.
--
-- Entitlements stay the single seam Stripe later plugs into: this just changes the
-- *default* for a fresh, confirmed user from "no row" to an 'active' row with
-- source='signup'. The Stripe webhook (service role) can still flip status to
-- 'past_due'/'canceled' later, and an admin can still pre-seed rows by email.
--
-- A trigger on auth.users (not app code) so it fires for every user-creation path
-- and is atomic with the change. RLS has no insert policy on entitlements, so this
-- runs SECURITY DEFINER (as the function owner) to bypass it, exactly like the
-- existing handle_new_workspace() trigger.

create or replace function public.handle_new_user_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Email-less user-creation paths (phone-only, some OAuth/SSO providers) have no
  -- email to key an entitlement on. Skip them rather than abort the user insert on
  -- the NOT NULL primary key.
  if new.email is null then
    return new;
  end if;

  insert into public.entitlements (email, status, source, user_id)
  values (lower(new.email), 'active', 'signup', new.id)
  -- Pre-seeded rows win: never downgrade/relabel an existing entitlement (it may be
  -- an admin allowlist entry or a Stripe-managed row). Only backfill the user_id link
  -- when it isn't set yet, so the row points at the auth user once they exist.
  on conflict (email) do update
    set user_id = excluded.user_id,
        updated_at = now()
    where public.entitlements.user_id is null;
  return new;
end;
$$;

-- Fire only once the email is VERIFIED, never on an unconfirmed insert. This blocks
-- "entitlement squatting": signing up someone else's email creates an UNCONFIRMED
-- auth.users row, and that must not pre-create or mislink their entitlement.
--   * INSERT path: users created already-confirmed — Supabase "Confirm email" OFF
--     (instant), or an admin/dashboard-created confirmed user.
--   * UPDATE path: the normal "Confirm email" ON flow, where confirming transitions
--     email_confirmed_at from NULL to a timestamp after the fact.
drop trigger if exists on_auth_user_created_entitlement on auth.users;
drop trigger if exists on_auth_user_confirmed_entitlement on auth.users;

create trigger on_auth_user_created_entitlement
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.handle_new_user_entitlement();

create trigger on_auth_user_confirmed_entitlement
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_new_user_entitlement();
