import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { INVITE_COOKIE, verifyCookieValue, invitableType } from "@/lib/agentInvite";
import AgentInvite from "@/components/onboard/AgentInvite";

// The password-protected invite for a single role agent (/agent-invite/[type], e.g.
// /agent-invite/cfo). A visitor the link is handed to:
//   1. enters the shared access password (env AGENT_INVITE_PASSCODE, set in Vercel),
//   2. is welcomed and gives their name + email,
//   3. gets a LIVE agent of this type provisioned and is dropped into the standard customer
//      questionnaire + dashboard - the same experience as any other agent, minus the payment.
//
// The passcode cookie is verified server-side here so an un-passed visitor only ever sees the gate.
// A type that isn't an invitable role agent 404s. No payment, no pre-existing login.

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function AgentInvitePage({ params, searchParams }: Props) {
  const { type: typeParam } = await params;
  const type = invitableType(typeParam);
  if (!type) notFound();

  const { name } = await searchParams;
  const store = await cookies();
  const unlocked = verifyCookieValue(store.get(INVITE_COOKIE)?.value);
  const greetName = (name || "").trim();

  return (
    <AgentInvite
      type={type.id}
      agentLabel={type.label}
      unlocked={unlocked}
      greetName={greetName}
    />
  );
}
