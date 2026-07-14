import { NextRequest, NextResponse } from "next/server";
import { findOrCreateCrmEntity } from "@/lib/crm";
import { upsertPipelineDeal } from "@/lib/crm";
import { sendTelegram } from "@/lib/telegram";
import { createAttioDeal } from "@/lib/attio";
import puppeteer from "puppeteer";

const MANDRILL_KEY   = process.env.MANDRILL_API_KEY || "";
const BCC_EMAIL      = "david@apolloclaw.ai";
const SUPABASE_URL   = process.env.SUPABASE_URL || "";
const SUPABASE_SKEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const STORAGE_BUCKET = "intake-docs";

// ── Upload PDF to Supabase Storage, return public URL ───────────────────────
async function uploadPdfToStorage(pdfBase64: string, filename: string): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_SKEY) throw new Error("Supabase not configured");
  const pdfBuffer = Buffer.from(pdfBase64, "base64");
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SKEY}`,
        "apikey": SUPABASE_SKEY,
        "Content-Type": "application/pdf",
        "x-upsert": "true",
      },
      body: pdfBuffer,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${err}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
}

// ── Generate PDF summary via Puppeteer ───────────────────────────────────────
async function generatePrecallPdf(data: Record<string, unknown>, name: string): Promise<string> {
  const rows = [
    ["Name", name],
    ["Email", String(data.email || "")],
    data.company    ? ["Company",   String(data.company)]    : null,
    data.website    ? ["Website",   String(data.website)]    : null,
    data.role       ? ["Role",      String(data.role)]       : null,
    data.industry   ? ["Industry",  String(data.industry)]   : null,
    data.teamSize   ? ["Team Size", String(data.teamSize)]   : null,
  ].filter(Boolean) as [string, string][];

  const tableRows = rows.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;color:#6b7280;width:35%;border-bottom:1px solid #f0ede6;font-size:11pt;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #f0ede6;font-size:11pt;">${value}</td></tr>`
  ).join("");

  const timeBlock = Array.isArray(data.timeGoesTo) && data.timeGoesTo.length
    ? `<div style="margin:16px 0;padding:12px 16px;background:#f9f7f3;border-left:3px solid #6b7280;border-radius:3px;font-size:11pt;"><strong>Where time goes:</strong><br>${(data.timeGoesTo as string[]).join(", ")}</div>`
    : "";

  const painBlock = data.aiHelp
    ? `<div style="margin:16px 0;padding:12px 16px;background:#f9f7f3;border-left:3px solid #E8342A;border-radius:3px;font-size:11pt;"><strong>What they need AI for:</strong><br>${String(data.aiHelp).slice(0, 800)}</div>`
    : "";

  const cloneBlock = data.cloneJob
    ? `<div style="margin:16px 0;padding:12px 16px;background:#f9f7f3;border-left:3px solid #1a1a2e;border-radius:3px;font-size:11pt;"><strong>Job to clone:</strong><br>${String(data.cloneJob).slice(0, 800)}</div>`
    : "";

  const notesBlock = data.anythingElse
    ? `<div style="margin:16px 0;padding:12px 16px;background:#f9f7f3;border-left:3px solid #9da3af;border-radius:3px;font-size:11pt;"><strong>Additional notes:</strong><br>${String(data.anythingElse).slice(0, 800)}</div>`
    : "";

  const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fff; margin: 0; padding: 40px 50px; }
  h1 { font-family: 'Courier New', monospace; font-size: 14pt; font-weight: 900; letter-spacing: 1px; margin: 0 0 4px; }
  .sub { font-size: 10pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px; }
  .divider { border: none; border-top: 2px solid #E8342A; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .footer { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 12px; font-size: 9pt; color: #9da3af; }
  .brand-red { color: #E8342A; }
</style>
</head>
<body>
  <h1>Apollo<span class="brand-red">[</span>Claw<span class="brand-red">]</span></h1>
  <div class="sub">Pre-Call Questionnaire</div>
  <hr class="divider">
  <table>${tableRows}</table>
  ${timeBlock}${painBlock}${cloneBlock}${notesBlock}
  <div class="footer">Apollo[Claw] AI Consulting &nbsp;|&nbsp; 69 Roslyn Road, Roslyn Heights, NY 11577 &nbsp;|&nbsp; ${today}</div>
</body>
</html>`;

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
    });
    return Buffer.from(pdfBuffer).toString("base64");
  } finally {
    await browser.close();
  }
}

// ── Send summary email to David with PDF attachment ───────────────────────────
async function sendPrecallEmail(data: Record<string, unknown>, name: string, pdfBase64: string): Promise<void> {
  const rows: string[] = [
    `<tr><td style="padding:6px 0;color:#6b7280;width:35%;">Name</td><td style="padding:6px 0;"><strong>${name}</strong></td></tr>`,
    `<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${data.email}</td></tr>`,
    data.company  ? `<tr><td style="padding:6px 0;color:#6b7280;">Company</td><td style="padding:6px 0;">${data.company}</td></tr>` : "",
    data.website  ? `<tr><td style="padding:6px 0;color:#6b7280;">Website</td><td style="padding:6px 0;">${data.website}</td></tr>` : "",
    data.role     ? `<tr><td style="padding:6px 0;color:#6b7280;">Role</td><td style="padding:6px 0;">${data.role}</td></tr>` : "",
    data.industry ? `<tr><td style="padding:6px 0;color:#6b7280;">Industry</td><td style="padding:6px 0;">${data.industry}</td></tr>` : "",
    data.teamSize ? `<tr><td style="padding:6px 0;color:#6b7280;">Team Size</td><td style="padding:6px 0;">${data.teamSize}</td></tr>` : "",
  ].filter(Boolean);

  const painBlock  = data.aiHelp     ? `<div style="padding:12px 16px;background:#f9f7f3;border-left:3px solid #E8342A;border-radius:3px;font-size:13px;color:#4b5563;margin:16px 0;"><strong>What they need AI for:</strong><br>${String(data.aiHelp).slice(0,500)}</div>` : "";
  const cloneBlock = data.cloneJob   ? `<div style="padding:12px 16px;background:#f9f7f3;border-left:3px solid #1a1a2e;border-radius:3px;font-size:13px;color:#4b5563;margin:16px 0;"><strong>Job to clone:</strong><br>${String(data.cloneJob).slice(0,500)}</div>` : "";
  const notesBlock = data.anythingElse ? `<div style="padding:12px 16px;background:#f9f7f3;border-left:3px solid #6b7280;border-radius:3px;font-size:13px;color:#4b5563;margin:16px 0;"><strong>Additional notes:</strong><br>${String(data.anythingElse).slice(0,500)}</div>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0;color:#1a1a1a;">
      <div style="border-bottom:2px solid #E8342A;padding-bottom:16px;margin-bottom:24px;">
        <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
        <span style="font-size:12px;color:#6b7280;margin-left:12px;text-transform:uppercase;letter-spacing:0.08em;">Pre-Call Questionnaire</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">${rows.join("")}</table>
      ${painBlock}${cloneBlock}${notesBlock}
      <p style="font-size:12px;color:#9da3af;margin-top:24px;">PDF summary attached.</p>
    </div>`;

  const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  await fetch("https://mandrillapp.com/api/1.0/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: MANDRILL_KEY,
      message: {
        from_email: "david@apolloclaw.ai",
        from_name: "David Oralevich | Apollo[Claw]",
        to: [{ email: BCC_EMAIL, name: "David Oralevich", type: "to" }],
        subject: `Pre-Call: ${name}${data.company ? " - " + data.company : ""}`,
        html,
        important: true,
        attachments: [
          {
            type: "application/pdf",
            name: `precall-${safeName}.pdf`,
            content: pdfBase64,
          },
        ],
      },
    }),
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const name = data.name || "Unknown";

    // 1. CRM Discovery card (upsert so repeat submissions update not duplicate)
    try {
      await upsertPipelineDeal(data.email, {
        client_name: name,
        contact_name: name,
        contact_email: data.email,
        brand: "Apollo Claw",
        brand_color: "#E8342A",
        stage: "discovery",
        notes: [
          data.company   ? `Company: ${data.company}`     : null,
          data.website   ? `Website: ${data.website}`     : null,
          data.role      ? `Role: ${data.role}`            : null,
          data.industry  ? `Industry: ${data.industry}`   : null,
          data.teamSize  ? `Team Size: ${data.teamSize}`  : null,
          data.aiHelp    ? `AI Help: ${String(data.aiHelp).slice(0, 300)}` : null,
          data.cloneJob  ? `Clone Job: ${String(data.cloneJob).slice(0, 300)}` : null,
        ].filter(Boolean).join("\n"),
        next_action: "Review pre-call questionnaire",
      });
      console.log(`[submit-precall] CRM pipeline card upserted for ${data.email}`);
    } catch (crmErr: unknown) {
      const msg = crmErr instanceof Error ? crmErr.message : String(crmErr);
      console.error("[submit-precall] CRM error:", msg);
      // non-fatal — continue
    }

    // 1b. Write entities + companies so the card appears on the kanban board
    try {
      await findOrCreateCrmEntity(name, data.email as string, 'discovery', 'Pre-call questionnaire submitted');

      // Create Attio deal at Prospect stage
      try {
        const firstName = name.split(' ')[0] || name;
        const lastName = name.split(' ').slice(1).join(' ') || '';
        await createAttioDeal({
          name,
          email: data.email as string,
          firstName,
          lastName,
          company: data.company as string || '',
          industry: data.industry as string || '',
          referralSource: 'Pre-Call Form',
        });
      } catch (attioErr) {
        console.error('[submit-precall] Attio deal failed (non-fatal):', attioErr);
      }
    } catch (entityErr: unknown) {
      const msg = entityErr instanceof Error ? entityErr.message : String(entityErr);
      console.error('[submit-precall] CRM entity creation failed:', msg);
    }

    // 2. Generate PDF
    let pdfBase64 = "";
    let pdfStorageUrl = "";
    try {
      pdfBase64 = await generatePrecallPdf(data, name);
      console.log(`[submit-precall] PDF generated for ${name}`);
    } catch (pdfErr: unknown) {
      const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
      console.error("[submit-precall] PDF generation failed:", msg);
    }

    // 2b. Upload PDF to storage + patch CRM card notes with URL
    if (pdfBase64) {
      try {
        const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
        const ts = Date.now();
        const filename = `precall-${safeName}-${ts}.pdf`;
        pdfStorageUrl = await uploadPdfToStorage(pdfBase64, filename);
        await upsertPipelineDeal(data.email as string, {
          notes: [
            data.company   ? `Company: ${data.company}`   : null,
            data.website   ? `Website: ${data.website}`   : null,
            data.role      ? `Role: ${data.role}`          : null,
            data.industry  ? `Industry: ${data.industry}` : null,
            data.teamSize  ? `Team Size: ${data.teamSize}` : null,
            data.aiHelp    ? `AI Help: ${String(data.aiHelp).slice(0, 300)}`   : null,
            data.cloneJob  ? `Clone Job: ${String(data.cloneJob).slice(0, 300)}` : null,
            `Pre-call PDF: ${pdfStorageUrl}`,
          ].filter(Boolean).join("\n"),
        });
        console.log(`[submit-precall] PDF stored and CRM card updated: ${pdfStorageUrl}`);
      } catch (storErr: unknown) {
        const msg = storErr instanceof Error ? storErr.message : String(storErr);
        console.error("[submit-precall] PDF storage/CRM patch failed:", msg);
      }
    }

    // 3. Telegram notification
    await sendTelegram(
      `<b>Pre-Call Questionnaire - Apollo Claw</b>\n<b>Name:</b> ${name}\n<b>Email:</b> ${data.email}${data.company ? `\n<b>Company:</b> ${data.company}` : ""}${data.role ? `\n<b>Role:</b> ${data.role}` : ""}${data.industry ? `\n<b>Industry:</b> ${data.industry}` : ""}`
    );

    // 4. Summary email to David with PDF attached
    try {
      await sendPrecallEmail(data, name, pdfBase64);
      console.log(`[submit-precall] Summary email sent to ${BCC_EMAIL}`);
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("[submit-precall] Summary email failed:", msg);
    }

    // 5. Confirmation email to the client
    try {
      const clientHtml = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0;color:#1a1a1a;">
        <div style="border-bottom:2px solid #E8342A;padding-bottom:14px;margin-bottom:22px;">
          <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
        </div>
        <p>Hi ${name},</p>
        <p>Thanks for taking a few minutes to fill this out. We'll be ready to hit the ground running on our call.</p>
        <p style="margin-top:24px;">Looking forward to our call.</p>
        <p style="color:#6b7280;font-size:13px;">- David Oralevich</p>
        <p style="font-size:11px;color:#9da3af;margin-top:32px;border-top:1px solid #e0e0e0;padding-top:12px;">Apollo[Claw] AI Consulting | 69 Roslyn Road, Roslyn Heights, NY 11577</p>
      </div>`;
      await fetch("https://mandrillapp.com/api/1.0/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: MANDRILL_KEY,
          message: {
            from_email: "david@apolloclaw.ai",
            from_name: "David Oralevich | Apollo[Claw]",
            to: [{ email: data.email, name, type: "to" }],
            bcc_address: "david@apolloclaw.ai",
            subject: "Looking forward to our call — Apollo[Claw]",
            html: clientHtml,
            important: true,
          },
        }),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[submit-precall] Client confirmation email failed:", msg);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("submit-precall error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
