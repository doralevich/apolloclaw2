interface PageHeroProps {
  /**
   * No longer rendered. Hero banners carry no category tag per David's call, so this is kept
   * only so the many callers that still pass it do not need editing. Safe to delete once those
   * call sites are cleaned up.
   */
  label?: string;
  title: string;
  titleAccent?: string;
  accentFirst?: boolean;
  description?: string;
  cta?: { label: string; href: string };
}

export default function PageHero({ title, titleAccent, accentFirst, description, cta }: PageHeroProps) {
  return (
    <section
      style={{ background: "#0B1729", color: "#ffffff" }}
      className="relative overflow-hidden"
    >
      {/* grid overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* red glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "120%",
          background:
            "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 text-center max-w-5xl relative z-10">
        <h1
          className="font-display leading-[1.05] tracking-tight"
          style={{
            fontSize: "clamp(38px, 5.6vw, 72px)",
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {accentFirst ? (
            <>
              <span style={{ color: "#D72B2B" }}>{titleAccent}</span>{" "}{title}
            </>
          ) : titleAccent ? (
            <>
              {title}{" "}<span style={{ color: "#D72B2B" }}>{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </h1>
        {description && (
          <p
            className="font-body"
            style={{
              fontSize: "clamp(15px, 1.15vw, 18px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 940,
              margin: "24px auto 0",
            }}
          >
            {description}
          </p>
        )}
        {cta && (
          <div style={{ marginTop: 36 }}>
            <a
              href={cta.href}
              target={cta.href.startsWith("http") ? "_blank" : undefined}
              rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center font-bold uppercase transition-all hover:brightness-110"
              style={{
                background: "#D72B2B",
                color: "#ffffff",
                fontSize: 13,
                letterSpacing: "0.1em",
                padding: "14px 30px",
                borderRadius: 4,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(215,43,43,0.35)",
              }}
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
