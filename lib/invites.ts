import { publicSiteOrigin } from "@/lib/site-url";

// Single source of truth for the invite link shape. Prefers NEXT_PUBLIC_SITE_URL
// (stable, shareable) and falls back to the request origin. Used by the members
// POST (create) and GET (list) routes so every invite URL is built the same way.
export function inviteUrl(request: Request, token: string): string {
  const origin = publicSiteOrigin(new URL(request.url).origin);
  return `${origin}/invite/${token}`;
}
