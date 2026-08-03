-- Shared rate limiting for public, unauthenticated POST endpoints.
--
-- Per the security playbook (docs/SECURITY_HARDENING_PLAYBOOK.md, Item 7). The counters live in
-- Postgres rather than process memory because every route here runs on serverless instances: an
-- in-memory Map (which is what /api/chat and /api/submit-contact used) resets on cold start and is
-- not shared between concurrent instances, so the effective limit is "N per instance", which under
-- real traffic is no limit at all.
--
-- Fixed window rather than sliding: a sliding window needs per-hit rows, and this table would then
-- grow with traffic. A fixed window costs one row per (bucket, window) and the worst case is a
-- caller getting 2x the limit across a window boundary, which is an acceptable trade for a signup
-- form.

create table if not exists public.rate_limits (
  bucket       text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (bucket, window_start)
);

-- Server-only: RLS on with NO policy at all. anon and authenticated therefore get nothing, while
-- the service role bypasses RLS entirely. This is the playbook's "provably server-only" state, and
-- it is deliberately not a policy of the form `for all to public using (true)` — that phrasing
-- includes anon, which is the exact bug the playbook documents finding live on The College Agent.
alter table public.rate_limits enable row level security;

-- Atomic increment-and-test. SECURITY DEFINER so it can write to a table with no policies, with
-- search_path pinned so a caller cannot shadow `public` with their own schema.
create or replace function public.rate_limit_hit(
  p_bucket         text,
  p_max            integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  -- Floor "now" to the start of the current window, so every caller in the same window agrees on
  -- the same key without needing a lock.
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (bucket, window_start, count)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into v_count;

  -- true = allowed. The insert itself is the increment, so this is a single atomic round trip.
  return v_count <= p_max;
end;
$$;

-- Only the service role may call this. Without the revoke, SECURITY DEFINER plus the default
-- execute grant to public would let any anon-key holder inflate another visitor's counter.
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- Housekeeping: old windows are dead weight. Callers never read them, so this can run whenever.
create index if not exists rate_limits_window_start_idx on public.rate_limits (window_start);

comment on table public.rate_limits is
  'Fixed-window counters for public endpoint rate limiting. Server-only (RLS on, no policy). Rows older than a day are safe to delete.';
