# Security hardening: current state

Companion to `SECURITY_HARDENING_PLAYBOOK.md`. That file is the target; this one records where
this repo actually stands against it, so the overnight pass starts from facts rather than
assumptions.

**Audited against `main` at commit 8c4fe00 on 2026-08-03**, then revised once PR #54 landed the
first hardening passes. Rows marked *(#54)* describe work that is in that pull request rather than
in `main` — check whether it has merged before relying on them.

Re-verify before acting either way: the playbook's own golden rule #2 is to check reality rather
than the repo, and this file is the repo.

## Playbook items

| # | Item | State |
|---|---|---|
| 1 | Platform API-key exposure audit | **Done, PASSED** *(#54)*. No secret name appears in the built client bundle, no server secret is referenced from a client component, and the only `NEXT_PUBLIC_` vars are the Supabase URL/anon key plus non-sensitive config. The one `sk-ant-` hit is three validation and placeholder strings in `app/setup/page.tsx`, which the playbook explicitly allows. |
| 2 | Encrypt BYO secrets at rest | **Built** *(#54)*. This turned out to apply, which the first draft of this file missed: `/setup` collects five credentials belonging to the CUSTOMER — Anthropic key, Telegram bot token, Fireflies key, Tavily key, Fathom password — and `submit-setup` wrote them into `agent_setup.answers` in plaintext. `lib/crypto/byo.ts` now envelopes them with AES-256-GCM before they reach Postgres. **Needs `BYO_ENC_KEY` set in Vercel to take effect**; until then it degrades to plaintext and logs a warning. `agent_setup` was empty when this landed, so no backfill was required. |
| 3 | RLS audit across every table | **Done, CLEAN** *(#54)*. All seven tables are RLS-enabled. **No instance of the `TO public USING(true)` pattern** the playbook documents finding live on The College Agent — every policy carries a real predicate (`is_workspace_member`, `is_workspace_admin`, `owner_id = auth.uid()`, or a JWT email match). `agent_setup`, `rate_limits`, `stripe_events`, and `audit_log` are RLS-on-no-policy, the intended server-only state. The advisor's SECURITY DEFINER warnings were each checked by reading the function bodies: reachable but not exploitable, since each self-checks membership or the caller's JWT. |
| 4 | Admin route + API auth | **Partial.** `config/admins.ts` exists. Whether every `/api/admin/*` route calls a `requirePlatformAdmin()` equivalent is unverified. |
| 5 | `CRON_SECRET` on cron routes | **Not checked.** No cron routes identified yet. |
| 6 | Stripe webhook signature + idempotency | **Done** *(#54)*. Signature was already verified. The handler now claims the event id in a `stripe_events` table before any work and releases it if the handler throws. This closed a real bug: a Stripe retry previously re-sent the sale email and Telegram alert, because the per-type provisioning cap only made provisioning idempotent, not its side effects. |
| 7 | Rate limiting on public POST endpoints | **Done** *(#54)*. Seven public POST endpoints now share a Postgres fixed-window counter (`rate_limits` + `rate_limit_hit`, migration 0007). The two that previously had in-memory `Map` counters were effectively unlimited across instances and now use the shared limiter. **Fails open by design.** |
| 8 | Security headers + CSP | **Done, CSP report-only** *(#54)*. HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` on every route. CSP ships report-only so a real deployment can be watched first. `upgrade-insecure-requests` is omitted deliberately (ignored in report-only, and it warns on every page load) and **must be added back on promotion**. |
| 9 | GitHub repo security | **Unknown.** Dependabot / secret scanning / push protection are repo-admin toggles and have not been checked. Note `main` currently takes direct merges from this workflow, so branch protection is a real decision, not a default. |
| 10 | Data deletion capability + runbook | **Not built.** Deletion is on request, done by hand. No `purgeUserAccount()`, no runbook. Deliberately deferred alongside §4: the endpoint is destructive by design. |
| §4 | Admin MFA step-up (AAL2) | **Not built.** Deliberately deferred: enrollment going wrong locks the only admin out of `/admin`, so this wants doing deliberately rather than as part of a batch. |
| §5 | Audit logging | **Table and helper built** *(#54)*. `audit_log` plus `lib/audit.ts`. Deliberately not yet called from anything — the table exists so admin surfaces can start writing without a second migration. `logAudit` never throws. |
| §6 | Consent / cookie banner | **Done.** `components/CookieConsent.tsx` gates Google Analytics through Consent Mode v2: `analytics_storage` defaults to `denied`, so no analytics cookie or identifier is written until the visitor accepts. Verified in a browser. |
| §7 | Supabase PITR | **Unknown.** Dashboard toggle, not checked. |
| §9 | Compliance document set | **Not started.** `/privacy` and `/cookies` exist and are live, but they are drafted from the codebase, not by counsel, and have not been reviewed by an attorney. |

## What is left

Ordered by what actually carries risk now that #54 has taken the abusable items.

1. **Set `BYO_ENC_KEY` in Vercel** (`openssl rand -base64 48`). The encryption code is shipped but
   inert without it. `agent_setup` is empty today, so setting it before the first real `/setup`
   submission means no customer credential is ever written in plaintext. This is the single
   highest-value action remaining and it is a config change, not code.
2. **Enable leaked-password protection** in Supabase Auth. Dashboard toggle.
3. **Promote the CSP** from report-only to enforced, once a real deployment has been clicked
   through with the console open. Two-line change: rename the header key and restore
   `upgrade-insecure-requests`.
4. **Admin MFA step-up** (§4) and the **data-deletion endpoint** (Item 10). Both deferred on
   purpose — lockout risk and destructive-by-design respectively.
5. **Items 4, 5, 9, §7** — verify every `/api/admin/*` route gates on an admin check, confirm
   there are no unauthenticated cron routes, flip on Dependabot / secret scanning / push
   protection, and enable PITR.
6. **Compliance document set** (§9), and an attorney review of `/privacy` and `/cookies`.

## Known, flagged, not fixed

`submit-setup` also emails the same five customer credentials in plaintext to
david@apolloclaw.ai and writes them into a CRM note. That is currently how those keys reach a
human to set up a client machine, so redacting it would break a real workflow. It does mean that
with the database copy now encrypted, **the inbox and the CRM are the weakest places those
credentials live**. Worth a deliberate decision about how they should be delivered.

## Scope note

The playbook targets "a new app". This repo is both the marketing site and the dashboard/agent
backend. #54 covered the public marketing surface plus everything database-level, which applies to
both halves — RLS, the trigger-function lockdown, credential encryption, and webhook idempotency
are not marketing-specific.

What has NOT been swept is the authenticated surface's own routes: whether every `/api/admin/*`
and `/api/agents/*` handler gates correctly, and whether any of them need rate limiting of their
own. That is Item 4's remaining half and belongs with the dashboard work described in
`DASHBOARD_STATUS.md`.
