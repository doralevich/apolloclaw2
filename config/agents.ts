// The machine every new instance gets, whatever it is. One size across both runtimes —
// OpenClaw and Hermes — and across every entry in the agent-type registry, because the size
// is a hosting decision rather than a per-product one, and two agents that cost the same to
// host should not quietly be different machines.
//
// This is the ONLY place a new instance's shape is decided: lib/provision.ts passes this
// object to Agent37 directly, so an agent type cannot carry its own size and drift from it.
// Change the numbers here and every subsequent provision follows.
//
// Instances that ALREADY exist keep whatever they were built with — Agent37 sizes a box at
// create time. Resizing one is a deliberate act through /api/agents/[id]/resize.
// Which app provisioned an instance. Apollo and the College Agent share ONE Agent37
// account, so listAgents() hands back both apps' instances to whichever app asks. The
// admin overview builds its orphan list from "live instance with no row in our database",
// which is true of every College Agent box - so they all reported here as orphans of
// Apollo's, and a real orphan of ours was indistinguishable from someone else's agent.
//
// Stamped into instance metadata at create (lib/provision.ts, the only createAgent call).
// Deliberately NOT the template name: the Apollo image is registered under "college-agent"
// as well while it is renamed to "apollo-agent" (see TEMPLATE_PORTS below), so the template
// cannot separate the two apps and filtering on it would misattribute our own agents.
export const APP_ID = "apolloclaw" as const;

// The app that created an instance, read from its Agent37 metadata. null for instances
// provisioned before the stamp existed - Agent37 offers no way to set metadata on an
// existing instance, so those can never be backfilled and are reported as unattributed
// rather than claimed.
export function instanceAppId(metadata: Record<string, unknown> | null | undefined): string | null {
  const v = metadata?.app;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export const INSTANCE_RESOURCES = { cpu: 2, memory: 4, disk: 6 } as const;

// $25/mo to match the paid Apollo agent (config/agent-types.ts PAID_AGENT) and the hosting we
// sell as including "$25/mo of token usage". The live provisioning cap already comes from the
// agent TYPE, not from here — this const only supplies the template-name fallback today — but it
// is named DEFAULT_AGENT and read as "the default a new box gets", so it must not say $5 while
// the product is $25. Keeping the two in step means a future caller that ever wires this into the
// cap can't silently under-provision a customer to a fifth of what they paid for.
export const DEFAULT_AGENT = {
  template: "agent37-openclaw",
  ...INSTANCE_RESOURCES,
  monthlyCapUsd: 25,
} as const;

export const PORTS = {
  // OpenClaw serves its Control UI (the "dashboard") on its own gateway port 18789,
  // not Hermes' 9119. terminal/files are shared across both templates.
  dashboard: 18789,
  terminal: 7681,
  files: 8080,
} as const;

export type PortName = keyof typeof PORTS;

// Which openable ports each template actually serves. The college-agent template remaps
// its internal surfaces (Hermes dashboard 9120, ttyd 7682, filebrowser 8081) and none of
// the standard ports are enabled on its instances, so it exposes no port actions. Unknown
// templates fall back to the OpenClaw set.
const TEMPLATE_PORTS: Record<string, readonly PortName[]> = {
  "agent37-openclaw": ["dashboard", "terminal", "files"],
  // The Apollo build's OWN template names, kept as fallbacks in config/agent-types.ts. Both
  // remap their internal surfaces and enable none of the standard ports.
  // Same image under both names while the Agent37 registry is renamed from college-agent to
  // apollo-agent. Dropping either one would fall through to the OpenClaw set and offer port
  // actions that instance doesn't serve.
  "college-agent": [],
  "apollo-agent": [],
};

// Which runtime an image actually is, which is a different question from what the template
// is called. It decides where an agent keeps the files it reads — Hermes under
// $HERMES_STATE_DIR/memories, OpenClaw under $OPENCLAW_STATE_DIR/workspace — so it is the
// fact worth showing an operator, and the one we got wrong for every agent this morning.
//
// null for an image we don't recognise: better a raw template name on screen than a
// confident guess about a box nobody has looked inside.
const TEMPLATE_RUNTIMES: Record<string, "Hermes" | "OpenClaw"> = {
  "agent37-openclaw": "OpenClaw",
  "agent37-hermes": "Hermes",
  "agent37-hermes-small": "Hermes",
  // The Apollo build, under both its names. Confirmed Hermes: its memory file lives at
  // /home/node/.hermes/memories/USER.md, and its port remap targets the Hermes surfaces.
  "college-agent": "Hermes",
  "apollo-agent": "Hermes",
};

export function runtimeForTemplate(template: string | null | undefined): "Hermes" | "OpenClaw" | null {
  return (template ? TEMPLATE_RUNTIMES[template] : undefined) ?? null;
}

export function portsForTemplate(
  template: string | null | undefined
): Partial<Record<PortName, number>> {
  const names =
    (template ? TEMPLATE_PORTS[template] : undefined) ?? TEMPLATE_PORTS["agent37-openclaw"];
  const ports: Partial<Record<PortName, number>> = {};
  for (const name of names) ports[name] = PORTS[name];
  return ports;
}
