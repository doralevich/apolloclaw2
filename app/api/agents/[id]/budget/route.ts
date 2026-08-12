import { requireAgentAccess } from "@/lib/auth";
import { effectiveBudget } from "@/lib/instance-credit";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// The active agent's budget, with purchased credit folded in. effectiveBudget reconciles our
// credit ledger against the live runtime figures and re-asserts the instance cap, so every
// surface that reads this endpoint (chat header, Credits tab, vitals) shows the same correct
// balance whether or not the customer has bought credit.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  return json(await effectiveBudget(id));
});
