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
