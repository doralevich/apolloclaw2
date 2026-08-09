import { requireAdmin, requireUser } from "@/lib/auth";
import { findStripeCustomerId } from "@/lib/hosting-seats";
import { ApiError, json, route } from "@/lib/http";
import { publicSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/client";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/workspaces/{id}/billing-portal — a signed door into Stripe's customer portal.
//
// Invoices, the card on file, and cancellation live in Stripe, and the portal is Stripe's own
// UI for all three - rebuilding any of it here would mean handling card data we have no reason
// to touch. This route exists because the portal needs a server-created session: the customer
// id is resolved the same way seat billing resolves it, so the portal can never open on a
// different customer than the one the seats charge.
//
// Admin-only, like everything else that can see or change what the workspace pays.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  const customerId = await findStripeCustomerId(id);
  if (!customerId) {
    // White-glove: no subscription in Stripe to manage. A named refusal beats a broken portal.
    throw new ApiError(
      409,
      "no_subscription",
      "This workspace's billing is handled directly - talk to us for invoices or changes."
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${publicSiteOrigin(new URL(request.url).origin)}/dashboard/settings/plan`,
  });

  return json({ url: session.url });
});
