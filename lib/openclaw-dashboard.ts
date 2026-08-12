import "server-only";
import { agent37 } from "@/lib/agent37";
import { PORTS } from "@/config/agents";

// One place that knows how to mint a browser-ready link into an instance's OpenClaw
// Control UI. Extracted from /api/agents/[id]/signed-url so the platform-admin god-view
// can open ANY customer's instance the same way the customer's own "Open the dashboard"
// button does - same signed URL, same token ride-along, one implementation to fix when
// OpenClaw's auth story changes.

// Reads OpenClaw's gateway auth token from the instance config. The Control UI served on the
// dashboard port (18789) reads this token from the URL fragment to authenticate the browser
// session — mirroring the B2C launch flow. Device-auth pairing is disabled and the edge origin
// is allow-listed on the openclaw image, so this token rides in alongside the edge signed URL.
const READ_OPENCLAW_TOKEN_CMD =
  'CONFIG="${OPENCLAW_CONFIG_PATH:-${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/openclaw.json}"; ' +
  '[ -f "$CONFIG" ] && jq -r ".gateway.auth.token // empty" "$CONFIG" 2>/dev/null';

export async function openclawDashboardToken(id: string): Promise<string | null> {
  try {
    const { stdout } = await agent37.exec(id, READ_OPENCLAW_TOKEN_CMD);
    // jq prints the token on its own line; take the last non-empty line and ignore any noise.
    const token = stdout.trim().split("\n").map((l) => l.trim()).filter(Boolean).pop() ?? "";
    return token || null;
  } catch (e) {
    console.error("[signed-url:openclaw-token]", id, (e as Error).message);
    return null;
  }
}

/**
 * A signed URL for one port of one instance, ready to open in a browser. For the OpenClaw
 * dashboard port the gateway token is fetched and appended as a #token= fragment — the Control
 * UI authenticates off it. The two calls are independent, so they run concurrently; if the
 * token can't be read, the plain signed URL is returned (device-auth is disabled, so it may
 * suffice on its own).
 */
export async function instanceSignedUrl(
  id: string,
  port: number,
  ttlSeconds?: number
): Promise<{ url: string; port: number; expires_at: number }> {
  const [result, token] = await Promise.all([
    agent37.signedUrl(id, port, ttlSeconds),
    port === PORTS.dashboard ? openclawDashboardToken(id) : Promise.resolve(null),
  ]);
  if (token) {
    const url = new URL(result.url);
    url.hash = `token=${encodeURIComponent(token)}`;
    result.url = url.toString();
  }
  return result;
}
