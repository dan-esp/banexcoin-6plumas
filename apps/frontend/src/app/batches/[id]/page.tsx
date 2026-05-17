import { ConsoleClient } from "@/features/console/components";

export default async function BatchOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ConsoleClient batchId={id} />;
}
