import { cookies } from "next/headers";
import { INVITE_COOKIE, verifyCookieValue } from "@/lib/realEstateInvite";
import RealEstateInvite from "@/components/onboard/RealEstateInvite";

// The password-protected Real Estate agent invite. A visitor David hands the link to:
//   1. enters the access password (env REALESTATE_ONBOARDING_PASSCODE, set in Vercel),
//   2. is welcomed and gives their name + email,
//   3. gets a LIVE Real Estate agent provisioned and is dropped into the standard customer
//      questionnaire + dashboard - the same experience as any other agent, minus the payment.
//
// The passcode cookie is verified server-side here so an un-passed visitor only ever sees the gate.
// No payment, no pre-existing login.

type Props = { searchParams: Promise<{ name?: string }> };

export default async function RealEstateInvitePage({ searchParams }: Props) {
  const { name } = await searchParams;
  const store = await cookies();
  const unlocked = verifyCookieValue(store.get(INVITE_COOKIE)?.value);
  const greetName = (name || "David").trim() || "David";
  return <RealEstateInvite unlocked={unlocked} greetName={greetName} />;
}
