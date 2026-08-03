import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

// Encryption at rest for customer-supplied ("bring your own") credentials.
// Playbook Item 2.
//
// /setup collects five secrets that belong to the CUSTOMER, not to us: their Anthropic API key,
// Telegram bot token, Fireflies key, Tavily key, and a Fathom password. Those land in
// agent_setup.answers. Stored in plaintext, a single database dump is a mass credential theft
// against our customers' third-party accounts — which is a materially worse outcome than leaking
// our own data.
//
// AES-256-GCM, key material from BYO_ENC_KEY (Vercel env only, never in Postgres). The ciphertext
// is stored in place in the existing JSONB column behind a "v1:" marker, so there is no schema
// migration and no plaintext null-out step.
//
// MIGRATION-SAFE: with BYO_ENC_KEY unset, encryptForStorage() returns plaintext and logs a
// warning, and decryptSecret() passes through anything without the marker. So this can ship
// before the env var exists and starts protecting data the moment it is set.

const PREFIX = "v1:";

// Any-length secret to a stable 32 bytes. Lets BYO_ENC_KEY be any passphrase rather than
// requiring exactly 32 bytes of base64.
function key(): Buffer {
  const raw = process.env.BYO_ENC_KEY;
  if (!raw) throw new Error("BYO_ENC_KEY is not set on the server");
  return createHash("sha256").update(raw, "utf8").digest();
}

export function byoEncConfigured(): boolean {
  return !!process.env.BYO_ENC_KEY;
}

export function isEncrypted(value?: string | null): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(plaintext?: string | null): string | null {
  const s = (plaintext ?? "").trim();
  if (!s) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(s, "utf8"), cipher.final()]);
  return `${PREFIX}${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${ct.toString("base64")}`;
}

/** Write path. Never throws: a missing key degrades to plaintext rather than losing the value. */
export function encryptForStorage(plaintext?: string | null): string | null {
  const s = (plaintext ?? "").trim();
  if (!s) return null;
  if (isEncrypted(s)) return s; // already enveloped, don't double-wrap
  if (!byoEncConfigured()) {
    console.warn("[byo] BYO_ENC_KEY not set — storing credential as plaintext");
    return s;
  }
  try {
    return encryptSecret(s);
  } catch (err) {
    console.error("[byo] encryption failed, storing plaintext:", (err as Error).message);
    return s;
  }
}

/** Read path. Passes legacy plaintext straight through so old rows keep working. */
export function decryptSecret(stored?: string | null): string | null {
  if (!stored) return null;
  if (!isEncrypted(stored)) return stored;
  try {
    const [iv, tag, ct] = stored.slice(PREFIX.length).split(":");
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
    d.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8");
  } catch (err) {
    console.error("[byo] decryption failed:", (err as Error).message);
    return null;
  }
}

// The credential fields /setup collects. Anything listed here is enveloped before it reaches the
// database. Add a field here when the setup form starts collecting another secret.
export const BYO_SECRET_FIELDS = [
  "anthropic_api_key",
  "telegram_bot_token",
  "fireflies_api_key",
  "tavily_api_key",
  "fathom_password",
] as const;

/**
 * Returns a copy of an answers blob with every known credential field enveloped.
 * Non-secret fields are passed through untouched.
 */
export function encryptAnswerSecrets(
  answers: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers };
  for (const field of BYO_SECRET_FIELDS) {
    const value = out[field];
    if (typeof value === "string" && value.trim()) {
      out[field] = encryptForStorage(value);
    }
  }
  return out;
}

/** Inverse of encryptAnswerSecrets, for any future read path. */
export function decryptAnswerSecrets(
  answers: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers };
  for (const field of BYO_SECRET_FIELDS) {
    const value = out[field];
    if (typeof value === "string" && value) {
      out[field] = decryptSecret(value);
    }
  }
  return out;
}
