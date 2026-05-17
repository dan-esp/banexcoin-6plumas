import type { QrTransaction } from "@prisma/client"

function periodLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export type AccountSummary = {
  accountId: number
  username: string
  firstSeen: Date
  lastSeen: Date
}

export function mapAccount(account: AccountSummary) {
  return {
    accountNumber: account.accountId,
    alias: account.username,
    createdAt: account.firstSeen.toISOString(),
    updatedAt: account.lastSeen.toISOString(),
  }
}

export type AccountMonth = {
  accountId: number
  username: string
  year: number
  month: number
  qrCount: number
  consumedBs: number
  consumedUsdt: number
  tier: string
  cashbackUsdt: number
  reviewState: string
  updatedAt: Date
}

export function mapAccountMonth(month: AccountMonth) {
  return {
    id: `${month.accountId}-${month.year}-${month.month}`,
    accountNumber: month.accountId,
    alias: month.username,
    period: {
      year: month.year,
      month: month.month,
      label: periodLabel(month.year, month.month),
    },
    qrCount: month.qrCount,
    consumedBs: month.consumedBs,
    consumedUsdt: month.consumedUsdt,
    tier: month.tier,
    cashbackUsdt: month.cashbackUsdt,
    reviewState: month.reviewState,
  }
}

export function summarizeAccount(transactions: QrTransaction[]): AccountSummary | null {
  if (transactions.length === 0) return null
  let firstSeen = transactions[0].createdAt
  let lastSeen = transactions[0].createdAt
  for (const tx of transactions) {
    if (tx.createdAt < firstSeen) firstSeen = tx.createdAt
    if (tx.createdAt > lastSeen) lastSeen = tx.createdAt
  }
  return {
    accountId: transactions[0].accountId,
    username: transactions[0].username,
    firstSeen,
    lastSeen,
  }
}
