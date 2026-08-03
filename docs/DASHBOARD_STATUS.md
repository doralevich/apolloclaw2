# Dashboard: current state vs. the architecture brief

Companion to `DASHBOARD_UX_ARCHITECTURE_BRIEF.md`. That file describes The College Agent's
dashboard. This one records what Apollo Claw already has, so "duplicate the back end" starts from
what is actually here rather than from zero.

**Audited against `main` at commit 8c4fe00 on 2026-08-03.**

## Read this first: the two products have different shapes

The brief assumes **one user, one agent**. Its whole funnel — the four booleans, the single
`onboard_submissions` row per user, `hasAgent` as a yes/no — only makes sense when a person owns
exactly one agent.

Apollo Claw is **one workspace, many agents**. `config/agent-types.ts` defines nine types, and
`lib/provision.ts:171-185` caps it at one agent *per type* per workspace, so a customer can own a
CEO agent and a CFO agent at the same time. Intake is stored per agent in `agent_setup`, keyed
`(workspace_id, agent_type)`, not per user.

That is a product difference, not a gap. Porting the funnel verbatim would mean deciding a
workspace with a CEO agent is "done" and never showing intake for the CFO agent they buy next.
**Anything below that touches the funnel needs that decision made first.**

## What already exists

| Brief section | State here |
|---|---|
| §6 Chat | **Built.** Full component set under `components/chat/`: `ChatProvider`, `useChat`, `ChatSidebar`, `ChatComposer`, `ModelMenu`, `EffortMenu`, attachments, markdown. Thread id rides the URL via `/dashboard/chat/[[...session]]`. Sessions live in the agent runtime (`/api/agents/[id]/chat/sessions`), not our Postgres. |
| §7 Settings hub | **Partial.** `SettingsView`, `WorkspaceSwitcher`, `/dashboard/members`. No "delete agent → re-onboard" reset path. |
| §8 Credits | **Partial.** `CreditsView` exists and reads `/api/agents/[id]/budget` and `/usage` from the runtime. No `wallet_transactions` ledger, no starter grant, no top-ups, no referrals. |
| §9 Integrations | **Built.** `IntegrationsView`, per-agent, gated. |
| §11 Provisioning | **Built and idempotent.** `provisionTypedAgent` caps one agent per type per workspace and 409s a duplicate, which is what makes the Stripe webhook safe to retry. |
| §5 Intake → agent brain | **Partial.** `buildUserMd` + `injectAgentFile` write a `USER.md` into the live agent. One file, not the brief's three (`SOUL.md`, `memories/USER.md`, `context/STUDENT_PROFILE.md`). No résumé/document text extraction. No unit tests on the builders. |
| §4 Intake wizard | **Different shape.** `components/onboard/OnboardingForm.tsx` is a real multi-step questionnaire with two modes (lead and customer). It is not the brief's `STEPS[]`-driven conversational wizard, has no `showIf` conditional branching, no "go deeper" opt-in, and no localStorage resume. |

## What does not exist

| Brief section | Gap |
|---|---|
| §1 The funnel model | **Absent.** `app/dashboard/page.tsx` renders `<AgentsView />` with no state resolution. The only gate is the entitlement check in `app/dashboard/layout.tsx`. None of `paid` / `onboardDone` / `setupDone` / `hasAgent` is computed. |
| §2 Route grammar | No `(authed)` route group and no `[[...tab]]` catch-all. Tabs are separate route files, so there is no shared grammar for server guard and client to agree on. The auth gate does live in a layout, which is the part that matters. |
| §3 Parallel state read | Absent, since there is no funnel. |
| §10 Post-checkout auto-signin | Absent, and **probably not needed**: our checkout requires an authenticated user up front (`app/api/build/checkout/route.ts` passes `customer_email: user.email`), so the buyer is already signed in when Stripe returns them. The brief's flow solves a problem we do not have. |
| §12 Data model | Missing tables: `onboard_submissions`, `setup_submissions`, `orders`, `wallet_transactions`, `chat_sessions`, `checklist_items`, `referral_codes`, `referrals`, `leads`, `stripe_events`, `audit_log`, `rate_limits`. Some of these we may never want — chat sessions and credits are the runtime's job here, not ours. |
| §7 Re-onboard reset | No "delete agent → clear intake → redo" path. |

## What to settle before building

1. **Does the funnel go per-workspace or per-agent?** Everything in §1–§3 depends on this, and it
   is a product call, not a technical one.
2. **Which of the missing tables do we actually want?** `stripe_events`, `audit_log`, and
   `rate_limits` come from the security playbook and are worth having regardless.
   `wallet_transactions` and the referral tables are a billing model we have not decided on. Chat
   sessions and credits currently live in the runtime and arguably should stay there.
3. **Is the conversational wizard worth the rewrite?** We have a working questionnaire. The brief's
   version is better at conditional depth and resume-in-place, but replacing a working intake flow
   the week after launch carries real risk.

## Suggested order, if we proceed

Deliberately different from the brief's §13, because steps 1–3 of that list are the ones blocked on
the per-workspace/per-agent decision, and because a lot of §7 is already built.

1. Settle the funnel question above.
2. Add `stripe_events`, `audit_log`, `rate_limits` — wanted by the security playbook anyway, and
   independent of the funnel decision.
3. Expand `buildUserMd` into the brief's three-file split, with unit tests on the builders. This is
   the highest-value item that is not blocked: it is what makes the agent genuinely *theirs*, and
   the tests are what guarantee every intake answer actually reaches it.
4. The re-onboard reset path (§7), which is small and removes a support burden.
5. The funnel and route grammar, once (1) is answered.
6. Credits ledger and referrals, only if we want that billing model.
