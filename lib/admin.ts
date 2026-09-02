import "server-only";
import { requireUser } from "@/lib/auth";
import { isAdminEmail } from "@/config/admins";
import { ApiError } from "@/lib/http";
import { agent37 } from "@/lib/agent37";
import { APP_ID, instanceAppId } from "@/config/agents";

// The auth preamble every /api/admin route shares: authenticate, then enforce that the
// caller is a platform admin (by email). Returns the authenticated user/client so the
// handler can go on — though admin routes generally use the service-role client for the
// cross-tenant reads RLS would otherwise hide.
export async function requirePlatformAdmin() {
  const { supabase, user } = await requireUser();
  if (!isAdminEmail(user.email)) {
    // 403 (not 404): the caller is already authenticated, and these routes are only
    // ever hit by the gated /admin client. The route's *existence* isn't a secret to a
    // logged-in user the way the /admin page is, so a clear Forbidden is fine here.
    throw new ApiError(403, "forbidden", "Admin access required");
  }
  return { supabase, user };
}

// Refuse to act on an instance that belongs to the other product.
//
// Apollo and the College Agent share ONE Agent37 account, and the admin agents overview now
// LISTS the College Agent's boxes so that page is the source of truth for the whole fleet.
// Listing them puts their instance ids on screen, and several admin routes key off an Agent37
// id alone - DELETE with no local row hard-deletes the instance, which for one of these is a
// live student's agent destroyed from an app that holds no record of them. The overview renders
// those rows read-only; this is the half that actually enforces it.
//
// An instance with NO `app` stamp is deliberately not blocked: those predate the stamp, Agent37
// exposes no way to backfill metadata on an existing instance, and refusing them would break the
// unattributed-box cleanup this page exists for.
//
// Agent37 has no per-instance GET, so this reads the account listing (the same single call the
// overview makes) and finds the id in it. If Agent37 can't be reached, or the instance isn't in
// the listing at all, we do NOT block: there is no foreign box to protect, and failing closed
// would make ghost cleanup impossible exactly when it is needed.
export async function assertNotOtherApp(agent37Id: string) {
  let instance;
  try {
    const { data } = await agent37.listAgents();
    instance = data.find((a) => a.id === agent37Id);
  } catch {
    return;
  }
  if (!instance) return;
  const app = instanceAppId(instance.metadata);
  if (!app || app === APP_ID) return;
  throw new ApiError(
    403,
    "other_app",
    `That instance belongs to ${app === "college-agent" ? "The College Agent" : app}. It is ` +
      `listed here so the fleet view is complete, but it has to be managed from that product.`
  );
}
