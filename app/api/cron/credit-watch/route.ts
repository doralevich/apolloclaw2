import { sweepCredits } from "@/lib/credit-watch";
import { json, route } from "@/lib/http";
import { NextResponse } from "next/server";

// GET /api/cron/credit-watch — hourly, from vercel.json.
//
// Reads every watched instance's balance and either warns or tops up. See lib/credit-watch.ts
// for why this exists: an agent that runs out of credit goes silent, and silence reads as a
// broken product rather than an empty wallet.
//
// Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations. This route
// charges cards, so it verifies that header and refuses anything else — including, loudly,
// its own deployment if CRON_SECRET was never set. An unauthenticated endpoint that can
// trigger payments is worse than a cron job that doesn't run.

export const maxDuration = 300;

export const GET = route(async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron:credit-watch] CRON_SECRET is not set - refusing to run");
    return NextResponse.json({ error: "cron not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sweepCredits();
  return json({ ok: true, ...result });
});
