// Sub-brand wordmark for a named agent product ("The College [Agent]", "The Recruiting
// [Agent]"), matching the bracket-accent treatment of the main Apollo[Claw] logo but with
// its own accent color per agent. Text-based (like ApolloClawLogo's sibling wordmarks),
// not an image asset.

export default function AgentWordmark({
  name,
  accent,
  ink = "#1A1A1A",
  size = 26,
}: {
  name: string;
  accent: string;
  ink?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        fontWeight: 700,
        fontSize: size,
        color: ink,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span>The {name} </span>
      <span style={{ color: accent }}>[</span>
      <span>Agent</span>
      <span style={{ color: accent }}>]</span>
    </div>
  );
}
