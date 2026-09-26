"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthNavLink from "@/components/layout/AuthNavLink";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Menu, X } from "lucide-react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// Site IA, current top-level order per David's direct call: Company · Agents · Use Cases ·
// Case Studies · Security · Integrations · Contact. Industries now lives inside the Case Studies dropdown (each
// industry page carries its own case studies - config/caseStudies.ts). Industries and
// Agents (which one you're hiring) are two separate triggers, briefly merged into one two-column
// "Solutions" mega-menu and then split back out as too dense. Company used to be a small
// dropdown (About, Security); About's content moved to /company (next.config.ts redirects the
// old URL) and Company and Security are now their own plain top-level links, no dropdown.
//
// LEGAL, MEDICAL AND INSURANCE ARE IN AGENTS NOW, David's call, and this note used to say the
// opposite: that they stayed out because each resolved to the same page as its Industries
// counterpart. That was true and was the wrong conclusion - those pages are titled "Law Agent",
// "Medical AI Agent" and "AI Insurance Agent", so they were product pages filed under the wrong
// axis. They moved rather than being duplicated; the pages and their URLs are untouched. Real
// Estate remains in both lists, which is a separate and older decision (config/navigation.ts).
//
// Blog is back as a top-level link. It had been dropped along with the rest of Resources, which
// left /blog reachable only from a footer column where it was labelled "Insights" — so the one
// person who most needed to find it could not, and reported the page as missing. AI 101 and FAQ
// stay in the footer; the blog is the one that earns a slot up here, because it is the only one
// that gets new content.
//
// Every destination in both dropdowns is a real page. The old /use-cases/* tree was retired and
// split along these same two axes, with 301s from every old path (see next.config.ts).
//
// Layout history (David's direct feedback, several rounds): tried a slim utility bar above the
// main nav, merged it into one row, then split back into two tiers, this is that two-tier
// layout, dark navy utility bar on top (email, Log in), main nav in white
// underneath (category dropdowns, Book a Discovery Call). The AI Agents mega-menu was dropped
// from the top nav entirely per David's call that it's not needed here, moved into the Footer
// instead (components/layout/Footer.tsx). Pricing dropped from the nav entirely too - briefly
// came back once app/pricing/page.tsx existed, then David asked for it out of the nav again.
// The page itself is untouched and still live; only this link is gone.

const NAVY = "#0B1729";
const NAVY_DEEP = "#070F1C";
const PAPER = "#F5F6F8";
const PAPER_MUTED = "rgba(245,246,248,0.6)";
const RED = "#E12E30";
const HAIRLINE = "rgba(245,246,248,0.1)";

// Main nav row is white now (David wanted to try it), separate ink tokens since PAPER/HAIRLINE
// above are tuned for the dark utility bar, mobile drawer, and dropdown flyout panels. Link
// text is solid black per David's direct feedback (no muted/active distinction anymore, the
// red underline alone marks the active page).
const NAV_WHITE = "#FFFFFF";
const NAV_INK = "#000000";
const NAV_HAIRLINE = "rgba(26,26,26,0.12)";

const CONTACT_EMAIL = "hello@apolloclaw.ai";
import { AGENTS, CASE_STUDY_INDUSTRIES, externalLinkProps } from "@/config/navigation";
import { USE_CASES } from "@/config/useCases";

const USE_CASE_NAV = USE_CASES.map((u) => ({
  label: u.label,
  description: u.summary,
  to: `/use-cases/${u.slug}`,
  Icon: u.Icon,
}));

const CONSULT_URL = "https://cal.com/therealdaveo/dbdo-consultation";

interface NavGroup {
  kind: "group";
  label: string;
  /** The group's own page, making the trigger itself a destination rather than a dead button.
   *
   *  Only Agents has one (David: "the main Agent link should have our Fleet of Agents"). A
   *  trigger without this stays a <button>, which is correct for Company and Industries: there
   *  is no page behind either, and a link that goes nowhere is worse than a button that opens
   *  a menu. Set it and the desktop trigger becomes a Link and the drawer gains an overview
   *  row, so the page is reachable on both. */
  to?: string;
  active: (pathname: string) => boolean;
  render: () => React.ReactNode;
  // What the mobile drawer lists when this group is expanded. Carried on the group itself so
  // the drawer never has to branch on the label string to find the right array.
  // `external` rides along so the drawer opens an offsite row in a new tab exactly as the
  // desktop flyout does. A new tab in one and not the other is the drift this type invites.
  mobileItems: { label: string; to: string; Icon?: LucideIcon; external?: boolean }[];
}

// Plain top-level links (Case Studies, Contact), no dropdown, just an active-state underline
// like the group triggers, per David's call to promote them out of the Resources/Company
// dropdowns and into the top nav directly.
interface NavLink {
  kind: "link";
  label: string;
  to: string;
  active: (pathname: string) => boolean;
}

