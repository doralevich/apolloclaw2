"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowLeft, Blocks, BookOpen, ChartNoAxesColumn, CircleUser, Compass, CreditCard, LayoutGrid, ListChecks, LogOut, Menu, MessageSquare, MoreHorizontal, ShieldCheck, SlidersHorizontal, Users, X } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { branding } from "@/config/branding";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { DashboardHeader } from "@/components/DashboardHeader";

// The five things you DO with an agent. Everything you only ever configure — credits,
// members, the workspace itself — moved behind Settings, which is its own area rather than
// a sixth peer. Eight items in one flat list meant the daily surfaces and the once-a-quarter
// ones competed for the same attention; a rail you scan every day should only carry the
// former.
const NAV = [
  { href: "/dashboard/start-here", label: "Home", icon: Compass, exact: false },
  // Chat sits directly under Home. Talking to the agent is the thing people come back for every
  // day; the checklist is a first-week errand. The daily surface goes higher than the once-through
  // one.
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, exact: false },
  { href: "/dashboard/checklist", label: "Checklist", icon: ListChecks, exact: false },
  // Connections and Guide moved OFF the daily rail and INTO Settings (SETTINGS_NAV) - David's call.
  // The rail is the handful of things you do every day; connecting an app or reading the guide is
  // not that. Their pages are unchanged, only the tabs moved: the inSettings check below now
  // counts those two routes as part of the Settings area, so the Settings rail shows on them and
  // the moved tab highlights there. Channels stays off the rail too (still at /dashboard/channels).
];

// The settings area's own rail, grouped, shown INSTEAD of NAV while you're inside it — the
// same trade every settings screen worth copying makes: give the section the whole sidebar
// and put one obvious way back at the top.
const SETTINGS_NAV = [
  {
    // The scope the rest of the rework hangs off: settings about YOU, before settings about the
    // workspace and (eventually) the agents. Named groups are what let a customer answer
    // "whose setting is this?" before they click.
    title: "Account",
    items: [
      { href: "/dashboard/settings/account", label: "My Account", icon: CircleUser, exact: false },
    ],
  },
  {
    title: "Workspace",
    items: [
      // One group, at David's call - "Agent" as a heading for a single row made the rail read
      // as two areas when the customer thinks of it as one. "My Agent(s)" with the optional
      // plural spelled out, because a workspace can genuinely hold several since seats and a
      // label that flips between singular and plural reads as a bug.
      { href: "/dashboard/settings", label: "General", icon: SlidersHorizontal, exact: true },
      { href: "/dashboard/settings/agent", label: "My Agent(s)", icon: LayoutGrid, exact: false },
      // Connections lives here now rather than on the daily rail (David's call): it is the agent's
      // apps - Gmail, calendar, files - which is a setup question, not a daily one.
      { href: "/dashboard/integrations", label: "Connections", icon: Blocks, exact: false },
      // Two money pages, two scopes, both named for what they answer. Plan is the WORKSPACE's
      // subscription - seats, invoices, the card. Credits is one AGENT's wallet; Usage sits
      // directly beneath it (David's call) - where the wallet went, one row down from what's left.
      { href: "/dashboard/settings/plan", label: "Plan", icon: CreditCard, exact: false },
      { href: "/dashboard/settings/billing", label: "Credits", icon: ChartNoAxesColumn, exact: false },
      { href: "/dashboard/settings/usage", label: "Usage", icon: Activity, exact: false },
      { href: "/dashboard/settings/members", label: "Members", icon: Users, exact: false },
      // Guide (how to use the product) moved off the daily rail into Settings too.
      { href: "/dashboard/guide", label: "Guide", icon: BookOpen, exact: false },
    ],
  },
];

const SETTINGS_ROOT = "/dashboard/settings";

type NavItem = { href: string; label: string; icon: LucideIcon; exact: boolean };

