// Names of the files we write into a running agent's workspace, and the fence markers that
// mark our part of them. A leaf module on purpose: the builders (lib/agent-files.ts), the
// writer (lib/provision.ts), and every caller of both need these names, and putting them
// anywhere else makes those three import each other in a circle.
//
// OpenClaw is the default runtime — David's call, after using both — so these are its
// filenames. Hermes loads a subset of the same names out of a different directory, which
// lib/provision.ts resolves at write time; nothing here has to know which one booted.

/** Long-form source material from the customer's uploads and website (lib/enrichment.ts).
 *  Deliberately NOT one of the files a runtime auto-loads: it is reference material the
 *  agent opens when a question needs it, not context paid for on every turn. */
export const CONTEXT_FILENAME = "BUSINESS-CONTEXT.md";

/** The auto-loaded files we generate from the questionnaire. The rest of OpenClaw's eight —
 *  SOUL (template's persona), MEMORY (the agent's own), HEARTBEAT and BOOTSTRAP (runtime
 *  mechanics) — are not ours to write. */
export const GENERATED_FILES = {
  agents: "AGENTS.md",
  tools: "TOOLS.md",
  identity: "IDENTITY.md",
} as const;

/** Every block we write is fenced as `<!-- apollo:<slug>:start -->` … `:end`. Ours is what
 *  sits between the markers; everything outside belongs to the template that shipped the file
 *  and to the agent, which keeps writing in these files between sessions. */
export function fenceMarkers(slug: string): { start: string; end: string } {
  return { start: `<!-- apollo:${slug}:start -->`, end: `<!-- apollo:${slug}:end -->` };
}

export const AGENTS_FENCE = fenceMarkers("agents-guide");
export const TOOLS_FENCE = fenceMarkers("tools");
export const IDENTITY_FENCE = fenceMarkers("identity");
