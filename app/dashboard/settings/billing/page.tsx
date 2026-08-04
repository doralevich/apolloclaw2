import { CreditsView } from "@/components/CreditsView";

// Balance, monthly cap and usage for the active agent. Lives under Settings rather than in
// the app rail: you check it when something looks wrong or a renewal is due, not daily.
export default function Page() {
  return <CreditsView />;
}
