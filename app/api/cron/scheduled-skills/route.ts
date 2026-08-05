import { NextResponse } from "next/server";
import { json, route } from "@/lib/http";
import { sweepSchedules } from "@/lib/schedules";

// GET /api/cron/scheduled-skills — hourly, from vercel.json.
//
// Wakes up every hour, finds the schedules whose local time is now, runs each one's skill and
// delivers the result to the customer's connected chat app. This is the thing that makes "brief
// me every morning" possible: a skill has no clock of its own.
//
// Hourly is the granularity the whole feature is built around, which is why the schedule stores
// an hour rather than a time. Offering minutes would be a promise this cron cannot keep.
//
// Same auth as credit-watch next door: Vercel sends `Authorization: Bearer $CRON_SECRET` on
// scheduled invocations. This one doesn't charge cards, but it does run agent turns that cost
// the customer money, so an open endpoint would be a way to bill someone else's account.

export const maxDuration = 300;

export const GET = route(async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron:scheduled-skills] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "cron not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sweepSchedules();
  console.log("[cron:scheduled-skills]", JSON.stringify(result));
  return json({ ok: true, ...result });
});
