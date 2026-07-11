#!/usr/bin/env node
/**
 * seed-stripe-catalog.mjs — sync the Apollo Cloud catalog into Stripe.
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
const CATALOG = [
  { catalogKey: "ceo_plan", name: "The CEO Agent", amountCents: 450000 },
  { catalogKey: "cfo_plan", name: "The CFO Agent", amountCents: 450000 },
  { catalogKey: "legal_plan", name: "The Legal Agent", amountCents: 450000 },
  { catalogKey: "medical_plan", name: "The Medical Agent", amountCents: 450000 },
  { catalogKey: "insurance_plan", name: "The Insurance Agent", amountCents: 450000 },
  { catalogKey: "realestate_plan", name: "The Real Estate Agent", amountCents: 450000 },
  { catalogKey: "sales_plan", name: "The Sales Agent", amountCents: 450000 },
  { catalogKey: "apollo_hosting", name: "Apollo Cloud Agent Hosting", amountCents: 18900, interval: "month" },
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
const mode = key.startsWith("sk_live") ? "LIVE" : "test";
console.log(`Syncing Apollo Cloud catalog (${CATALOG.length} entries) in ${mode} mode${dryRun ? " [dry-run]" : ""}…`);

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
for (const entry of CATALOG) {
  try {
    const r = await seedEntry(entry);
    const amount = `$${(entry.amountCents / 100).toLocaleString("en-US")}${entry.interval ? `/${entry.interval}` : " one-time"}`;
    console.log(`  ${r.key.padEnd(16)} ${amount.padEnd(14)} product:${r.product}  price:${r.price}  ${r.id}`);
  } catch (err) {
    failed = true;
    console.error(`  ${entry.catalogKey}: ERROR — ${err.message}`);
  }
}
console.log(failed ? "Done with errors." : "Done.");
process.exit(failed ? 1 : 0);
