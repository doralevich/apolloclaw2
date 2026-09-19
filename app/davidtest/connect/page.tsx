"use client";

import { ConnectFlow } from "@/components/connect/ConnectFlow";
import { MockShell } from "@/components/davidtest/MockShell";

// The connect flow, walkable. Pressing Connect does not open a consent tab: the mock flips the
// connection on instead, and the real component's own polling finds it and advances, so what you
// see is its actual behaviour rather than a scripted version of it.
export default function Page() {
  return (
    <MockShell title="Connect flow" controls={["vendor", "conns"]}>
      <ConnectFlow />
    </MockShell>
  );
}
