import { addAttioNote, createAttioDeal } from "@/lib/attio";
import { ApiError, json, readJson, route } from "@/lib/http";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { sendTelegram } from "@/lib/telegram";

// POST /api/enterprise-contact - the "Custom corporate builds. Contact us." form on /pricing.
//
// A lead into the Attio pipeline (a deal at Prospect, the person and company attached, what they
// wrote as a note), and a ping to David so a corporate inquiry is never found a week later. Public
// and rate limited like every other form here; nothing is created but the lead.

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "enterprise_contact", LIMITS.form);
  if (limited) return limited;

  const body = await readJson<Record<string, unknown>>(request);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const company = clean(body.company, 160);
  const message = clean(body.message, 4000);
  if (!name) throw new ApiError(400, "invalid_request", "Tell us your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "invalid_request", "A valid work email is required.");

  const [firstName, ...rest] = name.split(/\s+/);
  const dealId = await createAttioDeal({
    name: company || name,
    email,
    firstName,
    lastName: rest.join(" "),
    company: company || undefined,
    referralSource: "Pricing page - Enterprise",
  });
  if (dealId && message) {
    await addAttioNote(dealId, "Enterprise inquiry from /pricing", message).catch(() => {});
  }

  await sendTelegram(
    `Enterprise inquiry from /pricing\n${name} <${email}>${company ? `\n${company}` : ""}${message ? `\n\n${message.slice(0, 800)}` : ""}`
  ).catch(() => {});

  return json({ ok: true });
});
