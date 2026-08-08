import { NextRequest, NextResponse } from "next/server";
import { findOrCreateCrmEntity } from "@/lib/crm";
import { sendTelegram } from "@/lib/telegram";
import { checkRateLimit, LIMITS } from "@/lib/rate-limit";

// CRM writes go to the separate "Brain" Supabase project. Prefer a dedicated
// CRM_SUPABASE_SERVICE_KEY — the shared SUPABASE_SERVICE_ROLE_KEY is the dashboard
// project's key and 401s against the Brain.
const SUPA_URL  = process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || "https://moubzvpffhqvumipbnfj.supabase.co";
const SUPA_KEY  = process.env.CRM_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

function supaHeaders() {
  return { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
}

// Rate limiting now goes through the shared Postgres limiter (lib/rate-limit.ts). The previous
// in-memory Map reset on cold start and was not shared between concurrent serverless instances,
// so the effective limit was "5 per warm lambda" rather than 5 per IP.

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Bot defenses: a filled-in honeypot, or a submission that came back
    // faster than a human could plausibly fill the form (< 2s), or an IP that's
    // rate-limited — all fake a normal success so bots don't learn to adapt,
    // but skip every downstream write (CRM, task, Telegram).
    const tooFast = typeof data.loadedAt === "number" && Date.now() - data.loadedAt < 2000;
    // Note this deliberately returns a fake success rather than a 429: unlike the other public
    // endpoints, this one is a bot target, and a distinct error teaches a bot what to avoid.
    const withinLimit = await checkRateLimit(req, "submit-contact", LIMITS.form);
    if (data.website || tooFast || !withinLimit) {
      return NextResponse.json({ ok: true });
    }

    const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.name || "Unknown";

    const notesLines = [
      `Contact form submission`,
      data.company      ? `Company: ${data.company}`           : null,
      data.industry     ? `Industry: ${data.industry}`         : null,
      data.companySize  ? `Size: ${data.companySize}`          : null,
      data.phone        ? `Phone: ${data.phone}`               : null,
      data.howHeard     ? `How heard: ${data.howHeard}`        : null,
      data.tasksToAutomate?.length
        ? `Wants to automate: ${data.tasksToAutomate.join(", ")}` : null,
      data.challenge    ? `Message: ${data.challenge}`         : null,
    ].filter(Boolean).join("\n");

    // Create kanban card (status=new_lead → Discovery column)
    let entityId: string | null = null;
    try {
      entityId = await findOrCreateCrmEntity(name, data.email, "new_lead", notesLines);
    } catch (e) {
      console.error("[submit-contact] entity creation failed:", e);
    }

    // Log interaction so the timeline has a record of the form submission
    if (entityId && SUPA_KEY) {
      try {
        await fetch(`${SUPA_URL}/rest/v1/interactions`, {
          method: "POST",
          headers: supaHeaders(),
          body: JSON.stringify({
            client_id: entityId,
            business_id: "apolloclaw",
            type: "note",
            summary: `Contact form submitted via apolloclaw.ai`,
            notes: notesLines,
          }),
        });
      } catch (e) {
        console.error("[submit-contact] interaction log failed:", e);
      }
    }

    // Create follow-up task
    if (entityId && SUPA_KEY) {
      try {
        await fetch(`${SUPA_URL}/rest/v1/tasks`, {
          method: "POST",
          headers: supaHeaders(),
          body: JSON.stringify({
            client_id: entityId,
            business_id: "apolloclaw",
            title: `Follow up - ${name} (contact form)`,
            status: "pending",
            priority: "high",
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          }),
        });
      } catch (e) {
        console.error("[submit-contact] task creation failed:", e);
      }
    }

    await sendTelegram(
      `<b>New Contact Form - Apollo Claw</b>\n<b>Name:</b> ${name}\n<b>Email:</b> ${data.email}${data.company ? `\n<b>Company:</b> ${data.company}` : ""}${data.challenge ? `\n<b>Message:</b> ${data.challenge.substring(0, 200)}` : ""}`,
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("submit-contact error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
