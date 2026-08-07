# Onboarding emails

Everything except the password receipt is now Mailchimp's. This app sends no onboarding
sequence, runs no cron for it, and writes no tags. The code that did all that was deleted —
this document is what is left, and it has the copy in it.

## What this app still sends

One email, from the Stripe webhook, through Mandrill, at the moment somebody pays:

> **Your ApolloClaw account is ready** — carries a set-your-password link.

That is the entire list.

### Why this one did not move

It is not a marketing email, it is the key to the account. The link is the only way into
something the customer has just paid for.

In a Mailchimp journey it would inherit marketing behaviour, and one part of that is fatal:
**Mailchimp will not deliver to a contact who has ever unsubscribed.** Somebody who opted out
of a newsletter last year would pay you and then never receive their way in, with no error
anywhere — it would look like a delivery that simply did not happen. Support finds out when
they email you, if they bother.

Moving it is a customer-lockout bug, not a preference. Leave it where it is.

## Setting the rest up in Mailchimp

The simple version, which needs nothing from this codebase:

1. **Connect Stripe to Mailchimp** so purchases create or update contacts. Mailchimp's Stripe
   integration handles this; no code involved.
2. **Build a Customer Journey** starting from the purchase, with a delay before each email.
3. **Paste the copy below** into the four emails.

### The tradeoff you are accepting

Mailchimp knows that somebody paid. It does not know whether they signed in, finished the
questionnaire, or have a working agent — that lives in Supabase, and nothing is sending it
over any more.

So these journeys fire on elapsed time alone. Concretely: **email 2 will go to people who
already finished the questionnaire, and email 3 will go to people who are already signed in.**
Roughly a fifth to a half of recipients, depending on how fast customers move.

That is the price of one system instead of two, and it is a reasonable price. It is worth
knowing in advance rather than discovering from a reply saying "I already did this."

If it starts costing you goodwill, the fix is to send the state back into Mailchimp as tags —
about eighty lines, and it is in the git history at PR #144.

## The copy

Send times are from purchase.

---

### 1. After 1 hour — "Here is what happens next"

Deliberately an hour behind the receipt rather than alongside it. Two emails landing together
get read as one, and the one that survives is the receipt.

> **Welcome, \*|FNAME|\*.**
>
> Your agent is being set up. There are three things between here and it being useful, and only
> the first one needs you today.
>
> **1. Tell it about your business.**
> This is the questionnaire. It is the longest part and it is the part everything else is built
> from, so it is worth doing properly rather than quickly. Twenty minutes, and you can leave and
> come back.
>
> **2. Connect the apps it works in.**
> Gmail, Calendar, Drive, whatever you live in. An agent with no connections can talk about your
> work. One with connections can do it.
>
> **3. Ask it something real.**
> Not a test question. Something you were going to have to do anyway. That is the fastest way to
> find out where it helps.
>
> [Start the questionnaire] → `https://apolloclaw.ai/onboard`
>
> Stuck at any point, reply to this email.

---

### 2. After 2 days — "Your agent is waiting on one thing"

> **One thing left, \*|FNAME|\*.**
>
> Your agent is provisioned and running, but it has not been told anything about your business
> yet, so it is a general assistant rather than yours.
>
> The questionnaire is what changes that. It asks how you work, who you serve, how you sound in
> writing, and what you want taken off your plate. Everything the agent does afterwards is built
> from those answers.
>
> [Pick up where you left off] → `https://apolloclaw.ai/onboard`
>
> If something in it did not make sense, tell me which question and I will answer it directly.
> That is usually faster than guessing.

---

### 3. After 3 days — "You have not been able to get in yet"

Written for someone whose receipt link expired. Since Mailchimp cannot tell who has signed in,
it now reaches everyone — so it is worded as an offer rather than an accusation. Keep it that
way.

> **Let us get you into your dashboard.**
>
> Your account is paid for and ready. If you have not signed in yet, that usually means the
> password link in your receipt expired before you got to it — it is short-lived on purpose.
>
> Getting a fresh one takes a moment: go to the login page and choose **Forgot password?**. It
> will email you a new link straight away.
>
> [Go to the login page] → `https://apolloclaw.ai/login`
>
> If that does not work, reply to this email and I will sort it out manually. You should not
> have to fight for something you have paid for.

---

### 4. After 7 days — "Three things people forget their agent can do"

> **You are set up. Now the useful part.**
>
> Most people use an agent for about a third of what it can do, because the other two thirds are
> not obvious. These are the three that surprise people most.
>
> **It can message you first.**
> Scheduled skills mean it can open the conversation, not just answer. A morning brief, an
> end-of-day summary, a weekly plan.
>
> **It can work where you already are.**
> It does not have to live in the dashboard. Connect a chat channel and it answers where you
> already spend your day.
>
> **It reads your actual files and mail.**
> Once Drive and Gmail are connected, "what did we agree with them in March" stops being a search
> and starts being a question.
>
> [Open the guide] → `https://apolloclaw.ai/dashboard/guide`
>
> If it is not earning its keep yet, reply and tell me what you were hoping it would take off
> you. That is useful to me either way.

---

## Two customers are mid-sequence

Both had the first email and nothing after it, because sends were switched off between:

- `doralevich@gmail.com` — bought Aug 6
- `baseline2llc@gmail.com` — bought Aug 7

They will not receive the rest unless a Mailchimp journey picks them up. If you build the
journey with a start trigger of "tag added", you can add them by hand.
