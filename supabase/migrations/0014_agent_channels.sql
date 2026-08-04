-- Chat channels: where an agent answers you, as opposed to what it can reach.
--
-- One row per (agent, channel). Telegram is the only one implemented; the table is shaped for
-- the rest because the columns they need are the same ones.
--
-- WHY A TABLE AT ALL. The first cut of Channels forwarded credentials straight through and
-- stored nothing, which is the safest thing you can do with a secret right up until you need it
-- again. Disconnecting a Telegram bot means calling deleteWebhook with that same token, and
-- asking a customer to re-paste a token in order to turn something off is the kind of design
-- that leaves webhooks pointed at us forever.
--
-- bot_token is encrypted at rest with AES-256-GCM (lib/crypto/byo.ts, the same path that already
-- protects the Telegram tokens collected at /setup). With BYO_ENC_KEY unset it degrades to
-- plaintext and logs — deliberate, so this ships before the env var and starts protecting the
-- moment it's set. Set BYO_ENC_KEY before anyone connects a real bot.
--
-- No RLS policies are added: every read and write goes through the service-role client behind
-- requireAgentAccess, matching how the rest of the agent-scoped tables are used. RLS is enabled
-- so a leaked anon key reaches nothing.

create table if not exists public.agent_channels (
  agent37_id    text not null references public.agents (agent37_id) on delete cascade,
  -- "telegram" | "slack" | "discord" | "whatsapp" — validated in config/channels.ts rather than
  -- as a check constraint, so adding one doesn't need a migration.
  channel       text not null,

  -- The customer's own credential. Encrypted; never returned to the browser.
  bot_token     text,

  -- What we show as "Connected as": @botname for Telegram.
  account       text,

  -- The Hermes webhook subscription this channel delivers to. Hermes creates subscriptions in
  -- its own dashboard (port 9119) with no API, so the customer names it and we store the name.
  subscription  text,

  -- The public-port URL we registered with the provider, kept so disconnect can tell what it is
  -- undoing even if the public port was deleted by other means.
  webhook_url   text,

  -- "connected" | "pending" | "error" | "disconnected"
  state         text not null default 'disconnected',
  -- Why it broke, when the provider said. Shown on the card.
  message       text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  primary key (agent37_id, channel)
);

alter table public.agent_channels enable row level security;
