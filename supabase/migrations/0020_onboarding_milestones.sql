-- Things a customer has done, where the doing happens somewhere this database cannot see.
--
-- The onboarding series decides what to say by asking what the customer has already done.
-- Most of that is answerable locally: auth.users knows about sign-ins, agents knows about
-- provisioning, agent_setup knows about the dashboard questionnaire.
--
-- The licence questionnaire is the exception, and it is the important one. A cloud (VPS)
-- buyer comes through /api/onboard/checkout, which creates an account and an entitlement and
-- deliberately does NOT provision an agent. Their questionnaire is the lead-mode form at
-- /onboard, and it posts to /api/intake, which writes to the separate CRM project. Nothing
-- about finishing it leaves a mark here.
--
-- Without this table the series reads "no agent_setup row" and concludes the questionnaire is
-- outstanding, forever, for precisely the cohort the series exists to serve. It would email
-- somebody two days after they filled in a twenty-minute form to ask them to fill in the form.
-- That is worse than sending nothing.
--
-- Keyed by email to match entitlements and onboarding_emails, and because /api/intake handles
-- anonymous submissions where the address is the only identifier that exists.

create table if not exists public.onboarding_milestones (
  email      text        not null,
  milestone  text        not null,
  reached_at timestamptz not null default now(),
  primary key (email, milestone)
);

comment on table public.onboarding_milestones is
  'Customer progress that happens outside this database, recorded so the onboarding series can see it. Currently just the paid licence questionnaire, which submits to the CRM project via /api/intake. Server-only (RLS on, no policy).';

comment on column public.onboarding_milestones.milestone is
  'Milestone id. questionnaire = completed the paid onboarding questionnaire, whichever form it came through.';

alter table public.onboarding_milestones enable row level security;

create index if not exists onboarding_milestones_email_idx
  on public.onboarding_milestones (email);
