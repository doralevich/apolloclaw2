"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Compass, CreditCard, LayoutGrid, LogOut, Menu, MessageSquare, Settings, Users, X } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { branding } from "@/config/branding";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/start-here", label: "Start Here", icon: Compass, exact: false },
  { href: "/dashboard", label: "Agents", icon: LayoutGrid, exact: true },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, exact: false },
  { href: "/dashboard/integrations", label: "Integrations", icon: Blocks, exact: false },
  { href: "/dashboard/credits", label: "API Credits", icon: CreditCard, exact: false },
  { href: "/dashboard/members", label: "Members", icon: Users, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

// Shared between the desktop rail and the mobile drawer so the two can never drift apart.
function SidebarContent({
  pathname,
  userEmail,
  onNavigate,
}: {
  pathname: string;
  userEmail: string;
  onNavigate?: () => void;
}) {
  const { agents } = useActiveAgent();
  // "Start Here" is the active agent's greeting — nothing to greet until one exists.
  const nav = NAV.filter((item) => item.href !== "/dashboard/start-here" || agents.length > 0);

  return (
    <>
      <div className="flex items-center gap-2 px-2 py-1">
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logoUrl} alt="" className="h-6 w-6 rounded" />
        ) : null}
        <span className="truncate font-semibold">{branding.appName}</span>
      </div>

      <div className="mt-4 space-y-2">
        <WorkspaceSwitcher />
        <AgentSwitcher />
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-4">
        <div className="truncate px-3 text-xs text-muted-foreground">{userEmail}</div>
        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userEmail } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt="" className="h-6 w-6 rounded" />
          ) : null}
          <span className="truncate font-semibold">{branding.appName}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r bg-card p-4 shadow-xl">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent pathname={pathname} userEmail={userEmail} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card p-4 md:flex">
        <SidebarContent pathname={pathname} userEmail={userEmail} />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
