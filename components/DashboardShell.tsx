"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Blocks, BookOpen, ChartNoAxesColumn, Compass, CreditCard, LayoutGrid, LogOut, Menu, MessageSquare, MoreHorizontal, Radio, Settings, SlidersHorizontal, Users, X } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { branding } from "@/config/branding";
import { CHANNELS_ENABLED } from "@/config/channels";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// The five things you DO with an agent. Everything you only ever configure — credits,
// members, the workspace itself — moved behind Settings, which is its own area rather than
// a sixth peer. Eight items in one flat list meant the daily surfaces and the once-a-quarter
// ones competed for the same attention; a rail you scan every day should only carry the
// former.
const NAV = [
  { href: "/dashboard/start-here", label: "Start Here", icon: Compass, exact: false },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, exact: false },
  { href: "/dashboard/integrations", label: "Connections", icon: Blocks, exact: false },
  // Sits next to Connections because the two answer the neighbouring questions — what the agent
  // can reach, and where it answers you. Absent entirely until the runtime endpoints are
  // confirmed (config/channels.ts): a rail item that leads somewhere broken is worse than one
  // that isn't there yet.
  ...(CHANNELS_ENABLED
    ? [{ href: "/dashboard/channels", label: "Channels", icon: Radio, exact: false }]
    : []),
  // Sits directly under Chat's neighbours: it is the answer to "what do I say to this thing",
  // which is a question people have while looking at the chat, not while looking for account
  // options.
  { href: "/dashboard/guide", label: "Guide", icon: BookOpen, exact: false },
  // My Agent is not here. It went below Guide first, and then into Settings entirely — the rail
  // is things you DO with the agent, and looking at the agent itself turned out to be the same
  // kind of question as billing or members.
];

// The settings area's own rail, grouped, shown INSTEAD of NAV while you're inside it — the
// same trade every settings screen worth copying makes: give the section the whole sidebar
// and put one obvious way back at the top.
const SETTINGS_NAV = [
  {
    title: "Agent",
    items: [
      // "My Agent", singular, because that is what a customer has: one, arriving with their
      // licence. Pluralises only if a workspace somehow holds more than one.
      { href: "/dashboard/settings/agent", label: "My Agent", icon: LayoutGrid, exact: false },
    ],
  },
  {
    title: "Workspace",
    items: [
      { href: "/dashboard/settings", label: "General", icon: SlidersHorizontal, exact: true },
      { href: "/dashboard/settings/billing", label: "Billing & Credits", icon: CreditCard, exact: false },
      { href: "/dashboard/settings/usage", label: "Usage", icon: ChartNoAxesColumn, exact: false },
      { href: "/dashboard/settings/members", label: "Members", icon: Users, exact: false },
    ],
  },
];

const SETTINGS_ROOT = "/dashboard/settings";

type NavItem = { href: string; label: string; icon: LucideIcon; exact: boolean };

