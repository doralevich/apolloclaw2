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
 * Prices are READ FROM lib/pricing/catalog.ts at run time, never copied here.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const CURRENCY = "usd";

// ── The catalog, PARSED OUT OF lib/pricing/catalog.ts ─────────────────────────
//
// This used to be a hand-written second copy of the price table, under a comment asking
// whoever edited one to remember the other. It drifted, exactly as those comments always
// let things drift, and it drifted in the direction that costs money: after the move to
// $249 it still held apollo_license at $2,500 and apollo_hosting at $189, and it had never
// carried apollo_license_basic at all. Running it would have written the old prices back
// over the new ones and left the $449 tier unmanaged.
//
// So it reads the real catalog instead. This is a regex over TypeScript source rather than
// an import, because the file is TS and this script is plain node with no loader available
// in this repo. That is not as good as importing it, and it is a great deal better than a
// copy: the parse either finds the entries or it aborts, where a copy just quietly disagrees.
// Every catalogKey in that file is followed by its name and then its amountCents, which is
// what this keys on. The sanity checks below are what turn a shape change into a loud stop.
function loadCatalog() {
  const file = resolve(__dirname, "..", "lib", "pricing", "catalog.ts");
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    console.error(`Cannot read ${file} - this script derives its prices from it.`);
    process.exit(1);
  }

  const entries = [];
  const keyRe = /catalogKey:\s*"([^"]+)"/g;
  let m;
  while ((m = keyRe.exec(src))) {
    const rest = src.slice(m.index);
    const name = /name:\s*"([^"]+)"/.exec(rest);
    const amount = /amountCents:\s*(\d+)/.exec(rest);
    if (!name || !amount) continue;
    const interval = /interval:\s*"(month)"/.exec(rest.slice(0, amount.index + 200));
    entries.push({
      catalogKey: m[1],
      name: name[1],
      amountCents: Number(amount[1]),
      ...(interval ? { interval: interval[1] } : {}),
    });
  }

  // A shape change in catalog.ts must stop this script, not quietly narrow it. Six is the
  // floor as of this writing: two tiers, the subscription, and four credit packs is seven.
  if (entries.length < 6) {
    console.error(
      `Parsed only ${entries.length} entries from lib/pricing/catalog.ts - its shape has probably changed. ` +
        `Refusing to sync a partial catalog.`
    );
    process.exit(1);
  }
  const bad = entries.filter((e) => !Number.isInteger(e.amountCents) || e.amountCents <= 0);
  if (bad.length) {
    console.error(`Bad amounts parsed: ${bad.map((b) => `${b.catalogKey}=${b.amountCents}`).join(", ")}`);
    process.exit(1);
  }
  const subs = entries.filter((e) => e.interval);
  if (subs.length !== 1) {
    console.error(`Expected exactly one recurring price, parsed ${subs.length}. Refusing to sync.`);
    process.exit(1);
  }
  return entries;
}

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
const entries = loadCatalog();
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
