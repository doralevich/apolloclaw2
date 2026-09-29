import { NextResponse } from "next/server";
import { agent37, Agent37Error } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

function errorPage(message: string, status: number) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Could not connect app</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; color: #111827; background: #fafafa; }
      main { max-width: 420px; margin: 16vh auto; padding: 0 24px; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      p { color: #6b7280; line-height: 1.5; margin: 0; }
    </style>
  </head>
  <body>
    <main>
      <h1>Could not connect app</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

// Opened in a new tab by the dashboard. This starts the managed OAuth flow server-side, then
// redirects the new tab to the provider's authorization URL so the dashboard tab can keep polling.
export const GET = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const url = new URL(request.url);
  const toolkit = url.searchParams.get("toolkit")?.trim();
  if (!toolkit) {
    throw new ApiError(400, "invalid_request", "toolkit is required");
  }

  try {
    const { redirectUrl } = await agent37.connectIntegration(id, { toolkit });
    return NextResponse.redirect(redirectUrl, 302);
  } catch (e) {
    // Some apps need a bring-your-own-credentials flow we don't expose here.
    if (e instanceof Agent37Error && e.status === 422) {
      return errorPage("This app can't be connected here yet. You can close this tab.", 422);
    }
    // Any other upstream failure. This tab is a browser page, so answer with a page rather than
    // the raw JSON error, and log which app failed so it can be traced in the Vercel logs.
    // Agent37 has answered some apps (Instacart, Sept 29 2026) with a bare 500 where a 422 was
    // expected, typically an app that needs its own API key rather than a sign-in.
    if (e instanceof Agent37Error) {
      console.error("[integrations-connect]", toolkit, e.status, e.code, e.message);
      return errorPage(
        e.status >= 500
          ? "This app couldn't be connected right now. Please try again in a few minutes. If it keeps happening, email hello@apolloclaw.ai and we'll connect it for you."
          : "This app can't be connected here yet. Email hello@apolloclaw.ai and we'll connect it for you. You can close this tab.",
        e.status >= 500 ? 502 : e.status
      );
    }
    throw e;
  }
});
