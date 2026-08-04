import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GetStartedClient from "./GetStartedClient";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Get Started with Custom AI Implementation | Apollo Claw" },
  description:
    "Apollo Claw delivers custom AI implementation for small businesses. We set up and manage AI agents that save 20+ hours weekly. Start here.",
  alternates: { canonical: "https://apolloclaw.ai/get-started" },
  openGraph: {
    images: OG_IMAGES,
    title: "Get Started with Custom AI Implementation | Apollo Claw",
    description:
      "Custom AI implementation for small businesses. We set up and manage AI agents that save 20+ hours weekly.",
    url: "https://apolloclaw.ai/get-started",
    type: "website",
  },
};

export default function GetStartedPage() {
  return (
    <>
      <PageHero
        label="Schedule"
        title="Schedule"
        titleAccent="Today."
        description="Pick a time that works for you and we'll connect live."
      />
      <GetStartedClient />
    </>
  );
}
