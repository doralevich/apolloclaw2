import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: { absolute: "Contact Apollo[Claw] | Schedule a Consultation" },
  description: "Schedule a consultation with Apollo[Claw] and find out exactly which AI agent fits your business. We scope every engagement individually.",
  openGraph: {
    title: "Contact Apollo[Claw] | Schedule a Consultation",
    description: "Schedule a consultation and find out exactly which AI agent fits your business.",
    url: "https://apolloclaw.ai/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="Get in"
        titleAccent="Touch."
        description="Have a question or ready to explore what AI can do for your business? Drop us a line."
      />
      <ContactClient />
    </>
  );
}
