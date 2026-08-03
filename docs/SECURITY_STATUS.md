# Security hardening: current state

Companion to `SECURITY_HARDENING_PLAYBOOK.md`. That file is the target; this one records where
this repo actually stands against it, so the overnight pass starts from facts rather than
assumptions.

**Audited against `main` at commit 8c4fe00 on 2026-08-03.** Re-verify before acting: the playbook's
own golden rule #2 is to check reality rather than the repo, and this file is the repo.

## Playbook items

| # | Item | State |
|---|---|---|
| 1 | Platform API-key exposure audit | **Not audited.** No grep of the built bundle or git history has been run. |
| 2 | Encrypt BYO secrets at rest | **Not built.** No `BYO_ENC_KEY`, no AES-GCM envelope. |
| 3 | RLS audit across every table | **Not audited here.** Live tables were listed during onboarding work and all reported RLS-enabled, but no per-table policy verdict has been produced, and `TO public USING(true)` has not been checked for. This is the playbook's highest-value item. |
| 4 | Admin route + API auth | **Partial.** `config/admins.ts` exists. Whether every `/api/admin/*` route calls a `requirePlatformAdmin()` equivalent is unverified. |
| 5 | `CRON_SECRET` on cron routes | **Not checked.** No cron routes identified yet. |
| 6 | Stripe webhook signature + idempotency | **Half done.** `app/api/stripe/webhook/route.ts` verifies the signature via `constructEventAsync`. There is **no** `stripe_events` table, so idempotency rests on the one-agent-per-type-per-workspace cap turning a duplicate into a 409. That covers provisioning but not the entitlement upsert. |
| 7 | Rate limiting on public POST endpoints | **Largely absent.** Of 23 POST routes, 21 have none. `chat` and `submit-contact` each have an in-memory `Map` counter, which resets per serverless instance and does not hold across them. No `rate_limits` table, no `rate_limit_hit` function. |
| 8 | Security headers + CSP | **Not built.** `next.config.ts` sets no headers at all. No CSP, not even report-only. |
| 9 | GitHub repo security | **Unknown.** Dependabot / secret scanning / push protection are repo-admin toggles and have not been checked. Note `main` currently takes direct merges from this workflow, so branch protection is a real decision, not a default. |
| 10 | Data deletion capability + runbook | **Not built.** Deletion is on request, done by hand. No `purgeUserAccount()`, no runbook. |
| §4 | Admin MFA step-up (AAL2) | **Not built.** |
| §5 | Audit logging | **Not built.** No `audit_log` table or helper. |
| §6 | Consent / cookie banner | **Done.** `components/CookieConsent.tsx` gates Google Analytics through Consent Mode v2: `analytics_storage` defaults to `denied`, so no analytics cookie or identifier is written until the visitor accepts. Verified in a browser. |
| §7 | Supabase PITR | **Unknown.** Dashboard toggle, not checked. |
| §9 | Compliance document set | **Not started.** `/privacy` and `/cookies` exist and are live, but they are drafted from the codebase, not by counsel, and have not been reviewed by an attorney. |

## Suggested order

Different from the playbook's own activation checklist, because the exposure here is different:
this app has a public marketing surface with unprotected forms, and no enterprise buyer waiting on
a questionnaire.

1. **Item 7, rate limiting.** The only gap on this list that can be actively abused tonight rather
   than merely being absent. `subscribe`, `submit-contact`, `submit-precall`, and `intake` all
   spend money or write data on an unauthenticated POST.
2. **Item 8, security headers, then CSP report-only.** Cheap, and nothing breaks.
3. **Item 3, the live RLS audit.** Highest value of the remaining items, and the one most likely to
   surface something real. The playbook found a live cross-tenant read on The College Agent this
   way.
4. **Item 6's `stripe_events` table**, closing the idempotency gap on the entitlement upsert.
5. Everything else, by whatever a buyer asks for first.

## Open question

The playbook targets "a new app". This repo is both the marketing site and the dashboard/agent
backend. Whether the pass covers the backend surfaces (`/dashboard`, `/api/agents/*`, provisioning)
in the same sweep or as a second pass has not been settled.
