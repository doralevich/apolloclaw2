"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/client";
import { branding } from "@/config/branding";
import { Button } from "@/components/ui/button";

// Standalone chrome for the admin god-view — deliberately NOT the workspace-scoped
// DashboardShell (no workspace switcher / per-workspace nav). Just a top bar identifying
// the admin area and the signed-in operator, with the full-width content below.
//
// Three tabs, three questions: Workspaces is "what does each customer have", Accounts is
// "who is registered", Agents is "what actually exists" (database and Agent37 compared).
const TABS = [
  { href: "/admin", label: "Workspaces" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/agents", label: "Agents" },
];
export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold">{branding.appName}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">{email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <nav className="border-b bg-card px-4 md:px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
