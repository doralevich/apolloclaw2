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

export function portsForTemplate(
  template: string | null | undefined
): Partial<Record<PortName, number>> {
  const names =
    (template ? TEMPLATE_PORTS[template] : undefined) ?? TEMPLATE_PORTS["agent37-openclaw"];
  const ports: Partial<Record<PortName, number>> = {};
  for (const name of names) ports[name] = PORTS[name];
  return ports;
}
