import "server-only";
import Stripe from "stripe";
import { ApiError } from "@/lib/http";

// One lazily-constructed Stripe client per server process. The key is read at call time
// (never module load) so builds don't require it and a missing key fails as a clean 500
// on the first billing route hit instead of crashing the whole app.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiError(500, "config_error", "STRIPE_SECRET_KEY is not set on the server");
  }
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}
