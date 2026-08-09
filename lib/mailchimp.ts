import { createHash } from "crypto";

const MC_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const MC_SERVER = MC_API_KEY.split("-").pop() || "us1"; // e.g. us1
const MC_LIST_ID = "8faa1558b2"; // Apollo Claw - The AI Edge

function mcHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`anystring:${MC_API_KEY}`).toString("base64")}`,
  };
}

// Upsert a contact into the Apollo Claw audience
export async function upsertMailchimpContact(email: string, firstName: string, lastName: string = ""): Promise<void> {
  // Loudly, not silently. This no-op used to be invisible, which cost an evening: David
  // searched the audience for a contact the code had "sent" on a deployment that never had
  // the key, and nothing anywhere said so.
  if (!MC_API_KEY) {
    console.warn("[mailchimp] MAILCHIMP_API_KEY not set - skipping upsert for", email);
    return;
  }
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  // Only send a name we actually have. An empty FNAME is not "no opinion" to Mailchimp - it is
  // a value, and it overwrites. That did not matter while every caller was a form with a
  // required name field; it matters now that registrations sync from auth metadata, where the
  // name is often missing and the audience may already hold a good one from an intake form.
  const merge_fields: Record<string, string> = {};
  if (firstName) merge_fields.FNAME = firstName;
  if (lastName) merge_fields.LNAME = lastName;
  try {
    const res = await fetch(`https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${emailHash}`, {
      method: "PUT",
      headers: mcHeaders(),
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields,
      }),
    });
    // fetch only throws on network failure. A 401 from a bad key or a 404 from the wrong
    // datacenter "succeeds" as far as the promise is concerned, so without this check every
    // auth failure was invisible - the exact shape of "test7 is not anywhere in Mailchimp".
    if (!res.ok) {
      console.error("[mailchimp] upsert failed:", email, res.status, (await res.text()).slice(0, 300));
    }
  } catch (err) {
    console.error("[mailchimp] upsertContact failed:", err);
  }
}

/**
 * The tag every ApolloClaw account carries, applied the moment the account exists.
 *
 * Named for what was bought rather than for a funnel stage: an ApolloClaw customer gets a VPS,
 * and that is what separates them in the audience from the intake and setup tags the marketing
 * forms apply. Somebody can be `ac-intake-submitted` for months without ever registering.
 */
export const REGISTRATION_TAG = "VPS-Registration";

/**
 * A registration, into the audience.
 *
 * Until this existed the storefront put NOBODY in Mailchimp. The contact writes all lived in the
 * marketing routes — intake, pre-call, setup — so a person who arrived, paid and got an account
 * was in Supabase and Stripe and nowhere a campaign could reach them. That is backwards: the
 * paying customer is the one contact you would least want to be missing.
 *
 * Best effort by construction. Both halves already swallow their own errors, and this is called
 * from paths where the account is the deliverable - a Mailchimp outage must never fail a
 * checkout webhook into a Stripe retry, or leave somebody staring at an error on an invitation
 * they have in fact accepted.
 *
 * Idempotent: the upsert is a PUT on the email hash and tagging is additive, so the repeat
 * deliveries these callers are built to tolerate cost nothing here either.
 */
export async function syncMailchimpRegistration(o: {
  email: string;
  firstName?: string;
  lastName?: string;
  /** Applied ON TOP of REGISTRATION_TAG - e.g. which flow they came in through. */
  extraTags?: string[];
}): Promise<void> {
  const email = o.email.trim().toLowerCase();
  if (!email) return;
  await upsertMailchimpContact(email, o.firstName?.trim() || "", o.lastName?.trim() || "");
  await tagMailchimpContact(email, [REGISTRATION_TAG, ...(o.extraTags ?? [])]);
}

// Apply one or more tags to a contact
export async function tagMailchimpContact(email: string, tags: string[]): Promise<void> {
  if (!tags.length) return;
  if (!MC_API_KEY) {
    console.warn("[mailchimp] MAILCHIMP_API_KEY not set - skipping tags for", email);
    return;
  }
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    const res = await fetch(`https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${emailHash}/tags`, {
      method: "POST",
      headers: mcHeaders(),
      body: JSON.stringify({
        tags: tags.map((name) => ({ name, status: "active" })),
      }),
    });
    if (!res.ok) {
      console.error("[mailchimp] tagging failed:", email, res.status, (await res.text()).slice(0, 300));
    }
  } catch (err) {
    console.error("[mailchimp] tagContact failed:", err);
  }
}
