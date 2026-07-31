-- Agent personalization: a chosen display name and an avatar, set during the post-payment
-- onboarding questionnaire (components/onboard/OnboardingForm.tsx) instead of the old
-- pre-checkout "Name (optional)" field. avatar_url holds either a Supabase Storage public
-- URL (uploaded image) or a small inline `data:image/svg+xml` URI (preset avatar) — both
-- render identically in an <img src>, so no separate "kind" column is needed.
--
-- agent_setup.agent_name / avatar_url are staging columns: the questionnaire can finish
-- before the Stripe webhook provisions the agent, so provisionTypedAgent (lib/provision.ts)
-- reads them here and applies them to the new agents row at creation time. If the agent
-- already exists when the questionnaire is submitted, /api/agent-setup writes straight to
-- agents.name / agents.avatar_url instead and these staging columns are just a record.

alter table public.agents add column if not exists avatar_url text;

alter table public.agent_setup add column if not exists agent_name text;
alter table public.agent_setup add column if not exists avatar_url text;
