"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Blocks, BookOpen, ChartNoAxesColumn, CircleUser, Compass, CreditCard, LayoutGrid, ListChecks, LogOut, Menu, MessageSquare, MoreHorizontal, SlidersHorizontal, UserPlus, Users, X, Plus } from "lucide-react";
import { signOut } from "@/lib/supabase/client";
import { branding } from "@/config/branding";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { AddAgentButton } from "@/components/AddAgentButton";
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
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { DashboardHeader } from "@/components/DashboardHeader";

// The five things you DO with an agent. Everything you only ever configure — credits,
// members, the workspace itself — moved behind Settings, which is its own area rather than
// a sixth peer. Eight items in one flat list meant the daily surfaces and the once-a-quarter
// ones competed for the same attention; a rail you scan every day should only carry the
// former.
const NAV = [
  { href: "/dashboard/start-here", label: "Welcome", icon: Compass, exact: false },
  // Between Start Here and Chat, which is the order somebody works through them: the greeting
  // points at the checklist, and the checklist's last item is to go and ask the thing something.
  { href: "/dashboard/checklist", label: "Checklist", icon: ListChecks, exact: false },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, exact: false },
  { href: "/dashboard/integrations", label: "Connections", icon: Blocks, exact: false },
  // Channels is OFF the rail at David's call - the same call that took the channel cards off
  // the checklist. The page itself still exists and still works at /dashboard/channels; only
  // the tab is gone, so nothing is deleted and putting it back is one line.
  //
  // Worth knowing what that costs: Channels is where a customer connects Telegram, and Telegram
  // is how most of them actually talk to their agent. With no tab, the only routes left are the
  // direct URL and whatever we send them in email. If people stop connecting it, this is why.
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
      // Two money pages, two scopes, both named for what they answer. Plan is the WORKSPACE's
      // subscription - seats, invoices, the card. Credits is one AGENT's wallet, with its usage
      // folded in beneath; the old separate Usage entry repeated the wallet's headline number a
      // rail-entry lower.
      { href: "/dashboard/settings/plan", label: "Plan", icon: CreditCard, exact: false },
      { href: "/dashboard/settings/billing", label: "Credits", icon: ChartNoAxesColumn, exact: false },
      { href: "/dashboard/settings/members", label: "Members", icon: Users, exact: false },
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
        // Black label on the selected row, David's call. It was text-primary on bg-primary/10,
        // and since the accent went black earlier today "primary at 10%" is a pale grey pill -
        // so the selected row was grey text on grey, which is the exact thing the tint was
        // introduced to avoid. Full-strength foreground and a heavier weight carry it now, and
        // the pill stays as the shape rather than as the signal.
        active
          ? "bg-secondary font-semibold text-foreground"
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

  const { current, workspaces } = useWorkspace();
  const hasManyWorkspaces = workspaces.length > 1;
  const isWorkspaceAdmin = current?.role === "admin";
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

      {/* Growing the account: another agent, or another person. Both were buried - Add another
          agent lived on Settings > My Agent, Members lived on Settings, and the first attempt at
          fixing it put a bare + beside the agent's name, which David quite rightly read as
          nothing at all. They are labelled rows here, above the chat list, because an icon is
          only obvious to whoever drew it.

          Admins only. Both actions end at endpoints that require it, and a member who presses
          either gets a 403 - so a row that is going to refuse is a row not worth showing. */}
      {isWorkspaceAdmin && (
        <div className="mt-6 flex flex-col gap-1">
          <span className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your team
          </span>
          <AddAgentButton
            trigger={
              <button type="button" className={SIDE_ACTION_CLASS}>
                <Plus className="h-4 w-4" />
                Add agent
              </button>
            }
          />
          <Link href="/dashboard/settings/members" onClick={onNavigate} className={SIDE_ACTION_CLASS}>
            <UserPlus className="h-4 w-4" />
            Invite a member
          </Link>
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
