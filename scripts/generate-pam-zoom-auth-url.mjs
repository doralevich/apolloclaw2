#!/usr/bin/env node

const redirectUri = process.env.ZOOM_REDIRECT_URI || "https://www.apolloclaw.ai/pam/zoom/callback";
const clientId = process.argv[2] || process.env.ZOOM_CLIENT_ID;

if (!clientId) {
  console.error("Missing ZOOM_CLIENT_ID. Usage: ZOOM_CLIENT_ID=<id> node scripts/generate-pam-zoom-auth-url.mjs");
  process.exit(1);
}

const url = new URL("https://zoom.us/oauth/authorize");
url.searchParams.set("response_type", "code");
url.searchParams.set("client_id", clientId);
url.searchParams.set("redirect_uri", redirectUri);

console.log(url.toString());
