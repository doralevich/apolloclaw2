-- Setup checklist: what the customer has told us they have done.
--
-- WHY A TABLE AND NOT DERIVED STATE. Most of the checklist ticks itself — a Composio connection,
-- a configured channel, an existing chat thread are all observable, and anything observable
-- should never be self-reported. What is left is the work that happens INSIDE a conversation:
-- telling the agent your pricing, handing over invoicing, uploading a contract. Nothing in any
-- database sees those. The only honest options are to leave them off the list or to let somebody
-- say they are done, and leaving them off means the checklist omits the substance of the product.
--
-- ROW EXISTS = DONE. Unticking deletes. There is deliberately no `done boolean` column: a
-- boolean plus a timestamp is two facts that can disagree, and the first bug is always a row
-- with done=false and a done_at from March.
--
-- KEYED BY AGENT, like agent_schedules and agent_channels. A workspace is a business, its
-- members share one agent, and "has the invoicing been handed over" is a fact about the
-- business rather than about whoever happens to be logged in. Two people would otherwise tick
-- the same box twice and see different totals.
--
-- ITEM IDS ARE NOT CONSTRAINED HERE. The catalogue lives in config/checklist.ts, generated per
-- customer from their questionnaire answers, so a check constraint would need a migration every
-- time the copy changed — and rows for a retired item are simply never read again.

create table if not exists public.agent_checklist_items (
  agent37_id text        not null references public.agents (agent37_id) on delete cascade,
  item       text        not null,
  done_at    timestamptz not null default now(),
  done_by    uuid        references auth.users (id) on delete set null,
  primary key (agent37_id, item)
);

comment on table public.agent_checklist_items is
  'Self-reported setup steps, one row per completed item. Everything observable (app connections, channels, chat threads) is derived at read time and never stored here. Service-role only (RLS on, no policy) — /api/agents/[id]/checklist authenticates the member first.';

comment on column public.agent_checklist_items.item is
  'Item id from config/checklist.ts. Unconstrained on purpose: the catalogue is generated per customer from their intake answers, and rows for retired items are simply never read.';

-- Service-role only: no policies, no grants. RLS on so anon/authenticated see nothing, matching
-- agent_schedules and agent_setup.
alter table public.agent_checklist_items enable row level security;

create index if not exists agent_checklist_items_agent_idx
  on public.agent_checklist_items (agent37_id);
