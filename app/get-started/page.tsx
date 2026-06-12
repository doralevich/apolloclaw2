import PageHero from "@/components/PageHero";
import GetStartedClient from "./GetStartedClient";

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
