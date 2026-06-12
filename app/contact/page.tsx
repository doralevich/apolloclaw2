import PageHero from "@/components/PageHero";
import ContactClient from "./ContactClient";

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
