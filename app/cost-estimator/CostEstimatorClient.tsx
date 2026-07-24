"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  GitBranch,
  Activity,
  MessageSquare,
  Search,
  Code2,
  Heart,
  Clock,
  Network,
  BarChart3,
  ArrowLeftRight,
  Lightbulb,
  Sparkles,
  Zap,
  Check,
  User,
  Users,
  Headphones,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Model = {
  id: string;
  name: string;
  provider: string;
  in: number; // USD per 1M input tokens
  out: number; // USD per 1M output tokens
};

const MODELS: Model[] = [
  { id: "claude-opus-4-7", provider: "Anthropic", name: "Claude Opus 4.7", in: 5, out: 25 },
  { id: "claude-opus-4-6", provider: "Anthropic", name: "Claude Opus 4.6", in: 5, out: 25 },
  { id: "claude-opus-4-5", provider: "Anthropic", name: "Claude Opus 4.5", in: 5, out: 25 },
  { id: "claude-sonnet-4-6", provider: "Anthropic", name: "Claude Sonnet 4.6", in: 3, out: 15 },
  { id: "claude-sonnet-4-5", provider: "Anthropic", name: "Claude Sonnet 4.5", in: 3, out: 15 },
  { id: "claude-haiku-4-5", provider: "Anthropic", name: "Claude Haiku 4.5", in: 1, out: 5 },

  { id: "gpt-5-2-pro", provider: "OpenAI", name: "GPT-5.2 Pro", in: 21, out: 168 },
  { id: "gpt-5-2", provider: "OpenAI", name: "GPT-5.2", in: 1.75, out: 14 },
  { id: "gpt-5", provider: "OpenAI", name: "GPT-5", in: 1.25, out: 10 },
  { id: "gpt-5-mini", provider: "OpenAI", name: "GPT-5 Mini", in: 0.25, out: 2 },
  { id: "gpt-5-nano", provider: "OpenAI", name: "GPT-5 Nano", in: 0.05, out: 0.4 },
  { id: "gpt-4-1", provider: "OpenAI", name: "GPT-4.1", in: 2, out: 8 },
  { id: "gpt-4-1-mini", provider: "OpenAI", name: "GPT-4.1 mini", in: 0.4, out: 1.6 },
  { id: "gpt-4-1-nano", provider: "OpenAI", name: "GPT-4.1 nano", in: 0.1, out: 0.4 },

  { id: "o3", provider: "OpenAI Reasoning", name: "o3", in: 2, out: 8 },
  { id: "o3-pro", provider: "OpenAI Reasoning", name: "o3-pro", in: 20, out: 80 },
  { id: "o4-mini", provider: "OpenAI Reasoning", name: "o4-mini", in: 1.1, out: 4.4 },

  { id: "gemini-2-5-pro", provider: "Google", name: "Gemini 2.5 Pro", in: 1.25, out: 10 },
  { id: "gemini-2-5-flash", provider: "Google", name: "Gemini 2.5 Flash", in: 0.3, out: 2.5 },
  { id: "gemini-2-0-flash", provider: "Google", name: "Gemini 2.0 Flash", in: 0.1, out: 0.4 },

  { id: "deepseek-v3-2", provider: "DeepSeek", name: "DeepSeek V3.2", in: 0.28, out: 0.42 },
  { id: "deepseek-r1", provider: "DeepSeek", name: "DeepSeek R1", in: 0.5, out: 2.18 },

  { id: "grok-4", provider: "Grok", name: "Grok 4", in: 3, out: 15 },
  { id: "grok-4-1-fast", provider: "Grok", name: "Grok 4.1 Fast", in: 0.2, out: 0.5 },

  { id: "kimi-k2-5", provider: "Other", name: "Kimi K2.5", in: 0.6, out: 2 },
  { id: "qwen-3-5-plus", provider: "Other", name: "Qwen 3.5 Plus", in: 0.11, out: 0.44 },
  { id: "qwen-3-5-flash", provider: "Other", name: "Qwen 3.5 Flash", in: 0.1, out: 0.4 },
  { id: "mistral-large-3", provider: "Other", name: "Mistral Large 3", in: 2, out: 6 },
  { id: "mistral-medium-3", provider: "Other", name: "Mistral Medium 3", in: 0.4, out: 2 },
  { id: "llama-4-scout", provider: "Other", name: "Llama 4 Scout", in: 0.17, out: 0.17 },
  { id: "llama-4-maverick", provider: "Other", name: "Llama 4 Maverick", in: 0.27, out: 0.85 },
];

