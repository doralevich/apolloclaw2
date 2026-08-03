export const DEFAULT_AGENT = {
  template: "agent37-openclaw",
  cpu: 2,
  memory: 4,
  disk: 6,
  monthlyCapUsd: 5,
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
