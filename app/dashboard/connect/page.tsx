import { ConnectFlow } from "@/components/connect/ConnectFlow";

// Deliberately not in the sidebar. This is a flow somebody is walked through once, reachable
// afterwards from Home and from the build screen's hand-off, not a section of the product to
// come back and browse.
export default function Page() {
  return <ConnectFlow />;
}
