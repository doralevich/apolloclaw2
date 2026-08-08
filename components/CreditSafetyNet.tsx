"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bell, Zap } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { usd } from "@/lib/format";
import { CREDIT_PACKS } from "@/lib/pricing/catalog";
import { cn } from "@/lib/utils";

// The two settings that stop an agent going quiet: tell me when the balance is low, and (if
// they want it) buy the next pack automatically. lib/credit-watch.ts is what acts on them.
//
// Both are rendered as one card each with the threshold as a row of small buttons rather than
// a select — there are four choices, they're all short, and a dropdown to answer "how low is
// low" is a click more than the question deserves.

// Mirrors THRESHOLD_CHOICES_MICROS in lib/credit-settings.ts. The server validates against
// its own list; this one only has to draw the buttons.
const THRESHOLDS = [3_000_000, 5_000_000, 10_000_000, 25_000_000];

interface Settings {
  warnEnabled: boolean;
  warnBelowMicros: number;
  autorechargeEnabled: boolean;
  autorechargeBelowMicros: number;
  autorechargePackKey: string | null;
  lastRechargeAt: string | null;
  failedCharges: number;
  disabledReason: string | null;
  canAutorecharge: boolean;
}

type Patch = {
  warn_enabled?: boolean;
  warn_below_micros?: number;
  autorecharge_enabled?: boolean;
  autorecharge_below_micros?: number;
  autorecharge_pack_key?: string | null;
};

export function CreditSafetyNet({ agentId }: { agentId: string | null }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!agentId) return;
    const s = await apiFetch<Settings>(`/api/agents/${agentId}/credit-settings`);
    setSettings(s);
  }, [agentId]);

  useEffect(() => {
    if (!agentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-on-prop-change: the previous agent's settings must not linger on screen
      setSettings(null);
      return;
    }
    let cancelled = false;
    apiFetch<Settings>(`/api/agents/${agentId}/credit-settings`)
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      // Supporting controls, not the headline balance: a failure here shouldn't shout.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  async function save(patch: Patch) {
    if (!agentId || saving) return;
    setSaving(true);
    // Optimism with a rollback: these are toggles, and waiting on a round-trip to see a switch
    // move feels broken. `load()` in the finally puts the server's answer back either way.
    try {
      const updated = await apiFetch<Settings>(`/api/agents/${agentId}/credit-settings`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setSettings(updated);
    } catch (e) {
      toast.error((e as Error).message || "Couldn't save that.");
      await load().catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  if (!agentId || !settings) return null;

  const pack = settings.autorechargePackKey
    ? CREDIT_PACKS.find((p) => p.catalogKey === settings.autorechargePackKey)
    : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* ── Low-balance warning ───────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Bell className="size-4 text-muted-foreground" />
              Low balance warning
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              We email you before your agent runs out. Without this, the first sign is your agent
              going quiet.
            </p>
          </div>
          <Toggle
            on={settings.warnEnabled}
            disabled={saving}
            label="Low balance warning"
            onChange={(on) => save({ warn_enabled: on })}
          />
        </div>

        {settings.warnEnabled && (
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground">Warn me below</div>
            <ThresholdRow
              value={settings.warnBelowMicros}
              disabled={saving}
              onChange={(v) => save({ warn_below_micros: v })}
            />
          </div>
        )}
      </div>

      {/* ── Auto-recharge ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Zap className="size-4 text-muted-foreground" />
              Auto-recharge
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {settings.canAutorecharge
                ? "Buy more automatically when the balance runs low, so your agent never stops."
                : "Buy a pack once first - that saves your card, which is what this charges."}
            </p>
          </div>
          <Toggle
            on={settings.autorechargeEnabled}
            disabled={saving || !settings.canAutorecharge || !settings.autorechargePackKey}
            label="Auto-recharge"
            onChange={(on) => save({ autorecharge_enabled: on })}
          />
        </div>

        {settings.disabledReason && (
          <div className="mt-3 flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">We turned this off.</p>
              <p className="mt-0.5 text-muted-foreground">
                Your card was declined {settings.failedCharges} times. Buy a pack manually to save a
                working card, then switch this back on.
              </p>
            </div>
          </div>
        )}

        {settings.canAutorecharge && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">When the balance drops below</div>
              <ThresholdRow
                value={settings.autorechargeBelowMicros}
                disabled={saving}
                onChange={(v) => save({ autorecharge_below_micros: v })}
              />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Buy this much</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {CREDIT_PACKS.map((p) => (
                  <Chip
                    key={p.catalogKey}
                    selected={settings.autorechargePackKey === p.catalogKey}
                    disabled={saving}
                    onClick={() => save({ autorecharge_pack_key: p.catalogKey })}
                  >
                    ${(p.amountCents / 100).toLocaleString("en-US")}
                  </Chip>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.autorechargeEnabled && pack
                ? `We'll charge your saved card $${(pack.amountCents / 100).toLocaleString("en-US")} and tell you each time. Three declines in a row switches this off.`
                : "Charges the card you used to buy credits. Turns itself off after three failed charges."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ThresholdRow({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (micros: number) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {THRESHOLDS.map((t) => (
        <Chip key={t} selected={value === t} disabled={disabled} onClick={() => onChange(t)}>
          {usd(t)}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

/** A switch. Built here rather than pulled in, because it is the only one in the app and a
 *  checkbox styled as a track is twelve lines. */
function Toggle({
  on,
  disabled,
  label,
  onChange,
}: {
  on: boolean;
  disabled: boolean;
  label: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        on ? "border-foreground bg-foreground" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
