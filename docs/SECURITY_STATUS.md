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
| 4 | Admin route + API auth | **Done, VERIFIED Oct 5, 2026.** All 27 `/api/admin/*` route files call `requirePlatformAdmin()` (`lib/admin.ts`, email allowlist in `config/admins.ts`) as the first line of every exported handler. Four files export one guarded handler as both GET and POST, which is why a naive count of guard calls per handler looks short there. |
| 5 | `CRON_SECRET` on cron routes | **Done, VERIFIED Oct 5, 2026.** Three cron routes (`credit-watch`, `purge-agents`, `scheduled-skills`) each require `Authorization: Bearer $CRON_SECRET` and refuse to run at all when the variable is unset. |
| 6 | Stripe webhook signature + idempotency | **Done** *(#54)*. Signature was already verified. The handler now claims the event id in a `stripe_events` table before any work and releases it if the handler throws. This closed a real bug: a Stripe retry previously re-sent the sale email and Telegram alert, because the per-type provisioning cap only made provisioning idempotent, not its side effects. |
| 7 | Rate limiting on public POST endpoints | **Done** *(#54)*. Seven public POST endpoints now share a Postgres fixed-window counter (`rate_limits` + `rate_limit_hit`, migration 0007). The two that previously had in-memory `Map` counters were effectively unlimited across instances and now use the shared limiter. **Fails open by design.** |
| 8 | Security headers + CSP | **Done, CSP ENFORCED Oct 5, 2026.** Promoted from report-only after a crawl of all 65 public routes against a production build showed zero violations. The audit added the Supabase storage origin (avatars) and cdn.simpleicons.org to `img-src`, analytics.google.com to `connect-src`, and restored `upgrade-insecure-requests`. The two self-contained demo pages (`public/demo.html`, `public/day-with-john.html`) get the same policy plus `blob:` for scripts, fonts and connections, by a second header rule scoped to those paths. Dashboard and admin pages were checked by code audit, not by a signed-in crawl. |
| 9 | GitHub repo security | **Partial, Oct 5, 2026.** `.github/dependabot.yml` added (weekly grouped npm version-update PRs). The API confirms Dependabot ALERTS are disabled; alerts, secret scanning and push protection are owner-only toggles under Settings > Code security and analysis and still need flipping by David. Branch protection on `main` is unchanged. |
| 10 | Data deletion capability + runbook | **Not built.** Deletion is on request, done by hand. No `purgeUserAccount()`, no runbook. Deliberately deferred alongside §4: the endpoint is destructive by design. |
| §4 | Admin MFA step-up (AAL2) | **Not built.** Deliberately deferred: enrollment going wrong locks the only admin out of `/admin`, so this wants doing deliberately rather than as part of a batch. |
| §5 | Audit logging | **In use.** `audit_log` plus `lib/audit.ts`, and `logAudit` is now called from 15 of the 27 admin routes (every mutating one, plus opening a customer instance). |
| §6 | Consent / cookie banner | **Done.** `components/CookieConsent.tsx` gates Google Analytics through Consent Mode v2: `analytics_storage` defaults to `denied`, so no analytics cookie or identifier is written until the visitor accepts. Verified in a browser. |
| §7 | Supabase PITR | **Unknown.** Dashboard toggle, not checked. |
| §9 | Compliance document set | **Not started.** `/privacy` and `/cookies` exist and are live, but they are drafted from the codebase, not by counsel, and have not been reviewed by an attorney. |

## What is left

Re-ordered Oct 5, 2026 after items 4, 5 and 8 were closed and item 9 half-closed (see the table).

1. **Set `BYO_ENC_KEY` in Vercel** (`openssl rand -base64 48`). The encryption code is shipped but
   inert without it. Until it is set, `submit-setup` cannot store a submission's credentials in the
   encrypted Setup keys store and falls back to carrying them in the notification email, which is
   the one remaining plaintext path. Config change, not code. **David.**
2. **Enable leaked-password protection** in Supabase Auth. Dashboard toggle. **David.**
3. **Turn on Dependabot alerts, secret scanning and push protection** under Settings > Code
   security and analysis. The version-update config is in the repo; these three are owner
   toggles the API will not flip from here. **David.**
4. **Admin MFA step-up** (§4) and the **data-deletion endpoint** (Item 10). Both deferred on
   purpose: lockout risk and destructive-by-design respectively.
5. **Supabase PITR** (§7). Dashboard toggle, not checked.
6. **Compliance document set** (§9), and an attorney review of `/privacy`, `/terms` and
   `/cookies`. The ten agent sites share the same privacy and terms text apart from the
   per-site advice section, so one read covers all of them.
7. **Tighten the CSP further**: `script-src` still carries `'unsafe-inline'` (the inline GA
   config and JSON-LD blocks) and `'unsafe-eval'` (the Next.js runtime). Moving the inline
   scripts to a nonce is the next step; the policy is enforced now, so this is hardening, not
   a gap.

## Known, flagged, not fixed

`submit-setup` stores the five customer credentials encrypted in the Setup keys store and sends
David an email that says which were given and links to `/admin/setup-keys`, where only a platform
admin can reveal them. CRM notes never carry a secret, only "provided". The remaining weak spot
is the fallback: when `BYO_ENC_KEY` is unset or the store write fails, the email carries the
credentials in plaintext so a key is never lost. Item 1 above closes it.

## Scope note

The playbook targets "a new app". This repo is both the marketing site and the dashboard/agent
backend. #54 covered the public marketing surface plus everything database-level, which applies to
both halves — RLS, the trigger-function lockdown, credential encryption, and webhook idempotency
are not marketing-specific.

What has NOT been swept is the authenticated surface's own routes: whether every `/api/admin/*`
and `/api/agents/*` handler gates correctly, and whether any of them need rate limiting of their
own. That is Item 4's remaining half and belongs with the dashboard work described in
`DASHBOARD_STATUS.md`.
