import { GuideView } from "@/components/GuideView";

// noindex, matching /onboard/[agent] and /build/[slug]. This is a signed-in app screen, and
// without a robots rule it inherited the root layout's canonical - telling Google it was the
// homepage.
export const metadata = { title: "Guide", robots: { index: false, follow: false } };

export default function GuidePage() {
  return <GuideView />;
}
