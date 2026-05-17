import { BatchTransactionsClient } from "@/features/console/components";

export default async function BatchTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BatchTransactionsClient batchId={id} />;
}
