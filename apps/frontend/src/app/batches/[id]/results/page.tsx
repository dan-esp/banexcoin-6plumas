import { BatchResultsClient } from "@/features/console/components";

export default async function BatchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BatchResultsClient batchId={id} />;
}
