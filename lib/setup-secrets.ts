import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { BYO_SECRET_FIELDS, byoEncConfigured, decryptSecret, encryptSecret } from "@/lib/crypto/byo";

// The /setup form's credentials, kept encrypted for Super Admin instead of emailed (migration
// 0036). Store, list without values, reveal one submission's values on request.

/** Human labels for the secret fields, in the order the admin page shows them. */
export const SECRET_LABELS: Record<string, string> = {
  anthropic_api_key: "Anthropic API key",
  telegram_bot_token: "Telegram bot token",
  fireflies_api_key: "Fireflies API key",
  tavily_api_key: "Tavily API key",
  fathom_password: "Fathom password",
};

/**
 * Save a submission's secrets, each encrypted. Returns the row id, or null when they could not be
 * stored safely: no encryption key on the server (we never write a secret in the clear), or the
 * write failed. A null tells the caller to fall back to emailing them, so nothing is lost.
 */
export async function storeSetupSecrets(input: {
  email: string;
  clientName: string;
  context: Record<string, string>;
  fields: Record<string, string | undefined>;
}): Promise<number | null> {
  if (!byoEncConfigured()) {
    console.warn("[setup-secrets] BYO_ENC_KEY not set; not storing, the email carries them instead");
    return null;
  }
  const secrets: Record<string, string> = {};
  for (const field of BYO_SECRET_FIELDS) {
    const value = input.fields[field];
    if (typeof value === "string" && value.trim()) {
      const sealed = encryptSecret(value);
      if (!sealed) return null;
      secrets[field] = sealed;
    }
  }
  if (Object.keys(secrets).length === 0) return null;
  const { data, error } = await createAdminClient()
    .from("setup_secrets")
    .insert({
      email: input.email.trim().toLowerCase(),
      client_name: input.clientName || null,
      context: input.context,
      secrets,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[setup-secrets] store failed:", error.message);
    return null;
  }
  return (data as { id: number }).id;
}

export interface SetupSecretsSummary {
  id: number;
  email: string;
  client_name: string | null;
  context: Record<string, string>;
  /** Which secrets the submission holds, by label. Never the values. */
  provided: string[];
  submitted_at: string;
}

/** Every submission, newest first, with which secrets each holds but none of their values. */
export async function listSetupSecrets(): Promise<SetupSecretsSummary[]> {
  const { data, error } = await createAdminClient()
    .from("setup_secrets")
    .select("id, email, client_name, context, secrets, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { id: number; email: string; client_name: string | null; context: Record<string, string>; secrets: Record<string, string>; submitted_at: string }) => ({
    id: row.id,
    email: row.email,
    client_name: row.client_name,
    context: row.context ?? {},
    provided: Object.keys(row.secrets ?? {}).map((k) => SECRET_LABELS[k] ?? k),
    submitted_at: row.submitted_at,
  }));
}

/** One submission's secrets, decrypted, as label/value pairs. Callers audit-log the reveal. */
export async function revealSetupSecrets(id: number): Promise<{ email: string; values: { label: string; value: string }[] } | null> {
  const { data, error } = await createAdminClient()
    .from("setup_secrets")
    .select("email, secrets")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as { email: string; secrets: Record<string, string> };
  const values = Object.entries(row.secrets ?? {}).map(([k, v]) => ({
    label: SECRET_LABELS[k] ?? k,
    value: decryptSecret(v) ?? "",
  }));
  return { email: row.email, values };
}