type NavEntry = NavGroup | NavLink;

function DesktopDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = group.active(pathname);
  // The flyout opens on CSS hover, which on its own leaves it stuck open after you click
  // through to a page: the cursor is still sitting on the trigger when the new page renders.
  // Clicking anything inside dismisses it, and it re-arms once the cursor leaves the trigger.
  const [dismissed, setDismissed] = useState(false);

  // The trigger's contents are identical either way; only the element changes. A group with a
  // page of its own is a Link you can click through to, one without stays a button that only
  // opens the menu. Hover still drives the flyout in both cases - it is the parent .group that
  // owns that, not this element.
  const triggerClass =
    "relative flex items-center gap-1 whitespace-nowrap pb-1 text-[14px] font-bold tracking-[0.01em] transition-colors";
  const triggerInner = (
    <>
      {group.label}
      <ChevronDown size={11} className={`transition-transform ${dismissed ? "" : "group-hover:rotate-180"}`} />
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
      )}
    </>
  );

  return (
    <div className="group relative" onMouseLeave={() => setDismissed(false)}>
      {group.to ? (
        <Link href={group.to} className={triggerClass} style={{ color: NAV_INK }}>
          {triggerInner}
        </Link>
      ) : (
        <button className={triggerClass} style={{ color: NAV_INK }}>
          {triggerInner}
        </button>
      )}
      <div
        onClick={() => setDismissed(true)}
        className={`invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 ${
          dismissed ? "" : "group-hover:visible group-hover:opacity-100"
        }`}
      >
        {group.render()}
      </div>
    </div>
  );
}

function DesktopNavLink({ item, pathname }: { item: NavLink; pathname: string }) {
  const active = item.active(pathname);
  return (
    <Link
      href={item.to}
      className="relative whitespace-nowrap pb-1 text-[14px] font-bold tracking-[0.01em] transition-colors"
      style={{ color: NAV_INK }}
    >
      {item.label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: RED }} />
      )}
    </Link>
  );
}

function panelStyle(minWidth: number): React.CSSProperties {
  return {
    background: NAVY_DEEP,
    border: `1px solid ${HAIRLINE}`,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    minWidth,
  };
}

