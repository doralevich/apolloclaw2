import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { getCrmToken, createCrmClient, createCrmTask } from "@/lib/crm";
import { sendTelegram } from "@/lib/telegram";
import { upsertMailchimpContact, tagMailchimpContact } from "@/lib/mailchimp";
import { createAttioDeal } from "@/lib/attio";
import { execFile } from "child_process";
import { promisify } from "util";
import * as path from "path";
const execFileAsync = promisify(execFile);

const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";

async function generateIntakePdf(data: Record<string, unknown>): Promise<Buffer | null> {
  try {
    const scriptPath = path.join(process.cwd(), "lib", "intake-pdf-gen.cjs");
    const b64Input = Buffer.from(JSON.stringify({ ...data, trackType: "business" })).toString("base64");
    const { stdout } = await execFileAsync("node", [scriptPath, b64Input], {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 60000,
    });
    return Buffer.from(stdout, "base64");
  } catch (err) {
    console.error("[submit-intake] PDF generation failed:", err);
    return null;
  }
}

async function sendIntakeSummaryToDavid(name: string, email: string, pdfBuffer: Buffer | null, mandrillKey: string): Promise<void> {
  if (!mandrillKey) return;
  const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "client";
  const message: Record<string, unknown> = {
    from_email: "david@apolloclaw.ai",
    from_name: "Apollo[Claw] Intake",
    to: [{ email: "david@apolloclaw.ai", name: "David Oralevich", type: "to" }],
    subject: `Intake Form Received: ${name}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1a1a1a;">
      <div style="border-bottom:2px solid #E8342A;padding-bottom:12px;margin-bottom:20px;">
        <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
      </div>
      <p><strong>New Intake Form Received</strong></p>
      <p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
      <p style="color:#595959;font-size:13px;">Full intake details in the attached PDF.</p>
    </div>`,
    important: true,
  };
  if (pdfBuffer) {
    message.attachments = [{
      type: "application/pdf",
      name: `intake-${safeName}.pdf`,
      content: pdfBuffer.toString("base64"),
    }];
  }
  try {
    await fetch("https://mandrillapp.com/api/1.0/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: mandrillKey, message }),
    });
  } catch (err) {
    console.error("[submit-intake] David summary email failed:", err);
  }
}


async function sendSetupLinkEmail(email: string, firstName: string): Promise<void> {
  if (!MANDRILL_KEY) {
    console.warn("[submit-intake] MANDRILL_API_KEY not set — skipping setup-link email");
    return;
  }
  try {
    const res = await fetch("https://mandrillapp.com/api/1.0/messages/send-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: MANDRILL_KEY,
        template_name: "apolloclaw-setup-link",
        template_content: [],
        message: {
          from_email: "hello@apolloclaw.ai",
          from_name: "Apollo[Claw]",
          to: [{ email, name: firstName || email, type: "to" }],
          bcc_address: "david@apolloclaw.ai",
          subject: "Last step: complete your Technical Setup — Apollo[Claw]",
          important: true,
          merge_vars: [
            {
              rcpt: email,
              vars: [{ name: "FNAME", content: firstName || "" }],
            },
          ],
        },
      }),
    });
    const result = await res.json();
    if (!Array.isArray(result)) {
      console.error("[submit-intake] Mandrill unexpected response:", JSON.stringify(result));
      return;
    }
    const status = result[0]?.status;
    if (status !== "sent" && status !== "queued") {
      console.error("[submit-intake] Mandrill setup-link rejected:", JSON.stringify(result[0]));
    }
  } catch (err) {
    console.error("[submit-intake] setup-link email failed:", err);
  }
}

export async function POST(req: NextRequest) {
  // Rate limit before any work: this endpoint is public and unauthenticated.
  // Fails open if the limiter is unavailable (see lib/rate-limit.ts).
  const limited = await enforceRateLimit(req, "submit-intake", LIMITS.form);
  if (limited) return limited;

  try {
    const data = await req.json();
    const firstName = data.firstName || (data.name ? String(data.name).split(" ")[0] : "") || "";
    const lastName = data.lastName || (data.name ? String(data.name).split(" ").slice(1).join(" ") : "") || "";
    const name = data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || "Unknown";

    // ── Legacy CRM (operational backend) ────────────────────────────────────
    try {
      const token = await getCrmToken();
      const clientRes = await createCrmClient(token, {
        name,
        email: data.email,
        company: data.company || "",
        status: "prospect",
        business_id: "apolloclaw",
        referral_source: "Apollo Claw Intake Form",
        industry: data.industry || "",
        phone: data.phone || "",
      });
      const clientId = (clientRes as Record<string, unknown>)?.id as string || null;

      const descLines = [
        `Intake Form Submission`,
        `Name: ${name}`,
        `Email: ${data.email}`,
        ...Object.entries(data)
          .filter(([k]) => !["name", "email", "firstName", "lastName"].includes(k))
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`),
      ];

      await createCrmTask(token, {
        title: `Intake Form — ${name}`,
        description: descLines.join("\n"),
        status: "pending",
        priority: "high",
        business_id: "apolloclaw",
        ...(clientId ? { client_id: clientId } : {}),
      });
    } catch (crmErr) {
      console.error("CRM error (non-fatal):", crmErr);
    }

    // ── Attio: create deal in Apollo Claw Pipeline ───────────────────────────
    if (data.email) {
      try {
        await createAttioDeal({
          name,
          email: String(data.email),
          firstName,
          lastName,
          company: data.company || "",
          industry: data.industry || "",
          phone: data.phone || "",
          referralSource: "Apollo Claw Intake Form",
        });
      } catch (attioErr) {
        console.error("[submit-intake] Attio deal creation failed (non-fatal):", attioErr);
      }
    }

    // ── Mailchimp: upsert contact + tag as intake-submitted ──────────────────
    if (data.email) {
      try {
        await upsertMailchimpContact(String(data.email), firstName, lastName);
        await tagMailchimpContact(String(data.email), ["ac-intake-submitted", "Bot-Onboarding"]);
      } catch (mcErr) {
        console.error("[submit-intake] Mailchimp tag failed (non-fatal):", mcErr);
      }
    }

    // ── Generate PDF + send summary to David ────────────────────────────────
    try {
      const pdfBuffer = await generateIntakePdf({ ...data, firstName, lastName });
      await sendIntakeSummaryToDavid(name, String(data.email || ""), pdfBuffer, MANDRILL_KEY);
    } catch (pdfErr) {
      console.error("[submit-intake] PDF/summary failed (non-fatal):", pdfErr);
    }

    await sendTelegram(
      `<b>📝 Setup Form — Apollo[Claw]</b>
<b>Name:</b> ${name}
<b>Email:</b> ${data.email}
${Object.entries(data).filter(([k,v])=>!["firstName","lastName","email"].includes(k)&&v!==null&&v!==undefined&&v!==String()).map(([k,v])=>`<b>${k}:</b> ${Array.isArray(v)?v.join(", "):v}`).join("\n")}`,
    );

    if (data.email) {
      await sendSetupLinkEmail(String(data.email), firstName);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("submit-intake error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
