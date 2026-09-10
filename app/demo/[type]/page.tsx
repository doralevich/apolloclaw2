import { notFound } from "next/navigation";
import { getAgentType } from "@/config/agent-types";
import { DemoRunner } from "@/components/demo/DemoRunner";

// Step two: the walkthrough itself.
//
// Resolves the type the same way /onboard/[agent] does, and refuses the same ones, so a slug
// that works here works there and vice versa. Everything past this point is client-side; the
// only server call the demo makes is /api/demo/preview at the end, and that one writes nothing.

type Props = { params: Promise<{ type: string }> };

export default async function DemoWalkthroughPage({ params }: Props) {
  const { type: slug } = await params;
  const type = getAgentType(slug);
  if (!type || type.externalUrl || type.noSetup || !type.available) notFound();

  return <DemoRunner typeId={type.id} typeLabel={type.label} />;
}
