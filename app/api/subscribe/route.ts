import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit before any work: this endpoint is public and unauthenticated.
  // Fails open if the limiter is unavailable (see lib/rate-limit.ts).
  const limited = await enforceRateLimit(req, "subscribe", LIMITS.newsletter);
  if (limited) return limited;

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = "8faa1558b2";

    if (!MAILCHIMP_API_KEY) {
      // The single most common cause of a "Service unavailable" here is the variable being
      // set for the wrong Vercel environment, or the deploy predating it. Say so, because
      // the customer-facing message deliberately says nothing useful.
      console.error(
        "[subscribe] MAILCHIMP_API_KEY is not set on this deployment. Check it is enabled for " +
          "Production (not only Preview) and that this build came after it was added."
      );
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // Marketing API keys end in a datacenter suffix ("...-us1") which forms the API host.
    // A Mandrill (Mailchimp Transactional) key has no such suffix — a very easy mix-up, since
    // both are Mailchimp products — and would otherwise produce a nonsense hostname and a
    // confusing network error rather than a clear one.
    const dc = MAILCHIMP_API_KEY.split("-").pop();
    if (!dc || dc === MAILCHIMP_API_KEY || !/^[a-z]{2}\d+$/.test(dc)) {
      console.error(
        `[subscribe] MAILCHIMP_API_KEY has no datacenter suffix (expected something like "-us1"). ` +
          `This is usually a Mandrill key by mistake: Mandrill sends transactional email and cannot ` +
          `add anyone to an audience. The Marketing API key comes from Mailchimp -> profile -> Extras -> API keys.`
      );
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["weekly-claw", "website-footer"],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true });
    }

    // Handle already subscribed
    if (data.title === "Member Exists") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    // Log the status and Mailchimp's own detail: the two realistic failures here are a bad
    // key (401) and a list id that is not this account's audience (404), and they need very
    // different fixes.
    console.error(
      `[subscribe] Mailchimp rejected the request (HTTP ${response.status}) for list ${LIST_ID}:`,
      data
    );
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
