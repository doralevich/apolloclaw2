#!/usr/bin/env node
/**
 * backfill-mailchimp-registrations.mjs — put every existing account into the Mailchimp audience.
 *
 * The app now syncs a contact at the moment an account is created (Stripe webhook for buyers,
 * invitation accept for seats — both call syncMailchimpRegistration in lib/mailchimp.ts). That
 * only helps from today forward. Everybody who registered BEFORE that shipped is in Supabase
 * and in Stripe and in no audience at all, which is the gap this closes: one pass over the auth
 * users, upserting each and applying the VPS-Registration tag.
 *
 *   MAILCHIMP_API_KEY=... \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/backfill-mailchimp-registrations.mjs [--dry-run]
 *
 * Values are read from the environment or .env.local. Safe to re-run: the Mailchimp upsert is a
 * PUT on the email hash and tagging is additive, so a second pass changes nothing.
 *
 * WHAT IT DOES NOT DO: it never unsubscribes, never removes a tag, and never overwrites a name
 * with an empty one. Someone who opted out stays opted out — `status_if_new` only applies to
 * contacts Mailchimp has not seen, so a resubscribe is not something this can cause by accident.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const REGISTRATION_TAG = "VPS-Registration";
const MC_LIST_ID = "8faa1558b2"; // Apollo Claw - The AI Edge. Same audience as lib/mailchimp.ts.
const DRY_RUN = process.argv.includes("--dry-run");

// .env.local, for the ordinary case of running this from a checkout rather than a shell that
// already has production credentials exported.
function loadEnvLocal() {
  try {
    const file = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local is fine — the environment may carry everything already.
  }
}
loadEnvLocal();

const MC_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const missing = [
  !MC_API_KEY && "MAILCHIMP_API_KEY",
  !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
  !SERVICE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
].filter(Boolean);
if (missing.length) {
  console.error(`Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const MC_SERVER = MC_API_KEY.split("-").pop();
if (!MC_SERVER || !/^[a-z]{2}\d+$/.test(MC_SERVER)) {
  console.error(`MAILCHIMP_API_KEY has no datacenter suffix (expected something like "-us1").`);
  process.exit(1);
}
const mcHeaders = {
  "Content-Type": "application/json",
  Authorization: `Basic ${Buffer.from(`anystring:${MC_API_KEY}`).toString("base64")}`,
};

/** Every auth user, paged. The admin endpoint caps a page at 1000; we ask for less and loop. */
async function listAuthUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!res.ok) throw new Error(`Supabase admin list failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < 200) return users;
  }
}

async function syncOne(email, firstName, lastName) {
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const base = `https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${hash}`;

  // Only send a name we actually have. Sending "" would blank a name somebody already has in
  // the audience, and a name from an intake form is better data than a name from auth metadata.
  const merge_fields = {};
  if (firstName) merge_fields.FNAME = firstName;
  if (lastName) merge_fields.LNAME = lastName;

  const put = await fetch(base, {
    method: "PUT",
    headers: mcHeaders,
    body: JSON.stringify({ email_address: email, status_if_new: "subscribed", merge_fields }),
  });
  if (!put.ok) throw new Error(`upsert ${put.status}: ${await put.text()}`);

  const tag = await fetch(`${base}/tags`, {
    method: "POST",
    headers: mcHeaders,
    body: JSON.stringify({ tags: [{ name: REGISTRATION_TAG, status: "active" }] }),
  });
  if (!tag.ok) throw new Error(`tag ${tag.status}: ${await tag.text()}`);
}

const users = await listAuthUsers();
console.log(`${users.length} account(s) found${DRY_RUN ? " (dry run - nothing will be written)" : ""}`);

let done = 0;
let skipped = 0;
const failures = [];
for (const u of users) {
  const email = (u.email || "").trim().toLowerCase();
  if (!email) {
    skipped++;
    continue;
  }
  const meta = u.user_metadata || {};
  const full = String(meta.full_name || meta.name || "").trim();
  const first = meta.first_name || full.split(/\s+/)[0] || "";
  const last = meta.last_name || full.split(/\s+/).slice(1).join(" ") || "";

  if (DRY_RUN) {
    console.log(`  would sync ${email}${first || last ? ` (${[first, last].filter(Boolean).join(" ")})` : ""}`);
    done++;
    continue;
  }
  try {
    await syncOne(email, first, last);
    done++;
    console.log(`  ✓ ${email}`);
  } catch (err) {
    failures.push({ email, message: err.message });
    console.error(`  ✗ ${email}: ${err.message}`);
  }
}

console.log(`\n${done} synced, ${skipped} skipped (no address), ${failures.length} failed`);
// A non-zero exit on failures, so this is usable from a job rather than only by eye.
if (failures.length) process.exit(1);
