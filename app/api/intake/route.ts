import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { sendTelegram } from "@/lib/telegram";
import * as path from "path";
import * as fs from "fs";
import { upsertMailchimpContact, tagMailchimpContact } from "@/lib/mailchimp";
import { createAttioDeal, findAttioDealByEmail, updateAttioDealStage } from "@/lib/attio";
import { renderSectionsPdf, type PdfSectionInput } from "@/lib/pdf";
import { buildIntakeSections as buildSharedSections, sectionsToHtml, escapeHtml } from "@/lib/onboardingSections";

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
// CRM writes go to the separate "Brain" Supabase project. Prefer a dedicated
// CRM_SUPABASE_SERVICE_KEY (that project's service_role key) — the shared
// SUPABASE_SERVICE_ROLE_KEY belongs to the storefront/dashboard project and 401s here.
const SUPA_URL = process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || "https://moubzvpffhqvumipbnfj.supabase.co";
const SUPA_KEY = process.env.CRM_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";

const trackLabel: Record<string, string> = {
  business: "Business Owner / Executive",
  personal: "Personal CEO",
  student: "Collegiate — Student",
  admin: "Collegiate — Administrator",
  agency: "Agency / Reseller",
};

// Which entry point the submission came through. /white-glove-onboarding sends
// "white-glove"; plain /onboard sends "self-serve". Older submissions predate the field and
// send nothing, so absence is treated as self-serve rather than as an error. The two forms
// are identical, so without this marker there is no way to tell an invited client's
// onboarding from a cold lead once it lands in the inbox.
function isWhiteGlove(d: Record<string, unknown>): boolean {
  return String(d.leadSource || "") === "white-glove";
}

// Set when the questionnaire was completed on the paid side of the /onboard paywall, which
// is the difference between a customer's build brief and a prospect's enquiry. This is a
// display hint only — the money is confirmed by the Stripe webhook, never by a form post.
function isPaidIntake(d: Record<string, unknown>): boolean {
  return d.paid === true;
}

// What to call this submission in the subject line and on the PDF badge.
function intakeKind(d: Record<string, unknown>): string | null {
  if (isWhiteGlove(d)) return "White Glove";
  if (isPaidIntake(d)) return "Paid";
  return null;
}

// ─── Build the intake sections, grouped by track ──────────────────────────────
// The business/personal core is shared with the paid post-checkout flow (see
// lib/onboardingSections.ts); student/admin/agency are legacy tracks specific to
// this route (the current /onboard form only ever submits "business").
function buildIntakeSections(d: Record<string, unknown>): PdfSectionInput[] {
  const track = String(d.trackType || "");
  const sections = buildSharedSections(d);

  if (track === "student") {
    sections.push({
      title: "Academic Profile",
      rows: [
        { label: "School", value: d.school },
        { label: "School Type", value: d.schoolType },
        { label: "Year", value: d.year },
        { label: "Major", value: d.major },
        { label: "AI Bot Uses", value: d.uses },
        { label: "Current AI Tools", value: d.currentTools },
        { label: "Biggest Challenge", value: d.goalShort },
        { label: "Longer-Term Goal", value: d.goalLong },
        { label: "Budget", value: d.budget },
        { label: "Timeline", value: d.timeline },
      ],
    });
  }

  if (track === "admin") {
    sections.push({
      title: "Institutional Profile",
      rows: [
        { label: "Role", value: d.adminRole },
        { label: "School", value: d.school },
        { label: "School Type", value: d.schoolType },
        { label: "AI Bot Uses", value: d.uses },
        { label: "Compliance", value: d.compliance },
        { label: "Budget", value: d.budget },
        { label: "Timeline", value: d.timeline },
      ],
    });
  }

  if (track === "agency") {
    sections.push({
      title: "Agency Profile",
      rows: [
        { label: "Agency Name", value: d.agencyName },
        { label: "Website", value: d.website },
        { label: "Agency Size", value: d.size },
        { label: "Agency Model", value: d.model },
        { label: "Client Types", value: d.clientTypes },
        { label: "Client Count", value: d.clientCount },
        { label: "Services Offered", value: d.services },
        { label: "Why Partner", value: d.whyPartner },
        { label: "Revenue Goal", value: d.revenue },
        { label: "Timeline", value: d.timeline },
        { label: "Questions", value: d.questions },
      ],
    });
  }

  return sections;
}

