import "server-only";
import { agent37 } from "@/lib/agent37";
import { availableMicros } from "@/lib/budget";
import { deliverCredit, recordCreditPurchase } from "@/lib/credits";
import {
  listWatchedAgents,
  type CreditSettings,
} from "@/lib/credit-settings";
import * as telegramChannel from "@/lib/channels/telegram";
import { getChannelConfig } from "@/lib/channels/store";
import { sendMandrillEmail } from "@/lib/email";
import { usd } from "@/lib/format";
import { creditPackForCatalogKey, type CreditPack } from "@/lib/pricing/catalog";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram } from "@/lib/telegram";

// The sweep behind the low-balance warning and auto-recharge. Runs hourly from
// /api/cron/credit-watch.
//
// What it is actually protecting against: an agent whose balance hits zero stops answering,
// and nothing tells anyone. The customer's experience is that the product broke. By the time
// they think to look at a billing page, they have already had the bad day.
//
// Every decision here is made from the runtime's balance, read fresh, one instance at a time.
// Nothing is inferred from our own ledger — the ledger records what we sold, the runtime knows
// what is left, and only the second one can say whether an agent is about to go quiet.

/** Don't say the same thing twice in a day. */
const WARN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** A declined card declines again. Three, then stop and say why. */
const MAX_FAILED_CHARGES = 3;

export interface SweepResult {
  checked: number;
  warned: number;
  recharged: number;
  failed: number;
  skipped: number;
}

interface AgentContext {
  settings: CreditSettings;
  agentName: string;
  ownerEmails: string[];
}

/** Who to tell. Every member of the workspace who can act on it. */
async function resolveContext(settings: CreditSettings): Promise<AgentContext | null> {
  const db = createAdminClient();

  const { data: agent } = await db
    .from("agents")
    .select("name, agent37_id")
    .eq("agent37_id", settings.agent37Id)
    .maybeSingle();
  // The row is gone: the agent was deleted and its settings outlived it. Nothing to watch.
  if (!agent) return null;

  const { data: members } = await db
    .from("memberships")
    .select("user_id")
    .eq("workspace_id", settings.workspaceId);

  const ids = (members ?? []).map((m) => m.user_id as string);
  const emails: string[] = [];
  for (const id of ids) {
    const { data } = await db.auth.admin.getUserById(id);
    const email = data.user?.email?.trim();
    if (email) emails.push(email);
  }

  return {
    settings,
    agentName: (agent.name as string | null) || settings.agent37Id,
    ownerEmails: emails,
  };
}

// ─── The warning ──────────────────────────────────────────────────────────────

/**
 * Has enough changed to be worth saying again?
 *
 * Two separate cases. Never warned, or warned long enough ago that the cooldown has expired —
 * say it. But also: warned, then they topped up and have fallen below the line again. That is
 * a NEW event and waiting out a cooldown from the old one would silently skip it, so a balance
 * that has risen since the last warning resets the clock.
 */
function shouldWarn(settings: CreditSettings, balance: number, now: number): boolean {
  if (!settings.lastWarnedAt) return true;
  const since = now - new Date(settings.lastWarnedAt).getTime();
  if (since >= WARN_COOLDOWN_MS) return true;
  const previous = settings.lastWarnedBalanceMicros;
  return previous !== null && balance > previous;
}

// Through the login page, not straight at the billing page.
//
// /dashboard redirects to /login when there is no session and passes no destination, so a
// customer who clicks this from their phone signs in and lands on Start Here, then has to go
// and find Credits themselves. That is the whole journey David flagged: they are in Telegram,
// they have gone to find the email, and the email drops them one screen short of the thing it
// asked them to do.
//
// The login page already reads ?next= and /auth/callback carries it through the magic link, so
// this is just using what is there. safeNext rejects anything not starting with a single "/",
// so a relative path is all this can ever be.
const TOP_UP_URL = "https://apolloclaw.ai/login?next=%2Fdashboard%2Fsettings%2Fbilling";

/**
 * Say it in the customer's own chat app, using their own bot.
 *
 * Note which Telegram this is. `sendTelegram` from lib/telegram.ts posts to one hardcoded chat
 * id — David's ops channel — so the existing "low credits" ping tells US and nobody else. This
 * uses the per-agent channel config: the customer's bot token, and the owner chat id captured
 * the first time they messaged it. Two different Telegrams that were easy to mistake for one.
 *
 * Only channels that are actually connected, and only where we know the owner's chat. Telegram
 * is the one wired up here because it is the one that holds an owner chat id; Slack and
 * WhatsApp would need their own destination captured before this could reach them.
 */
