-- Cap how large a channel session can grow, even during continuous use.
--
-- 0014/0015 gave each channel a persistent session so a chat thread carries across messages;
-- lib/channels/turn.ts then added a reset once the thread had gone cold. But the cold-reset
-- fires on a GAP between messages, so a long, unbroken conversation never reset and its history
-- kept growing — every reply re-reads the whole pile first, which is the slow, expensive shape
-- Grace's bill showed (13M read to 50K written).
--
-- This adds the missing piece: when the current session was opened. lib/channels/turn.ts uses it
-- to reset a thread once it has simply been alive too long (a hard age cap), independent of how
-- recently the last message arrived — so the re-read per turn is bounded no matter how heavily
-- the bot is used in one sitting. Nothing durable is lost on a reset: the instance's own memory
-- (MEMORY.md) carries the facts; only the expendable scrollback is shed.
--
-- Additive and nullable. A row from before this column existed has no start time; turn.ts treats
-- that as "age unknown, reset once" so the session gets a tracked start from then on.

alter table public.agent_channels
  add column if not exists session_started_at timestamptz;

comment on column public.agent_channels.session_started_at is
  'When the current channel session was opened. Used by lib/channels/turn.ts to reset a thread '
  'once it has been alive longer than the max-age cap, bounding the per-turn history re-read.';
