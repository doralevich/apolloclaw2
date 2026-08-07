import { sweepOnboardingEmails } from "@/lib/onboarding-series";
import { json, route } from "@/lib/http";
import { NextResponse } from "next/server";

// GET /api/cron/onboarding-series — hourly, from vercel.json.
//
// Walks every customer who bought since the series went live and sends at most one due
// onboarding email each. See lib/onboarding-series.ts for the steps and, more importantly,
// for why each one checks what the customer has actually done before it says anything.
//
// Same auth as credit-watch: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled
// invocations, and this refuses anything else, including loudly refusing itself when the
// secret was never configured. This endpoint emails paying customers, so an open version of
// it is a way for a stranger to mail our customer list on demand.

export const maxDuration = 300;

export const GET = route(async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron:onboarding-series] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "cron not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sweepOnboardingEmails();

  // Log every run that did anything at all, which now means any run that tagged somebody.
  //
  // This used to be gated on sent/failed alone, from when sending was the whole job. With sends
  // handed to Mailchimp both are permanently zero, so that condition would never fire again and
  // the hourly tag sync — now the only thing this endpoint does — would run in complete silence.
  // The one question worth asking of these logs is "did the sync run", and it could not be
  // answered.
  if (result.tagged || result.sent.length || result.failed.length) {
    console.log(
      `[cron:onboarding-series] tagged=${result.tagged} sends=${result.sendsEnabled ? "on" : "off"} ` +
        `considered=${result.considered} sent=${result.sent.length} ` +
        `skipped=${result.skipped.length} failed=${result.failed.length}`
    );
  }
  return json({ ok: true, ...result });
});
