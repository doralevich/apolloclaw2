-- A realtor's book of business, in a place the agent can read.
--
-- WHY THIS EXISTS, and it is not "somewhere to keep a spreadsheet". The scheduled reports we ship
-- for real estate open with "for each of my active listings" and "every deal I have under
-- contract", and the agent has no idea what either of those is. Today it has to ask, every
-- morning, which turns a report that should arrive finished into a conversation. This is the
-- ground truth those reports read.
--
-- Which is also the test for every column here: does a scheduled report or a skill need it? An
-- address, a status and a price answer "what am I working on". Dates answer "what is due". A
-- client name answers "who do I chase". Anything beyond that belongs in the CRM they already pay
-- for, and this is deliberately not one - there is no pipeline, no activity log and no contact
-- record, because a worse CRM alongside their real one is worth less than nothing.
--
-- ONE TABLE FOR BOTH SIDES. A buyer representation is a deal with no listing, and a listing that
-- goes under contract is the same row it was last week with a different status. Splitting them
-- would mean a deal changing tables mid-transaction, and every report having to read both.

create table if not exists public.agent_listings (
  id            bigint generated always as identity primary key,
  agent37_id    text not null references public.agents (agent37_id) on delete cascade,

  -- The one required field. Everything else can be filled in later or never, because a half
  -- entered listing the agent knows about beats a complete one nobody bothered to type.
  address       text not null check (length(btrim(address)) > 0),

  -- Which side of the table they are on. Decides what a report says about the row: a listing
  -- gets days on market and price conversations, a buyer deal gets deadlines and nothing else.
  side          text not null default 'listing' check (side in ('listing', 'buyer')),

  -- The lifecycle, and the reason one table covers listings and deals. 'active' and 'coming_soon'
  -- are the listing half; 'under_contract' is where both sides meet; 'closed' and 'withdrawn' are
  -- history the agent should stop chasing but not forget.
  status        text not null default 'active'
                check (status in ('coming_soon', 'active', 'under_contract', 'closed', 'withdrawn')),

  -- Cents, not dollars, and not a float. A list price is money, and money in a float is how you
  -- get $915,624.99 in a report.
  price_cents   bigint check (price_cents is null or price_cents >= 0),

  beds          numeric(4, 1) check (beds is null or beds >= 0),
  baths         numeric(4, 1) check (baths is null or baths >= 0),
  mls_number    text,

  -- The three dates a report actually asks about. list_date drives days on market; the other two
  -- drive every deadline between offer and close.
  list_date     date,
  contract_date date,
  close_date    date,

  -- Who it is for. A first name is enough and is usually all they will type.
  client_name   text,

  -- Anything the agent should know that has no column: the repair negotiation, the picky HOA, the
  -- lender who is slow. Read verbatim into the file the agent sees.
  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- NO UNIQUE CONSTRAINT ON ADDRESS, deliberately. The same house genuinely does come back: a
-- listing that expires and relists in the spring is a new deal with new dates, and an agent who
-- sold it in 2023 and is selling it again now wants both rows. Duplicates here are the customer's
-- to resolve, not the database's to prevent.

-- The list every page and every report loads: one agent's book, live rows first.
create index if not exists agent_listings_agent_status_idx
  on public.agent_listings (agent37_id, status, updated_at desc);

alter table public.agent_listings enable row level security;

-- Read and write go through the API, which checks workspace membership on the agent first. No
-- policy here means no direct client access, the same posture as agent_schedules and agent_tasks.
