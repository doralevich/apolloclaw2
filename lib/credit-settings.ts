import "server-only";
import { ApiError } from "@/lib/http";
import { creditPackForCatalogKey } from "@/lib/pricing/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

// Reading and writing an instance's credit safety net (supabase/migrations/0011).
//
// Deliberately thin: the sweep in lib/credit-watch.ts owns the decisions, this owns the row.

export interface CreditSettings {
  agent37Id: string;
  workspaceId: string;
  warnEnabled: boolean;
  warnBelowMicros: number;
  lastWarnedAt: string | null;
  lastWarnedBalanceMicros: number | null;
  autorechargeEnabled: boolean;
  autorechargeBelowMicros: number;
  autorechargePackKey: string | null;
  stripeCustomerId: string | null;
  lastRechargeAt: string | null;
  failedCharges: number;
  disabledReason: string | null;
}

// The defaults a row gets before anyone has touched the settings. Kept here rather than
// relying on the DB defaults alone, so a UI reading settings for an agent with no row yet
// shows the same numbers the row would have been created with.
const DEFAULT_WARN_BELOW_MICROS = 5_000_000; // $5

/** Thresholds offered in the UI, in micros. Small, round, and the same list for both
 *  settings — two different sets of numbers for "when is the balance low" would be two
 *  answers to one question. */
export const THRESHOLD_CHOICES_MICROS = [3_000_000, 5_000_000, 10_000_000, 25_000_000];

type Row = {
  agent37_id: string;
  workspace_id: string;
  warn_enabled: boolean;
  warn_below_micros: number | string;
  last_warned_at: string | null;
  last_warned_balance_micros: number | string | null;
  autorecharge_enabled: boolean;
  autorecharge_below_micros: number | string;
  autorecharge_pack_key: string | null;
  stripe_customer_id: string | null;
  last_recharge_at: string | null;
  failed_charges: number;
  disabled_reason: string | null;
};

// bigint columns come back from PostgREST as strings once they exceed the JS-safe range, and
// as numbers below it. Normalize rather than trusting whichever shape today's value produced.
function toNumber(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fromRow(row: Row): CreditSettings {
  return {
    agent37Id: row.agent37_id,
    workspaceId: row.workspace_id,
    warnEnabled: row.warn_enabled,
    warnBelowMicros: toNumber(row.warn_below_micros, DEFAULT_WARN_BELOW_MICROS),
    lastWarnedAt: row.last_warned_at,
    lastWarnedBalanceMicros:
      row.last_warned_balance_micros === null ? null : toNumber(row.last_warned_balance_micros),
    autorechargeEnabled: row.autorecharge_enabled,
    autorechargeBelowMicros: toNumber(row.autorecharge_below_micros, DEFAULT_WARN_BELOW_MICROS),
    autorechargePackKey: row.autorecharge_pack_key,
    stripeCustomerId: row.stripe_customer_id,
    lastRechargeAt: row.last_recharge_at,
    failedCharges: row.failed_charges,
    disabledReason: row.disabled_reason,
  };
}

/** Settings as they'd be for an agent nobody has configured yet. Not persisted — a row is
 *  only written when someone changes something, or when a checkout captures their customer id. */
export function defaultSettings(agent37Id: string, workspaceId: string): CreditSettings {
  return {
    agent37Id,
    workspaceId,
    warnEnabled: true,
    warnBelowMicros: DEFAULT_WARN_BELOW_MICROS,
    lastWarnedAt: null,
    lastWarnedBalanceMicros: null,
    autorechargeEnabled: false,
    autorechargeBelowMicros: DEFAULT_WARN_BELOW_MICROS,
    autorechargePackKey: null,
    stripeCustomerId: null,
    lastRechargeAt: null,
    failedCharges: 0,
    disabledReason: null,
  };
}

export async function getCreditSettings(
  agent37Id: string,
  workspaceId: string
): Promise<CreditSettings> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("credit_settings")
    .select("*")
    .eq("agent37_id", agent37Id)
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  return data ? fromRow(data as Row) : defaultSettings(agent37Id, workspaceId);
}

export interface CreditSettingsPatch {
  warnEnabled?: boolean;
  warnBelowMicros?: number;
  autorechargeEnabled?: boolean;
  autorechargeBelowMicros?: number;
  autorechargePackKey?: string | null;
}

/**
 * Apply a customer's changes.
 *
 * Turning auto-recharge ON clears any previous failure state: they have come back and made a
 * deliberate choice, which is exactly the signal that whatever killed the last attempt (an
 * expired card, usually) has been dealt with. Leaving the counter at 3 would let the next
 * failure disable it instantly and look like the switch never worked.
 */
