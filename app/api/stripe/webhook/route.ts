import type Stripe from "stripe";
import { NextResponse, after } from "next/server";
import { getAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { rememberStripeCustomer } from "@/lib/credit-settings";
import { deliverCredit, recordCreditPurchase } from "@/lib/credits";
import { creditPackForCatalogKey } from "@/lib/pricing/catalog";
import { ApiError } from "@/lib/http";
import { findAuthUserIdByEmail } from "@/lib/license-session";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { graceUntilIso } from "@/lib/entitlement";
import { sendTelegram } from "@/lib/telegram";
import { NOTIFY_EMAIL, sendMandrillEmail } from "@/lib/email";
import { syncMailchimpRegistration } from "@/lib/mailchimp";
import { escapeHtml } from "@/lib/onboardingSections";

// Stripe webhook — the provisioning side of the storefront.
//
// checkout.session.completed (paid) -> provision the purchased agent into the buyer's
// workspace and activate their entitlement. The session metadata written by
// /api/build/checkout (user_id, workspace_id, agent_type, agent_name) is the entire
// contract between checkout and here.
//
// This Stripe account also serves The College Agent's own site, so events that don't
// carry our metadata are acknowledged and ignored — never errored (Stripe would retry
// them forever).
//
// Idempotency: Stripe retries deliveries, so provisioning must tolerate duplicates. The
// one-agent-per-type-per-workspace cap inside provisionTypedAgent turns a duplicate into
// a 409, which we treat as "already provisioned" and acknowledge.

// Stripe gets its 200 immediately; provisioning and the profile/context writes run in
// `after()` against a booting instance, and that work counts against this function's duration.
export const maxDuration = 300;

export const POST = async (request: Request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // Raw body, untouched — signature verification hashes the exact bytes Stripe sent.
    const payload = await request.text();
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // Claim the event id BEFORE doing any work. Stripe retries until it gets a 2xx, and the
  // one-agent-per-type cap inside provisionTypedAgent only made the provisioning step
  // idempotent — a retry still re-sent the sale email and the Telegram alert. Claiming here
  // makes the whole handler idempotent.
  //
  // Fails open: if the table is missing (migration not yet applied) or the insert errors for
  // any reason other than a duplicate, we process the event rather than silently dropping a
  // real purchase.
  const db = createAdminClient();
  const { error: claimError } = await db
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (claimError) {
    // 23505 = unique_violation, i.e. we have already handled this event.
    if (claimError.code === "23505") {
      console.log("[stripe-webhook] duplicate delivery, already processed:", event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe-webhook] could not claim event, processing anyway:", claimError.message);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    // Release the claim so a genuine retry can reprocess. Without this a transient Agent37 or
    // DB failure would be permanently swallowed: Stripe would retry, we would see our own claim
    // row, and report success for work that never happened.
    await db.from("stripe_events").delete().eq("id", event.id);
    // Non-2xx makes Stripe redeliver — exactly what we want for transient failures.
    console.error(`[stripe-webhook] ${event.type} failed:`, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const meta = session.metadata ?? {};

  // The license flow (/api/onboard/checkout): an anonymous buyer paid before having an
  // account, so this event is where the account comes from. Checked first because these
  // sessions deliberately carry no user_id or workspace_id — there was no user to name.
  if (meta.flow === "onboard_license") {
    await handleLicensePurchase(session);
    return;
  }

  // An API credit pack bought from the dashboard's Credits tab (/api/credits/checkout).
  if (meta.flow === "credit_topup") {
    await handleCreditPurchase(session);
    return;
  }

  const { user_id: userId, workspace_id: workspaceId, agent_type: agentTypeId } = meta;

  // Not an Apollo agent purchase (e.g. a College Agent checkout on this shared account).
  if (!userId || !workspaceId || !agentTypeId) return;

  // Delayed payment methods complete the session before the money clears; the
  // async_payment_succeeded event re-enters here once payment_status flips to paid.
  if (session.payment_status !== "paid") {
    console.log("[stripe-webhook] session completed but unpaid, waiting:", session.id);
    return;
  }

  const type = getAgentType(agentTypeId);
  if (!type || !type.planKey) {
    console.error("[stripe-webhook] paid session for unknown agent type:", agentTypeId, session.id);
    return;
  }

  // Paid customers are entitled customers — activate (or create) their entitlement row so
  // the rest of the dashboard's spend gates open up. Keyed by email like the allowlist.
  const email = session.customer_details?.email?.trim().toLowerCase();
  if (email) {
    const db = createAdminClient();
    const { error } = await db
      .from("entitlements")
      .upsert(
        // grace_until cleared: a fresh/renewed subscription wipes any lingering grace window.
        { email, status: "active", source: "stripe", user_id: userId, grace_until: null },
        { onConflict: "email" }
      );
    if (error) console.error("[stripe-webhook] entitlement upsert failed:", email, error.message);
  }

  try {
    const agent = await provisionTypedAgent({
      type,
      workspaceId,
      userId,
      name: meta.agent_name || undefined,
      // The customer already paid — a missing dedicated template must not fail the order.
      allowTemplateFallback: true,
    });
    console.log("[stripe-webhook] provisioned", type.id, agent.id, "for session", session.id);

    // Notify the team of the sale — Telegram + email — after the response so a slow
    // Mandrill/Telegram call never delays Stripe's 200 or risks a retry.
    const amount =
      session.amount_total != null
        ? `$${(session.amount_total / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        : "";
    const buyer = session.customer_details?.email || email || userId;
    after(async () => {
      // Same audience sync as the licence flow. This buyer already had an account, so the tag
      // may well be there - the upsert and the tag are both idempotent, and re-applying is
      // cheaper than working out whether we have seen them before.
      if (email) {
        await syncMailchimpRegistration({
          email,
          firstName: (session.customer_details?.name || "").trim().split(/\s+/)[0] || "",
          lastName: (session.customer_details?.name || "").trim().split(/\s+/).slice(1).join(" "),
          extraTags: ["ac-agent-purchased"],
        });
      }
      // The customer's own welcome. Until this existed, buying an agent sent the buyer nothing
      // at all: Stripe redirected them to the questionnaire, and if they closed that tab the
      // purchase left no trace in their inbox and no way back to the page short of guessing
      // the URL. The only mail this flow produced went to us.
      if (email) {
        await sendAgentWelcomeEmail({
          email,
          firstName: (session.customer_details?.name || "").trim().split(/\s+/)[0] || "",
          label: type.label,
          setupUrl: `${publicSiteOrigin()}/onboard/${encodeURIComponent(type.id)}?ws=${encodeURIComponent(workspaceId)}`,
        });
      }
      await notifyPurchase({ label: type.label, agentId: agent.id, buyer, amount, sessionId: session.id });
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      // Duplicate delivery (or a second purchase attempt for a type the workspace already
      // has): the agent exists, which is the state this event wanted. Acknowledge.
      console.log("[stripe-webhook] already provisioned, skipping:", session.id);
      return;
    }
    throw err;
  }
}

// ─── Credit pack: record first, deliver second ────────────────────────────────
//
// The purchase is written down the moment payment is confirmed, BEFORE we try to hand the
// credit to the runtime. If that hand-off fails the row stays pending and a retry sweep
// picks it up — the customer's money is never somewhere we can't see it.
//
// Delivery failure deliberately does NOT throw. Throwing would fail the webhook, Stripe
// would redeliver, and we would be re-deciding a payment that already settled; the pending
// row is the better record of "paid, not yet applied".
async function handleCreditPurchase(session: Stripe.Checkout.Session): Promise<void> {
  const meta = session.metadata ?? {};
  const { workspace_id: workspaceId, agent37_id: agentId, catalog_key: catalogKey } = meta;

  if (!workspaceId || !agentId || !catalogKey) {
    console.error("[stripe-webhook] credit session missing metadata:", session.id);
    return;
  }
  if (session.payment_status !== "paid") {
    console.log("[stripe-webhook] credit session unpaid, waiting:", session.id);
    return;
  }

  const pack = creditPackForCatalogKey(catalogKey);
  if (!pack) {
    console.error("[stripe-webhook] paid credit session for unknown pack:", catalogKey, session.id);
    return;
  }

  // Remember whose card this was, before anything that can fail. The checkout saved the
  // payment method for off-session use (setup_future_usage in /api/credits/checkout), and this
  // is the id auto-recharge charges later. Done on every purchase, not just the first: someone
  // buying again has just re-confirmed a working card.
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (customerId) await rememberStripeCustomer(agentId, workspaceId, customerId);

  const rowId = await recordCreditPurchase({
    workspaceId,
    agent37Id: agentId,
    pack,
    stripeSessionId: session.id,
    purchasedBy: meta.user_id || undefined,
  });
  // null = this session was already recorded (webhook retry). The original row is either
  // delivered or waiting for the sweep; either way there is nothing new to grant.
  if (rowId === null) {
    console.log("[stripe-webhook] credit purchase already recorded:", session.id);
    return;
  }

  after(async () => {
    const ok = await deliverCredit(rowId);
    console.log("[stripe-webhook] credit", ok ? "delivered" : "PENDING (delivery failed)", session.id);
  });
}

// ─── License purchase: the account is created HERE, from the paid session ─────
//
// Under the current model there is nothing to provision at this moment: we sell the
// customization, and what gets built is decided by the onboarding answers the buyer is
// filling in right now, on the other side of the redirect. So this does exactly three
// things — create the auth user, give them a workspace, and send a receipt — and then tells
// David a sale happened. The password is not this route's business: the buyer chooses it on
// the closing screen of the flow they are still in.
//
// Every step is written to tolerate re-delivery. Stripe retries until it gets a 2xx, and
// while the stripe_events claim makes that rare, "rare" is not "never" and creating a
// second workspace for someone would be a mess to unpick by hand.
async function handleLicensePurchase(session: Stripe.Checkout.Session): Promise<void> {
  // Delayed payment methods complete the session before the money clears; the
  // async_payment_succeeded event re-enters here once payment_status flips to paid.
  if (session.payment_status !== "paid") {
    console.log("[stripe-webhook] license session completed but unpaid, waiting:", session.id);
    return;
  }

  const meta = session.metadata ?? {};
  const email = (session.customer_details?.email || meta.lead_email || "").trim().toLowerCase();
  if (!email) {
    // Nothing to key an account on. Acknowledge rather than throw: retrying will not
    // conjure an email, and a 500 here would make Stripe redeliver forever.
    console.error("[stripe-webhook] license session with no email:", session.id);
    return;
  }

  const first = meta.first_name || "";
  const last = meta.last_name || "";
  const db = createAdminClient();

  // Create the user, or find the one already there. A repeat buyer, a white-glove client
  // David set up by hand, and a Stripe re-delivery all land in the "already exists" branch.
  let userId: string | null = null;
  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    // Confirmed on creation: they proved control of this address by paying with it, and an
    // unconfirmed user would not fire the entitlement trigger (see migration 0003).
    email_confirm: true,
    user_metadata: { first_name: first, last_name: last, phone: meta.phone || "" },
  });
  if (created?.user) {
    userId = created.user.id;
  } else {
    console.log("[stripe-webhook] user exists or could not be created, looking up:", email, createError?.message);
    userId = await findAuthUserIdByEmail(db, email);
  }
  if (!userId) {
    // Throwing makes Stripe redeliver, which is right: the money is taken and the account
    // is the thing we owe them. A transient Supabase failure should get another attempt.
    throw new Error(`could not create or find an account for ${email}`);
  }

  // A workspace only if they have none. The on_workspace_created trigger adds the owner as
  // an admin member, so inserting the row is the whole job.
  const { data: memberships, error: mErr } = await db
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1);
  if (mErr) throw new Error(`membership lookup failed: ${mErr.message}`);
  if (!memberships?.length) {
    const owner = [first, last].filter(Boolean).join(" ").trim();
    const { error: wsErr } = await db
      .from("workspaces")
      .insert({ name: owner ? `${owner}'s Workspace` : email, owner_id: userId });
    if (wsErr) throw new Error(`workspace creation failed: ${wsErr.message}`);
  }

  // Paid customers are entitled customers. The signup trigger already inserted a row with
  // source='signup'; this restamps it as Stripe-managed so handleSubscriptionDeleted can
  // cancel it later. Keyed by email, like the allowlist.
  const { error: entErr } = await db
    .from("entitlements")
    .upsert({ email, status: "active", source: "stripe", user_id: userId, grace_until: null }, { onConflict: "email" });
  if (entErr) console.error("[stripe-webhook] entitlement upsert failed:", email, entErr.message);

  const amount =
    session.amount_total != null
      ? `$${(session.amount_total / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "";

  // After the response so a slow Mandrill call never delays Stripe's 200 or risks a retry.
  after(async () => {
    // Into the audience, tagged VPS-Registration. This is the moment the account exists, which
    // makes it the moment they become a contact - and until this line was here, the licence
    // flow put nobody in Mailchimp at all. Best effort inside; a Mailchimp outage must not
    // fail a webhook whose real work (account, workspace, entitlement) has already landed.
    await syncMailchimpRegistration({
      email,
      firstName: first,
      lastName: last,
      extraTags: ["ac-license-purchased"],
    });
    await sendPurchaseReceiptEmail(email, first);
    await notifyLicensePurchase({ email, name: [first, last].filter(Boolean).join(" "), amount, sessionId: session.id });
  });
}

// The receipt. NO SET-PASSWORD LINK — the buyer chooses their password on the closing screen
// of the flow they are still in (components/onboard/BuildScreen.tsx → /api/onboard/set-password).
//
// This used to carry a "Set your password" button, generated from a Supabase recovery link.
// That made sense when the flow ended at /login with no password to log in with. It stopped
// making sense when the closing screen started asking for one, and became actively confusing:
// the email lands while they are mid-questionnaire, so they are told to go and set a password
// they are about to be asked for anyway. Worse, using the emailed link stamps last_sign_in_at,
// and /api/onboard/set-password then refuses with "already_set" — so the email could send a
// buyer down a path that breaks the screen they were on.
//
// "Forgot password?" is named as the way back in, in words rather than as a button. Somebody
// who pays and closes the tab before the closing screen still has a route, and it is the
// ordinary one that proves control of the mailbox rather than a link sitting in an inbox.
async function sendPurchaseReceiptEmail(email: string, first: string): Promise<void> {
  const origin = publicSiteOrigin();
  // Licence buyers have no agent provisioned yet, so their questionnaire is the lead-mode
  // form at plain /onboard — the same place Stripe returns them to.
  const questionnaireUrl = `${origin}/onboard`;
  try {
    await sendMandrillEmail({
      to: email,
      subject: "Your ApolloClaw account is ready",
      html:
        `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
        `<h2 style="color:#0B1729">Welcome${first ? `, ${first}` : ""}.</h2>` +
        `<p>Your payment is confirmed and your ApolloClaw account has been created for <strong>${email}</strong>.</p>` +
        `<p>Carry on where you left off - you'll choose your password at the end, and go straight into your dashboard.</p>` +
        `<p><a href="${questionnaireUrl}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Continue setting up</a></p>` +
        `<p style="color:#6b7280;font-size:13px">The questionnaire is what your agent gets built from, so it is worth the few minutes.</p>` +
        `<p style="color:#6b7280;font-size:13px">Already finished and need to get back in? Log in with the password you chose, or use "Forgot password?" on the login page.</p>` +
        `</div>`,
    });
  } catch (err) {
    // Best effort. The account exists either way, and "Forgot password?" on the login page
    // is a working second path, so a mail failure must not fail the webhook.
    console.error("[stripe-webhook] purchase receipt email failed:", email, err);
  }
}

async function notifyLicensePurchase(o: {
  email: string;
  name: string;
  amount: string;
  sessionId: string;
}): Promise<void> {
  const line = `🟢 New ApolloClaw license purchased${o.amount ? ` (${o.amount})` : ""}`;
  await sendTelegram(`${line}\nBuyer: ${o.name || o.email} <${o.email}>\nAccount created ✅\nOnboarding answers follow when they finish the form.`);
  await sendMandrillEmail({
    to: NOTIFY_EMAIL,
    subject: `New ApolloClaw license${o.amount ? ` (${o.amount})` : ""} - ${o.name || o.email}`,
    html:
      `<h2 style="font-family:sans-serif;color:#0B1729">New license purchased</h2>` +
      `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Buyer</td><td>${o.name || "-"}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td>${o.email}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Amount</td><td>${o.amount || "-"}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Session</td><td>${o.sessionId}</td></tr>` +
      `</table>` +
      `<p style="font-family:sans-serif;color:#6b7280;font-size:13px">The account and workspace exist and a set-password email has been sent. Nothing is provisioned yet - the build follows from their onboarding answers, which arrive separately with a PDF when they finish the questionnaire.</p>`,
  });
}

// Team alert on a completed purchase: Telegram (same channel as the intake flows) plus an
// email to the notify address. Best-effort — both helpers swallow their own errors.
// The welcome email for an agent purchase, sent to the customer.
//
// Distinct from the licence flow's "your account is ready", which exists because that buyer had
// no account yet and needed a password link. This buyer is already signed in and already has a
// dashboard; what they need is confirmation the thing they paid for exists, and the one link
// that gets them to the next step.
//
// Deliberately not a sequence. It says what they bought, what happens next, and where to go —
// once, at the moment they will actually read it.
async function sendAgentWelcomeEmail(o: {
  email: string;
  firstName: string;
  label: string;
  setupUrl: string;
}): Promise<void> {
  try {
    await sendMandrillEmail({
      to: o.email,
      subject: `Your ${o.label} is ready`,
      html:
        `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
        `<h2 style="color:#0B1729">Your ${escapeHtml(o.label)} is ready${o.firstName ? `, ${escapeHtml(o.firstName)}` : ""}.</h2>` +
        `<p>Payment is confirmed and the agent has been created in your workspace. It is running, ` +
        `but it does not know anything about your business yet - so right now it is a general ` +
        `assistant rather than yours.</p>` +
        `<p>The setup questions are what change that. They ask how you work, who you serve, and ` +
        `what you want taken off your plate, and everything the agent does afterwards is built ` +
        `from those answers. Twenty minutes or so, and you can leave and come back.</p>` +
        `<p><a href="${o.setupUrl}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Set up your ${escapeHtml(o.label)}</a></p>` +
        // The reason this email exists at all: closing the Stripe tab used to lose the link.
        `<p style="color:#6b7280;font-size:13px">This link keeps working, so you can come back to ` +
        `it whenever suits. If anything in the questions does not make sense, reply to this email ` +
        `and tell me which one - that is usually faster than guessing.</p>` +
        `</div>`,
    });
  } catch (err) {
    // Best effort, and after the response. The agent is provisioned and paid for either way, and
    // a mail failure must not fail the webhook into a Stripe retry that re-runs provisioning.
    console.error("[stripe-webhook] agent welcome email failed:", o.email, err);
  }
}

async function notifyPurchase(o: {
  label: string;
  agentId: string;
  buyer: string;
  amount: string;
  sessionId: string;
}): Promise<void> {
  const line = `🟢 New agent purchased: ${o.label}${o.amount ? ` (${o.amount})` : ""}`;
  await sendTelegram(`${line}\nBuyer: ${o.buyer}\nAgent: ${o.agentId}\nProvisioned ✅`);
  await sendMandrillEmail({
    to: NOTIFY_EMAIL,
    subject: `New ApolloClaw sale - ${o.label}${o.amount ? ` (${o.amount})` : ""}`,
    html:
      `<h2 style="font-family:sans-serif;color:#0B1729">New agent purchased</h2>` +
      `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Agent</td><td>${o.label}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Amount</td><td>${o.amount || "-"}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Buyer</td><td>${o.buyer}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Agent ID</td><td>${o.agentId}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Session</td><td>${o.sessionId}</td></tr>` +
      `</table><p style="font-family:sans-serif;color:#6b7280;font-size:13px">The agent has been provisioned. The buyer's setup questionnaire (with a PDF) follows separately when they complete it.</p>`,
  });
}

// Hosting subscription cancelled -> flip the Stripe-managed entitlement off. Only rows
// this webhook owns (source = 'stripe') are touched; admin allowlist entries survive.
// The agent instance itself is left running — suspension policy is a human decision.
//
// SEATS AND THIS FUNCTION. The update below is keyed on EMAIL, so it cancels the whole
// customer, not one agent. That is correct here and only because seats are sold as a QUANTITY
// on this one subscription (lib/hosting-seats.ts): removing a colleague decrements the quantity
// and fires no event at all, so by the time this runs the customer really has cancelled
// everything. Sell a seat as a second subscription and this becomes a live bug - cancelling one
// would lock the whole company out, founder included. If that ever changes, this has to key on
// something narrower than the address.
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // Ours if it carries either marker: `agent_type` from the retired per-agent checkout, or
  // `flow` from the license checkout. Without the second test a cancelled license would have
  // left the entitlement active forever, since those subscriptions never had an agent_type.
  const meta = subscription.metadata ?? {};
  if (!meta.agent_type && meta.flow !== "onboard_license") return; // not an Apollo subscription

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await getStripe().customers.retrieve(customerId);
  const email = !customer.deleted ? customer.email?.trim().toLowerCase() : null;
  if (!email) return;

  // A cancellation opens a grace window rather than locking the account the same minute: the
  // customer keeps dashboard access until grace_until passes (10 days), after which the gate
  // and the credit-watch cron take over. This is the fix for the "cancelled, instantly locked
  // out while the instance keeps running" case. updated_at is stamped here (the old cancel path
  // left it untouched, which made created_at === updated_at read misleadingly).
  const db = createAdminClient();
  const { error } = await db
    .from("entitlements")
    .update({ status: "canceled", grace_until: graceUntilIso(), updated_at: new Date().toISOString() })
    .eq("email", email)
    .eq("source", "stripe");
  if (error) console.error("[stripe-webhook] entitlement cancel failed:", email, error.message);
}