// One row, used by the app rail, the Settings rail, and the Settings entry itself, so the
// active treatment can't drift between them.
// Same shape as a NavLink, never "active" - these open a dialog or jump into Settings rather
// than being a destination the rail highlights.
const SIDE_ACTION_CLASS =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground";

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
        // A BLACK pill on the selected row, David's call - the grey bg-secondary pill it
        // replaced read as barely-selected. Full-strength primary (black since the accent
        // change) with its own foreground keeps the pair legible in dark mode too, where
        // primary and its foreground swap together.
        active
          ? "bg-primary font-semibold text-primary-foreground"
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
  // Connections and Guide are not under /settings/, but they moved into the Settings area, so the
  // Settings rail (not the daily rail) shows on them and their moved tab highlights there.
  const inSettings =
    pathname.startsWith(SETTINGS_ROOT) ||
    pathname.startsWith("/dashboard/integrations") ||
    pathname.startsWith("/dashboard/guide");

  // Home always shows now (David's call): it is a launcher you come back to, not a getting-started
  // page you outgrow, so the tab is never hidden and there is no retire-after-N-logins rule.
  const nav = NAV;

  const { current, workspaces, isPlatformAdmin } = useWorkspace();
  const hasManyWorkspaces = workspaces.length > 1;
  const isWorkspaceAdmin = current?.role === "admin";
  // Always the ApolloClaw wordmark, per David - the rail used to prefer the workspace's
  // uploaded logo (current.logo_url), which meant support visits and multi-workspace admins
  // saw the CUSTOMER'S brand where the product's belongs. The upload feature is retired;
  // stored logo_url values are simply no longer read here.
  const logoUrl = branding.logoUrl;
  // The logo stands alone now, so it has to carry its own name for anyone who can't see it.
  const logoAlt = branding.appName;

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
          // Ours, the real wordmark, not the app name in bold text.
          //
          // branding.logoUrl comes from NEXT_PUBLIC_LOGO_URL, which is unset — this is a
          // white-label shell, so it defaults to empty and every install without that variable
          // fell through to a text string. The same inline SVG the marketing nav uses fills that
          // gap: it takes an ink colour, so the black wordmark works on this light rail while
          // the bracket keeps the brand red.
          <ApolloClawLogo ink="var(--color-foreground)" height={26} />
        )}
      </div>

      {/* The agent, named, with its face - the treatment David liked on The College Agent, where
          the rail opens with Max and "Your agent" and nothing else.
          The workspace tile above it is gone for anyone with a single workspace. It answered
          "whose account am I in", which is a real question in a product where you switch between
          them - and nobody here does: every customer has exactly one, so it was a permanent row
          restating their own name back at them, directly under a wordmark. WorkspaceSwitcher
          still renders in full when there IS more than one, which is when the question starts
          being worth a row. */}
      <div className="mt-4 space-y-2">
        {hasManyWorkspaces && <WorkspaceSwitcher />}
        <AgentSwitcher />
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* "Your team" (Add agent, Invite a member) used to live here on the main rail. Retired
          (David's call): the two actions were redundant with Settings, where My Agent(s) already
          holds "add another agent" and Members is the invite-and-manage page. A labelled shortcut
          block sitting a few rows above two nav entries that do the same thing is clutter, not a
          convenience — so the rail loses the block and Settings keeps the real destinations. */}

      {/* The god-view, for the people who run the PLATFORM rather than a workspace. /admin was
          a secret URL nothing linked to, which meant remembering it - and the whole point of
          the Super Admin area is that David shouldn't have to remember anything. Plain <a>,
          not <Link>: /admin renders outside the dashboard shell, so a full navigation is
          honest about the context switch. Platform admins only; everyone else never sees it. */}
      {isPlatformAdmin && (
        <div className="mt-6 flex flex-col gap-1">
          <span className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Platform
          </span>
          <a href="/admin" className={SIDE_ACTION_CLASS}>
            <ShieldCheck className="h-4 w-4" />
            Super Admin
          </a>
        </div>
      )}

      {/* Your conversations, under the nav - reachable from any page rather than only once
          you've opened Chat. The rail used to be a second column inside the chat page, which
          meant two sidebars on screen there and none anywhere else. */}
      <ChatSidebar onNavigate={onNavigate} />

      {/* The Settings NavLink that lived here is gone at David's call - the header's cog is
          the door now, and two identical doors ten centimetres apart made the rail longer
          without making anything easier to find. The account card stays: it is who you are,
          not where you go. */}
      <div className="mt-auto space-y-2 pt-4">
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
  const isChat = pathname.startsWith("/dashboard/chat");
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

      {/* Header and content are siblings inside a column, and the column is the shell's h-screen
          track: the header is pinned because only <main> scrolls, with no fixed positioning and
          no phantom gap reserved at the top of every page.

          Chat needs the whole height and manages its own scrolling, so it renders bare - the
          max-w-7xl reading measure and the padding belong to pages of prose and cards, and
          around a conversation they would put the composer in a box in the middle of the room. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        {/* No wash here any more - David's final call, looking at the checklist: "make the
            background white." The lavender-and-rose bloom went onto every page for a while and
            came straight back off; it survives only on the chat WELCOME state (ChatView), the
            screen it was designed for, where there is nothing to read underneath it. */}
        {isChat ? (
          <div className="min-h-0 flex-1">{children}</div>
        ) : (
          <main className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
          </main>
        )}
      </div>
    </div>
  );
}
