import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/config/admins";
import { displayFirstName, displayFullName } from "@/config/greetings";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import { ActiveAgentProvider } from "@/components/ActiveAgentProvider";
import { DashboardShell } from "@/components/DashboardShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardChatProvider } from "@/components/DashboardChatProvider";
import { PendingApproval } from "@/components/PendingApproval";
import { hasDashboardAccess } from "@/lib/entitlement";
import { mapMembershipsToWorkspaces } from "@/lib/workspaces";
import type { WorkspaceWithRole } from "@/lib/types";

type AdminDB = ReturnType<typeof createAdminClient>;

async function loadWorkspaces(db: AdminDB, userId: string): Promise<WorkspaceWithRole[]> {
  const { data } = await db.from("memberships").select("role, workspaces(*)").eq("user_id", userId);
  return mapMembershipsToWorkspaces(data);
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");

  // Bootstrap via the service-role client: the user is already authenticated
  // (getUser validated the JWT), but the user-scoped client's RLS auth context is
  // unreliable inside a Server Component render — it returns empty even when the
  // data exists. We only ever touch THIS user's own rows (filtered by id/email).
  const db = createAdminClient();
  const email = (user.email ?? "").toLowerCase();

  // Access gate. Live accounts are in; a lapsed account (cancelled/past-due) stays in until
  // its 10-day grace window closes — see lib/entitlement.ts for the shared rule. Checked via
  // the admin client so a non-entitled user can't slip through on a flaky SSR auth context.
  const { data: entitlement } = await db
    .from("entitlements")
    .select("status, grace_until")
    .eq("email", email)
    .maybeSingle();
  if (!hasDashboardAccess(entitlement)) {
    // Pass the status through so a lapsed subscriber sees "paused", not "no access".
    return <PendingApproval email={user.email ?? ""} status={entitlement?.status} />;
  }

  // Every entitled user gets a default workspace on first visit, so they never
  // land on an empty "no workspace selected" dead-end. The on_workspace_created
  // trigger adds the admin membership.
  let workspaces = await loadWorkspaces(db, user.id);
  if (workspaces.length === 0) {
    const { error } = await db.from("workspaces").insert({ name: "My Workspace", owner_id: user.id });
    if (error) console.error("[dashboard:default-workspace]", error);
    workspaces = await loadWorkspaces(db, user.id);
  }

  return (
    <ThemeProvider>
      <WorkspaceProvider
        initialWorkspaces={workspaces}
        userId={user.id}
        userEmail={user.email ?? ""}
        // Resolved here because auth user_metadata is only readable server-side. Null when the
        // account has no usable name — the chat greeting has a no-name form for exactly that.
        userFirstName={displayFirstName(user.user_metadata, user.email)}
        userFullName={displayFullName(user.user_metadata, user.email)}
        // Read here for the same reason as the name: auth metadata is server-only.
        userAvatarUrl={typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : ""}
        isPlatformAdmin={isAdminEmail(user.email)}
      >
        <ActiveAgentProvider>
          {/* Chat threads are provided at the DASHBOARD level so the sidebar can list them from
              every page. Inside ActiveAgentProvider because it needs the active agent, outside
              DashboardShell because the shell renders the list. */}
          <DashboardChatProvider>
            <DashboardShell>{children}</DashboardShell>
          </DashboardChatProvider>
        </ActiveAgentProvider>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
