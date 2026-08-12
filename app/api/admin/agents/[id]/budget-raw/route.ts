import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// TEMP admin diagnostic. Returns the budget and usage an instance reports, UNSHAPED - so we can
// read the exact field the runtime uses for purchased top-up credit. A delivered $25 top-up
// wasn't showing in the balance, and the balance math reads `credit_remaining_micros ??
// topup_remaining_micros`; if the runtime names it something else, or the write never stuck, this
// is where it shows. Platform-admin only, read-only. Remove once the credit read is fixed.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;

  const [budget, usage] = await Promise.allSettled([
    agent37.getBudget(id),
    agent37.getUsage(id),
  ]);

  return json({
    agent37_id: id,
    budget:
      budget.status === "fulfilled"
        ? budget.value
        : { error: String((budget as PromiseRejectedResult).reason) },
    usage:
      usage.status === "fulfilled"
        ? usage.value
        : { error: String((usage as PromiseRejectedResult).reason) },
  });
});
