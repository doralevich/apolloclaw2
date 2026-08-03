import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: { absolute: "What Apollo Claw Does | AI Strategy, Agents & Org-Wide Deployment" },
  description: "We sit across the table from your leadership team, map your operations, and build an AI strategy that pays for itself. No vendor fluff. No generic playbooks.",
};

const services = [
  {
    category: "Communication",
    logos: ["WhatsApp","Gmail","Outlook","Office 365","Calendly","Telegram","Zoom","Google Meet"],
    slugs:  ["whatsapp/25D366","gmail/EA4335","microsoftoutlook/0078D4","microsoftoffice/D83B01","calendly/006BFF","telegram/26A5E4","zoom/2D8CFF","googlemeet/00897B"],
    items: [
      { name: "Email Management", desc: "AI reads, sorts, prioritizes, and drafts replies to your inbox. Handles follow-ups, flags what needs attention, and archives the rest." },
      { name: "Calendar & Scheduling", desc: "Checks availability, sends invites, reschedules conflicts, and sends reminders. Connects to Google Calendar, Outlook, and Calendly." },
      { name: "SMS & WhatsApp", desc: "Two-way messaging automation for client follow-ups, appointment reminders, and lead nurturing via SMS or WhatsApp Business." },
    ],
  },
  {
    category: "Sales & CRM",
    logos: ["HubSpot","Salesforce","Pipedrive","Zoho","Monday.com","Notion"],
    slugs:  ["hubspot/FF7A59","salesforce/00A1E0","pipedrive/1A1F36","zoho/E42527","mondaydotcom/F62B54","notion/000000"],
    items: [
      { name: "CRM Updates", desc: "Automatically logs calls, meetings, and emails. Updates deal stages, adds notes, and keeps your pipeline current without manual entry." },
      { name: "Lead Qualification", desc: "AI engages new leads, asks qualifying questions, scores them, and routes hot leads to you immediately." },
      { name: "Outreach Sequences", desc: "Personalized outreach at scale. AI writes and sends follow-up sequences based on prospect behavior and engagement." },
    ],
  },
  {
    category: "Operations",
    logos: ["QuickBooks","DocuSign","Google Drive","Dropbox","Notion","Adobe"],
    slugs:  ["intuit/2CA01C","docusign/FFCC22","googledrive/4285F4","dropbox/0061FF","notion/000000","adobeacrobatreader/EC1C24"],
    items: [
      { name: "Document Processing", desc: "Reads contracts, invoices, and reports. Extracts key data, summarizes findings, and flags action items." },
      { name: "Research & Intelligence", desc: "Searches the web, analyzes competitors, monitors news, and delivers structured briefings on any topic." },
      { name: "Invoice & Billing", desc: "Generates invoices, tracks payment status, sends reminders, and reconciles billing records automatically." },
    ],
  },
  {
    category: "Integrations",
    logos: ["Shopify","Slack","Zapier","Make","Stripe","OpenAI","Twilio"],
    slugs:  ["shopify/96BF48","slack/4A154B","zapier/FF4A00","make/6D00CC","stripe/635BFF","openai/412991","twilio/F22F46"],
    items: [
      { name: "API Connections", desc: "Connects your bot to any platform with an API - Shopify, QuickBooks, HubSpot, Salesforce, Slack, and hundreds more." },
      { name: "Workflow Automation", desc: "Custom multi-step workflows triggered by events. A new lead triggers a CRM entry, a follow-up email, and a Slack alert - all automatically." },
      { name: "Custom Reporting", desc: "Daily, weekly, or on-demand reports delivered to your inbox or Telegram. Metrics, trends, and actionable summaries." },
    ],
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        label="What We Do"
        title="Everything Your"
        titleAccent="Bot Can Do"
        description="Every Apollo[Claw] bot is built from a menu of proven integrations. We pick the right combination for your business and wire it all together."
        cta={{ label: "Book a Free Call", href: "https://calendly.com/therealdaveo/apolloai" }}
      />

      {(services as any[]).map((group, gi) => (
        <div key={gi}>
          <section className={`py-16 ${gi % 2 === 0 ? "bg-surface-alt" : "bg-background"}`}>
            <div className="container mx-auto px-4 md:px-8 max-w-6xl">
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-8 h-[3px] bg-primary rounded-full" />
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">{group.category}</span>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.items.map((item: {name:string;desc:string}, ii: number) => (
                  <ScrollReveal key={ii} delay={ii * 100}>
                    <div className="bauhaus-card p-8 h-full flex flex-col">
                      <h3 className="font-display text-xl text-foreground mb-3">{item.name}</h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Logo Strip */}
              <div className="mt-12 pt-8 border-t border-border/40">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 text-center">Works With</p>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
                  {group.logos.map((logoName: string, li: number) => (
                    <div key={li} className="flex flex-col items-center gap-1.5">
                      <img
                        src={`https://cdn.simpleicons.org/${group.slugs[li]}/9ca3af`}
                        alt={logoName}
                        width={28}
                        height={28}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <span className="font-mono text-[9px] text-muted-foreground text-center whitespace-nowrap">{logoName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {gi < services.length - 1 && <div className="section-divider" />}
        </div>
      ))}

      <div className="section-divider" />

    </>
  );
}
