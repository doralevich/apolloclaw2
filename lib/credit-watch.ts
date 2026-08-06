import "server-only";
import { agent37 } from "@/lib/agent37";
import { availableMicros } from "@/lib/budget";
import { deliverCredit, recordCreditPurchase } from "@/lib/credits";
import {
  listWatchedAgents,
  type CreditSettings,
} from "@/lib/credit-settings";
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

async function warn(ctx: AgentContext, balance: number, autorechargeOffered: boolean): Promise<void> {
  const { settings, agentName, ownerEmails } = ctx;
  const threshold = usd(settings.warnBelowMicros);

  const html =
    `<h2 style="font-family:sans-serif;color:#0B1729">${agentName} is running low on credits</h2>` +
    `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
    `There is <strong>${usd(balance)}</strong> left to spend — below the ${threshold} line you set.</p>` +
    `<p style="font-family:sans-serif;font-size:15px;color:#111827">` +
    `Credits pay for everything your agent does: thinking, searching the web, and using your ` +
    `connected tools. When they run out your agent stops answering until you top up.</p>` +
    `<p style="font-family:sans-serif;font-size:15px">` +
    `<a href="https://apolloclaw.ai/dashboard/settings/billing" style="background:#0B1729;color:#fff;` +
    `padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Add credits</a></p>` +
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

  await sendTelegram(
    `⚠️ Low credits — ${agentName}\n` +
      `Balance: ${usd(balance)} (warns below ${threshold})\n` +
      `Told: ${ownerEmails.join(", ") || "nobody — no member emails found"}`
  );

  const db = createAdminClient();
  await db
    .from("credit_settings")
    .update({
      last_warned_at: new Date().toISOString(),
      last_warned_balance_micros: balance,
      updated_at: new Date().toISOString(),
    })
    .eq("agent37_id", settings.agent37Id);
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
      description: `ApolloClaw auto-recharge — ${pack.name}`,
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
    await sendTelegram(`💳 Auto-recharge — ${agentName}\nCharged ${usd(pack.amountCents * 10_000)} (balance was ${usd(balance)})`);
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
        `Buy a pack manually on the Credits page — that saves the card you use — and you can turn ` +
        `auto-recharge back on from the same place.</p>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">Stripe said: ${reason}</p>`;
      for (const to of ownerEmails) {
        await sendMandrillEmail({ to, subject: `Action needed: auto-recharge is off for ${agentName}`, html });
      }
      await sendTelegram(`🚫 Auto-recharge disabled — ${agentName}\nAfter ${failures} failed charges: ${reason}`);
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
