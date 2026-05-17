import { mapResult, type RawUserResultRecord } from "../batches/mappers"
import { PublicRepository } from "../repositories/public.repository"
import { notFound } from "../shared/http-error"
import { mapAccount, mapAccountMonth, summarizeAccount } from "./mappers"

const ACCOUNT_TRANSACTION_LIMIT = 500

export class AccountService {
  constructor(private readonly repository: PublicRepository) {}

  async getAccount(accountNumber: number) {
    const transactions = await this.repository.listTransactionsByAccount(accountNumber, {
      limit: ACCOUNT_TRANSACTION_LIMIT,
      offset: 0,
    })
    const summary = summarizeAccount(transactions)
    if (!summary) throw notFound("account not found")

    return { data: mapAccount(summary) }
  }

  async listAccountMonths(accountNumber: number) {
    const transactions = await this.repository.listTransactionsByAccount(accountNumber, {
      limit: ACCOUNT_TRANSACTION_LIMIT,
      offset: 0,
    })
    const summary = summarizeAccount(transactions)
    if (!summary) throw notFound("account not found")

    const batchIds = Array.from(new Set(transactions.map((tx) => tx.batchId)))
    const monthsByKey = new Map<string, ReturnType<typeof mapAccountMonth>>()
    const resultsForView: Array<ReturnType<typeof mapResult>> = []

    for (const batchId of batchIds) {
      const batch = await this.repository.findBatchByBatchId(batchId)
      if (!batch) continue
      const result = await this.repository.findCashbackResultByBatchId(batchId)
      if (!result) continue

      const userResult = ((result.results ?? []) as RawUserResultRecord[]).find(
        (r) => r.accountId === accountNumber,
      )
      if (!userResult) continue

      const periodMatch = batch.batchName?.match(/(\d{4})-(\d{1,2})/)
      if (!periodMatch) continue
      const year = Number(periodMatch[1])
      const month = Number(periodMatch[2])
      const key = `${year}-${month}`

      const payoutRate = batch.payoutOracleRate ?? batch.oracle?.rate ?? null
      const consumedBs = userResult.totalBob ?? 0
      const consumedUsdt = payoutRate && payoutRate > 0
        ? Number((consumedBs / payoutRate).toFixed(6))
        : 0

      monthsByKey.set(key, mapAccountMonth({
        accountId: accountNumber,
        username: userResult.username ?? summary.username,
        year,
        month,
        qrCount: userResult.transactionCount ?? 0,
        consumedBs,
        consumedUsdt,
        tier: userResult.tierName ?? "",
        cashbackUsdt: userResult.cashbackUsdt ?? 0,
        reviewState: (userResult.manualReviewTransactions ?? 0) > 0 ? "review" : "ready",
        updatedAt: result.calculatedAt ?? new Date(),
      }))

      resultsForView.push(
        mapResult(userResult, {
          year,
          month,
          payoutOracleRate: payoutRate,
          calculatedAt: result.calculatedAt,
        }),
      )
    }

    const months = Array.from(monthsByKey.values()).sort((a, b) => {
      if (a.period.year !== b.period.year) return b.period.year - a.period.year
      return b.period.month - a.period.month
    })

    return { data: months, results: resultsForView }
  }
}
