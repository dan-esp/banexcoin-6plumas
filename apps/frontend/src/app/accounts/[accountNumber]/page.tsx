import { AccountDetailClient } from "@/features/console/components";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountNumber: string }>;
}) {
  const { accountNumber } = await params;

  return <AccountDetailClient accountNumber={Number(accountNumber)} />;
}
