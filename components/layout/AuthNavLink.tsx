"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, signOut } from "@/lib/supabase/client";

// The account affordance in the marketing nav. Logged out it is a plain "Log in"; logged in it
// becomes "My Dashboard" plus "Log out", so a signed-in visitor browsing the marketing site can
// see they are signed in and get back to the dashboard without retyping the URL.
//
// Session state starts as `undefined` meaning "not known yet", which is deliberately distinct
// from `null` (known to be signed out). During that first moment nothing is rendered, so a
// signed-in visitor never sees "Log in" flash before it corrects itself.

type Variant = "utility" | "drawer";

export default function AuthNavLink({ variant, onNavigate }: { variant: Variant; onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Both of these set state from a callback rather than synchronously in the effect body,
    // which is what react-hooks/set-state-in-effect is actually guarding against.
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) setEmail(data.user?.email ?? null);
      })
      .catch(() => {
        // Unreachable Supabase: fall back to the logged-out affordance rather than rendering
        // nothing forever.
        if (!cancelled) setEmail(null);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setEmail(session?.user?.email ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Not resolved yet — render nothing rather than guessing wrong.
  if (email === undefined) return null;

  if (variant === "drawer") {
    return email ? (
      <>
        <Link href="/dashboard" className="py-4 text-lg font-semibold" style={{ color: "#F5F6F8" }} onClick={onNavigate}>
          My Dashboard
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="py-4 text-left text-lg font-semibold"
          style={{ color: "rgba(245,246,248,0.65)", background: "none", border: "none", cursor: "pointer" }}
        >
          Log out
        </button>
      </>
    ) : (
      <Link href="/login" className="py-4 text-lg font-semibold" style={{ color: "#F5F6F8" }} onClick={onNavigate}>
        Log in
      </Link>
    );
  }

  // Utility bar. The email is shown from sm up and hidden on the narrowest widths, where it
  // would push the bar out of alignment with the nav below it.
  return email ? (
    <div className="flex items-center gap-4">
      <span className="hidden text-[12px] sm:inline" style={{ color: "rgba(255,255,255,0.6)" }} title={email}>
        {email}
      </span>
      <Link href="/dashboard" className="text-[12px] font-semibold" style={{ color: "#ffffff" }}>
        My Dashboard
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-[12px] font-semibold"
        style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        Log out
      </button>
    </div>
  ) : (
    <Link href="/login" className="text-[12px] font-semibold" style={{ color: "#ffffff" }}>
      Log in
    </Link>
  );
}
