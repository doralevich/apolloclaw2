// What the agent says on an empty chat.
//
// It used to be one fixed line — "Hi, this is {agent}." / "What can I do for you?" — on every
// new chat forever. Something a person reads several times a day should not be the same string
// every time, and an assistant that introduces itself by name at every meeting sounds like it
// has never met you. So: greet the USER by name, name the agent only occasionally, and vary
// both halves.
//
// Rules the copy has to keep:
//   - Never promise a capability. The subline is an invitation, not a feature list — what the
//     agent can actually reach depends on which apps are connected, which the strip above it
//     handles. Nothing here should be falsifiable by a workspace with nothing connected.
//   - Never render an empty name. Every line below has a no-name form, because first_name is
//     user metadata and plenty of accounts won't have it.

export type Greeting = { headline: string; subline: string };

/** Time-of-day band for the greeting. Local to the reader's browser. */
function band(hour: number): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

// Headlines. Each is a function of the reader's first name (may be null) and the agent's name.
// `namesAgent` marks the ones that introduce the agent — those are drawn from rarely, so the
// introduction stays a nice touch instead of the thing it says every single time.
type HeadlineVariant = {
  build: (name: string | null, agent: string, hour: number) => string;
  namesAgent?: boolean;
};

const HEADLINES: HeadlineVariant[] = [
  { build: (n) => (n ? `Hi ${n}.` : "Hi there.") },
  { build: (n) => (n ? `Hey ${n}.` : "Hey there.") },
  { build: (n) => (n ? `Welcome back, ${n}.` : "Welcome back.") },
  {
    build: (n, _a, h) => {
      const greeting = `Good ${band(h)}`;
      return n ? `${greeting}, ${n}.` : `${greeting}.`;
    },
  },
  { build: (n) => (n ? `Ready when you are, ${n}.` : "Ready when you are.") },
  {
    namesAgent: true,
    build: (n, a) => (n ? `Hi ${n} - ${a} here.` : `Hi, this is ${a}.`),
  },
  {
    namesAgent: true,
    build: (n, a) => (n ? `${a} here, ${n}.` : `${a} here.`),
  },
];

// Sublines. Friendlier and more useful than "What can I do for you?" on its own, without
// claiming any particular app or power.
const SUBLINES: string[] = [
  "What can I do for you?",
  "What's on your plate today?",
  "Ask in your own words - there's no list of commands to learn.",
  "Tell me what you need and I'll work out the steps.",
  "Big or small - a quick question or a whole afternoon of work.",
  "Start anywhere. I'll ask if I need more.",
  "Give me the messy version. I'll sort it out.",
];

// How often the agent introduces itself by name. Roughly one chat in five: often enough that a
// new customer learns the name, rare enough that it never feels like a script.
const AGENT_INTRO_CHANCE = 0.2;

/**
 * One greeting, chosen fresh. Call this on the CLIENT only — it is deliberately random, and
 * running it during SSR would hand the browser a different string than it renders.
 *
 * @param hour local hour, 0-23, for the time-of-day variants.
 */
export function pickGreeting({
  userName,
  agentName,
  hour,
  random = Math.random,
}: {
  userName: string | null;
  /** Null when the agent has no name yet — the intro variants are skipped rather than saying
   *  something like "your agent here." */
  agentName: string | null;
  hour: number;
  /** Injectable for tests; defaults to Math.random. */
  random?: () => number;
}): Greeting {
  const introduce = !!agentName && random() < AGENT_INTRO_CHANCE;
  const pool = HEADLINES.filter((h) => !!h.namesAgent === introduce);
  const headline = pool[Math.floor(random() * pool.length)] ?? HEADLINES[0];
  const subline = SUBLINES[Math.floor(random() * SUBLINES.length)] ?? SUBLINES[0];
  return { headline: headline.build(userName, agentName ?? "", hour), subline };
}

/**
 * The reader's first name, for greeting them by it.
 *
 * Checkout writes `first_name` into Supabase auth user metadata, so that is the good answer.
 * Accounts created another way won't have it, and the fallback is the email's local part — but
 * only when it plausibly reads as a name. "daveo@..." becomes "Daveo"; "info@", "admin@",
 * "sales.team.2024@" and anything with digits get nothing, because "Hi Info2024." is worse than
 * "Hi there."
 */
export function displayFirstName(
  metadata: Record<string, unknown> | null | undefined,
  email: string | null | undefined
): string | null {
  const meta = metadata ?? {};
  const fromMeta =
    pickString(meta.first_name) ??
    pickString(meta.given_name) ??
    pickString(meta.full_name)?.split(/\s+/)[0] ??
    pickString(meta.name)?.split(/\s+/)[0];
  if (fromMeta) return capitalize(fromMeta);

  const local = (email ?? "").split("@")[0]?.trim() ?? "";
  // Take the first segment of a dotted/underscored address, then insist it looks like a name:
  // letters only, and long enough not to be initials.
  const first = local.split(/[._\-+]/)[0] ?? "";
  if (!/^[a-zA-Z]{3,}$/.test(first)) return null;
  if (ROLE_ADDRESSES.has(first.toLowerCase())) return null;
  return capitalize(first);
}

// Shared mailboxes: a person is not reading these, and if one is, they aren't named "Support".
const ROLE_ADDRESSES = new Set([
  "info",
  "admin",
  "sales",
  "support",
  "hello",
  "contact",
  "team",
  "office",
  "billing",
  "accounts",
  "help",
  "noreply",
  "no",
]);

function pickString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
