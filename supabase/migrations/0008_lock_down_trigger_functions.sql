-- Revoke RPC access to two SECURITY DEFINER functions that are only ever meant to run as
-- triggers (playbook Item 3: "SECURITY DEFINER functions callable by anon/authenticated").
--
-- Supabase exposes every function in `public` over PostgREST at /rest/v1/rpc/<name>, and the
-- default EXECUTE grant goes to PUBLIC. handle_new_user_entitlement and handle_new_workspace are
-- attached to triggers on auth.users and public.workspaces; nothing should ever call them
-- directly, and being SECURITY DEFINER they run as their owner if something does.
--
-- Triggers are unaffected: a trigger function executes as part of the firing statement and does
-- not consult EXECUTE grants on the function itself.
revoke all on function public.handle_new_user_entitlement() from public, anon, authenticated;
revoke all on function public.handle_new_workspace() from public, anon, authenticated;

-- Deliberately NOT revoked here, and why:
--
--   is_workspace_member(uuid), is_workspace_admin(uuid)
--     Called from inside the RLS policies on workspaces, memberships, agents, and invitations.
--     Policies are evaluated with the privileges of the querying role, so `authenticated` MUST
--     retain EXECUTE or every one of those policies errors instead of returning false. Revoking
--     from anon alone would likewise turn an anonymous read of those tables from a clean empty
--     result into an error.
--
--   set_agent_status(text, text), get_workspace_members(uuid), can_create_agent()
--     Each already gates itself: the first two raise 'not a member' unless
--     is_workspace_member() passes, and can_create_agent() matches on the caller's JWT email, so
--     an anon caller with no email gets false. Verified by reading the function bodies against
--     the live database, not the migrations. They are reachable but not exploitable, so tightening
--     the grant is defence in depth rather than a fix, and is deliberately left for a change that
--     can be tested against the dashboard rather than shipped alongside unrelated work.
