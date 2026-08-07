# Onboarding emails: where they live and how to move them to Mailchimp

Two systems send mail to a new cloud (VPS) customer. Knowing which is which is the whole
point of this document, because they fail in different ways and only one of them should ever
move into a marketing tool.

## What sends what, today

| Email | Sent by | Transport | Trigger |
|---|---|---|---|
| Your ApolloClaw account is ready | Stripe webhook | Mandrill | genuine event, at payment |
| Here is what happens next | hourly cron | Mandrill | polled, +1h |
| Your agent is waiting on one thing | hourly cron | Mandrill | polled, +48h, only if unfinished |
| You have not been able to get in yet | hourly cron | Mandrill | polled, +72h, only if never signed in |
| Three things people forget | hourly cron | Mandrill | polled, +7d, only once set up |

Mandrill **is** Mailchimp Transactional, so all of this already bills to the Mailchimp family.
What is *not* in Mailchimp is the sequencing: no audience, no journey, no automation builder.
That logic lives in `lib/onboarding-series.ts`.

## Why the nudges are polled rather than triggered

Their conditions are of the form *"48 hours have passed and they still have not done X"*.

Nothing happens when somebody fails to do something. Absence emits no event, so there is
nothing to hook a trigger to. The only way to notice is to look on a schedule, which is what
the hourly cron is for. The receipt is different — payment is a real event — and that one is
genuinely triggered.

## Moving the journeys to Mailchimp

### Step 1: the tags (done, shipped)

A Customer Journey can only branch on what Mailchimp knows, and Mailchimp knew none of this.
Every hour the cron now upserts each Stripe customer into the audience and sets:

| Tag | Means | Comes off? |
|---|---|---|
| `ac-customer` | active paid entitlement | yes, when it lapses |
| `ac-signed-in` | has signed in at least once | no |
| `ac-questionnaire-done` | finished the questionnaire, either form | no |
| `ac-agent-live` | an agent is provisioned | no |

Only `ac-customer` is ever removed. You cannot un-sign-in, so the rest are monotonic.

These are re-asserted every run rather than written once, which makes the audience
self-healing: a failed write is corrected an hour later instead of leaving a customer
permanently mislabelled.

Note `ac-questionnaire-done` in particular. A licence buyer's questionnaire posts to
`/api/intake` and writes to the CRM project, so nothing about finishing it reaches the
dashboard database on its own. `onboarding_milestones` (migration 0020) exists purely so this
tag can be true. Without it, any journey branching on "finished the questionnaire" would be
permanently false for every cloud customer.

### Step 2: build the journeys

In Mailchimp, start each journey from **tag added → `ac-customer`**, then use a delay and a
condition. The rule that matters:

> **Every nudge must check the tag before it sends.** A journey that only waits will email
> somebody asking them to finish a form they finished on Tuesday. That is worse than sending
> nothing, because it tells a person who has just paid you that nobody is paying attention.

- *Here is what happens next* — wait 1 hour, send. No condition.
- *Your agent is waiting on one thing* — wait 2 days, **if `ac-questionnaire-done` is absent**, send.
- *You have not been able to get in yet* — wait 3 days, **if `ac-signed-in` is absent**, send.
- *Three things people forget* — wait 7 days, **if both tags present**, send.

Copy for all four is in `lib/onboarding-series.ts`, in the `STEPS` array, ready to paste.

### Step 3: switch the code sends off

Set `ONBOARDING_SERIES_SENDS=off` in Vercel. The cron keeps running and keeps syncing tags —
which the journeys now depend on — and stops sending. Nothing needs deploying, and it is
reversible in one environment variable if a journey misbehaves.

Do this **the moment the first journey goes live**, not before and not after. Both systems
running at once means somebody receives both versions of the same email.

## What should NOT move

**The password receipt.** It carries a short-lived link that is the only way into an account
somebody has paid for. In a marketing journey it inherits marketing behaviour: added delay, a
higher chance of landing in Promotions, and — the real problem — it stops entirely for anyone
who has ever unsubscribed. A customer who unsubscribed from a newsletter last year would pay
and then never receive their way in.

It stays on the Stripe webhook, in code, sending through Mandrill. `ONBOARDING_SERIES_SENDS`
deliberately does not touch it.

## Checking it works

The tag sync is silent when it succeeds. To confirm:

- Open the audience in Mailchimp and look for `ac-customer` on a recent buyer.
- Or check the function logs for `[mailchimp] setTags rejected` — a 404 there means the
  contact was never upserted, which is the one failure that would take the whole sync down.

Sends are recorded in `onboarding_emails` (migration 0019), one row per `(email, step)`, and
that table is the record of what a customer has actually received from the code path. It says
nothing about Mailchimp sends; Mailchimp's own reporting owns those.
