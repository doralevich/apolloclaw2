import { cookies } from "next/headers";
import { json, readJson, route } from "@/lib/http";
import { enforceRateLimit, type RateLimitRule } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUserIdByEmail } from "@/lib/license-session";
import { provisionTypedAgent } from "@/lib/provision";
import { INVITE_COOKIE, verifyCookieValue, invitableType } from "@/lib/agentInvite";

// POST /api/agent-invite/[type]/claim { name, email }
//
// The no-payment equivalent of the Stripe webhook + /api/onboard/complete, for any role agent:
// authorized by the invite passcode cookie (not a login, not a paid session), it stands up a real
// account for the visitor and provisions their LIVE agent of `type`, then hands back a one-click
// sign-in URL.
//
// After this returns, the browser navigates to that URL, which logs the visitor in server-side and
// forwards them to /onboard/[type]?ws=...&agent=... - the STANDARD customer questionnaire and
// dashboard, identical to any paying customer. The passcode simply stands in for checkout.
//
// Provisioning spends real money on a VPS, so this is rate-limited far tighter than a form: the
// passcode is the gate, this is the backstop against a leaked passcode being used to spin up a
// fleet.
const CLAIM_LIMIT: RateLimitRule = { max: 4, windowSeconds: 3600 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Ctx = { params: Promise<{ type: string }> };

export const POST = route(async (request: Request, { params }: Ctx) => {
  const limited = await enforceRateLimit(request, "agent_invite_claim", CLAIM_LIMIT);
  if (limited) return limited;

  // Gate: must have passed the passcode. The page checks this too, but the endpoint re-checks so it
  // can never be driven directly.
  const store = await cookies();
  if (!verifyCookieValue(store.get(INVITE_COOKIE)?.value)) {
    return json({ error: "Please enter the access password first." }, 403);
  }

  const { type: typeParam } = await params;
  const type = invitableType(typeParam);
  if (!type) {
    return json({ error: "This agent is not available through an invite link." }, 404);
  }

  const body = await readJson<{ name?: string; email?: string }>(request);
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  const name = (typeof body.name === "string" ? body.name : "").trim();
  if (!EMAIL_RE.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  const first = name.split(/\s+/)[0] || "";
  const last = name.split(/\s+/).slice(1).join(" ") || "";

  const db = createAdminClient();

  // 1. Account: reuse the visitor's existing account if the email already has one, otherwise create
  //    it (confirmed, so the magic link below signs them straight in, and the signup trigger grants
  //    the entitlement the dashboard requires).
  let userId = await findAuthUserIdByEmail(db, email);
  if (!userId) {
    const { data: created, error: createErr } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        ...(name ? { full_name: name } : {}),
        ...(first ? { first_name: first } : {}),
        ...(last ? { last_name: last } : {}),
      },
    });
    if (createErr || !created?.user?.id) {
      throw new Error(`account creation failed: ${createErr?.message || "no user returned"}`);
    }
    userId = created.user.id;
  }

  // 2. Workspace: reuse their first workspace if they have one, otherwise create it. The
  //    on_workspace_created trigger inserts the owner's admin membership automatically.
  const { data: membership } = await db
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  let workspaceId = (membership?.workspace_id as string | undefined) ?? undefined;
  if (!workspaceId) {
    const wsName = first ? `${first}'s Workspace` : email;
    const { data: ws, error: wsErr } = await db
      .from("workspaces")
      .insert({ name: wsName, owner_id: userId })
      .select("id")
      .single();
    if (wsErr || !ws?.id) {
      throw new Error(`workspace creation failed: ${wsErr?.message || "no workspace returned"}`);
    }
    workspaceId = ws.id as string;
  }

  // 3. Agent: provision a live agent of this type if the workspace has none. If one already exists
  //    (the visitor came back), reuse it. The questionnaire that follows customizes it.
  const { data: existing } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", type.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  let agent37Id = (existing?.agent37_id as string | undefined) ?? undefined;
  if (!agent37Id) {
    try {
      const agent = await provisionTypedAgent({
        type,
        workspaceId,
        userId,
        allowTemplateFallback: true,
        callerWritesContext: true,
      });
      agent37Id = agent.id;
    } catch (err) {
      // A 409 from the one-per-type cap means a concurrent request just made it; fall through and
      // re-read. Anything else is a real failure.
      const { data: raced } = await db
        .from("agents")
        .select("agent37_id")
        .eq("workspace_id", workspaceId)
        .eq("agent_type", type.id)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();
      agent37Id = (raced?.agent37_id as string | undefined) ?? undefined;
      if (!agent37Id) throw err;
    }
  }

  // 4. Sign-in: mint a single-use magic link and hand back our own /auth/callback URL (same
  //    mechanism as the password-reset email, minus the email - the visitor is already here). It
  //    establishes the session server-side and forwards to the standard setup questionnaire.
  const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkErr || !tokenHash) {
    throw new Error(`sign-in link failed: ${linkErr?.message || "no token"}`);
  }

  const next = `/onboard/${type.id}?ws=${encodeURIComponent(workspaceId)}${
    agent37Id ? `&agent=${encodeURIComponent(agent37Id)}` : ""
  }`;
  const url = `/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent(next)}`;

  return json({ url });
});
