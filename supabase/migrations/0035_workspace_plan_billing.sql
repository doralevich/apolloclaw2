-- What a plan customer pays for, beside the plan itself (0033).
--
-- Checkout (app/api/onboard/checkout) sells Solo, Team and Executive as a Stripe subscription,
-- and extra agents as a quantity on that same subscription. The webhook records the plan here and
-- keeps it in step when the subscription changes (a plan switch in the billing portal, an agent
-- added or removed), so the app never has to ask Stripe how many agents someone may run.
--
--   addon_agents            extra agents bought past the plan's included ones
--   stripe_subscription_id  the subscription that pays for the plan; how the webhook finds the row
--   stripe_customer_id      the customer it bills, for the billing portal and add-on charges
--
-- Legacy customers have no row here, or a row without a subscription: their price is the one
-- they already pay, and none of these columns apply to them.

alter table public.workspace_agent_plans
  add column if not exists addon_agents integer not null default 0 check (addon_agents between 0 and 100),
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text;

create unique index if not exists workspace_agent_plans_subscription_idx
  on public.workspace_agent_plans (stripe_subscription_id)
  where stripe_subscription_id is not null;
