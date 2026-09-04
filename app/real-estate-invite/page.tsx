import { redirect } from "next/navigation";

// The Real Estate invite moved into the shared /agent-invite/[type] scheme (one passcode across
// every role agent). This keeps the original /real-estate-invite link David handed out working: it
// forwards to the generic flow, pre-personalized to David.
export default function RealEstateInviteRedirect() {
  redirect("/agent-invite/realestate?name=David");
}