// ─── Generate the intake PDF (serverless-safe, @react-pdf/renderer) ────────────
async function generateIntakePdf(data: Record<string, unknown>): Promise<Buffer | null> {
  try {
    const track = String(data.trackType || "");
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const heading = [name, data.email].filter(Boolean).join(" • ");
    const submittedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return await renderSectionsPdf({
      docTitle: "Client Intake Form",
      heading,
      submittedAt,
      badge: [trackLabel[track] || track, intakeKind(data)].filter(Boolean).join(" • "),
      sections: buildIntakeSections(data),
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return null;
  }
}

// ─── Send email via Mandrill (with optional PDF attachment) ───────────────────
async function sendEmail(opts: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
  extraAttachments?: Array<{ name: string; type: string; contentBase64: string }>;
}): Promise<boolean> {
  try {
    const message: Record<string, unknown> = {
      from_email: "david@apolloclaw.ai",
      from_name: "David Oralevich | Apollo[Claw]",
      to: [{ email: opts.to, name: opts.toName, type: "to" }],
      bcc_address: "david@apolloclaw.ai",
      subject: opts.subject,
      html: opts.html,
      important: true,
    };

    const attachments: Array<{ type: string; name: string; content: string }> = [];
    if (opts.pdfBuffer && opts.pdfFilename) {
      attachments.push({ type: "application/pdf", name: opts.pdfFilename, content: opts.pdfBuffer.toString("base64") });
    }
    for (const a of opts.extraAttachments ?? []) {
      if (a.contentBase64) attachments.push({ type: a.type || "application/octet-stream", name: a.name || "file", content: a.contentBase64 });
    }
    if (attachments.length) message.attachments = attachments;

    const res = await fetch("https://mandrillapp.com/api/1.0/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: MANDRILL_KEY, message }),
    });
    const result = await res.json() as Array<{ status: string }>;
    return Array.isArray(result) && result[0]?.status !== "rejected" && result[0]?.status !== "invalid";
  } catch (err) {
    console.error("Mandrill send failed:", err);
    return false;
  }
}

