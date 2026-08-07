import { createHash } from "crypto";

const MC_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const MC_SERVER = MC_API_KEY.split("-").pop() || "us1"; // e.g. us1
const MC_LIST_ID = "8faa1558b2"; // Apollo Claw — The AI Edge

function mcHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`anystring:${MC_API_KEY}`).toString("base64")}`,
  };
}

// Upsert a contact into the Apollo Claw audience
export async function upsertMailchimpContact(email: string, firstName: string, lastName: string = ""): Promise<void> {
  if (!MC_API_KEY) return;
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    await fetch(`https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${emailHash}`, {
      method: "PUT",
      headers: mcHeaders(),
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      }),
    });
  } catch (err) {
    console.error("[mailchimp] upsertContact failed:", err);
  }
}

/**
 * Set and unset tags in one call.
 *
 * tagMailchimpContact below only ever adds. That is right for "this person submitted the
 * intake form", which is a thing that happened and stays happened. It is wrong for the
 * onboarding state tags, where the whole point is that a tag stops being true: somebody
 * cancels, and `ac-customer` has to come off or a journey keeps talking to an ex-customer.
 *
 * Mailchimp models removal as the same endpoint with status "inactive" rather than a DELETE,
 * so both directions are one request.
 */
export async function setMailchimpTags(
  email: string,
  add: string[],
  remove: string[] = []
): Promise<void> {
  if (!MC_API_KEY) return;
  if (!add.length && !remove.length) return;
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    const res = await fetch(
      `https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${emailHash}/tags`,
      {
        method: "POST",
        headers: mcHeaders(),
        body: JSON.stringify({
          tags: [
            ...add.map((name) => ({ name, status: "active" })),
            ...remove.map((name) => ({ name, status: "inactive" })),
          ],
        }),
      }
    );
    // Checked, unlike its neighbours. A silent tag failure is the worst kind here: the journeys
    // that branch on these tags would simply never fire, and an audience that quietly stopped
    // updating looks exactly like an audience where nobody's state changed. 404 specifically
    // means the contact is not in the audience at all, which is a fixable mistake worth naming.
    if (!res.ok) {
      const detail = res.status === 404 ? " (contact not in the audience — upsert it first)" : "";
      console.error(`[mailchimp] setTags rejected — HTTP ${res.status}${detail}:`, (await res.text()).slice(0, 200));
    }
  } catch (err) {
    console.error("[mailchimp] setTags failed:", err);
  }
}

// Apply one or more tags to a contact
export async function tagMailchimpContact(email: string, tags: string[]): Promise<void> {
  if (!MC_API_KEY || !tags.length) return;
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    await fetch(`https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${emailHash}/tags`, {
      method: "POST",
      headers: mcHeaders(),
      body: JSON.stringify({
        tags: tags.map((name) => ({ name, status: "active" })),
      }),
    });
  } catch (err) {
    console.error("[mailchimp] tagContact failed:", err);
  }
}
