import { NextRequest, NextResponse } from "next/server";
import { upsertPipelineDeal, findOrCreateCrmEntity } from "@/lib/crm";
import { sendTelegram } from "@/lib/telegram";
import { findAttioDealByEmail, addAttioNote, updateAttioDealStage } from "@/lib/attio";
import { upsertMailchimpContact, tagMailchimpContact } from "@/lib/mailchimp";

const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";
const TO_EMAIL = "david@apolloclaw.ai";

// Apollo Claw dashboard Supabase (tbbzlloiigtepdwoquvy) — write setup credentials to agent_setup
const AC_SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tbbzlloiigtepdwoquvy.supabase.co";
const AC_SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function upsertAgentSetup(email: string, agentType: string, answers: Record<string, unknown>): Promise<void> {
  if (!AC_SUPA_KEY) {
    console.warn("[upsertAgentSetup] SUPABASE_SERVICE_ROLE_KEY not set — skipping");
    return;
  }
  try {
    // Find workspace by owner email via auth.users lookup
    const usersRes = await fetch(`${AC_SUPA_URL}/auth/v1/admin/users?page=1&per_page=100`, {
      headers: {
        apikey: AC_SUPA_KEY,
        Authorization: `Bearer ${AC_SUPA_KEY}`,
      },
    });
    const usersData = usersRes.ok ? await usersRes.json() as { users: Array<{ id: string; email: string }> } : { users: [] };
    const user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Client hasn't created their dashboard account yet — store in pending_setups table if exists,
      // otherwise log and continue (non-fatal)
      console.warn(`[upsertAgentSetup] No dashboard account for ${email} — skipping agent_setup write`);
      return;
    }

    // Find workspace for this user
    const wsRes = await fetch(
      `${AC_SUPA_URL}/rest/v1/memberships?user_id=eq.${user.id}&limit=1`,
      {
        headers: {
          apikey: AC_SUPA_KEY,
          Authorization: `Bearer ${AC_SUPA_KEY}`,
        },
      }
    );
    const memberships = wsRes.ok ? await wsRes.json() as Array<{ workspace_id: string }> : [];
    if (!memberships.length) {
      console.warn(`[upsertAgentSetup] No workspace found for ${email}`);
      return;
    }
    const workspaceId = memberships[0].workspace_id;

    // Upsert agent_setup
    const upsertRes = await fetch(`${AC_SUPA_URL}/rest/v1/agent_setup`, {
      method: "POST",
      headers: {
        apikey: AC_SUPA_KEY,
        Authorization: `Bearer ${AC_SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        agent_type: agentType,
        answers,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!upsertRes.ok) {
      const txt = await upsertRes.text();
      console.error(`[upsertAgentSetup] Failed (${upsertRes.status}): ${txt}`);
    } else {
      console.log(`[upsertAgentSetup] Written for workspace ${workspaceId}`);
    }
  } catch (err) {
    console.error("[upsertAgentSetup] Error:", err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function sendSummaryEmail(opts: {
  subject: string;
  html: string;
}): Promise<void> {
  if (!MANDRILL_KEY) {
    console.warn("[submit-setup] MANDRILL_API_KEY not set — skipping email");
    return;
  }
  const message: Record<string, unknown> = {
    from_email: "david@apolloclaw.ai",
    from_name: "Apollo[Claw] Setup",
    to: [{ email: TO_EMAIL, name: "David Oralevich", type: "to" }],
    subject: opts.subject,
    html: opts.html,
    important: true,
  };
  const res = await fetch("https://mandrillapp.com/api/1.0/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: MANDRILL_KEY, message }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`[submit-setup] Mandrill send failed (${res.status}): ${txt}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, email, fields } = body as {
      source?: string;
      email?: string;
      fields?: Record<string, string>;
    };

    if (!source || !email || !fields) {
      return NextResponse.json(
        { success: false, message: "Missing source, email, or fields." },
        { status: 400 }
      );
    }

    const name =
      [fields.first_name, fields.last_name].filter(Boolean).join(" ").trim() ||
      "Unknown";

    // ── STEP 1: silent CRM upsert ONLY — no email, no Telegram, no PDF ────────
    if (source === "apollo_setup_1") {
      try {
        await upsertPipelineDeal(email, {
          client_name: name,
          contact_name: name,
          contact_email: email,
          brand: "Apollo Claw",
          brand_color: "#E8342A",
          stage: "onboarding",
          onboarding_status: "awaiting_step2",
          notes: [
            "Setup Step 1 submitted",
            `Assistant Name: ${fields.assistant_name || ""}`,
            `Timezone: ${fields.timezone || ""}`,
            `Computer Name: ${fields.computer_name || ""}`,
          ].join("\n"),
          next_action: "Awaiting Step 2 (API credentials)",
        });
      } catch (err) {
        console.error("[submit-setup] Step 1 CRM upsert failed:", err);
      }
      try {
        await findOrCreateCrmEntity(
          name,
          email,
          "onboarding",
          "Setup Step 1 submitted"
        );
      } catch (err) {
        console.error("[submit-setup] Step 1 entity create failed:", err);
      }
      return NextResponse.json({ success: true });
    }

    // ── STEP 2: full flow (PDF, email, Telegram, CRM final state) ───────────
    if (source === "apollo_setup_2") {
      try {
        await upsertPipelineDeal(email, {
          client_name: name,
          contact_name: name,
          contact_email: email,
          brand: "Apollo Claw",
          brand_color: "#E8342A",
          stage: "onboarding",
          onboarding_status: "deployment_ready",
          notes: [
            "Setup completed (Step 2)",
            `Assistant Name: ${fields.assistant_name || ""}`,
            `Timezone: ${fields.timezone || ""}`,
            `Computer Name: ${fields.computer_name || ""}`,
            `Anthropic API Key: ${fields.anthropic_api_key || ""}`,
            `Telegram Bot Token: ${fields.telegram_bot_token || ""}`,
            `Telegram Bot Username: ${fields.telegram_bot_username || ""}`,
          ].join("\n"),
          next_action: "Deploy assistant to client Mac Mini",
        });
      } catch (err) {
        console.error("[submit-setup] Step 2 CRM upsert failed:", err);
      }
      try {
        await findOrCreateCrmEntity(
          name,
          email,
          "onboarding",
          "Setup complete — deployment_ready"
        );
      } catch (err) {
        console.error("[submit-setup] Step 2 entity create failed:", err);
      }

      const F = fields;
      const rowText = (label: string, val: string) =>
        val
          ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:42%;vertical-align:top;font-size:13px;">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${escapeHtml(val)}</td></tr>`
          : "";
      const rowCred = (label: string, val: string) =>
        val
          ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:42%;vertical-align:top;font-size:13px;">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:13px;color:#1a1a1a;font-family:'Courier New',monospace;word-break:break-all;">${escapeHtml(val)}</td></tr>`
          : "";
      const sectionHead = (t: string) =>
        `<p style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#E8342A;margin:22px 0 4px;border-bottom:1px solid #f0f0f0;padding-bottom:4px;">${t}</p>`;
      const itBlock =
        F.it_contact_name || F.it_contact_email || F.it_notes
          ? `${sectionHead("IT Contact")}<table style="width:100%;border-collapse:collapse;">${rowText("IT Contact Name", F.it_contact_name || "")}${rowText("IT Contact Email", F.it_contact_email || "")}${rowText("IT Notes", F.it_notes || "")}</table>`
          : "";
      const summaryHtml = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0;color:#1a1a1a;">
          <div style="border-bottom:2px solid #E8342A;padding-bottom:16px;margin-bottom:8px;">
            <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
            <span style="font-size:12px;color:#6b7280;margin-left:12px;text-transform:uppercase;letter-spacing:0.08em;">Technical Setup Complete</span>
          </div>
          ${sectionHead("Client")}
          <table style="width:100%;border-collapse:collapse;">
            ${rowText("Name", name)}
            ${rowText("Email", email)}
            ${rowText("Assistant Name", F.assistant_name || "")}
            ${rowText("Timezone", F.timezone || "")}
            ${rowText("Computer Name", F.computer_name || "")}
            ${rowText("Meeting Recorder", F.meeting_recorder || "")}
          </table>
          ${sectionHead("Credentials")}
          <table style="width:100%;border-collapse:collapse;">
            ${rowCred("Anthropic API Key", F.anthropic_api_key || "")}
            ${rowCred("Telegram Bot Token", F.telegram_bot_token || "")}
            ${rowCred("Telegram Bot Username", F.telegram_bot_username || "")}
            ${rowCred("Fireflies API Key", F.fireflies_api_key || "")}
            ${rowCred("Tavily API Key", F.tavily_api_key || "")}
            ${rowCred("Calendly URL", F.calendly_url || "")}
          </table>
          ${itBlock}
        </div>
      `;
      try {
        await sendSummaryEmail({
          subject: `Technical Setup Complete: ${name}`,
          html: summaryHtml,
        });
      } catch (err) {
        console.error("[submit-setup] Email send failed:", err);
      }

      await sendTelegram(
        `<b>Technical Setup Complete — Apollo[Claw]</b>\n` +
          `<b>Name:</b> ${name}\n` +
          `<b>Email:</b> ${email}\n` +
          `<b>Assistant:</b> ${fields.assistant_name || ""}\n` +
          `<b>Computer:</b> ${fields.computer_name || ""}\n` +
          `<b>Timezone:</b> ${fields.timezone || ""}\n` +
          `<i>Full credentials in inbox.</i>`
      );

      // Write credentials to tbbz agent_setup (if client has a dashboard account)
      try {
        await upsertAgentSetup(email, "personal", {
          first_name: fields.first_name || "",
          last_name: fields.last_name || "",
          email,
          assistant_name: fields.assistant_name || "",
          timezone: fields.timezone || "",
          computer_name: fields.computer_name || "",
          meeting_recorder: fields.meeting_recorder || "",
          anthropic_api_key: fields.anthropic_api_key || "",
          telegram_bot_token: fields.telegram_bot_token || "",
          telegram_bot_username: fields.telegram_bot_username || "",
          fireflies_api_key: fields.fireflies_api_key || "",
          tavily_api_key: fields.tavily_api_key || "",
          calendly_url: fields.calendly_url || "",
          it_contact_name: fields.it_contact_name || "",
          it_contact_email: fields.it_contact_email || "",
          it_notes: fields.it_notes || "",
          submitted_at: new Date().toISOString(),
        });
      } catch (setupErr) {
        console.error("[submit-setup] agent_setup write failed (non-fatal):", setupErr);
      }

      // Tag contact as setup-complete in Mailchimp — triggers Ready to Build email
      try {
        await upsertMailchimpContact(email, name.split(" ")[0] || name, name.split(" ").slice(1).join(" ") || "");
        await tagMailchimpContact(email, ["ac-setup-complete", "Bot-Client"]);
      } catch (mcErr) {
        console.error("[submit-setup] Mailchimp tag failed (non-fatal):", mcErr);
      }

      // Attach setup credentials as a note on the Attio deal
      try {
        const dealId = await findAttioDealByEmail(email);
        if (dealId) {
          const noteLines = [
            `Setup Complete — ${name}`,
            `Email: ${email}`,
            `Assistant Name: ${fields.assistant_name || ""}`,
            `Timezone: ${fields.timezone || ""}`,
            `Computer Name: ${fields.computer_name || ""}`,
            `Meeting Recorder: ${fields.meeting_recorder || "fathom"}`,
            `Anthropic API Key: ${fields.anthropic_api_key || ""}`,
            `Telegram Bot Token: ${fields.telegram_bot_token || ""}`,
            `Telegram Bot Username: ${fields.telegram_bot_username || ""}`,
            `Fireflies API Key: ${fields.fireflies_api_key || ""}`,
            `Tavily API Key: ${fields.tavily_api_key || ""}`,
            `Calendly URL: ${fields.calendly_url || ""}`,
          ].filter(l => !l.endsWith(": ")).join("\n");
          await addAttioNote(dealId, "Technical Setup — Credentials", noteLines);
          await updateAttioDealStage(dealId, "Setup Complete", "deployment_ready");
        }
      } catch (attioErr) {
        console.error("[submit-setup] Attio note failed (non-fatal):", attioErr);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: `Unknown source: ${source}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[submit-setup] error:", msg);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
