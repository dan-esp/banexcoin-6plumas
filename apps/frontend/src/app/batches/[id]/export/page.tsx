import { BatchExportClient } from "@/features/console/components";

export default async function BatchExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BatchExportClient batchId={id} />;
}
