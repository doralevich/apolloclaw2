-- Reshape agent_channels for the OpenClaw design.
--
-- The first cut routed Telegram through a Hermes webhook subscription on the instance, because
-- that is the only inbound path Agent37 documents. It targets the wrong runtime: the Apollo
-- Agent provisions agent37-openclaw (config/agent-types.ts), which has no Hermes, nothing
-- listening on Hermes's 8644, and no dashboard on 9119 to create a subscription in.
--
-- Telegram now delivers to THIS APP instead — /api/channels/telegram/{agentId} — which runs a
-- turn on the instance and sends the reply back. Both ends are ours, so there is no public
-- port, no manual subscription step for the customer, and no unproven handshake between two
-- authentication schemes.
--
-- The table was empty (no channel had ever been connected), so the dead columns are dropped
-- rather than left to confuse.

alter table public.agent_channels drop column if exists subscription;
alter table public.agent_channels drop column if exists webhook_url;

-- Telegram echoes this on every delivery as X-Telegram-Bot-Api-Secret-Token. It is what makes
-- our public webhook URL safe: anyone can POST to the URL, only Telegram knows the secret.
alter table public.agent_channels add column if not exists secret text;

-- The agent session this channel talks in, so a Telegram thread is one continuing conversation
-- rather than a new one per message.
alter table public.agent_channels add column if not exists session_id text;

-- Bound on the first message received. Every later message from a different Telegram user is
-- ignored, which is the whole "your own account, nobody else" promise on the card.
alter table public.agent_channels add column if not exists owner_chat_id text;
