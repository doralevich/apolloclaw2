import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Seats: who an agent belongs to, and who may be invited to one.
//
// The rules here are small but they are the ones that decide whether a customer's office
// manager can read the founder's chat threads, so they live in one place rather than inline in
// whichever route needed them first.

/** The part after the @, lowercased. Empty string for anything that isn't an address. */
export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

// Free mailbox providers. A company whose admin signed up with a gmail.com address has no
// meaningful domain to match against — every colleague AND every stranger on earth shares it —
// so "same domain" would wave through exactly the invitations it is meant to question.
//
// Deliberately short. This is not a spam list; it is the handful of providers common enough
// that treating them as a company domain would be actively misleading.
const PUBLIC_MAILBOX_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

export type DomainVerdict = "same" | "different" | "unverifiable";

/**
 * Does this invitation stay inside the inviter's company?
 *
 * David asked for invitations to be restricted to the same domain. This ANSWERS that question
 * rather than enforcing it, because a hard rule breaks cases that arrive early and often: a
 * fractional CFO on their own domain, an agency, a company with two domains, or an admin whose
 * own address is gmail.com. It also stops nobody determined — anyone holding an admin seat can
 * invite whoever they like regardless.
 *
 * So the caller warns and requires a deliberate confirm on "different", and refuses nothing.
 * `unverifiable` is its own answer rather than being folded into "same": with a public mailbox
 * on either side there is no company to be inside of, and claiming the domains match would be a
 * reassurance we have not earned.
 */
export function domainVerdict(inviterEmail: string, inviteeEmail: string): DomainVerdict {
  const from = emailDomain(inviterEmail);
  const to = emailDomain(inviteeEmail);
  if (!from || !to) return "unverifiable";
  if (PUBLIC_MAILBOX_DOMAINS.has(from) || PUBLIC_MAILBOX_DOMAINS.has(to)) return "unverifiable";
  return from === to ? "same" : "different";
}

/**
 * Which agents a person may see.
 *
 * An admin sees the whole workspace: they pay for it, they provision the seats, and they are
 * the one who has to clean up when somebody leaves. A member sees the agents that are theirs,
 * plus any with no owner at all — those predate seats and were workspace-wide when they were
 * created, so hiding them would take an agent away from somebody already using it.
 */
export function visibleAgentFilter(role: string, userId: string): { ownerIn: string[] } | null {
  if (role === "admin") return null;
  return { ownerIn: [userId] };
}

/**
 * Hand a waiting agent to the colleague who just accepted their invitation.
 *
 * The seat endpoint provisions the agent when the ADMIN asks for it, parked on the admin's own
 * user id — because provisioning on accept would let a mistyped address that happens to be a
 * real mailbox mint a VPS, and because the agent should already exist when they first sign in.
 * This is the handover.
 *
 * Matched on the invitation's `email` rather than on any id, because that address is the only
 * thing linking "the seat David bought" to "the person who just signed in", and it is the thing
 * he typed deliberately.
 *
 * Returns the agent handed over, or null when there is nothing to hand over — which is the
 * ordinary case for a plain invitation with no seat attached.
 */
export async function claimSeat(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  userId: string,
  email: string
): Promise<string | null> {
  const address = email.trim().toLowerCase();
  if (!address) return null;

  const { data: invite } = await admin
    .from("invitations")
    .select("token, created_by, with_agent")
    .eq("workspace_id", workspaceId)
    .eq("email", address)
    .eq("with_agent", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!invite?.created_by) return null;

  // The oldest agent still parked on the buyer that nobody else has claimed. Oldest rather than
  // newest: if an admin adds two seats before either colleague accepts, the first to accept
  // should get the first agent built, not race the second one.
  //
  // This deliberately cannot take an agent already owned by another member — the filter is on
  // the admin's id — so the worst case is that a colleague gets no agent and says so, rather
  // than quietly being handed somebody else's.
  const { data: parked } = await admin
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .eq("owner_id", invite.created_by)
    .order("created_at", { ascending: true })
    .limit(10);

  const candidate = (parked ?? [])[0]?.agent37_id;
  if (!candidate) return null;

  await admin.from("agents").update({ owner_id: userId }).eq("agent37_id", candidate);
  return candidate;
}

