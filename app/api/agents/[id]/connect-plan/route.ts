import { loadAgentAnswers } from "@/lib/agent-answers";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { guessVendor } from "@/config/connect-flow";

type Ctx = { params: Promise<{ id: string }> };

// Which email suite this customer probably runs on, and why.
//
// Read by the guided connect flow to pre-select Google or Microsoft rather than asking cold. It
// only ever pre-selects: both buttons stay live, and the reason is printed next to the choice so
// a wrong guess is visibly a guess. See config/connect-flow.ts for the rules.
//
// Server-side because both of the good signals are: the questionnaire answers live in agent_setup
// behind the service-role client, and the account's own email address is only on the auth user.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { user } = await requireAgentAccess(id, "member");

  const db = createAdminClient();
  const answers = await loadAgentAnswers(db, id);

  return json(guessVendor(answers, user.email ?? null));
});
