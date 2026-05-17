import type { MonthlyAggregation, User } from "@prisma/client"

export function mapAccount(account: User) {
  return {
    accountNumber: account.account_number,
    alias: account.alias,
    createdAt: account.created_at.toISOString(),
    updatedAt: account.updated_at.toISOString(),
  }
}

export function mapAccountMonth(month: MonthlyAggregation) {
  return {
    id: month.id,
    accountNumber: month.account_number,
    alias: month.alias,
    period: {
      year: month.year,
      month: month.month,
      label: `${month.year}-${String(month.month).padStart(2, "0")}`,
    },
    qrCount: month.tx_count,
    consumedBs: month.total_bs,
    consumedUsdt: month.total_usdt,
    tier: month.tier,
    cashbackUsdt: month.cashback_usdt,
    reviewState: month.review_state ?? "ready",
  }
}