async function warnInChannels(ctx: AgentContext, balance: number): Promise<void> {
  // No agent name in the message: it arrives from the agent's own bot, in the customer's
  // thread with it, so it speaks as itself rather than announcing who it is.
  const { settings } = ctx;
  try {
    const config = await getChannelConfig(settings.agent37Id, "telegram");
    if (!config?.ownerChatId) return;
    await telegramChannel.sendMessage(
      config.token,
      config.ownerChatId,
      `Heads up - I am running low on credits. There is ${usd(balance)} left, and when it ` +
        `runs out I stop answering until it is topped up.\n\n` +
        `You can add credits here: ${TOP_UP_URL}\n` +
        `That link signs you in and goes straight to the top-up page.`
    );
  } catch (err) {
    // A revoked bot token, a blocked bot, a deleted chat. None of it is worth failing the
    // warning over — the email is the one that has to land.
    console.error("[credit-watch] channel warning failed", settings.agent37Id, err);
  }
}

async function warn(ctx: AgentContext, balance: number, autorechargeOffered: boolean): Promise<void> {
  const { settings, agentName, ownerEmails } = ctx;
  const threshold = usd(settings.warnBelowMicros);

  const html =
    `<h2 style="font-family:sans-serif;color:#0B1729">${agentName} is running low on credits</h2>` +
    `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
    `There is <strong>${usd(balance)}</strong> left to spend - below the ${threshold} line you set.</p>` +
    `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
    `Credits pay for everything your agent does: thinking, searching the web, and using your ` +
    `connected tools. When they run out your agent stops answering until you top up.</p>` +
    `<p style="font-family:sans-serif;font-size:15px">` +
    `<a href="${TOP_UP_URL}" style="background:#0B1729;color:#fff;` +
    `padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Sign in and add credits</a></p>` +
    `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">` +
    `That link signs you in and takes you straight to the top-up page.</p>` +
    (autorechargeOffered
      ? `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">` +
        `You can also turn on auto-recharge on that page and never see this email again.</p>`
      : "") +
    `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">` +
    `You're getting this because the low-balance warning is on for ${agentName}. Change the ` +
    `threshold or switch it off from the same page.</p>`;

  for (const to of ownerEmails) {
    await sendMandrillEmail({ to, subject: `${agentName} is low on credits (${usd(balance)} left)`, html });
  }

  // And in the chat app they actually use.
  //
  // Email alone assumes the customer will go and look. Somebody who talks to their agent in
  // Telegram all day has no reason to open the dashboard and may not read that inbox for days
  // — they find out when the agent stops answering, which reads as the product breaking rather
  // than as a balance running out. Telling them in the thread they are already in is the
  // difference between a warning and a post-mortem.
  //
  // Best-effort, and last: a channel that has been revoked must not cost them the email that
  // has already been sent.
  await warnInChannels(ctx, balance);

  await sendTelegram(
    `⚠️ Low credits - ${agentName}\n` +
      `Balance: ${usd(balance)} (warns below ${threshold})\n` +
      `Told: ${ownerEmails.join(", ") || "nobody - no member emails found"}`
  );

  // UPSERT, not update. The sweep now covers agents that have never had a settings row, and an
  // update filtered on agent37_id silently matches nothing for those — which would leave
  // last_warned_at null forever and send this email every hour until they paid or left.
  const db = createAdminClient();
  await db.from("credit_settings").upsert(
    {
      agent37_id: settings.agent37Id,
      workspace_id: settings.workspaceId,
      warn_enabled: settings.warnEnabled,
      warn_below_micros: settings.warnBelowMicros,
      last_warned_at: new Date().toISOString(),
      last_warned_balance_micros: balance,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "agent37_id" }
  );
}

// ─── The recharge ─────────────────────────────────────────────────────────────

/**
 * Charge the saved card for one pack, then record and deliver it exactly like a manual
 * purchase — same ledger, same pending-then-delivered ordering, same retry story. The only
 * difference is that nobody clicked anything.
 *
 * Off-session means the customer isn't there to handle a 3-D Secure prompt, so a card that
 * demands one fails here. That is the correct outcome: it counts as a failed charge, and
 * after three the switch turns itself off and tells them to buy manually once.
 */
