import type {
  Batch,
  CashbackResult,
  QrTransaction,
} from "@prisma/client"

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function parsePeriod(batchName: string | null | undefined): { year: number; month: number; label: string } {
  if (batchName) {
    const match = batchName.match(/(\d{4})-(\d{1,2})/)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2])
      return { year, month, label: `${year}-${String(month).padStart(2, "0")}` }
    }
  }
  const fallback = new Date()
  return {
    year: fallback.getUTCFullYear(),
    month: fallback.getUTCMonth() + 1,
    label: `${fallback.getUTCFullYear()}-${String(fallback.getUTCMonth() + 1).padStart(2, "0")}`,
  }
}

function periodLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

type RawUserResult = {
  accountId?: number
  username?: string
  totalBob?: number
  tierName?: string
  rate?: number
  cashbackBob?: number
  cashbackUsdt?: number
  transactionCount?: number
  manualReviewTransactions?: number
}

type RawBanexLine = {
  accountId?: number
  username?: string
  cashbackUsdt?: number
}

export function mapBatch(batch: Batch, result?: CashbackResult | null) {
  const period = parsePeriod(batch.batchName)

  const blockedRows = result?.audit?.rowsDiscardedByValidation ?? 0
  const warningRows = result?.warnings?.length ?? 0
  const validRows = result?.audit?.rowsProcessed ?? batch.rowsLoaded ?? null

  const totalUsers = result?.usersQualifyingForCashback ?? result?.totalUsersAnalyzed ?? 0
  const transactions = batch.rowsLoaded ?? null

  let consumptionBs: number | null = null
  let cashbackBs: number | null = null
  let cashbackUsdt = 0

  for (const r of (result?.results ?? []) as RawUserResult[]) {
    consumptionBs = (consumptionBs ?? 0) + (r.totalBob ?? 0)
    cashbackBs = (cashbackBs ?? 0) + (r.cashbackBob ?? 0)
    cashbackUsdt += r.cashbackUsdt ?? 0
  }

  const oracle = batch.oracle
  const payoutOracleRate = batch.payoutOracleRate ?? oracle?.rate ?? null
  const payoutOracleSource = batch.payoutOracleSource ?? oracle?.source ?? null
  const payoutOracleFetchedAtIso = batch.payoutOracleFetchedAt
    ? toIso(batch.payoutOracleFetchedAt)
    : oracle?.fetchedAt ?? null
  const payoutOracleMode = batch.payoutOracleMode ?? oracle?.mode ?? null
  const payoutOracleStatus = batch.payoutOracleStatus ?? oracle?.status ?? null
  const payoutOracleReason = batch.payoutOracleReason ?? oracle?.fallbackReason ?? null

  const approved = Boolean(batch.approvedAt)
  const consumptionUsdt = payoutOracleRate && consumptionBs !== null
    ? Number((consumptionBs / payoutOracleRate).toFixed(6))
    : null

  return {
    id: batch.batchId ?? batch.id,
    period,
    status: batch.status,
    validation: {
      status: result ? "ok" : "pending",
      validRows,
      warningRows,
      blockedRows,
      exportBlocked: blockedRows > 0,
    },
    totals: {
      users: totalUsers,
      transactions,
      consumptionBs,
      consumptionUsdt,
      cashbackBs,
      cashbackUsdt,
    },
    payoutOracle: {
      rate: payoutOracleRate,
      source: payoutOracleSource,
      fetchedAt: payoutOracleFetchedAtIso,
      mode: payoutOracleMode,
      status: payoutOracleStatus,
      reason: payoutOracleReason,
    },
    approval: {
      approved,
      approvedBy: batch.approvedBy ?? null,
      approvedAt: toIso(batch.approvedAt),
    },
    export: {
      ready: Boolean(batch.exportReady) && approved && blockedRows === 0,
      exportedAt: toIso(batch.exportedAt),
    },
    createdAt: (batch.createdAt ?? batch.savedAt ?? new Date()).toISOString(),
    updatedAt: toIso(batch.updatedAt),
  }
}

export function mapTransaction(transaction: QrTransaction) {
  return {
    id: transaction.id,
    transactionId: transaction.transactionId,
    accountNumber: transaction.accountId,
    alias: transaction.username,
    createdAt: transaction.createdAt.toISOString(),
    amounts: {
      bs: transaction.amountBob,
      usdt: transaction.amountUsdt,
      impliedRate: transaction.fxRate,
      fee: transaction.commission,
    },
    validation: {
      status: transaction.status,
      message: null,
    },
    anomaly: {
      flagged: false,
      score: null,
    },
  }
}

export function mapResult(
  raw: RawUserResult,
  context: { year: number; month: number; payoutOracleRate: number | null; calculatedAt: Date | null },
) {
  const consumedBs = raw.totalBob ?? 0
  const consumedUsdt = context.payoutOracleRate && context.payoutOracleRate > 0
    ? Number((consumedBs / context.payoutOracleRate).toFixed(6))
    : 0

  return {
    id: `${raw.accountId ?? "unknown"}-${context.year}-${context.month}`,
    accountNumber: raw.accountId ?? 0,
    alias: raw.username ?? "",
    period: {
      year: context.year,
      month: context.month,
      label: periodLabel(context.year, context.month),
    },
    totals: {
      consumedBs,
      consumedUsdt,
      qrCount: raw.transactionCount ?? 0,
      historicalEffectiveRate: null,
    },
    tier: {
      name: raw.tierName ?? "",
      cashbackRate: raw.rate ?? 0,
    },
    payoutOracleRate: context.payoutOracleRate,
    cashback: {
      bs: raw.cashbackBob ?? 0,
      usdt: raw.cashbackUsdt ?? 0,
    },
    reviewState: (raw.manualReviewTransactions ?? 0) > 0 ? "review" : "ready",
    updatedAt: (context.calculatedAt ?? new Date()).toISOString(),
  }
}

export function mapDisbursement(
  raw: RawBanexLine,
  fallback: { batchId: string; status: string; tier: string; createdAt: Date | null },
) {
  return {
    id: `${fallback.batchId}-${raw.accountId ?? "unknown"}`,
    accountNumber: raw.accountId ?? 0,
    alias: raw.username ?? "",
    tier: fallback.tier,
    cashbackUsdt: raw.cashbackUsdt ?? 0,
    status: fallback.status,
    exportReference: null,
    generatedAt: null,
    createdAt: (fallback.createdAt ?? new Date()).toISOString(),
  }
}

export type RawUserResultRecord = RawUserResult
export type RawBanexLineRecord = RawBanexLine
