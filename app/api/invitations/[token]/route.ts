import { requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";
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

  return json({ workspace_id: workspaceId, agent_id: claimed });
});
