import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";
import { syncMailchimpRegistration } from "@/lib/mailchimp";
import { claimSeat } from "@/lib/seats";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ token: string }> };

export const POST = route(async (_request: Request, { params }: Ctx) => {
  const { token } = await params;
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) throw new ApiError(400, "invalid_request", error.message);

  const workspaceId = data as string;

  // If the admin bought them a seat, hand the waiting agent over now.
  //
  // The agent was built when the admin asked and paid for it, parked on the admin's own id
  // until this moment — so the colleague signs in and it is already there, and a mistyped
  // address never minted a VPS on its own.
  //
  // Best effort, deliberately: joining the workspace is the thing they just did and it has
  // succeeded. Failing the whole request because the handover stumbled would leave them
  // staring at an error having actually been let in, and the seat can be reassigned by hand.
  let claimed: string | null = null;
  try {
    claimed = await claimSeat(createAdminClient(), workspaceId, user.id, user.email ?? "");
  } catch (err) {
    console.error("[invitations] seat handover failed", workspaceId, user.id, err);
  }

  // The OTHER way somebody becomes an ApolloClaw user: they never touched Stripe, an admin
  // bought them a seat and they accepted. Registered the same as a buyer, so tagged the same,
  // and previously invisible to Mailchimp entirely. After the response - joining is done and a
  // marketing sync must not be in the path of the redirect they are waiting on.
  const meta = (user.user_metadata ?? {}) as { first_name?: string; last_name?: string; full_name?: string; name?: string };
  const full = (meta.full_name || meta.name || "").trim();
  after(async () => {
    await syncMailchimpRegistration({
      email: user.email ?? "",
      firstName: meta.first_name || full.split(/\s+/)[0] || "",
      lastName: meta.last_name || full.split(/\s+/).slice(1).join(" "),
      extraTags: ["ac-seat-accepted"],
    });
  });

  return json({ workspace_id: workspaceId, agent_id: claimed });
});
