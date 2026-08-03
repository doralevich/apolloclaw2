import "server-only";
import type Stripe from "stripe";
import { ApiError } from "@/lib/http";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// A paid Stripe checkout session, used as the authorization token for the license flow.
//
// The buyer has an account (the webhook created it) but has never signed in — they have not
// set a password yet. So the routes that finish their onboarding cannot ask for a session
// cookie, and the checkout session id stands in: an unguessable token that Stripe hands
// only to the person who paid, scoped to exactly one purchase.
//
// This is deliberately weaker than logging them in. Holding the id lets you submit
// onboarding for that one purchase and read its build status. It does not let you into
// their dashboard, read their data, or act as them anywhere else.

export interface VerifiedLicenseSession {
  session: Stripe.Checkout.Session;
  email: string;
}

/** Retrieve a checkout session and insist it is ours, and paid. */
export async function verifyPaidLicenseSession(sessionId: string): Promise<VerifiedLicenseSession> {
  const id = sessionId.trim();
  // Cheap shape check before spending a Stripe call on obvious junk.
  if (!id.startsWith("cs_") || id.length > 200) {
    throw new ApiError(400, "invalid_request", "A checkout session id is required.");
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(id);
  } catch {
    // A bad id and a deleted session look the same from here, and mean the same thing to
    // the caller.
    throw new ApiError(404, "not_found", "That checkout session could not be found.");
  }

  // This Stripe account also serves The College Agent. Anything outside the license flow is
  // refused rather than described.
  if (session.metadata?.flow !== "onboard_license") {
    throw new ApiError(404, "not_found", "That checkout session could not be found.");
  }

  if (session.payment_status !== "paid") {
    throw new ApiError(402, "payment_required", "That checkout has not been paid.");
  }

  const email = (session.customer_details?.email || session.metadata?.lead_email || "").trim().toLowerCase();
  if (!email) {
    throw new ApiError(422, "invalid_state", "That checkout has no email on it.");
  }

  return { session, email };
}

/**
 * Page through auth users to find one by email. supabase-js has no getUserByEmail, and the
 * user base is small enough that paging beats maintaining a lookup table. Capped so a
 * runaway never spins.
 */
export async function findAuthUserIdByEmail(
  db: ReturnType<typeof createAdminClient>,
  email: string
): Promise<string | null> {
  const wanted = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`user lookup failed: ${error.message}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === wanted);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

export interface BuyerAccount {
  userId: string;
  workspaceId: string;
}

/**
 * Find the account and workspace the Stripe webhook created for this buyer.
 *
 * A 409 here means the webhook has not landed yet — Stripe fires it in parallel with the
 * browser redirect, so a fast buyer really can arrive first. The caller should say "one
 * moment" and retry rather than treat it as broken, which is why it is its own status.
 */
export async function findBuyerAccount(email: string): Promise<BuyerAccount> {
  const db = createAdminClient();

  const userId = await findAuthUserIdByEmail(db, email);
  if (!userId) {
    throw new ApiError(409, "account_pending", "Your account is still being created. One moment.");
  }

  const { data, error } = await db
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);

  const workspaceId = data?.workspace_id as string | undefined;
  if (!workspaceId) {
    throw new ApiError(409, "account_pending", "Your workspace is still being created. One moment.");
  }

  return { userId, workspaceId };
}
