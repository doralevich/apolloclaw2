import { loadAgentAnswers } from "@/lib/agent-answers";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChips, buildOpener } from "@/config/chat-opening";

type Ctx = { params: Promise<{ id: string }> };

// What the agent opens an empty chat with, and what it offers underneath, built from this
// customer's own questionnaire. See config/chat-opening.ts for the rules.
//
// Server-side because the answers live in agent_setup behind the service-role client, the same
// place the checklist reads them from.
//
// The chips come back UNFILTERED by what is connected, and there are more of them than the row
// shows. Filtering happens in the browser, which already knows the connection state and is the
// only place it can be known without a second upstream call on every chat load. See
// chipIsUsable() - the contract is that the caller takes the first CHIP_ROW_SIZE that pass.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const db = createAdminClient();
  const answers = await loadAgentAnswers(db, id);

  return json({
    opener: buildOpener(answers),
    chips: buildChips(answers),
    // Whether this customer's screen is theirs or the generic fallback. The UI does not print
    // this, but it is the difference between the two cases and worth being able to see.
    personalized: !!answers,
  });
});
