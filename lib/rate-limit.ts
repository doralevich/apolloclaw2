import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Shared rate limiter for public, unauthenticated endpoints.
// Backed by supabase/migrations/0007_rate_limits.sql.
//
// FAILS OPEN, deliberately. Per the playbook's golden rule 4: availability primitives fail open,
// authorization fails closed. If Postgres is unreachable, or the migration has not been applied
// yet, or the service-role key is missing, every caller is allowed through. A signup form that
// rejects real customers because the limiter's datastore blinked is a worse outcome than one that
// briefly stops throttling abuse.
//
// That also makes this migration-safe: this code can ship before 0007 is applied and is simply a
// no-op until then.

export type RateLimitRule = { max: number; windowSeconds: number };

// Defaults tuned for forms a human fills in: generous enough that nobody legitimate trips them,
// tight enough that a script is throttled within seconds.
export const LIMITS = {
  // Money or third-party spend on the other side.
  checkout: { max: 10, windowSeconds: 60 },
  // Writes to the CRM and sends email.
  form: { max: 5, windowSeconds: 60 },
  // Cheapest to abuse, and the most attractive to a list-bomber.
  newsletter: { max: 5, windowSeconds: 300 },
  // The assistant: spends the platform's Anthropic key on every call.
  assistant: { max: 30, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimitRule>;

// Vercel puts the real client IP first in x-forwarded-for; everything after it is proxy hops and is
// caller-controlled, so only the first entry is trustworthy. Callers we cannot identify all share
// the "unknown" bucket, which throttles them collectively rather than not at all.
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Records a hit and reports whether the caller is still within their allowance.
 * Returns true when the request should proceed. Never throws.
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string,
  rule: RateLimitRule
): Promise<boolean> {
  const ip = clientIp(request);
  try {
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_bucket: `${endpoint}:${ip}`,
      p_max: rule.max,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) {
      // Includes "function does not exist" before the migration is applied.
      console.error(`[rate-limit] ${endpoint} check failed, allowing:`, error.message);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error(`[rate-limit] ${endpoint} threw, allowing:`, (err as Error).message);
    return true;
  }
}

// 429 with Retry-After, so a well-behaved client backs off instead of hammering.
export function rateLimitedResponse(rule: RateLimitRule): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rule.windowSeconds),
      },
    }
  );
}

/**
 * Convenience wrapper: returns a 429 Response when the caller is over their allowance, or null
 * when the handler should proceed.
 *
 *   const limited = await enforceRateLimit(request, "subscribe", LIMITS.newsletter);
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  request: Request,
  endpoint: string,
  rule: RateLimitRule
): Promise<Response | null> {
  const allowed = await checkRateLimit(request, endpoint, rule);
  return allowed ? null : rateLimitedResponse(rule);
}
