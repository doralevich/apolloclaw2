export const DEFAULT_AGENT = {
  template: "agent37-hermes",
  cpu: 2,
  memory: 4,
  disk: 6,
  monthlyCapUsd: 5,
} as const;

export const PORTS = {
  dashboard: 9119,
  terminal: 7681,
  files: 8080,
} as const;