// ─── Find or create CRM pipeline card via entities + companies tables ───────────
async function findOrCreateCrmClient(
  name: string,
  email: string,
  phone: string,
  company: string,
  trackType: string
): Promise<string | null> {
  const sbHeaders: Record<string, string> = {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  // Everything below keys off this, never the raw string. The lookup is an exact match, so
  // "Dave@Company.com" and "dave@company.com" were two different people to this code: two
  // cards, two deals, a split history for one prospect. Every apolloclaw row already stores a
  // lowercase address, so normalising on the way in is enough — no backfill, and Donna's dbdo
  // rows (which do carry mixed case) are left alone.
  const cleanEmail = email.trim().toLowerCase();
  const enc = encodeURIComponent(cleanEmail);
  const label = trackLabel[trackType] || trackType;
  if (!SUPA_KEY) {
    console.error("[intake][crm] SUPABASE service-role key is MISSING — CRM writes skipped (email/PDF still send)");
    return null;
  }
  try {
    // 1. Find or create a company entity keyed by email (the pipeline board card)
    const cardSearch = await fetch(
      `${SUPA_URL}/rest/v1/entities?kind=eq.company&email=eq.${enc}&business_id=eq.apolloclaw&limit=1`,
      { headers: sbHeaders }
    );
    if (!cardSearch.ok) {
      console.error(`[intake][crm] entity lookup rejected — HTTP ${cardSearch.status} at ${SUPA_URL} (401=bad/rotated key, 404=wrong project):`, (await cardSearch.text()).slice(0, 300));
      return null;
    }
    const cardFound = await cardSearch.json() as Array<{ id: string }>;
    let cardId: string | null = null;

    if (Array.isArray(cardFound) && cardFound.length > 0) {
      cardId = cardFound[0].id;
      // A repeat submission carries the person's LATEST answers, and the card used to ignore
      // them completely — it found the id and returned. So a corrected phone number or a
      // changed company name lived only inside the PDF, while the board kept showing whatever
      // they typed the first time and looked authoritative doing it.
      //
      // Only non-empty values overwrite. Someone who skips the company field on a second pass
      // is not asking us to erase the company they gave us on the first.
      const refresh: Record<string, string> = {};
      if (name.trim()) refresh.name = name.trim();
      if (phone.trim()) refresh.phone = phone.trim();
      if (company.trim()) refresh.company_text = company.trim();
      if (Object.keys(refresh).length) {
        const patch = await fetch(`${SUPA_URL}/rest/v1/entities?id=eq.${cardId}`, {
          method: "PATCH",
          headers: { ...sbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify(refresh),
        });
        if (!patch.ok) {
          // Worth a line in the log, not worth failing the submission over. The intake email
          // and PDF still carry the new details either way.
          console.error(`[intake][crm] card refresh rejected — HTTP ${patch.status}:`, (await patch.text()).slice(0, 200));
        }
      }
    } else {
      // Create company entity
      const cardRes = await fetch(`${SUPA_URL}/rest/v1/entities`, {
        method: "POST", headers: sbHeaders,
        body: JSON.stringify({
          kind: "company", name: name, email: cleanEmail,
          phone: phone || null, company_text: company || null,
          business_id: "apolloclaw", status: "contacted", type: "apolloclaw",
          notes: `Intake form submitted — Track: ${label}`,
          referral_source: "intake_form",
        }),
      });
      // 409 means the unique index caught a duplicate this request lost the race to: another
      // submission for the same address created the card between our search and our insert.
      // The right answer is the card that won, not an error — the person did nothing wrong,
      // they double-clicked. Search again and use what is there.
      if (cardRes.status === 409) {
        const retry = await fetch(
          `${SUPA_URL}/rest/v1/entities?kind=eq.company&email=eq.${enc}&business_id=eq.apolloclaw&limit=1`,
          { headers: sbHeaders }
        );
        const rows = retry.ok ? (await retry.json()) as Array<{ id: string }> : [];
        if (rows.length > 0) {
          console.warn(`[intake][crm] duplicate create raced and lost for ${cleanEmail}; using existing card`);
          return rows[0].id;
        }
        console.error(`[intake][crm] entity create hit a 409 but no existing card was found for ${cleanEmail}`);
        return null;
      }
      if (!cardRes.ok) {
        console.error(`[intake][crm] entity create rejected — HTTP ${cardRes.status} at ${SUPA_URL} (401=bad/rotated key, 404=wrong project):`, (await cardRes.text()).slice(0, 300));
        return null;
      }
      const cardCreated = await cardRes.json() as Array<{ id: string }>;
      if (Array.isArray(cardCreated) && cardCreated.length > 0) {
        cardId = cardCreated[0].id;
        // Insert into lean companies table so the kanban board renders it
        await fetch(`${SUPA_URL}/rest/v1/companies`, {
          method: "POST", headers: sbHeaders,
          body: JSON.stringify({
            id: cardId, name: name, status: "contacted",
            type: "apolloclaw", business_id: "apolloclaw",
          }),
        });
        // Create pipeline deal
        await fetch(`${SUPA_URL}/rest/v1/pipeline_deals`, {
          method: "POST", headers: sbHeaders,
          body: JSON.stringify({
            client_name: name, contact_name: name, contact_email: cleanEmail,
            brand: "Apollo Claw", brand_color: "#E8342A",
            stage: "contacted", onboarding_status: "awaiting_step1",
          }),
        });
      }
    }
    return cardId;
  } catch (err) {
    console.error("CRM client lookup/create failed:", err);
    return null;
  }
}

// ─── Log intake note via Supabase ─────────────────────────────────────────────
async function logCrmNote(clientId: string, summary: string): Promise<void> {
  try {
    await fetch(`${SUPA_URL}/rest/v1/interactions`, {
      method: "POST",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        client_id: clientId,
        type: "note",
        summary,
        business_id: "apolloclaw",
      }),
    });
  } catch (err) {
    console.error("CRM note logging failed:", err);
  }
}


// ─── Upload PDF to Supabase Storage, return public URL ───────────────────────
async function uploadIntakePdf(pdfBuffer: Buffer, filename: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${SUPA_URL}/storage/v1/object/intake-docs/${filename}`,
      {
        method: "POST",
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          "Content-Type": "application/pdf",
          "x-upsert": "true",
        },
        body: new Uint8Array(pdfBuffer),
      }
    );
    if (!res.ok) { console.error("PDF upload failed:", await res.text()); return null; }
    return `${SUPA_URL}/storage/v1/object/public/intake-docs/${filename}`;
  } catch (err) {
    console.error("PDF upload error:", err);
    return null;
  }
}

// ─── Upload an arbitrary client-provided file to Supabase Storage ─────────────
async function uploadClientFile(buffer: Buffer, filename: string, contentType: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPA_URL}/storage/v1/object/intake-docs/${filename}`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": contentType || "application/octet-stream", "x-upsert": "true" },
      body: new Uint8Array(buffer),
    });
    if (!res.ok) { console.error("[intake] client file upload failed:", await res.text()); return null; }
    return `${SUPA_URL}/storage/v1/object/public/intake-docs/${filename}`;
  } catch (err) {
    console.error("[intake] client file upload error:", err);
    return null;
  }
}

