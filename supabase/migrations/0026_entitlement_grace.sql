-- Grace period before an account goes dark.
--
-- Policy (David): a customer starts "live" (the signup trigger already defaults status to
-- 'active') and, when their hosting subscription lapses, keeps dashboard access for a fixed
-- window before we actually shut the door. Before this, a Stripe cancellation flipped the
-- entitlement straight to 'canceled' and the gate locked them out the same minute — which is
-- how Russell (info@shastone.com) lost access while his instance kept running.
--
-- The grace window is expressed as a single nullable timestamp: `grace_until`. It is additive
-- and non-breaking — old code that never selects it is unaffected. Access is granted while
-- `grace_until` is in the FUTURE, regardless of the (lapsed) status stored next to it, so no
-- new status value is needed and the existing check constraint is left untouched:
--
--   in-grace  = status <> 'active'  AND grace_until > now()
--   locked    = status <> 'active'  AND (grace_until IS NULL OR grace_until <= now())
--   live      = status  = 'active'  (grace_until is cleared to NULL on re-activation)
--
-- The Stripe webhook sets grace_until = now() + 10 days on subscription.deleted; the hourly
-- credit-watch cron flips any past-grace row to 'inactive' and clears the timestamp so the
-- admin Accounts view reads honestly. See lib/entitlement.ts for the shared rules.

alter table public.entitlements
  add column if not exists grace_until timestamptz;

comment on column public.entitlements.grace_until is
  'When set and in the future, the account keeps dashboard access despite a lapsed status '
  '(the 10-day grace window after a cancellation). NULL for live accounts and after grace ends.';