// One row, used by the app rail, the Settings rail, and the Settings entry itself, so the
// active treatment can't drift between them.
function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        // Tinted with the accent rather than plain grey: on a rail of six identical rows, a grey
        // pill behind grey text is not a selected state, it's a slightly different grey.
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

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
  // "Start Here" is where every session lands, agents or not: with one it greets the
  // active agent, without one it prompts them to create the first. Hiding it used to
  // leave a freshly-signed-in customer on a page missing from their own sidebar.
  const inSettings = pathname.startsWith(SETTINGS_ROOT);

  const { agents } = useActiveAgent();
  const nav = NAV.map((item) =>
    item.href === "/dashboard" && agents.length > 1 ? { ...item, label: "My Agents" } : item
  );

  const { current } = useWorkspace();
  const logoUrl = current?.logo_url || branding.logoUrl;
  // The logo stands alone now, so it has to carry its own name for anyone who can't see it.
  const logoAlt = current?.logo_url ? current.name : branding.appName;

  // Inside Settings the rail belongs to Settings: no workspace/agent switchers, no chat list,
  // no app nav — those are the things you came here to stop looking at. One way back, at the
  // top, where the logo would otherwise be.
  if (inSettings) {
    return (
      <>
        <Link
          href="/dashboard/start-here"
          onClick={onNavigate}
          className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>

        <div className="mt-6 space-y-5">
          {SETTINGS_NAV.map((group) => (
            <div key={group.title}>
              <div className="px-3 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.title}
              </div>
              <nav className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
                ))}
              </nav>
            </div>
          ))}
        </div>

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

  return (
    <>
      {/* The customer's logo when they've uploaded one, ours otherwise. Their business, their
          room — and the fallback is a real state, not a gap, since most will never upload.

          Logo only, no text beside it. The label used to read `current.name` whenever a custom
          logo was uploaded, which is the workspace name — the exact string the switcher renders
          directly underneath. So uploading a logo guaranteed the workspace name appeared twice,
          stacked; David hit the same thing without one, his workspace being called Apollo Claw.
          The name belongs to the switcher; this row is the mark above it. */}
      <div className="px-2 py-1">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={logoAlt} className="h-8 w-auto max-w-[9rem] object-contain object-left" />
        ) : (
          // No logo anywhere means nothing would name the product at all, so the wordmark
          // stands in. Never the workspace name — that would reintroduce the duplicate.
          <span className="truncate font-semibold">{branding.appName}</span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <WorkspaceSwitcher />
        <AgentSwitcher />
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Your conversations, under the nav — reachable from any page rather than only once
          you've opened Chat. The rail used to be a second column inside the chat page, which
          meant two sidebars on screen there and none anywhere else. */}
      <ChatSidebar onNavigate={onNavigate} />

      {/* Settings sits below the chat list with the account controls, not among the five
          things you do daily — it is a door into another area, not a sixth destination. */}
      <div className="mt-auto space-y-2 pt-4">
        <NavLink
          item={{ href: SETTINGS_ROOT, label: "Settings", icon: Settings, exact: false }}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <AccountCard userEmail={userEmail} />
      </div>
    </>
  );
}

// Who you're signed in as, at the foot of the rail.
//
// It was the raw email on one line and a full-width "Sign out" button under it — which gave the
// most destructive control in the rail the most visual weight, and gave the identity none. The
// mockup has a card: initial, address, and the action tucked behind a menu where you go looking
// for it rather than fall onto it.
function AccountCard({ userEmail }: { userEmail: string }) {
  const initial = (userEmail?.[0] || "?").toUpperCase();
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
        {initial}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{userEmail}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userEmail } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // h-screen + overflow-hidden from md up, so the rail holds its own height and only <main>
    // scrolls. It was min-h-screen, which lets the whole page grow with the content and take the
    // rail's foot down with it — on a long Connections page, Settings and the account card ended
    // up somewhere below the fold, which is the one place navigation must never be.
    //
    // Mobile keeps min-h-screen and a normal document scroll. The rail there is a drawer that
    // overlays, not a column, so there is nothing to pin and a fixed viewport height would just
    // fight the browser chrome.
    <div className="flex min-h-screen flex-col md:h-screen md:min-h-0 md:flex-row md:overflow-hidden">
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
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r bg-background p-4 shadow-xl">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col">
              <SidebarContent pathname={pathname} userEmail={userEmail} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop rail.
          bg-background, not bg-card: the rail and the content pane were both pure white,
          separated by a hairline and a beige gutter — so the navigation advanced and the page
          around it receded, which is backwards. The rail is the recessive surface and the
          content cards are the white ones, the way the mockups have it.

          The border is drawn rather than transparent. It could be transparent back when this
          rail was navy, because the colour change WAS the edge. Light on light, the rail and the
          pane it sits against resolve to the same token — without a hairline here the two merge
          and the layout loses its left edge entirely. */}
      <aside className="relative hidden w-[17rem] shrink-0 flex-col border-r bg-background p-4 md:flex">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarContent pathname={pathname} userEmail={userEmail} />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
