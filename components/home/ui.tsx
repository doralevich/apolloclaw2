import Link from "next/link";

// ════════════════════════════════════════════════════════════
// PROPOSED TYPE SCALE + SPACING RHYTHM (site rebuild, Phase 1)
// Applied here on the homepage only, for visual approval before it's used sitewide.
//
// Type (Bricolage Grotesque headlines, Inter body):
//   H1 (hero)      clamp(2.5rem, 5.5vw, 4.25rem) / 800 / leading 1.05
//   H2 (section)   clamp(1.875rem, 3.2vw, 2.75rem) / 700 / leading 1.1
//   H3 (card)      1.375rem / 600 / leading 1.2
//   Body large     1.125rem / 400 / leading 1.65 (hero subline, section intros)
//   Body           1rem / 400 / leading 1.7
//   Label/eyebrow  0.75rem / 700 / uppercase / tracking 0.14em (the bracket signature)
//
// Spacing:
//   Section rhythm   py-20 md:py-28 (80px / 112px) , "comfortable air, not crowded, not airy"
//   Content width    max-w-7xl (page), max-w-2xl/3xl (prose blocks, for readability)
//   Gaps             4 / 6 / 8 / 12 / 16 (Tailwind scale)
//
// Buttons: minimal radius (8px). Primary = solid ink; secondary = outline ink.
// ════════════════════════════════════════════════════════════

export const INK = "#1A1A1A";
export const INK_MUTED = "rgba(26,26,26,0.65)";
export const INK_SOFT = "rgba(26,26,26,0.45)";
export const CREAM = "#F2F0EB";
export const RED = "#E12E30";
export const HAIRLINE = "rgba(26,26,26,0.1)";

export function BracketLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-heading mb-5 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.14em]"
      style={{ color: INK }}
    >
      <span style={{ color: RED }}>[</span>
      {children}
      <span style={{ color: RED }}>]</span>
    </span>
  );
}

export function Section({
  children,
  bg = CREAM,
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
      style={{ color: INK }}
    >
      {children}
    </h2>
  );
}

export function BodyLarge({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[1.125rem] leading-[1.65]" style={{ color: INK_MUTED }}>
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
  const style = { background: INK, color: "#ffffff", padding: "13px 26px" };
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
    "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border text-[13px] font-bold tracking-[0.02em] transition-colors hover:bg-black/[0.03]";
  const style = { borderColor: INK, color: INK, padding: "13px 26px" };
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
      style={{ color: INK }}
    >
      {children}
    </Link>
  );
}

// Hero-only dot grid + red glow (design direction: subtle, radial-masked, sparing , hero and
// at most one or two other sections, never blanketed).
export function TextureBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(26,26,26,0.09) 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 60% 20%, rgba(225,46,48,0.08) 0%, transparent 70%)`,
        }}
      />
    </>
  );
}
