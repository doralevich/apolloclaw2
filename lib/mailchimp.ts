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
