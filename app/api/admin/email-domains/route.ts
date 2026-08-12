import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";

// TEMP admin diagnostic: which Mandrill account the site sends through, and which sending domains
// it has verified. Our email arrives as designsbydaveo.com even though the code asks for
// david@apolloclaw.ai, which means apolloclaw.ai isn't a verified sending domain in THIS account
// (Mandrill rewrites an unverified from to a verified one). This shows the account and the exact
// per-domain DKIM/SPF status so we can see whether apolloclaw.ai is there and valid. Removed once
// the sending domain is sorted. Never returns the API key.
export const GET = route(async () => {
  await requirePlatformAdmin();
  const key = process.env.MANDRILL_API_KEY || "";

  const post = async (path: string, body: Record<string, unknown> = {}) => {
    try {
      const res = await fetch(`https://mandrillapp.com/api/1.0/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, ...body }),
      });
      return { status: res.status, data: await res.json().catch(() => null) };
    } catch (e) {
      return { status: 0, error: e instanceof Error ? e.message : String(e) };
    }
  };

  const [account, domains] = await Promise.all([
    post("users/info.json"),
    post("senders/domains.json"),
  ]);

  // Trim the account to the identifying bits, not the whole reputation blob.
  const acct = account.data as { username?: string; created_at?: string } | null;

  return json({
    mandrill_key_present: Boolean(key),
    account: acct ? { username: acct.username, created_at: acct.created_at } : account,
    sending_domains: domains.data,
  });
});
