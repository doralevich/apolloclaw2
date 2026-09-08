import { GuideView } from "@/components/GuideView";

// noindex comes from app/dashboard/layout.tsx, which covers every screen under /dashboard.
export const metadata = { title: "Guide" };

export default function GuidePage() {
  return <GuideView />;
}
