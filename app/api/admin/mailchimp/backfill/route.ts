import { createHash } from "crypto";
import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";
import { REGISTRATION_TAG, syncMailchimpRegistration } from "@/lib/mailchimp";
import { createAdminClient } from "@/lib/supabase/admin";

// /api/admin/mailchimp/backfill — put every existing account into the Mailchimp audience.
//
// The app syncs a contact the moment an account is created (Stripe webhook for buyers,
// invitation accept for seats). That only helps from the day it shipped. Everybody who
// registered before is in Supabase and in Stripe and in no audience at all, and this is the one
// pass that fixes it.
//
// WHY A ROUTE AND NOT ONLY THE SCRIPT. scripts/backfill-mailchimp-registrations.mjs does the
// same job, and needs MAILCHIMP_API_KEY and SUPABASE_SERVICE_ROLE_KEY pasted into a shell. The
// deployment already holds both. Running it here means the credentials never leave Vercel and
// nobody has to find them — the same reasoning that put the Stripe catalog seed behind
// /api/admin/stripe/sync rather than leaving it as a CLI-only job.
//
// Answers GET as well as POST so a logged-in admin can run it by visiting the URL. Safe to
// repeat: the Mailchimp upsert is a PUT on the email hash and tagging is additive, so a second
// pass changes nothing. Add ?dry=1 to see who WOULD be synced without writing.
//
// Never unsubscribes, never removes a tag, and never overwrites a name with an empty one —
// see lib/mailchimp.ts. Someone who opted out stays opted out.

// Mailchimp is two calls per contact and this walks every account. Minutes, not seconds, on a
// list of any size.
export const maxDuration = 300;

/** Every auth user, paged. listUsers caps a page at 1000; ask for less and loop. */
async function listAllUsers(db: ReturnType<typeof createAdminClient>) {
  const out: { email: string; first: string; last: string }[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers failed on page ${page}: ${error.message}`);
    const batch = data?.users ?? [];
    for (const u of batch) {
      const email = (u.email || "").trim().toLowerCase();
      if (!email) continue;
      const meta = (u.user_metadata ?? {}) as {
        first_name?: string;
        last_name?: string;
        full_name?: string;
        name?: string;
      };
      const full = String(meta.full_name || meta.name || "").trim();
      out.push({
        email,
        first: meta.first_name || full.split(/\s+/)[0] || "",
        last: meta.last_name || full.split(/\s+/).slice(1).join(" ") || "",
      });
    }
    if (batch.length < 200) return out;
  }
}

const backfill = route(async (request: Request) => {
  await requirePlatformAdmin();

  // Stated rather than assumed. Without the key syncMailchimpRegistration returns silently —
  // correct in a webhook, where a marketing sync must never fail a purchase, and useless here
  // where "0 failed" would read as success on a run that wrote nothing at all.
  const key = process.env.MAILCHIMP_API_KEY;
  if (!key) {
    return json({ error: "MAILCHIMP_API_KEY is not set on this deployment." }, 500);
  }

  // The datacenter comes from the key's suffix; a key without one produces a garbage hostname
  // and every call fails with a network error nobody sees. Diagnosed here, in the response.
  const dc = key.split("-").pop() ?? "";
  if (!/^[a-z]{2,4}\d+$/.test(dc)) {
    return json(
      { error: `MAILCHIMP_API_KEY has no datacenter suffix (expected something like "-us1"; got "...${dc.slice(-6)}").` },
      500
    );
  }

  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const users = await listAllUsers(createAdminClient());

  if (dry) {
    return json({
      dry_run: true,
      tag: REGISTRATION_TAG,
      datacenter: dc,
      count: users.length,
      emails: users.map((u) => u.email),
    });
  }

  // DIRECT calls, not syncMailchimpRegistration. The lib helpers swallow HTTP failures by
  // design - a marketing sync must never fail a purchase webhook - which made this route
  // report "synced: 7" for seven rejections and cost David an evening of searching an audience
  // the writes never reached. An admin diagnostic wants the opposite contract: every Mailchimp
  // answer, verbatim, in the response the admin is already looking at.
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`,
  };
  const listId = "8faa1558b2"; // Apollo Claw - The AI Edge, confirmed against the account
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  // Sequential on purpose. Mailchimp rate-limits per account, and a backfill that runs once is
  // not worth the failure mode of firing a few hundred concurrent writes at it.
  let synced = 0;
  const failed: { email: string; step: string; status?: number; message: string }[] = [];
  for (const u of users) {
    const hash = createHash("md5").update(u.email.toLowerCase()).digest("hex");
    const merge_fields: Record<string, string> = {};
    if (u.first) merge_fields.FNAME = u.first;
    if (u.last) merge_fields.LNAME = u.last;
    try {
      const put = await fetch(`${base}/${hash}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ email_address: u.email, status_if_new: "subscribed", merge_fields }),
      });
      if (!put.ok) {
        failed.push({ email: u.email, step: "upsert", status: put.status, message: (await put.text()).slice(0, 400) });
        continue;
      }
      const tag = await fetch(`${base}/${hash}/tags`, {
        method: "POST",
        headers,
        body: JSON.stringify({ tags: [{ name: REGISTRATION_TAG, status: "active" }] }),
      });
      if (!tag.ok) {
        failed.push({ email: u.email, step: "tag", status: tag.status, message: (await tag.text()).slice(0, 400) });
        continue;
      }
      synced++;
    } catch (err) {
      failed.push({ email: u.email, step: "network", message: (err as Error).message });
    }
  }

  return json({ tag: REGISTRATION_TAG, datacenter: dc, total: users.length, synced, failed });
});

export const POST = backfill;
export const GET = backfill;
