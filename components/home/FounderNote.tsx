import Image from "next/image";
import { BracketLabel, Section, SoftLink, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// Section 7 of the home page, From Our Founder (David's spec, Sept 27 2026). Compact two-column
// note: the photo (public/david-oralevich.png, the same one /company uses) beside the letter,
// stacked and centered on phones.
export function FounderNote() {
  return (
    <Section bg="#FFFFFF">
      <div className="mx-auto grid max-w-4xl items-center gap-8 text-center md:grid-cols-[180px_1fr] md:gap-12 md:text-left">
        <Image
          src="/david-oralevich.png"
          alt="David Oralevich, Founder and CEO of Apollo Claw"
          width={180}
          height={180}
          className="mx-auto rounded-full md:mx-0"
          style={{ border: "1px solid rgba(11,23,41,0.1)" }}
        />
        <div>
          <BracketLabel light>From Our Founder</BracketLabel>
          <p className="font-body text-[1.125rem] leading-[1.75]" style={{ color: TAN_INK_MUTED }}>
            I&apos;ve been building for businesses since 2008, when I started Designs By Dave O. A few
            years ago, a trip to Israel and a meeting with the CEO of Wix changed how I saw AI and
            what it could do for the people running companies. Apollo Claw is the result: a Chief of
            Staff built around the way you work. I&apos;d love to show you what yours could look like.
          </p>
          <p className="font-heading mt-6 text-[15px] font-bold" style={{ color: TAN_INK }}>
            David Oralevich, Founder &amp; CEO
          </p>
          <div className="mt-5">
            <SoftLink light href="/company">
              Read Our Story →
            </SoftLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
