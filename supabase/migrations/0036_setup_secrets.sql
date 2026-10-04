-- The credentials a client gives in the /setup form, kept encrypted where only Super Admin can
-- read them, so they no longer have to travel by email.
--
-- /setup (app/api/submit-setup) collects an Anthropic key, a Telegram bot token and a few other
-- service keys for a Mac Mini install. They used to reach David only as plain text in an email,
-- and were saved anywhere else only when the client happened to have a dashboard account already
-- (agent_setup). This table takes every submission, account or not.
--
-- Each secret is encrypted field by field with BYO_ENC_KEY (lib/crypto/byo.ts) before it is
-- written, so the database never holds one in the clear. They are read back only through the
-- Super Admin "Setup keys" page, one submission at a time, and every reveal is written to the
-- audit log.

create table if not exists public.setup_secrets (
  id            bigint generated always as identity primary key,
  email         text not null,
  client_name   text,
  -- What the setup was for, so the right submission is easy to find. Nothing secret here.
  context       jsonb not null default '{}'::jsonb,
  -- Field name to "v1:..." ciphertext. Never plaintext: the app refuses to write here without
  -- an encryption key, and emails the old way instead.
  secrets       jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz not null default now()
);

create index if not exists setup_secrets_email_idx on public.setup_secrets (lower(email), submitted_at desc);

alter table public.setup_secrets enable row level security;
-- No policies: server only, read through the platform-admin routes.

comment on table public.setup_secrets is 'Credentials from the /setup form, encrypted per field with BYO_ENC_KEY. Read only via Super Admin, every reveal audit-logged. Server-only (RLS on, no policy).';
