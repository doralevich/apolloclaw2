#!/usr/bin/env node
/**
 * seed-stripe-catalog.mjs — sync the ApolloClaw catalog into Stripe.
 *
 * Standalone CLI twin of lib/stripe/seed-catalog.ts (same logic, runnable without the app —
 * e.g. against production with the LIVE key). The deployed app exposes the same sync at
 * POST /api/admin/stripe/sync for platform admins.
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/seed-stripe-catalog.mjs [--dry-run]
 *
 * Reads STRIPE_SECRET_KEY from the environment or .env.local. Idempotent:
 *   - products matched by metadata.catalog_key (rename updates in place)
 *   - prices matched by lookup_key; reprice = new price + transfer_lookup_key + archive old
 *   - aborts if a lookup_key belongs to a product we didn't create (protects The College
 *     Agent's catalog, which shares this Stripe account)
 *
 * KEEP THE TABLE BELOW IN SYNC WITH lib/pricing/catalog.ts (source of truth).
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const CURRENCY = "usd";
// We sell one thing: the license, plus the hosting subscription that carries it. The eight
// per-agent plans at $4,500 are retired (see lib/pricing/catalog.ts). They are not listed
// here, so this seed no longer manages them — their Stripe products still exist untouched
// and can be archived by hand in the dashboard.
const CATALOG = [
  { catalogKey: "apollo_license", name: "ApolloClaw Agent License", amountCents: 250000 },
  { catalogKey: "apollo_hosting", name: "ApolloClaw Agent Hosting", amountCents: 18900, interval: "month" },
];

// API credit packs. What the customer PAYS: the credit they receive ($25, $50, $100, $250,
// $500) plus a 7% markup. The credit amount itself lives in lib/pricing/catalog.ts, which is
// what the app delivers to the runtime — keep the two files in step, since Stripe charging one
// number while the app grants another is the kind of mismatch nobody notices until month end.
const CREDIT_PACKS = [
  { catalogKey: "apollo_credits_25", name: "ApolloClaw API Credits - $25", amountCents: 2675 },
  { catalogKey: "apollo_credits_50", name: "ApolloClaw API Credits - $50", amountCents: 5350 },
  { catalogKey: "apollo_credits_100", name: "ApolloClaw API Credits - $100", amountCents: 10700 },
  { catalogKey: "apollo_credits_250", name: "ApolloClaw API Credits - $250", amountCents: 26750 },
  { catalogKey: "apollo_credits_500", name: "ApolloClaw API Credits - $500", amountCents: 53500 },
];

// ── Load .env.local (same pattern as apollo-setup-followup.mjs) ────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // no .env.local — rely on the process environment
}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set (env or .env.local).");
  process.exit(1);
}
const dryRun = process.argv.includes("--dry-run");
const entries = [...CATALOG, ...CREDIT_PACKS];
const mode = key.startsWith("sk_live") ? "LIVE" : "test";
console.log(`Syncing ApolloClaw catalog (${entries.length} entries) in ${mode} mode${dryRun ? " [dry-run]" : ""}…`);

const stripe = new Stripe(key);

async function findProductByCatalogKey(catalogKey) {
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    if (product.metadata?.catalog_key === catalogKey) return product;
  }
  return null;
}

function priceMatches(price, entry) {
  return (
    price.active &&
    price.unit_amount === entry.amountCents &&
    price.currency === CURRENCY &&
    (entry.interval ? price.recurring?.interval === entry.interval : !price.recurring)
  );
}

async function seedEntry(entry) {
  let product = await findProductByCatalogKey(entry.catalogKey);
  let productAction = "unchanged";
  if (!product) {
    productAction = "create";
    if (!dryRun) {
      product = await stripe.products.create({
        name: entry.name,
        metadata: { catalog_key: entry.catalogKey },
      });
    }
  } else if (product.name !== entry.name) {
    productAction = "rename";
    if (!dryRun) product = await stripe.products.update(product.id, { name: entry.name });
  }

  const { data: existing } = await stripe.prices.list({ lookup_keys: [entry.catalogKey], limit: 1 });
  const current = existing[0];

  if (current && product) {
    const owner = typeof current.product === "string" ? current.product : current.product.id;
    if (owner !== product.id) {
      throw new Error(
        `lookup_key "${entry.catalogKey}" already belongs to foreign product ${owner} — refusing to transfer it.`
      );
    }
  }

  if (current && priceMatches(current, entry)) {
    return { key: entry.catalogKey, product: productAction, price: "unchanged", id: current.id };
  }

  const priceAction = current ? "reprice" : "create";
  let priceId = "(dry-run)";
  if (!dryRun) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: entry.amountCents,
      lookup_key: entry.catalogKey,
      transfer_lookup_key: true,
      ...(entry.interval ? { recurring: { interval: entry.interval } } : {}),
      metadata: { catalog_key: entry.catalogKey },
    });
    if (current) await stripe.prices.update(current.id, { active: false });
    priceId = price.id;
  }
  return { key: entry.catalogKey, product: productAction, price: priceAction, id: priceId };
}

let failed = false;
for (const entry of entries) {
  try {
    const r = await seedEntry(entry);
    const amount = `$${(entry.amountCents / 100).toLocaleString("en-US")}${entry.interval ? `/${entry.interval}` : " one-time"}`;
    console.log(`  ${r.key.padEnd(22)} ${amount.padEnd(14)} product:${r.product}  price:${r.price}  ${r.id}`);
  } catch (err) {
    failed = true;
    console.error(`  ${entry.catalogKey}: ERROR — ${err.message}`);
  }
}
console.log(failed ? "Done with errors." : "Done.");
process.exit(failed ? 1 : 0);
