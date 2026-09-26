import type { Metadata } from "next";
import { IntegrationsDirectory } from "@/components/integrations/IntegrationsDirectory";
import { composioLogoUrl } from "@/lib/integration-catalog";
import { getPublicIntegrationCatalog } from "@/lib/public-integration-catalog";
import { OG_IMAGES } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";
import {
  NAVY,
  PAPER,
  PAPER_MUTED,
  PrimaryButton,
  RED,
  SecondaryButton,
  TAN,
  TextureBackground,
} from "@/components/home/ui";

// The public integrations directory, David's call: "similar to our connections, showing all
// of the connections we have," styled like a standard app-store directory page (his reference:
// lindy.ai/integrations). This is the read-only, no-login twin of the real Connections tab
// (components/IntegrationsView.tsx) inside the dashboard - same curated catalog
// (lib/integration-catalog.ts), no Connect button and no connected/not-connected state, because
// there is no agent here to connect anything to yet. That is what the CTAs below are for.

// The full catalog is dozens of paged API calls, so it is fetched on the server and cached for an
// hour rather than on every visit.
export const revalidate = 3600;

const HERO_LOGOS =["gmail", "googlecalendar", "outlook", "salesforce", "hubspot", "notion", "zoom"];

export const metadata: Metadata = {
  title: { absolute: "Integrations | Apollo[Claw]" },
  description: "Apps your Apollo[Claw] agent can connect to and act in - Gmail, Google Workspace, Microsoft 365, Salesforce, Stripe, and more.",
  alternates: { canonical: "https://apolloclaw.ai/integrations" },
  openGraph: {
    images: OG_IMAGES,
    title: "Integrations | Apollo[Claw]",
    description: "Apps your agent can connect to and act in, across mail, files, calendars, CRM, and more.",
    url: "https://apolloclaw.ai/integrations",
    type: "website",
  },
};

export default async function IntegrationsPage() {
  const catalog = await getPublicIntegrationCatalog();
  return (
    <>
      <section style={{ background: NAVY }} className="relative overflow-hidden">
        <TextureBackground />
        <div className="container relative z-20 mx-auto max-w-7xl px-5 py-16 text-center md:px-8 md:py-20">
          <div aria-hidden className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
            {HERO_LOGOS.map((slug) => (
              <span
                key={slug}
                className="flex size-11 items-center justify-center rounded-xl"
                style={{ background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={composioLogoUrl(slug)} alt="" className="size-6 object-contain" />
              </span>
            ))}
          </div>
          <span
            className="font-mono mb-5 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{ color: RED }}
          >
            Integrations
          </span>
          <h1
            className="font-heading mx-auto text-[clamp(1.875rem,3.4vw,3rem)] font-extrabold leading-[1.12] tracking-tight"
            style={{ color: PAPER, textWrap: "balance", maxWidth: 780 }}
          >
            Connect Every Tool You Already Use
          </h1>
          <p
            className="font-body mx-auto mt-6 text-[1.125rem] leading-[1.65]"
            style={{ color: PAPER_MUTED, maxWidth: 620 }}
          >
            Mail, calendars, files, CRM, payments, and more - connect the tools you already use
            once your agent is built.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton href={SCHEDULE_CONSULT_URL} external>
              Book a Discovery Call
            </PrimaryButton>
            <SecondaryButton href="/how-it-works">How It Works</SecondaryButton>
          </div>
        </div>
      </section>

      <section style={{ background: TAN }} className="px-5 py-16 md:px-8 md:py-20">
        <IntegrationsDirectory catalog={catalog} />
      </section>

      {/* NO CLOSING CTA HERE, same reasoning as /ai-agents: components/layout/PreFooter.tsx
          already appends one sitewide. */}
    </>
  );
}
