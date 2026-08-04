#!/usr/bin/env node
/**
 * Does a Telegram message actually reach the agent, and does the agent answer back?
 *
 * This is the one question the Channels feature rests on and the one thing that cannot be
 * answered from the repo. Hermes receives webhooks on port 8644 and authenticates deliveries
 * with its own subscription signature; Telegram authenticates with a `secret_token` it echoes in
 * a header. If those two schemes don't line up, Hermes rejects everything Telegram sends and the
 * feature is dead no matter how good the UI is.
 *
 * Run this against a THROWAWAY bot before switching Channels on. It does exactly what the
 * dashboard's connect button does, then reports what Telegram saw.
 *
 * Usage:
 *   AGENT37_API_KEY=sk_live_... \
 *   INSTANCE_ID=ab12cd34ef \
 *   BOT_TOKEN=123456:ABC-DEF... \
 *   SUBSCRIPTION=telegram \
 *   SIGNING_SECRET=whatever-hermes-showed-you \
 *   node scripts/test-telegram-channel.mjs
 *
 * Then message the bot, wait a few seconds, and run it again with CHECK=1 to see whether the
 * delivery landed:
 *
 *   BOT_TOKEN=... CHECK=1 node scripts/test-telegram-channel.mjs
 *
 * Clean up afterwards with CLEANUP=1, which unhooks the bot and deletes the public port.
 */

const API = process.env.AGENT37_API_BASE_URL || "https://api.agent37.com";
const KEY = process.env.AGENT37_API_KEY;
const INSTANCE = process.env.INSTANCE_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUBSCRIPTION = process.env.SUBSCRIPTION || "telegram";
const SIGNING_SECRET = process.env.SIGNING_SECRET || "";
const PORT = 8644;
const PREFIX = "webhooks";

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

async function agent37(path, init) {
  const res = await fetch(`${API}/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

async function telegram(method, params) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params || {}),
  });
  return res.json();
}

// ── CHECK: did the delivery land? ────────────────────────────────────────────────────────────
if (process.env.CHECK) {
  if (!BOT_TOKEN) die("BOT_TOKEN is required");
  const info = await telegram("getWebhookInfo");
  if (!info.ok) die(`Telegram: ${info.description}`);
  const r = info.result;
  console.log(`\nWebhook URL:            ${r.url || "(none)"}`);
  console.log(`Pending updates:        ${r.pending_update_count ?? 0}`);
  console.log(`Last error:             ${r.last_error_message || "(none)"}`);
  if (r.last_error_date) console.log(`Last error at:          ${new Date(r.last_error_date * 1000).toISOString()}`);

  console.log("");
  if (r.last_error_message) {
    console.log("✗ Hermes is REJECTING Telegram's deliveries.");
    console.log("  The message above is the answer — send it to Claude. A 401/403 means the two");
    console.log("  authentication schemes don't line up and something has to translate between");
    console.log("  them. A 404 means the subscription path is wrong.");
  } else if ((r.pending_update_count ?? 0) > 0) {
    console.log("~ Updates are queued but not delivered yet. Wait a moment and re-run.");
  } else if (r.url) {
    console.log("✓ Telegram reports no delivery errors.");
    console.log("  If the agent also REPLIED in Telegram, the whole path works — turn Channels on.");
    console.log("  If it stayed silent, delivery is fine but Hermes isn't routing the message to");
    console.log("  the agent or isn't sending the answer back. That's Hermes-side config.");
  } else {
    console.log("✗ No webhook is set on this bot. Run the script without CHECK first.");
  }
  process.exit(0);
}

// ── CLEANUP ──────────────────────────────────────────────────────────────────────────────────
if (process.env.CLEANUP) {
  if (BOT_TOKEN) {
    const d = await telegram("deleteWebhook", { drop_pending_updates: true });
    console.log(`deleteWebhook: ${d.ok ? "ok" : d.description}`);
  }
  if (KEY && INSTANCE) {
    const r = await agent37(`/instances/${INSTANCE}/public-ports/${PORT}`, { method: "DELETE" });
    console.log(`delete public port: ${r.status} ${JSON.stringify(r.body)}`);
  }
  process.exit(0);
}

// ── SET UP ───────────────────────────────────────────────────────────────────────────────────
if (!KEY) die("AGENT37_API_KEY is required");
if (!INSTANCE) die("INSTANCE_ID is required");
if (!BOT_TOKEN) die("BOT_TOKEN is required");

console.log("\n1. Checking the bot token...");
const me = await telegram("getMe");
if (!me.ok) die(`Telegram rejected the token: ${me.description}`);
console.log(`   ✓ @${me.result.username}`);

console.log("\n2. Giving port 8644 a public URL...");
let origin;
const created = await agent37(`/instances/${INSTANCE}/public-ports`, {
  method: "POST",
  body: JSON.stringify({ port: PORT, prefix: PREFIX }),
});
if (created.status === 409) {
  const list = await agent37(`/instances/${INSTANCE}/public-ports`);
  const existing = (list.body?.data || []).find((p) => p.port === PORT);
  if (!existing) die(`409 from create, but no existing entry for ${PORT}: ${JSON.stringify(list.body)}`);
  origin = existing.url;
  console.log(`   ✓ reusing existing entry: ${origin}`);
} else if (created.status >= 200 && created.status < 300) {
  origin = created.body.url;
  console.log(`   ✓ created: ${origin}`);
} else {
  die(`create public port failed: ${created.status} ${JSON.stringify(created.body)}`);
}

const url = `${origin.replace(/\/$/, "")}/webhooks/${encodeURIComponent(SUBSCRIPTION)}`;

console.log("\n3. Pointing the bot at it...");
if (!SIGNING_SECRET) {
  console.log("   ! SIGNING_SECRET not set — sending without secret_token. If Hermes requires a");
  console.log("     signature this will fail, which is itself a useful result.");
}
const hook = await telegram("setWebhook", {
  url,
  ...(SIGNING_SECRET ? { secret_token: SIGNING_SECRET } : {}),
  allowed_updates: ["message"],
  drop_pending_updates: true,
});
if (!hook.ok) die(`setWebhook failed: ${hook.description}`);
console.log(`   ✓ ${url}`);

console.log(`
──────────────────────────────────────────────────────────────────
Now message @${me.result.username} in Telegram, wait ~10 seconds, then run:

  BOT_TOKEN=$BOT_TOKEN CHECK=1 node scripts/test-telegram-channel.mjs

Two things to watch:
  • Does the agent REPLY in Telegram?  (the whole path works)
  • What does CHECK report?            (whether Hermes accepted the delivery)

Clean up with:
  BOT_TOKEN=$BOT_TOKEN INSTANCE_ID=$INSTANCE_ID AGENT37_API_KEY=... CLEANUP=1 \\
    node scripts/test-telegram-channel.mjs
──────────────────────────────────────────────────────────────────
`);