async function recharge(ctx: AgentContext, pack: CreditPack, balance: number): Promise<boolean> {
  const { settings, agentName, ownerEmails } = ctx;
  const db = createAdminClient();
  const stripe = getStripe();

  try {
    if (!settings.stripeCustomerId) throw new Error("no saved Stripe customer for this agent");

    // Their default card, else the most recently attached one. Explicit rather than relying
    // on Stripe's implicit default, so "which card did you charge" has an answer.
    const customer = await stripe.customers.retrieve(settings.stripeCustomerId);
    const defaultPm =
      !customer.deleted && typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : null;
    let paymentMethod = defaultPm;
    if (!paymentMethod) {
      const { data: methods } = await stripe.paymentMethods.list({
        customer: settings.stripeCustomerId,
        type: "card",
        limit: 1,
      });
      paymentMethod = methods[0]?.id ?? null;
    }
    if (!paymentMethod) throw new Error("no saved card on file");

    const intent = await stripe.paymentIntents.create({
      amount: pack.amountCents,
      currency: "usd",
      customer: settings.stripeCustomerId,
      payment_method: paymentMethod,
      off_session: true,
      confirm: true,
      description: `ApolloClaw auto-recharge - ${pack.name}`,
      metadata: {
        flow: "credit_autorecharge",
        workspace_id: settings.workspaceId,
        agent37_id: settings.agent37Id,
        catalog_key: pack.catalogKey,
      },
    });

    if (intent.status !== "succeeded") throw new Error(`payment intent ${intent.status}`);

    // Same two-step as the webhook path: record the money first, then hand the credit over.
    // The payment intent id stands in for a checkout session id — it is the unique thing this
    // charge has, so a repeated sweep can't book it twice.
    const rowId = await recordCreditPurchase({
      workspaceId: settings.workspaceId,
      agent37Id: settings.agent37Id,
      pack,
      stripeSessionId: intent.id,
    });
    if (rowId !== null) await deliverCredit(rowId);

    await db
      .from("credit_settings")
      .update({
        last_recharge_at: new Date().toISOString(),
        failed_charges: 0,
        disabled_reason: null,
        // A fresh balance means the next dip is a new event worth warning about.
        last_warned_at: null,
        last_warned_balance_micros: null,
        updated_at: new Date().toISOString(),
      })
      .eq("agent37_id", settings.agent37Id);

    const html =
      `<h2 style="font-family:sans-serif;color:#0B1729">We topped up ${agentName}</h2>` +
      `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
      `The balance had fallen to ${usd(balance)}, so we bought the ${usd(pack.amountCents * 10_000)} ` +
      `credit pack you chose and charged your saved card.</p>` +
      `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">` +
      `Auto-recharge is on for this agent. Turn it off or change the amount on the Credits page.</p>`;
    for (const to of ownerEmails) {
      await sendMandrillEmail({ to, subject: `${agentName}: credits topped up automatically`, html });
    }
    await sendTelegram(`💳 Auto-recharge - ${agentName}\nCharged ${usd(pack.amountCents * 10_000)} (balance was ${usd(balance)})`);
    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const failures = settings.failedCharges + 1;
    const disable = failures >= MAX_FAILED_CHARGES;

    console.error("[credit-watch] recharge failed", settings.agent37Id, reason);
    await db
      .from("credit_settings")
      .update({
        failed_charges: failures,
        ...(disable
          ? { autorecharge_enabled: false, disabled_reason: reason.slice(0, 300) }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("agent37_id", settings.agent37Id);

    if (disable) {
      const html =
        `<h2 style="font-family:sans-serif;color:#0B1729">Auto-recharge is off for ${agentName}</h2>` +
        `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
        `We tried to top up your credits ${MAX_FAILED_CHARGES} times and the card was declined each ` +
        `time. Rather than keep trying, we've switched auto-recharge off.</p>` +
        `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
        `Buy a pack manually on the Credits page - that saves the card you use - and you can turn ` +
        `auto-recharge back on from the same place.</p>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">Stripe said: ${reason}</p>`;
      for (const to of ownerEmails) {
        await sendMandrillEmail({ to, subject: `Action needed: auto-recharge is off for ${agentName}`, html });
      }
      await sendTelegram(`🚫 Auto-recharge disabled - ${agentName}\nAfter ${failures} failed charges: ${reason}`);
    }
    return false;
  }
}

// ─── The sweep ────────────────────────────────────────────────────────────────

export async function sweepCredits(): Promise<SweepResult> {
  const watched = await listWatchedAgents();
  const now = Date.now();
  const result: SweepResult = { checked: 0, warned: 0, recharged: 0, failed: 0, skipped: 0 };

  for (const settings of watched) {
    let balance: number;
    try {
      const budget = await agent37.getBudget(settings.agent37Id);
      balance = availableMicros(budget);
    } catch (err) {
      // An unreachable instance is not a low balance. Skipping is right: warning on a failed
      // read would email people every hour that an agent they can still use is out of money.
      console.error("[credit-watch] budget read failed", settings.agent37Id, err);
      result.skipped++;
      continue;
    }
    result.checked++;

    const ctx = await resolveContext(settings);
    if (!ctx) {
      result.skipped++;
      continue;
    }

    const pack = settings.autorechargePackKey
      ? creditPackForCatalogKey(settings.autorechargePackKey)
      : undefined;

    // Recharge first. If it succeeds the balance is no longer low and there is nothing to warn
    // about — an email saying "you're low" arriving beside one saying "we topped you up" is
    // the kind of thing that makes people distrust both.
    if (settings.autorechargeEnabled && pack && balance < settings.autorechargeBelowMicros) {
      if (await recharge(ctx, pack, balance)) result.recharged++;
      else result.failed++;
      continue;
    }

    if (settings.warnEnabled && balance < settings.warnBelowMicros && shouldWarn(settings, balance, now)) {
      try {
        await warn(ctx, balance, !settings.autorechargeEnabled);
        result.warned++;
      } catch (err) {
        console.error("[credit-watch] warning failed", settings.agent37Id, err);
        result.failed++;
      }
    }
  }

  console.log("[credit-watch] sweep", JSON.stringify(result));
  return result;
}
