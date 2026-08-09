"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useChatContext } from "@/components/chat/ChatProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderClock } from "@/components/chat/HeaderClock";
import { HeaderCredit } from "@/components/chat/HeaderCredit";

// The dashboard's top bar, on every page.
//
// It was the chat page's own header, which meant the clock, the remaining credit, the theme
// toggle and New Chat all vanished the moment you left Chat — the four things least tied to any
// one page were the four that only appeared on one. Balance especially: "what have I got left to
// spend" is not a question you only have while already spending.
//
// It cannot scroll away, and gets that for free rather than with position:fixed. The shell is
// h-screen with overflow-hidden and only <main> scrolls, so a header that is a sibling of <main>
// is pinned by the layout — no fixed positioning, no z-index, and no phantom gap to reserve at
// the top of every page.

// Path prefixes to titles, longest first so /dashboard/settings/agent beats /dashboard/settings.
const TITLES: Array<[string, string]> = [
  ["/dashboard/settings/agent", "My Agent"],
  ["/dashboard/settings/billing", "Billing & Credits"],
  ["/dashboard/settings/members", "Members"],
  ["/dashboard/settings/usage", "Usage"],
  ["/dashboard/settings", "Settings"],
  ["/dashboard/start-here", "Welcome"],
  ["/dashboard/checklist", "Checklist"],
  ["/dashboard/integrations", "Connections"],
  ["/dashboard/channels", "Channels"],
  ["/dashboard/guide", "Guide"],
  ["/dashboard/chat", "Chat"],
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { active } = useActiveAgent();
  const { userFullName, userFirstName, current } = useWorkspace();
  const { sessions, activeSessionId, startNewChat } = useChatContext();

  const onChat = pathname.startsWith("/dashboard/chat");

  const title = useMemo(() => {
    // On Chat the thread's own name wins: it is the one page where the title is content rather
    // than a label, and "Chat" above a conversation called "Q3 pricing" is the less useful of
    // the two facts.
    if (onChat) {
      const t = sessions.find((s) => s.session_id === activeSessionId)?.title?.trim();
      return t || (activeSessionId ? "Chat" : "New chat");
    }
    return TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";
  }, [onChat, pathname, sessions, activeSessionId]);

  function newChat() {
    startNewChat();
    // From anywhere else the button has to take you there as well as clear the thread —
    // otherwise it looks like it did nothing.
    if (!onChat) router.push("/dashboard/chat");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card/80 px-6 backdrop-blur-sm md:px-8">
      <h1 className="min-w-0 truncate text-base font-semibold text-foreground">{title}</h1>

      <div className="flex shrink-0 items-center gap-3">
        {/* Who is signed in, and as what - David's ask, after losing track of which account he
            was testing as. The name says whose session this is; the Admin/Member tag answers
            the question that actually confused him, since the two roles see different
            sidebars and only one of them can spend money. Hidden on narrow screens where the
            title and New Chat matter more. */}
        {(userFullName || userFirstName) && (
          <span className="hidden items-baseline gap-2 lg:flex">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{userFullName || userFirstName}</span>
            </span>
            {current && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {current.role === "admin" ? "Admin" : "Member"}
              </span>
            )}
          </span>
        )}
        {/* Date and time, from the mockup. The weather it also shows isn't here - see HeaderClock. */}
        <HeaderClock />
        {/* Only with an agent to ask about. Every other page in the dashboard survives without
            one - Start Here prompts you to build it - so a balance widget that errored on a
            missing agent would be the one thing that could not. */}
        {active && <HeaderCredit agentId={active.agent37_id} />}
        {/* Light/dark at the top of the screen, where you are when you decide you want it. The
            three-way preference (including "follow my device") stays in Settings. */}
        <ThemeToggle />
        {/* Settings, up here where David asked for it - beside the name it configures. The
            sidebar's own Settings entry stays; a door this important can have two handles. */}
        <Link
          href="/dashboard/settings"
          title="Settings"
          aria-label="Settings"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={newChat}
          title="New chat"
          className="brand-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-shadow hover:shadow-md hover:shadow-primary/30"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>
    </header>
  );
}
