import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { POST_AUTH_LANDING } from "@/lib/routes";

// The landing point for every emailed auth link: password recovery, email confirmation, invites.
//
// WHY THIS DOES NOT USE lib/supabase/server.ts. That client writes cookies through the ambient
// `cookies()` store and swallows any failure in a bare `catch {}` - correct for a Server
// Component, silently fatal here. When the write does not land there is no error, no log and no
// symptom on this side: verifyOtp still succeeds, Supabase still creates a session row, and we
// still redirect. The browser simply arrives at the next page with no cookie, finds no session,
// and bounces to /login. The person clicking sees the link "do nothing" and land them back at a
// login screen, over and over, while the server believes it signed them in every time.
//
// That is not hypothetical. Ira Stahlberger, Sep 17 2026: three recovery links in ten minutes,
// three session rows in auth.sessions, every one with user_agent "node" and a Vercel IP, and
// every one with updated_at EXACTLY equal to created_at - created by this route and never used
// by a browser again. His own sessions from August carry real Safari and iPhone user agents and
// residential IPs, because the login page signs in from the CLIENT, where cookies cannot go
// missing this way.
//
// So this route now builds the redirect FIRST and hands the Supabase client a setAll that writes
// onto that exact response. Same shape lib/supabase/middleware.ts already uses, for the same
// reason, and it does not depend on the ambient store being writable at the moment we ask.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next") || POST_AUTH_LANDING;
  // Prevent open redirects — only internal absolute paths are allowed.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : POST_AUTH_LANDING;

  // Built before the exchange so the auth cookies have somewhere to land. Reassigned only on
  // failure, which is why it is `let`.
  let response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie"));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // No try/catch. If this ever cannot write we want the throw, not another silent
          // sign-in that never reaches anybody.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return response;
    // Logged because the two ways this fails look identical to the person clicking - a link that
    // expired, and a link already spent by an email scanner that fetched it before they did.
    console.error("[auth/callback] verifyOtp failed:", type, error.message);
  } else {
    console.error("[auth/callback] no code and no token_hash on the link");
  }

  response = NextResponse.redirect(new URL("/login?error=auth", url.origin));
  return response;
}

/** The request's cookies, in the shape @supabase/ssr wants. */
function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  return header
    .split(";")
    .map((pair) => {
      const eq = pair.indexOf("=");
      if (eq < 1) return null;
      return {
        name: pair.slice(0, eq).trim(),
        value: decodeURIComponent(pair.slice(eq + 1).trim()),
      };
    })
    .filter((c): c is { name: string; value: string } => c !== null);
}