const PROVIDER_ORDER = [
  "Anthropic",
  "OpenAI",
  "OpenAI Reasoning",
  "Google",
  "DeepSeek",
  "Grok",
  "Other",
];

// Per-event token assumptions (input / output) and which role pays for them
type Role = "main" | "sub" | "heartbeat";
type EventKey =
  | "conversation"
  | "research"
  | "coding"
  | "heartbeat"
  | "cron"
  | "subagent";

const EVENT_PROFILE: Record<EventKey, { in: number; out: number; role: Role }> = {
  conversation: { in: 6000, out: 2000, role: "main" },
  research: { in: 30000, out: 6000, role: "main" },
  coding: { in: 60000, out: 10000, role: "main" },
  heartbeat: { in: 1000, out: 400, role: "heartbeat" },
  cron: { in: 10000, out: 2500, role: "main" },
  subagent: { in: 20000, out: 5000, role: "sub" },
};

const DEFAULT_USAGE: Record<EventKey, number> = {
  conversation: 20,
  research: 3,
  coding: 2,
  heartbeat: 20,
  cron: 5,
  subagent: 3,
};

const OPTIMIZED_SUB = "gemini-2-5-flash";
const OPTIMIZED_HEARTBEAT = "gpt-5-nano";

const EVENT_META: Record<
  EventKey,
  { label: string; color: string }
> = {
  conversation: { label: "Conversations", color: "hsl(0 68% 51%)" },
  research: { label: "Research", color: "hsl(217 91% 50%)" },
  coding: { label: "Coding", color: "hsl(280 65% 55%)" },
  heartbeat: { label: "Heartbeats", color: "hsl(35 85% 55%)" },
  cron: { label: "Cron", color: "hsl(160 60% 45%)" },
  subagent: { label: "Sub-agents", color: "hsl(0 0% 35%)" },
};

type Preset = {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  main: string;
  sub: string;
  hb: string;
  usage: Record<EventKey, number>;
  caching: boolean;
  batchCron: boolean;
};

const PRESETS: Preset[] = [
  {
    id: "solo",
    label: "Solo Founder",
    desc: "One operator, a few daily threads, occasional research.",
    icon: User,
    main: "claude-sonnet-4-6",
    sub: "claude-haiku-4-5",
    hb: "__same__",
    usage: { conversation: 8, research: 2, coding: 1, heartbeat: 5, cron: 2, subagent: 1 },
    caching: true,
    batchCron: false,
  },
  {
    id: "team",
    label: "5-Person Team",
    desc: "Small team running ops, research, and code through AI daily.",
    icon: Users,
    main: "claude-sonnet-4-6",
    sub: "claude-haiku-4-5",
    hb: "__same__",
    usage: { conversation: 100, research: 12, coding: 20, heartbeat: 60, cron: 15, subagent: 15 },
    caching: true,
    batchCron: false,
  },
  {
    id: "support",
    label: "Support Desk",
    desc: "High-volume customer chat. Cheap models, batchable scheduled work.",
    icon: Headphones,
    main: "claude-haiku-4-5",
    sub: "claude-haiku-4-5",
    hb: "__same__",
    usage: { conversation: 500, research: 0, coding: 0, heartbeat: 120, cron: 30, subagent: 0 },
    caching: true,
    batchCron: true,
  },
];

const findModel = (id: string): Model =>
  MODELS.find((m) => m.id === id) ?? MODELS[0];

const fmtPrice = (n: number) =>
  n >= 1 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtUSDWhole = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

type Breakdown = { total: number; byEvent: Record<EventKey, number> };