export async function updateCreditSettings(
  agent37Id: string,
  workspaceId: string,
  patch: CreditSettingsPatch
): Promise<CreditSettings> {
  const current = await getCreditSettings(agent37Id, workspaceId);

  if (patch.warnBelowMicros !== undefined && !THRESHOLD_CHOICES_MICROS.includes(patch.warnBelowMicros)) {
    throw new ApiError(400, "invalid_request", "Unsupported warning threshold");
  }
  if (
    patch.autorechargeBelowMicros !== undefined &&
    !THRESHOLD_CHOICES_MICROS.includes(patch.autorechargeBelowMicros)
  ) {
    throw new ApiError(400, "invalid_request", "Unsupported auto-recharge threshold");
  }
  if (patch.autorechargePackKey && !creditPackForCatalogKey(patch.autorechargePackKey)) {
    throw new ApiError(400, "invalid_request", "Unknown credit pack");
  }

  const enabling = patch.autorechargeEnabled === true && !current.autorechargeEnabled;
  const packKey = patch.autorechargePackKey ?? current.autorechargePackKey;

  // Arming it without saying what to buy would be a switch that silently does nothing.
  if ((patch.autorechargeEnabled ?? current.autorechargeEnabled) && !packKey) {
    throw new ApiError(400, "invalid_request", "Choose which pack to buy before turning auto-recharge on");
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("credit_settings")
    .upsert(
      {
        agent37_id: agent37Id,
        workspace_id: workspaceId,
        warn_enabled: patch.warnEnabled ?? current.warnEnabled,
        warn_below_micros: patch.warnBelowMicros ?? current.warnBelowMicros,
        autorecharge_enabled: patch.autorechargeEnabled ?? current.autorechargeEnabled,
        autorecharge_below_micros: patch.autorechargeBelowMicros ?? current.autorechargeBelowMicros,
        autorecharge_pack_key: packKey,
        ...(enabling ? { failed_charges: 0, disabled_reason: null } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agent37_id" }
    )
    .select("*")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);
  return fromRow(data as Row);
}

/**
 * Remember which Stripe customer to charge, from a checkout that just completed.
 *
 * Called on every credit purchase, not just the first: a customer who checks out again has
 * just re-confirmed a working card, and that session's customer is the one whose payment
 * method Stripe saved. Creates the settings row if this is their first purchase, so
 * auto-recharge can be switched on later without another trip through checkout.
 */
export async function rememberStripeCustomer(
  agent37Id: string,
  workspaceId: string,
  stripeCustomerId: string
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("credit_settings").upsert(
    {
      agent37_id: agent37Id,
      workspace_id: workspaceId,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "agent37_id" }
  );
  // Never fatal: the purchase itself has already succeeded and is being delivered. A missing
  // customer id costs auto-recharge, not the credit they just bought.
  if (error) console.error("[credit-settings] customer capture failed:", agent37Id, error.message);
}

/**
 * Every instance the sweep should look at — which is EVERY AGENT, not every settings row.
 *
 * This used to select from credit_settings alone. That looked right and was not: a row is only
 * written when somebody changes a setting or buys credits, so an agent nobody has configured
 * had no row and was therefore never swept. `defaultSettings` says warnEnabled: true, but that
 * default only reached the settings screen — it never reached the sweep, so the promise it
 * makes was one the product did not keep.
 *
 * In production that meant 4 agents and 0 rows: not one live customer would have been told
 * their agent was about to go quiet. The person this hurts most is the one who never opens the
 * dashboard because they talk to their agent in Telegram — exactly the customer least likely
 * to notice a balance falling on a page they never visit.
 *
 * So: start from agents, left-join their settings, and fall back to the defaults for the ones
 * with no row. An agent is only skipped when someone has deliberately switched both the
 * warning and auto-recharge off.
 */
export async function listWatchedAgents(): Promise<CreditSettings[]> {
  const db = createAdminClient();

  const { data: agents, error: agentsError } = await db
    .from("agents")
    .select("agent37_id, workspace_id");
  if (agentsError) throw new ApiError(500, "db_error", agentsError.message);

  const { data: rows, error } = await db.from("credit_settings").select("*");
  if (error) throw new ApiError(500, "db_error", error.message);

  const byAgent = new Map<string, CreditSettings>();
  for (const row of (rows ?? []) as Row[]) byAgent.set(row.agent37_id, fromRow(row));

  return (agents ?? [])
    .map((a) => {
      const id = a.agent37_id as string;
      return byAgent.get(id) ?? defaultSettings(id, a.workspace_id as string);
    })
    .filter((s) => s.warnEnabled || s.autorechargeEnabled);
}
