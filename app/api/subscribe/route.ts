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
      console.error("MAILCHIMP_API_KEY not set");
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // Extract datacenter from API key (e.g. us1 from key-us1)
    const dc = MAILCHIMP_API_KEY.split("-").pop();
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

    console.error("Mailchimp error:", data);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
