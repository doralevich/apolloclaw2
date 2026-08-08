import "server-only";
import type Stripe from "stripe";
import { AGENT_PLANS, CREDIT_PACKS, CURRENCY, HOSTING_PLAN, LICENSE_TIERS } from "@/lib/pricing/catalog";

// Idempotent Stripe catalog sync — safe to run any number of times, against test or live.
//
//   * Products are matched by metadata.catalog_key (renames update in place, never duplicate).
//   * Prices are matched by lookup_key. A price is immutable in Stripe, so a reprice mints a
//     NEW price with transfer_lookup_key (the key atomically moves to the new price) and then
//     archives the old one. Checkout always resolves prices by lookup_key, so it follows.
//   * A lookup_key that already exists on a product we DIDN'T create (no matching
//     catalog_key) aborts loudly instead of stealing the key — this Stripe account also
//     holds The College Agent's catalog and we must never touch its prices.

export interface SeedEntry {
  catalogKey: string;
  name: string;
  amountCents: number;
  interval?: "month";
}

export interface SeedAction {
  catalogKey: string;
  product: string;
  price: string;
  action: "created" | "repriced" | "renamed" | "unchanged";
}

function entries(): SeedEntry[] {
  return [
    // One entry per license tier. Advanced keeps the original `apollo_license` key, so this
    // run updates the product already live rather than creating a second one beside it; Basic
    // is new and gets created on the first sync after this deploys.
    ...LICENSE_TIERS.map(({ catalogKey, name, amountCents }) => ({ catalogKey, name, amountCents })),
    {
      catalogKey: HOSTING_PLAN.catalogKey,
      name: HOSTING_PLAN.name,
      amountCents: HOSTING_PLAN.amountCents,
      interval: HOSTING_PLAN.interval,
    },
    // AGENT_PLANS is empty now that the per-agent SKUs are retired, so this spread
    // contributes nothing. It stays because restoring one of those plans should be a single
    // line in the catalog, with the seed picking it up without being edited too.
    ...AGENT_PLANS.map(({ catalogKey, name, amountCents }) => ({ catalogKey, name, amountCents })),
    // Credit packs sell through the dashboard rather than the paywall, but Stripe doesn't
    // care where a price is used — leaving them out would make the admin sync button quietly
    // narrower than the CLI twin, and the packs would only exist wherever someone last ran
    // the script.
    ...CREDIT_PACKS.map(({ catalogKey, name, amountCents }) => ({ catalogKey, name, amountCents })),
  ];
}

async function findProductByCatalogKey(
  stripe: Stripe,
  catalogKey: string
): Promise<Stripe.Product | null> {
  // List-and-filter instead of the Search API: search indexing lags writes by up to a
  // minute, which would make back-to-back runs duplicate products.
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    if (product.metadata?.catalog_key === catalogKey) return product;
  }
  return null;
}

async function priceMatches(price: Stripe.Price, entry: SeedEntry): Promise<boolean> {
  return (
    price.active &&
    price.unit_amount === entry.amountCents &&
    price.currency === CURRENCY &&
    (entry.interval ? price.recurring?.interval === entry.interval : !price.recurring)
  );
}

async function seedEntry(stripe: Stripe, entry: SeedEntry): Promise<SeedAction> {
  let action: SeedAction["action"] = "unchanged";

  let product = await findProductByCatalogKey(stripe, entry.catalogKey);
  if (!product) {
    product = await stripe.products.create({
      name: entry.name,
      metadata: { catalog_key: entry.catalogKey },
    });
    action = "created";
  } else if (product.name !== entry.name) {
    product = await stripe.products.update(product.id, { name: entry.name });
    action = "renamed";
  }

  const { data: existing } = await stripe.prices.list({
    lookup_keys: [entry.catalogKey],
    limit: 1,
  });
  const current = existing[0];

  if (current) {
    const owner = typeof current.product === "string" ? current.product : current.product.id;
    if (owner !== product.id) {
      throw new Error(
        `lookup_key "${entry.catalogKey}" already belongs to foreign product ${owner} - ` +
          `refusing to transfer it. Resolve the collision in the Stripe dashboard first.`
      );
    }
    if (await priceMatches(current, entry)) {
      return { catalogKey: entry.catalogKey, product: product.id, price: current.id, action };
    }
  }

  // New price (first run) or reprice: transfer_lookup_key moves the key off the old price
  // atomically, then the old price is archived so it can't be picked up anywhere else.
  const price = await stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount: entry.amountCents,
    lookup_key: entry.catalogKey,
    transfer_lookup_key: true,
    ...(entry.interval ? { recurring: { interval: entry.interval } } : {}),
    metadata: { catalog_key: entry.catalogKey },
  });
  if (current) {
    await stripe.prices.update(current.id, { active: false });
  }

  return {
    catalogKey: entry.catalogKey,
    product: product.id,
    price: price.id,
    action: current ? "repriced" : "created",
  };
}

/** Sync the ApolloClaw catalog (license + hosting). Returns one action per entry. */
export async function seedStripeCatalog(stripe: Stripe): Promise<SeedAction[]> {
  const results: SeedAction[] = [];
  for (const entry of entries()) {
    results.push(await seedEntry(stripe, entry));
  }
  return results;
}