function dailyBreakdown(
  usage: Record<EventKey, number>,
  mainId: string,
  subId: string,
  hbId: string,
  caching: boolean,
  batchCron: boolean,
): Breakdown {
  const m = findModel(mainId);
  const s = findModel(subId);
  const h = findModel(hbId);
  const roleModel: Record<Role, Model> = { main: m, sub: s, heartbeat: h };

  // Prompt caching: assumes ~70% of input is reused → 0.7·0.1x + 0.3·1x ≈ 0.37x input cost
  const inputMult = caching ? 0.37 : 1;

  const byEvent = {} as Record<EventKey, number>;
  let total = 0;
  for (const key of Object.keys(EVENT_PROFILE) as EventKey[]) {
    const p = EVENT_PROFILE[key];
    const rm = roleModel[p.role];
    let perEvent = (p.in * rm.in * inputMult + p.out * rm.out) / 1_000_000;
    if (batchCron && key === "cron") perEvent *= 0.5;
    const eventTotal = usage[key] * perEvent;
    byEvent[key] = eventTotal;
    total += eventTotal;
  }
  return { total, byEvent };
}

function ModelSelect({
  id,
  value,
  onChange,
  allowSameAsMain,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  allowSameAsMain?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 rounded-full border border-border bg-background px-4 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all appearance-none cursor-pointer"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path fill='none' stroke='%23999' stroke-width='1.5' d='M2.5 4.5l3.5 3.5 3.5-3.5'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
        paddingRight: "2.5rem",
      }}
    >
      {allowSameAsMain && <option value="__same__">Same as Main Agent</option>}
      {PROVIDER_ORDER.map((provider) => (
        <optgroup key={provider} label={provider}>
          {MODELS.filter((m) => m.provider === provider).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}: {fmtPrice(m.in)} / {fmtPrice(m.out)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function UsageField({
  id,
  label,
  description,
  value,
  onChange,
  icon: Icon,
  max,
}: {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (n: number) => void;
  icon: React.ComponentType<{ className?: string }>;
  max: number;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-2 font-body text-sm text-foreground"
        >
          <Icon className="size-4 text-primary" />
          {label}
        </label>
        <span className="font-mono text-sm text-foreground tabular-nums rounded-full bg-card-elevated border border-border px-2.5 py-0.5 min-w-[3rem] text-center">
          {value}
        </span>
      </div>
      <p className="font-body text-xs text-muted-foreground leading-snug">
        {description}
      </p>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="apollo-range w-full"
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-muted) ${pct}%, var(--color-muted) 100%)`,
        }}
      />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-subtle">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function CostEstimatorClient() {
  const [main, setMain] = useState("claude-sonnet-4-6");
  const [sub, setSub] = useState("claude-haiku-4-5");
  const [hbRaw, setHbRaw] = useState<string>("__same__");
  const [usage, setUsage] = useState<Record<EventKey, number>>(DEFAULT_USAGE);
  const [whatIf, setWhatIf] = useState(false);
  const [caching, setCaching] = useState(false);
  const [batchCron, setBatchCron] = useState(false);
  const [showMath, setShowMath] = useState(false);

  const hb = hbRaw === "__same__" ? main : hbRaw;

  const currentBreakdown = useMemo(
    () => dailyBreakdown(usage, main, sub, hb, caching, batchCron),
    [usage, main, sub, hb, caching, batchCron],
  );
  const current = currentBreakdown.total * 30;

  const optimized = useMemo(
    () =>
      dailyBreakdown(
        usage,
        main,
        OPTIMIZED_SUB,
        OPTIMIZED_HEARTBEAT,
        caching,
        batchCron,
      ).total * 30,
    [usage, main, caching, batchCron],
  );
  const savings = Math.max(0, current - optimized);
  const savingsPct = current > 0 ? (savings / current) * 100 : 0;

  const monthlyByEvent = (Object.entries(currentBreakdown.byEvent) as [
    EventKey,
    number,
  ][])
    .map(([k, v]) => ({ key: k, monthly: v * 30 }))
    .sort((a, b) => b.monthly - a.monthly);
  const breakdownTotal = monthlyByEvent.reduce((s, e) => s + e.monthly, 0);

  const applyPreset = (p: Preset) => {
    setMain(p.main);
    setSub(p.sub);
    setHbRaw(p.hb);
    setUsage(p.usage);
    setCaching(p.caching);
    setBatchCron(p.batchCron);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Big cost display */}
      <div className="bauhaus-card !p-10 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Estimated Monthly Cost
        </span>
        <div className="font-display text-6xl md:text-7xl text-foreground mt-3 mb-2 tabular-nums">
          {fmtUSDWhole(current)}
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Based on your usage below
        </p>
      </div>

      {/* Model selection */}
      <div className="bauhaus-card">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="size-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Model Selection</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="model-main"
              className="flex items-center gap-2 font-body text-sm text-foreground"
            >
              <Bot className="size-4 text-primary" />
              Main Agent
            </label>
            <ModelSelect id="model-main" value={main} onChange={setMain} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle">
              Drives conversations, research, coding, cron
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="model-sub"
              className="flex items-center gap-2 font-body text-sm text-foreground"
            >
              <GitBranch className="size-4 text-primary" />
              Sub-Agent
            </label>
            <ModelSelect id="model-sub" value={sub} onChange={setSub} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle">
              Spawned for delegated tasks
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="model-hb"
              className="flex items-center gap-2 font-body text-sm text-foreground"
            >
              <Activity className="size-4 text-primary" />
              Heartbeat
            </label>
            <ModelSelect
              id="model-hb"
              value={hbRaw}
              onChange={setHbRaw}
              allowSameAsMain
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle">
              Lightweight check-ins
            </span>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle mt-6">
          Prices shown per 1M tokens · Input / Output
        </p>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="size-4 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground">
              Optimizations
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCaching((v) => !v)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                caching
                  ? "border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20"
                  : "border-border bg-card-elevated hover:border-muted-foreground/30"
              }`}
            >
              <span
                className={`mt-0.5 size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                  caching
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40 bg-transparent"
                }`}
              >
                {caching && <Check className="size-3 text-primary-foreground" />}
              </span>
              <span className="flex-1">
                <span className="block font-body text-sm text-foreground font-medium">
                  Prompt caching enabled
                </span>
                <span className="block font-body text-xs text-muted-foreground mt-0.5">
                  ~63% off input tokens. Assumes ~70% cache-hit rate on stable
                  system prompts, typical for production agents.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBatchCron((v) => !v)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                batchCron
                  ? "border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20"
                  : "border-border bg-card-elevated hover:border-muted-foreground/30"
              }`}
            >
              <span
                className={`mt-0.5 size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                  batchCron
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40 bg-transparent"
                }`}
              >
                {batchCron && <Check className="size-3 text-primary-foreground" />}
              </span>
              <span className="flex-1">
                <span className="block font-body text-sm text-foreground font-medium">
                  Run cron jobs via Batch API
                </span>
                <span className="block font-body text-xs text-muted-foreground mt-0.5">
                  50% off scheduled background jobs. Works for any async
                  workflow that doesn&apos;t need a real-time response.
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage inputs */}
      <div className="bauhaus-card">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="font-display text-xl text-foreground">Daily Usage</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle mr-1">
              Start from:
            </span>
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  title={p.desc}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card-elevated px-3 py-1.5 font-body text-xs text-foreground hover:border-primary/40 hover:bg-primary/[0.04] transition-all"
                >
                  <Icon className="size-3.5 text-primary" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <UsageField
            id="u-conv"
            label="Daily Conversations"
            description="Back-and-forth chats your agent handles each day: customer questions, internal pings, anything that looks like a thread."
            value={usage.conversation}
            onChange={(n) => setUsage((u) => ({ ...u, conversation: n }))}
            icon={MessageSquare}
            max={1000}
          />
          <UsageField
            id="u-research"
            label="Research Tasks"
            description="Heavier jobs where the agent gathers, reads, and summarizes information: competitor scans, market briefs, prospect digs."
            value={usage.research}
            onChange={(n) => setUsage((u) => ({ ...u, research: n }))}
            icon={Search}
            max={200}
          />
          <UsageField
            id="u-coding"
            label="Coding Sessions"
            description="Sessions where the agent writes, edits, or reviews code. Long context windows make these the most expensive runs."
            value={usage.coding}
            onChange={(n) => setUsage((u) => ({ ...u, coding: n }))}
            icon={Code2}
            max={150}
          />
          <UsageField
            id="u-hb"
            label="Heartbeats/Day"
            description="Tiny scheduled pings that keep the agent awake and watching for triggers. Small individually, big in aggregate."
            value={usage.heartbeat}
            onChange={(n) => setUsage((u) => ({ ...u, heartbeat: n }))}
            icon={Heart}
            max={2000}
          />
          <UsageField
            id="u-cron"
            label="Cron Jobs"
            description="Scheduled background runs: daily reports, nightly syncs, weekly cleanups. Predictable and easy to budget for."
            value={usage.cron}
            onChange={(n) => setUsage((u) => ({ ...u, cron: n }))}
            icon={Clock}
            max={500}
          />
          <UsageField
            id="u-sub"
            label="Sub-agent Spawns"
            description="Times the main agent delegates work to a specialist sub-agent. Use a cheaper model here without sacrificing main-agent quality."
            value={usage.subagent}
            onChange={(n) => setUsage((u) => ({ ...u, subagent: n }))}
            icon={Network}
            max={300}
          />
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="bauhaus-card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-primary" />
            <h2 className="font-display text-xl text-foreground">Cost Breakdown</h2>
          </div>
          <Button
            variant={whatIf ? "cta" : "cta-outline"}
            size="sm"
            onClick={() => setWhatIf((v) => !v)}
          >
            {whatIf ? "Hide What If?" : "What If?"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card-elevated p-6">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Current Setup
            </span>
            <div className="font-display text-3xl text-foreground mt-2 tabular-nums">
              {fmtUSDWhole(current)}
              <span className="font-body text-sm text-muted-foreground font-normal">
                {" "}
                /mo
              </span>
            </div>
            <div className="font-body text-xs text-muted-foreground mt-2">
              Main {findModel(main).name} · Sub {findModel(sub).name} · Heartbeat{" "}
              {findModel(hb).name}
            </div>
          </div>

          <div
            className={`rounded-2xl p-6 border transition-all ${
              whatIf
                ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                : "border-border bg-card-elevated"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Optimized Setup
            </span>
            <div className="font-display text-3xl text-foreground mt-2 tabular-nums">
              {fmtUSDWhole(optimized)}
              <span className="font-body text-sm text-muted-foreground font-normal">
                {" "}
                /mo
              </span>
            </div>
            <div className="font-body text-xs text-muted-foreground mt-2">
              Sub-agents on Flash, Heartbeats on Nano
            </div>
            {savings > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                  Save {fmtUSD(savings)}/mo ({savingsPct.toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {whatIf && (
          <div className="mt-6 rounded-2xl border border-border bg-surface-purple p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-display text-base text-foreground mb-2">
                  Why this works
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  Heartbeats are tiny, frequent pings; a nano-class model handles
                  them for pennies. Sub-agents do bursty delegated work where a
                  Flash-tier model gives you 90% of the quality at a fraction of
                  the cost. Keep your premium model on the Main Agent where
                  reasoning quality matters.
                </p>
              </div>
            </div>
          </div>
        )}

        {breakdownTotal > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Where the money goes
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-subtle">
                Monthly
              </span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full border border-border bg-card-elevated">
              {monthlyByEvent.map(({ key, monthly }) => {
                const pct = (monthly / breakdownTotal) * 100;
                if (pct < 0.5) return null;
                return (
                  <div
                    key={key}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: EVENT_META[key].color,
                    }}
                    title={`${EVENT_META[key].label}: ${fmtUSD(monthly)} (${pct.toFixed(0)}%)`}
                  />
                );
              })}
            </div>
            <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card-elevated overflow-hidden">
              {monthlyByEvent.map(({ key, monthly }) => {
                const pct = breakdownTotal > 0 ? (monthly / breakdownTotal) * 100 : 0;
                return (
                  <li
                    key={key}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span
                      className="inline-block size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: EVENT_META[key].color }}
                    />
                    <span className="flex-1 font-body text-sm text-foreground">
                      {EVENT_META[key].label}
                    </span>
                    <span className="font-mono tabular-nums text-sm text-foreground w-20 text-right">
                      {fmtUSD(monthly)}
                    </span>
                    <span className="font-mono tabular-nums text-sm text-muted-foreground w-12 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowMath((v) => !v)}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                {showMath ? "Hide" : "How is this calculated?"}
                <span className="text-base leading-none">
                  {showMath ? "–" : "+"}
                </span>
              </button>
              {showMath && (
                <div className="mt-4 rounded-2xl border border-border bg-surface-purple p-6">
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Each event type assumes a typical input/output token spend
                    per occurrence. We multiply by your daily count, apply your
                    selected model&apos;s rates, then scale to a 30-day month.
                    Caching reduces input cost; Batch API halves the cron line.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full">
                      <thead className="bg-card-elevated">
                        <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2 text-left">Event</th>
                          <th className="px-4 py-2 text-right">Input tokens</th>
                          <th className="px-4 py-2 text-right">Output tokens</th>
                          <th className="px-4 py-2 text-left">Billed to</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {(Object.keys(EVENT_PROFILE) as EventKey[]).map((k) => {
                          const p = EVENT_PROFILE[k];
                          return (
                            <tr
                              key={k}
                              className="font-body text-sm text-foreground"
                            >
                              <td className="px-4 py-2.5">
                                {EVENT_META[k].label}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                {p.in.toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                {p.out.toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 capitalize text-muted-foreground">
                                {p.role === "heartbeat"
                                  ? "Heartbeat"
                                  : p.role === "sub"
                                    ? "Sub-Agent"
                                    : "Main Agent"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle mt-4">
                    Industry averages: your real numbers from API logs will be
                    more accurate.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Glossary */}
      <div className="bauhaus-card">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="size-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Glossary</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {[
            {
              term: "Token",
              def: "A chunk of text the model reads or writes. Roughly 4 characters or three-quarters of a word in English. “Hello, world!” is about 4 tokens.",
            },
            {
              term: "Input Tokens",
              def: "Everything you send the model: your message, the system prompt, conversation history, tool definitions, and any documents in context. Priced lower than output.",
            },
            {
              term: "Output Tokens",
              def: "Everything the model generates back. Usually 3–5× the price of input tokens because generation is more compute-intensive than reading.",
            },
            {
              term: "MTok",
              def: "Short for one million tokens. Pricing is shown per MTok: e.g., “$3 / MTok” means $3 per million input tokens.",
            },
            {
              term: "Prompt Caching",
              def: "Storing the unchanging part of your prompt (system instructions, long documents) so the model skips re-processing it on every request. Cuts the input bill by ~90% on the cached portion.",
            },
            {
              term: "Context Window",
              def: "The maximum number of tokens a model can consider at one time. Bigger window = handles longer threads and larger documents, but more tokens billed per call.",
            },
            {
              term: "Main Agent",
              def: "The primary model your assistant uses for user-facing work: conversations, research, coding. Quality matters most here.",
            },
            {
              term: "Sub-Agent",
              def: "A secondary model the main agent delegates narrower tasks to. Usually a cheaper model since the work is bounded and well-defined.",
            },
            {
              term: "Heartbeat",
              def: "A lightweight scheduled ping that keeps an agent loop alive between user inputs. Small per-call, but adds up at scale.",
            },
            {
              term: "Cron Job",
              def: "A task that runs automatically on a schedule: hourly, daily, weekly. Named after the Unix cron utility.",
            },
            {
              term: "Batch API",
              def: "A discounted lane for non-realtime work. Submit a batch, get results within 24 hours, pay 50% less. Great for nightly jobs and back-office automation.",
            },
            {
              term: "Sub-Agent Spawn",
              def: "Each time the main agent kicks off a sub-agent to handle a specific task. One spawn = one delegated job.",
            },
          ].map(({ term, def }) => (
            <div key={term}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary mb-1">
                {term}
              </dt>
              <dd className="font-body text-sm text-muted-foreground leading-relaxed">
                {def}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Lead-gen CTA */}
      <div className="bauhaus-card border-primary/30 ring-1 ring-primary/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <span className="pill-badge mb-3">Talk to Apollo Claw</span>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2 leading-tight">
              Spending more than you&apos;d like?
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground">
              We&apos;ve cut client AI bills <span className="text-primary font-medium">40-70%</span>{" "}
              through smarter model routing, prompt caching, and right-sizing
              every agent for the job. Book a 30-minute discovery call and
              we&apos;ll show you exactly where the savings are.
            </p>
          </div>
          <a
            href="https://calendly.com/therealdaveo/apolloai"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="cta" size="lg">
              Schedule Today
              <ArrowRight className="size-4" />
            </Button>
          </a>
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-subtle text-center">
        Estimates only. Real costs depend on your actual token usage and provider rates.
      </p>
    </div>
  );
}