// Industries and Agents are two separate flyouts again (David: "let's do by Industry and
// By Departments, that's too much, should be separated"). They were briefly merged into one
// 820px-wide two-column mega-menu, which read as too dense. Industries stays a plain text list
// (vertical keywords, SEO-important), Agents keeps the icon-tile treatment.
// Both category flyouts render the same way: a two-column grid of icon tiles. Shared so
// Industries and Agents cannot drift apart visually.
function tilePanel(
  items: { label: string; description: string; to: string; Icon: LucideIcon; external?: boolean }[],
  pathname: string,
  minWidth: number,
) {
  return (
    <div className="overflow-hidden rounded-xl p-5" style={panelStyle(minWidth)}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item) => {
          const Icon = item.Icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              {...(item.external ? externalLinkProps : {})}
              className="-m-1.5 flex items-start gap-3 rounded-lg p-1.5 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,246,248,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(245,246,248,0.07)" }}
              >
                <Icon size={18} style={{ color: active ? RED : PAPER }} />
              </div>
              <div className="min-w-0">
                <div className="font-heading text-[14px] font-bold" style={{ color: active ? RED : PAPER }}>
                  {item.label}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-[1.35]" style={{ color: PAPER_MUTED }}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
  }, [pathname]);

  // Top-level order per David's direct call: Company (About, Security), Industries, Agents,
  // Case Studies, Blog, Contact. Industries and Agents are two separate triggers again after
  // a brief run as one merged "Solutions" mega-menu. Blog sits second-to-last so Contact keeps
  // the end of the row, which is where people look for it.
  const navEntries: NavEntry[] = [
    {
      kind: "link",
      label: "Company",
      to: "/company",
      active: (p) => p.startsWith("/company"),
    },
    {
      kind: "group",
      label: "Agents",
      // The only group with a page behind it: the fleet (app/ai-agents/page.tsx).
      to: "/ai-agents",
      // Matches the rows, not one URL prefix. Four agents live under /industries/* - law,
      // insurance, medical and real estate, whose pages were always there - so a prefix test on
      // /ai-agents alone left the tab unlit on four of its own destinations. External rows are
      // skipped: nothing on this site is ever "on" thecollegeagent.ai. The fleet page itself
      // lights it too, which the row test alone would miss.
      active: (p) => p === "/ai-agents" || AGENTS.some((a) => !a.external && p === a.to),
      mobileItems: AGENTS,
      render: () => tilePanel(AGENTS, pathname, 560),
    },
    {
      // One page per job an agent does (config/useCases.ts); the trigger opens the /use-cases hub.
      kind: "group",
      label: "Use Cases",
      to: "/use-cases",
      active: (p) => p.startsWith("/use-cases"),
      mobileItems: USE_CASE_NAV,
      render: () => tilePanel(USE_CASE_NAV, pathname, 640),
    },
    {
      // Industries folded in here, David's call: the trigger opens the overview of every case
      // study, and the dropdown lists each industry, whose page carries its own studies.
      kind: "group",
      label: "Case Studies",
      to: "/case-studies",
      active: (p) =>
        p.startsWith("/case-studies") || CASE_STUDY_INDUSTRIES.some((i) => !i.external && p === i.to),
      mobileItems: CASE_STUDY_INDUSTRIES,
      render: () => tilePanel(CASE_STUDY_INDUSTRIES, pathname, 680),
    },
    {
      kind: "link",
      label: "Security",
      to: "/security",
      active: (p) => p.startsWith("/security"),
    },
    {
      kind: "link",
      label: "Integrations",
      to: "/integrations",
      active: (p) => p.startsWith("/integrations"),
    },
    {
      kind: "link",
      label: "Contact",
      to: "/contact",
      active: (p) => p.startsWith("/contact"),
    },
  ];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        {/* Utility bar: email + account actions, the "blue bar" from the stackhaus.ai reference.
            Uses the same .container as the main nav below so email/Log in line up exactly
            with the logo and right edge underneath, instead of the ad-hoc px-5/px-8 this used
            to carry on its own. Get Started was removed from both this bar and the mobile
            drawer (David's call), leaving Book a Discovery Call as the single nav CTA. */}
        {/* py-[10px]: was 5px, David asked for 5px more top and bottom on this bar. */}
        <div className="hidden py-[10px] md:flex" style={{ background: NAVY_DEEP }}>
          <div className="container mx-auto flex w-full items-center justify-between">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px]"
              style={{ color: "#ffffff" }}
            >
              {CONTACT_EMAIL}
            </a>
            <AuthNavLink variant="utility" />
          </div>
        </div>

        {/* Main nav: white, category dropdowns centered, Book a Discovery Call flush right. */}
        <nav style={{ background: NAV_WHITE, borderBottom: `1px solid ${NAV_HAIRLINE}` }}>
          <div className="container mx-auto flex h-[88px] items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center">
              <ApolloClawLogo ink={NAV_INK} height={36} />
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-5 md:flex">
              {navEntries.map((entry) =>
                entry.kind === "group" ? (
                  <DesktopDropdown key={entry.label} group={entry} pathname={pathname} />
                ) : (
                  <DesktopNavLink key={entry.label} item={entry} pathname={pathname} />
                )
              )}
            </div>

            <a
              href={CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-90 md:inline-flex"
              style={{ background: RED, color: "#ffffff", padding: "10px 18px" }}
            >
              Book a Discovery Call
            </a>

            <button
              className="ml-auto p-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ color: NAV_INK }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto pt-[88px] md:hidden" style={{ background: NAVY }}>
          <div className="flex flex-col gap-1 px-6 py-8">
            {navEntries.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.label}
                  href={entry.to}
                  className="font-heading border-b py-4 text-xl font-semibold"
                  style={{ color: PAPER, borderColor: HAIRLINE }}
                >
                  {entry.label}
                </Link>
              ) : (
              <div key={entry.label} className="border-b" style={{ borderColor: HAIRLINE }}>
                <button
                  onClick={() => setOpenSection((s) => (s === entry.label ? null : entry.label))}
                  className="font-heading flex w-full items-center justify-between py-4 text-xl font-semibold"
                  style={{ color: PAPER }}
                >
                  {entry.label}
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${openSection === entry.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === entry.label && (
                  <div className="flex flex-col gap-1 pb-4 pl-2">
                    {/* The group's own page. On desktop the trigger itself is the link; the
                        drawer's trigger has to stay a toggle, so without this row the fleet
                        page would be desktop-only. */}
                    {entry.to && (
                      <Link
                        href={entry.to}
                        className="font-heading py-2 text-base font-bold"
                        style={{ color: PAPER }}
                      >
                        All {entry.label}
                      </Link>
                    )}
                    {entry.mobileItems.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <Link
                          key={item.to}
                          href={item.to}
                          {...(item.external ? externalLinkProps : {})}
                          className="flex items-center gap-2.5 py-2 text-base"
                          style={{ color: PAPER_MUTED }}
                        >
                          {Icon && <Icon size={16} />}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              )
            )}
            <AuthNavLink variant="drawer" onNavigate={() => setMobileOpen(false)} />
            <div className="mt-2 flex flex-col gap-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-center text-sm" style={{ color: PAPER_MUTED }}>
                {CONTACT_EMAIL}
              </a>
              <a
                href={CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[8px] border text-[13px] font-bold tracking-[0.04em]"
                style={{ borderColor: HAIRLINE, color: PAPER, padding: "14px 20px" }}
              >
                Book a Discovery Call
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
