import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import { ActiveAgentProvider } from "@/components/ActiveAgentProvider";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardChatProvider } from "@/components/DashboardChatProvider";
import { PendingApproval } from "@/components/PendingApproval";
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

  // v1 access gate (allowlist). Stripe later relaxes this (let unpaid users in to
  // subscribe). Checked via the admin client so a non-entitled user can't slip
  // through on a flaky SSR auth context.
  const { data: entitlement } = await db
    .from("entitlements")
    .select("status")
    .eq("email", email)
    .maybeSingle();
  if (entitlement?.status !== "active") {
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
    <WorkspaceProvider initialWorkspaces={workspaces} userEmail={user.email ?? ""}>
      <ActiveAgentProvider>
        {/* Chat threads are provided at the DASHBOARD level so the sidebar can list them from
            every page. Inside ActiveAgentProvider because it needs the active agent, outside
            DashboardShell because the shell renders the list. */}
        <DashboardChatProvider>
          <DashboardShell>{children}</DashboardShell>
        </DashboardChatProvider>
      </ActiveAgentProvider>
    </WorkspaceProvider>
  );
}
