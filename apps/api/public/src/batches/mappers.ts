import type {
  CashbackRun,
  Disbursement,
  MonthlyAggregation,
  Transaction,
} from "@prisma/client"

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function periodLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function mapBatch(batch: CashbackRun) {
  const blockedRows = batch.blocked_rows ?? 0
  const warningRows = batch.warning_rows ?? 0
  const approved = Boolean(batch.approved_at)

  return {
    id: batch.id,
    period: {
      year: batch.year,
      month: batch.month,
      label: periodLabel(batch.year, batch.month),
    },
    status: batch.status,
    validation: {
      status: batch.validation_status ?? "unknown",
      validRows: batch.valid_rows ?? null,
      warningRows,
      blockedRows,
      exportBlocked: blockedRows > 0,
    },
    totals: {
      users: batch.total_users,
      transactions: batch.total_transactions ?? null,
      consumptionBs: batch.total_consumption_bs ?? null,
      consumptionUsdt: batch.total_consumption_usdt ?? null,
      cashbackBs: batch.total_cashback_bs ?? null,
      cashbackUsdt: batch.total_cashback_usdt,
    },
    payoutOracle: {
      rate: batch.payout_oracle_rate ?? null,
      source: batch.payout_oracle_source ?? null,
      fetchedAt: toIso(batch.payout_oracle_fetched_at),
      mode: batch.payout_oracle_mode ?? null,
      status: batch.payout_oracle_status ?? null,
      reason: batch.payout_oracle_reason ?? null,
    },
    approval: {
      approved,
      approvedBy: batch.approved_by ?? null,
      approvedAt: toIso(batch.approved_at),
    },
    export: {
      ready: Boolean(batch.export_ready) && approved && blockedRows === 0,
      exportedAt: toIso(batch.exported_at),
    },
    createdAt: batch.created_at.toISOString(),
    updatedAt: toIso(batch.updated_at),
  }
}

export function mapTransaction(transaction: Transaction) {
  return {
    id: transaction.id,
    transactionId: transaction.transaction_id,
    accountNumber: transaction.account_number,
    alias: transaction.alias,
    createdAt: transaction.fecha_creacion.toISOString(),
    amounts: {
      bs: transaction.monto_bs,
      usdt: transaction.monto_usdt,
      impliedRate: transaction.tipo_cambio,
      fee: transaction.comision,
    },
    validation: {
      status: transaction.validation_status ?? "valid",
      message: transaction.validation_message ?? null,
    },
    anomaly: {
      flagged: transaction.is_anomaly ?? false,
      score: transaction.anomaly_score ?? null,
    },
  }
}

export function mapResult(result: MonthlyAggregation) {
  return {
    id: result.id,
    accountNumber: result.account_number,
    alias: result.alias,
    period: {
      year: result.year,
      month: result.month,
      label: periodLabel(result.year, result.month),
    },
    totals: {
      consumedBs: result.total_bs,
      consumedUsdt: result.total_usdt,
      qrCount: result.tx_count,
      historicalEffectiveRate: result.historical_effective_rate ?? null,
    },
    tier: {
      name: result.tier,
      cashbackRate: result.cashback_percentage ?? result.cashback_rate,
    },
    payoutOracleRate: result.payout_oracle_rate ?? null,
    cashback: {
      bs: result.cashback_bs,
      usdt: result.cashback_usdt,
    },
    reviewState: result.review_state ?? "ready",
    updatedAt: result.updated_at.toISOString(),
  }
}

export function mapDisbursement(disbursement: Disbursement) {
  return {
    id: disbursement.id,
    accountNumber: disbursement.account_number,
    alias: disbursement.alias,
    tier: disbursement.tier,
    cashbackUsdt: disbursement.cashback_usdt,
    status: disbursement.status,
    exportReference: disbursement.export_reference ?? null,
    generatedAt: toIso(disbursement.generated_at),
    createdAt: disbursement.created_at.toISOString(),
  }
}
