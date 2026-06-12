#!/usr/bin/env node
/**
 * apollo-setup-followup.mjs
 * 
 * Cron job: runs every 30 minutes.
 * 
 * Finds all pipeline deals where:
 *   - stage = 'onboarding'
 *   - onboarding_status = 'awaiting_step2'
 *   - proposal_sent_at IS NULL  (not yet sent — this field doubles as "setup_link_sent_at")
 *   - created_at is at least 15 minutes ago
 * 
 * For each match:
 *   1. Sends the Mandrill 'apolloclaw-setup-link' template to the prospect
 *   2. Sets proposal_sent_at = NOW() to mark email as sent
 *      (prevents duplicate sends on next cron run)
 * 
 * If the status update fails, the email is NOT counted as sent and
 * will be retried on the next cron run.
 * 
 * NOTE: The pipeline_deals_onboarding_status_check constraint restricts
 * onboarding_status to: awaiting_step1 | awaiting_step2 | deployment_ready
 * We track "setup link sent" state via proposal_sent_at instead of a separate
 * status value, to avoid needing a schema migration.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local from the apolloclaw app ────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, ".env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (err) {
    console.error("[setup-followup] Could not load .env.local:", err.message);
    process.exit(1);
  }
}

loadEnv();

const SUPA_URL     = process.env.SUPABASE_URL;
const SUPA_KEY     = process.env.SUPABASE_SERVICE_KEY;
const MANDRILL_KEY = process.env.MANDRILL_API_KEY;
const BCC_EMAIL    = "david@apolloclaw.ai";

if (!SUPA_URL || !SUPA_KEY) {
  console.error("[setup-followup] SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Aborting.");
  process.exit(1);
}
if (!MANDRILL_KEY) {
  console.error("[setup-followup] MANDRILL_API_KEY not set. Aborting.");
  process.exit(1);
}

const supaHeaders = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// ── Fetch deals awaiting step 2 for 15+ minutes, not yet emailed ──────────────
async function fetchEligibleDeals() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  // proposal_sent_at IS NULL means we haven't sent the setup link yet
  const url = `${SUPA_URL}/rest/v1/pipeline_deals`
    + `?stage=eq.onboarding`
    + `&onboarding_status=eq.awaiting_step2`
    + `&proposal_sent_at=is.null`
    + `&created_at=lt.${encodeURIComponent(cutoff)}`
    + `&select=id,client_name,contact_email,created_at`;

  const res = await fetch(url, { headers: supaHeaders });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase fetch failed (${res.status}): ${txt}`);
  }
  return res.json();
}

// ── Send setup link via Mandrill template ─────────────────────────────────────
async function sendSetupEmail(email, name) {
  const res = await fetch("https://mandrillapp.com/api/1.0/messages/send-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: MANDRILL_KEY,
      template_name: "apolloclaw-setup-link",
      template_content: [],
      message: {
        from_email: "hello@apolloclaw.ai",
        from_name: "Apollo[Claw]",
        to: [{ email, name: name || email, type: "to" }],
        bcc_address: BCC_EMAIL,
        subject: "Last step: complete your Technical Setup — Apollo[Claw]",
        important: true,
      },
    }),
  });

  const result = await res.json();
  if (!Array.isArray(result)) {
    throw new Error(`Mandrill unexpected response: ${JSON.stringify(result)}`);
  }
  const status = result[0]?.status;
  if (status !== "sent" && status !== "queued") {
    throw new Error(`Mandrill rejected: status=${status} — ${JSON.stringify(result[0])}`);
  }
  return status;
}

// ── Mark deal as sent (set proposal_sent_at = NOW()) ─────────────────────────
// proposal_sent_at is repurposed as "setup_link_sent_at" for the onboarding stage.
// This avoids needing a schema migration while providing idempotent deduplication.
async function markSent(dealId) {
  const sentAt = new Date().toISOString();
  const res = await fetch(
    `${SUPA_URL}/rest/v1/pipeline_deals?id=eq.${dealId}`,
    {
      method: "PATCH",
      headers: { ...supaHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        proposal_sent_at: sentAt,
        updated_at: sentAt,
      }),
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Status update failed (${res.status}): ${txt}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[setup-followup] Starting run at ${startedAt}`);

  let deals;
  try {
    deals = await fetchEligibleDeals();
  } catch (err) {
    console.error("[setup-followup] Failed to fetch eligible deals:", err.message);
    process.exit(1);
  }

  console.log(`[setup-followup] Found ${deals.length} eligible deal(s)`);
  if (deals.length === 0) {
    console.log("[setup-followup] Nothing to do.");
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const deal of deals) {
    const { id, client_name, contact_email, created_at } = deal;
    const ageMin = Math.round((Date.now() - new Date(created_at).getTime()) / 60000);
    console.log(`[setup-followup] Processing: ${contact_email} (${client_name}) — ${ageMin}m old`);

    // Step 1: Send email
    let emailStatus;
    try {
      emailStatus = await sendSetupEmail(contact_email, client_name);
      console.log(`[setup-followup] ✓ Email sent to ${contact_email} (${emailStatus})`);
    } catch (err) {
      console.error(`[setup-followup] ✗ Email failed for ${contact_email}:`, err.message);
      failed++;
      // Do NOT mark sent — will retry next cron run
      continue;
    }

    // Step 2: Mark sent ONLY after email confirms sent/queued
    try {
      await markSent(id);
      console.log(`[setup-followup] ✓ proposal_sent_at set for ${contact_email} — will not re-send`);
      sent++;
    } catch (err) {
      console.error(`[setup-followup] ✗ Mark-sent failed for ${contact_email} (${id}):`, err.message);
      // Email went out but dedup marker didn't save.
      // Next run will attempt again (duplicate risk). Monitor logs.
      failed++;
    }
  }

  console.log(`[setup-followup] Done. Sent=${sent} Failed=${failed}`);
}

main().catch(err => {
  console.error("[setup-followup] Unhandled error:", err);
  process.exit(1);
});