// ─── Store document link on CRM entity card ───────────────────────────────────
async function attachDocumentToEntity(entityId: string, label: string, title: string, url: string): Promise<void> {
  try {
    // Fetch current entity raw_data
    const fetchRes = await fetch(
      `${SUPA_URL}/rest/v1/entities?id=eq.${entityId}&select=raw_data`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    const rows = await fetchRes.json() as Array<{ raw_data: Record<string, unknown> | null }>;
    const existing = rows[0]?.raw_data || {};
    const docs = Array.isArray((existing as Record<string, unknown>).documents)
      ? [...(existing as { documents: unknown[] }).documents]
      : [];
    docs.push({ label, title, url, added_at: new Date().toISOString() });
    await fetch(`${SUPA_URL}/rest/v1/entities?id=eq.${entityId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({ raw_data: { ...existing, documents: docs } }),
    });
  } catch (err) {
    console.error("attachDocumentToEntity failed:", err);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limit before any work: this endpoint is public and unauthenticated.
  // Fails open if the limiter is unavailable (see lib/rate-limit.ts).
  const limited = await enforceRateLimit(req, "intake", LIMITS.form);
  if (limited) return limited;

  try {
    const data = await req.json();
    const { trackType, firstName, lastName, email, phone } = data;
    const fullName = `${firstName} ${lastName}`.trim();
    const track = trackLabel[trackType] || trackType;
    const company = (data.companyName || data.agencyName || data.school || "") as string;

    // Config visibility: on every submission, surface whether the CRM is wired up correctly
    // in the Vercel logs — without ever printing the secret. A "MISSING" key here is the
    // usual reason emails arrive but no CRM card appears.
    console.log(
      `[intake][config] supabaseUrl=${SUPA_URL} serviceRoleKey=${SUPA_KEY ? `present(len ${SUPA_KEY.length})` : "MISSING"}`
    );

    // 1. Telegram text summary
    const lines = [
      `<b>🎯 New Apollo[Claw] Intake — ${track}</b>`,
      `<b>Name:</b> ${fullName}`,
      `<b>Email:</b> ${email}`,
      `<b>Phone:</b> ${phone || "—"}`,
    ];
    if (company) lines.push(`<b>Company:</b> ${company}`);
    if (data.industry) lines.push(`<b>Industry:</b> ${data.industry}`);
    if (data.budget) lines.push(`<b>Budget:</b> ${data.budget}`);
    if (data.timeline) lines.push(`<b>Timeline:</b> ${data.timeline}`);
    if (data.mainPain) lines.push(`\n<b>Pain:</b> ${String(data.mainPain).slice(0, 300)}`);
    if (data.goalShort) lines.push(`\n<b>Goal:</b> ${String(data.goalShort).slice(0, 200)}`);
    lines.push(`\n<i>Full details in the email to david@apolloclaw.ai.</i>`);
    await sendTelegram(lines.join("\n"));

    // 2. Generate PDF
    const safeName = fullName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const safeCompany = (company || fullName).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const filenameParts = [safeName, safeCompany].filter(Boolean);
    const filename = `apolloclaw-intake-${[...new Set(filenameParts)].join("-")}.pdf`;
    const pdfBuffer = await generateIntakePdf({ ...data, trackType });

    // 3. Email to submitter
    const submitterHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F5F2EC;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F2EC;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e8e5df;">
      <tr><td style="padding:32px 36px 28px;">
        <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:900;color:#1a1a1a;letter-spacing:-0.5px;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></p>
        <p style="margin:0 0 28px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#888888;">AI Consulting</p>
        <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a;line-height:1.6;">Hi ${firstName},</p>
        <p style="margin:0 0 28px;font-size:15px;color:#595959;line-height:1.75;">Your intake form is in. We will review and be in touch with next steps.</p>
        <p style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">Talk soon,</p>
        <p style="margin:0 0 28px;font-size:14px;color:#1a1a1a;">David Oralevich</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #e8e5df;padding-top:20px;">
          <p style="margin:0 0 3px;font-size:11px;color:#b0b0b0;">Apollo[Claw] AI Consulting &nbsp;&middot;&nbsp; 69 Roslyn Road, Roslyn Heights, NY 11577</p>
          <p style="margin:0;font-size:11px;color:#b0b0b0;"><a href="https://apolloclaw.ai" style="color:#b0b0b0;text-decoration:none;">apolloclaw.ai</a> &nbsp;&middot;&nbsp; <a href="mailto:david@apolloclaw.ai" style="color:#b0b0b0;text-decoration:none;">david@apolloclaw.ai</a></p>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    await sendEmail({
      to: email,
      toName: fullName,
      subject: "Got it — Apollo[Claw]",
      html: submitterHtml,
      pdfBuffer: pdfBuffer || undefined,
      pdfFilename: pdfBuffer ? filename : undefined,
    });

    // 4. Email to David with full summary + PDF
    const davidHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0;color:#1a1a1a;">
        <div style="border-bottom:2px solid #E8342A;padding-bottom:16px;margin-bottom:24px;">
          <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
          <span style="font-size:12px;color:#6b7280;margin-left:12px;text-transform:uppercase;letter-spacing:0.08em;">New Intake</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
          <tr><td style="padding:6px 0;color:#6b7280;width:35%;">Name</td><td style="padding:6px 0;"><strong>${fullName}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${email}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;">${phone || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Track</td><td style="padding:6px 0;">${track}</td></tr>
          ${company ? `<tr><td style="padding:6px 0;color:#6b7280;">Company</td><td style="padding:6px 0;">${company}</td></tr>` : ""}
          ${data.industry ? `<tr><td style="padding:6px 0;color:#6b7280;">Industry</td><td style="padding:6px 0;">${data.industry}</td></tr>` : ""}
          ${data.budget ? `<tr><td style="padding:6px 0;color:#6b7280;">Budget</td><td style="padding:6px 0;">${data.budget}</td></tr>` : ""}
          ${data.timeline ? `<tr><td style="padding:6px 0;color:#6b7280;">Timeline</td><td style="padding:6px 0;">${data.timeline}</td></tr>` : ""}
        </table>
        ${data.mainPain ? `<div style="padding:12px 16px;background:#f9f7f3;border-left:3px solid #E8342A;border-radius:3px;font-size:13px;color:#4b5563;margin-bottom:16px;">${escapeHtml(String(data.mainPain).slice(0, 500))}</div>` : ""}
        ${sectionsToHtml(buildIntakeSections({ ...data, trackType }))}
        <p style="font-size:13px;color:#6b7280;margin-top:20px;">${pdfBuffer ? "Full intake form is also attached as a PDF." : "Note: the PDF attachment could not be generated this time. Every answer is included above."}</p>
      </div>`;

    await sendEmail({
      to: "david@apolloclaw.ai",
      toName: "David Oralevich",
      subject: `${intakeKind(data) ? `${intakeKind(data)} Intake` : "New Intake"}: ${fullName}${company ? ` — ${company}` : ""} [${track}]`,
      html: davidHtml,
      pdfBuffer: pdfBuffer || undefined,
      pdfFilename: pdfBuffer ? filename : undefined,
      // Attach the client's uploaded materials to the internal email as well.
      extraAttachments: (Array.isArray(data.uploadedFiles) ? (data.uploadedFiles as Array<Record<string, unknown>>) : [])
        .map((u) => ({
          name: typeof u.name === "string" ? u.name : "file",
          type: typeof u.type === "string" ? u.type : "application/octet-stream",
          contentBase64: typeof u.dataBase64 === "string" ? u.dataBase64 : "",
        }))
        .filter((a) => a.contentBase64),
    });

    // 5. Upload PDF to Supabase Storage and attach to CRM entity card
    let docUrl: string | null = null;
    if (pdfBuffer) {
      docUrl = await uploadIntakePdf(pdfBuffer, filename);
    }

    // Store client-uploaded materials in Supabase Storage regardless of CRM status,
    // so uploads are never lost when the CRM write fails. Links are attached to the
    // CRM card below only when we have a clientId.
    const uploads = Array.isArray(data.uploadedFiles) ? (data.uploadedFiles as Array<Record<string, unknown>>) : [];
    const uploadedDocs: { name: string; url: string }[] = [];
    for (const up of uploads) {
      const b64 = typeof up.dataBase64 === "string" ? up.dataBase64 : "";
      const origName = typeof up.name === "string" && up.name ? up.name : "file";
      if (!b64) continue;
      try {
        const buf = Buffer.from(b64, "base64");
        const safe = `${Date.now()}-${origName.replace(/[^a-z0-9._-]/gi, "-")}`;
        const url = await uploadClientFile(buf, safe, typeof up.type === "string" ? up.type : "application/octet-stream");
        if (url) uploadedDocs.push({ name: origName, url });
      } catch (e) {
        console.error("[intake] failed to store client upload:", origName, e);
      }
    }

    // 6. CRM — find or create client, log note
    const clientId = await findOrCreateCrmClient(fullName, email, phone, company, trackType);
    let crmStatus: "ok" | "write_failed" | "no_service_key";
    if (clientId) {
      // Attach intake PDF + any client uploads to the Documents section of the CRM card
      if (docUrl) {
        await attachDocumentToEntity(clientId, "Intake Form", `Apollo[Claw] Intake — ${fullName}`, docUrl);
      }
      for (const ud of uploadedDocs) {
        await attachDocumentToEntity(clientId, "Client Upload", ud.name, ud.url);
      }
      const noteLines = [
        `Apollo[Claw] intake form submitted — ${track}`,
        `Name: ${fullName} | Email: ${email} | Phone: ${phone || "—"}`,
        company ? `Company: ${company}` : "",
        data.industry ? `Industry: ${data.industry}` : "",
        data.budget ? `Budget: ${data.budget}` : "",
        data.timeline ? `Timeline: ${data.timeline}` : "",
        data.mainPain ? `\nPain Point: ${String(data.mainPain).slice(0, 500)}` : "",
        data.aiGoals ? `AI Goals: ${Array.isArray(data.aiGoals) ? (data.aiGoals as string[]).join(", ") : data.aiGoals}` : "",
        `\nEmails sent to ${email} and david@apolloclaw.ai with PDF attached.`,
      ].filter(Boolean);

      await logCrmNote(clientId, noteLines.join("\n"));
      await sendTelegram(`<b>✅ CRM logged</b> — ${fullName} under Apollo[Claw] prospects. Emails delivered.`);
      crmStatus = "ok";
    } else {
      crmStatus = SUPA_KEY ? "write_failed" : "no_service_key";
      console.error(`[intake][crm] result=${crmStatus} — email/PDF sent but no CRM card for ${email}`);
      await sendTelegram(`<b>⚠️ CRM NOT logged</b> (${crmStatus}) for ${fullName}. Emails still sent.`);
    }

    // Cleanup any temp files
    const tmpPath = path.join("/tmp", filename);
    try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch { /* ignore */ }

    // ── Mailchimp: tag ac-intake-submitted to advance the journey ──────────────
    if (email) {
      try {
        const firstName = data.firstName as string || fullName.split(" ")[0] || "";
        const lastName = data.lastName as string || fullName.split(" ").slice(1).join(" ") || "";
        await upsertMailchimpContact(email, firstName, lastName);
        await tagMailchimpContact(email, ["ac-intake-submitted"]);
      } catch (mcErr) {
        console.error("[intake] Mailchimp tag failed (non-fatal):", mcErr);
      }
    }

    // ── Attio: update deal stage to Intake Received ──────────────────────────
    if (email) {
      try {
        const firstName = data.firstName as string || fullName.split(" ")[0] || "";
        const lastName = data.lastName as string || fullName.split(" ").slice(1).join(" ") || "";
        const dealId = await findAttioDealByEmail(email);
        if (dealId) {
          await updateAttioDealStage(dealId, "Intake Received", "intake_received");
        } else {
          await createAttioDeal({
            name: fullName,
            email,
            firstName,
            lastName,
            company: data.companyName as string || "",
            industry: data.industry as string || "",
            phone: data.phone as string || "",
            referralSource: "Apollo Claw Intake Form",
          });
        }
      } catch (attioErr) {
        console.error("[intake] Attio update failed (non-fatal):", attioErr);
      }
    }

    // `crm` lets the browser (and you, in the network tab) see whether the CRM write
    // landed — "ok", "write_failed" (bad/rotated key or wrong project), or
    // "no_service_key" (env var missing) — without waiting on a Supabase query.
    return NextResponse.json({ ok: true, crm: crmStatus, pdf: pdfBuffer ? "ok" : "failed" });
  } catch (err) {
    console.error("Intake API error:", err);
    return NextResponse.json({ ok: false, error: "Submission failed" }, { status: 500 });
  }
}
