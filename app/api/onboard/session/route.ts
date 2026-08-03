import { ApiError, json, route } from "@/lib/http";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe/client";

// GET /api/onboard/session?id=cs_... — read back a completed checkout so the confirmation
// screen can show what was actually charged.
//
// Unauthenticated, like the checkout route that created the session, and for the same
// reason: the buyer has no account yet. What keeps that safe is what this returns. The
// session id is a long unguessable token that only the buyer receives (Stripe puts it in
// their success URL), and the response is deliberately narrow — the paid flag, the total,
// and the email that is already on their screen. No payment method, no customer id, no
// line-item internals, nothing that would help someone who guessed an id.
//
// Sessions that are not ours are refused rather than described. This Stripe account also
// serves The College Agent, and "not found" is the right answer for anything outside the
// license flow.

export const GET = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "onboard_session", LIMITS.form);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get("id")?.trim() || "";
  // Cheap shape check before spending a Stripe call on obvious junk.
  if (!id.startsWith("cs_") || id.length > 200) {
    throw new ApiError(400, "invalid_request", "A checkout session id is required.");
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(id);
  } catch {
    // A bad id and a deleted session look the same from here, and both mean the same thing
    // to the caller.
    throw new ApiError(404, "not_found", "That checkout session could not be found.");
  }

  if (session.metadata?.flow !== "onboard_license") {
    throw new ApiError(404, "not_found", "That checkout session could not be found.");
  }

  return json({
    paid: session.payment_status === "paid",
    amountTotal: session.amount_total,
    currency: session.currency,
    email: session.customer_details?.email ?? session.metadata?.lead_email ?? null,
  });
});
