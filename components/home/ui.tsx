import Link from "next/link";

// ════════════════════════════════════════════════════════════
// DESIGN SYSTEM v2 (dark navy pivot, David's direction after seeing v1 light-cream build live +
// a stackhaus.ai reference: dark bg, utility bar above nav, centered hero, simple two-button
// pairs, understated nav). Red #E12E30 (true logo value) stays the sole accent on the dark bg.
//
// Type (Bricolage Grotesque headlines, Inter body) — unchanged from v1, still proposed/pending
// full approval:
//   H1 (hero)      clamp(2.5rem, 5.5vw, 4.25rem) / 800 / leading 1.05
//   H2 (section)   clamp(1.875rem, 3.2vw, 2.75rem) / 700 / leading 1.1
//   H3 (card)      1.375rem / 600 / leading 1.2
//   Body large     1.125rem / 400 / leading 1.65
//   Body           1rem / 400 / leading 1.7
//   Label/eyebrow  0.75rem / 700 / uppercase / tracking 0.14em (the bracket signature)
//
// Spacing: py-20 md:py-28 section rhythm, max-w-7xl page / max-w-2xl-3xl prose, 8px button radius.
// ════════════════════════════════════════════════════════════

export const NAVY = "#0B1729";
export const NAVY_DEEP = "#070F1C";
export const NAVY_ELEVATED = "#101F38";
export const PAPER = "#F5F6F8";
export const PAPER_MUTED = "rgba(245,246,248,0.65)";
export const PAPER_SOFT = "rgba(245,246,248,0.45)";
export const RED = "#E12E30";
export const HAIRLINE = "rgba(245,246,248,0.1)";

// Kept for anything still referencing the v1 light tokens by name.
export const INK = PAPER;
export const INK_MUTED = PAPER_MUTED;
export const INK_SOFT = PAPER_SOFT;
export const CREAM = NAVY;

export function BracketLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-heading mb-5 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.14em]"
      style={{ color: PAPER }}
    >
      <span style={{ color: RED }}>[</span>
      {children}
      <span style={{ color: RED }}>]</span>
    </span>
  );
}

export function Section({
  children,
  bg = NAVY,
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <section style={{ background: bg }} className={`relative overflow-hidden ${className}`}>
      <div className="container relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">{children}</div>
    </section>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-heading text-[clamp(1.875rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-tight"
      style={{ color: PAPER }}
    >
      {children}
    </h2>
  );
}

export function BodyLarge({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[1.125rem] leading-[1.65]" style={{ color: PAPER_MUTED }}>
      {children}
    </p>
  );
}

export function PrimaryButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-90";
  const style = { background: RED, color: "#ffffff", padding: "13px 26px" };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border text-[13px] font-bold tracking-[0.02em] transition-colors hover:bg-white/[0.06]";
  const style = { borderColor: HAIRLINE, color: PAPER, padding: "13px 26px" };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  );
}

export function SoftLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-heading inline-flex items-center gap-1.5 text-[14px] font-bold transition-opacity hover:opacity-70"
      style={{ color: PAPER }}
    >
      {children}
    </Link>
  );
}

// Hero-only dot grid + red glow, light dots on the dark bg (design direction: subtle,
// radial-masked, sparing, hero and at most one or two other sections, never blanketed).
export function TextureBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(245,246,248,0.08) 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 15%, rgba(225,46,48,0.14) 0%, transparent 70%)`,
        }}
      />
    </>
  );
}
