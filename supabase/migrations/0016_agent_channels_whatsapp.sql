-- WhatsApp Cloud API needs two values Telegram and Slack don't.
--
-- external_id: the provider-side identifier a reply has to be addressed through. For WhatsApp
-- that's the Phone Number ID — the send endpoint is literally /{phone_number_id}/messages, so
-- without it there is nowhere to post the answer. Named generically because it is the same idea
-- wherever a provider gives the customer an id alongside a credential.
--
-- verify_token: the value Meta echoes back when the customer saves the callback URL, to prove the
-- endpoint is ours. Telegram's secret_token authenticates every delivery; this authenticates the
-- one-time handshake and is never seen again. Different job, different column — overloading
-- `secret` would mean the app secret and the verify token fighting over one slot.

alter table public.agent_channels add column if not exists external_id text;
alter table public.agent_channels add column if not exists verify_token text;
