import type { Anomaly } from "@prisma/client"

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

export function mapAnomaly(anomaly: Anomaly) {
  return {
    id: anomaly.id,
    anomalyId: anomaly.anomalyId,
    batchId: anomaly.batchId,
    transaction: {
      quoteId: anomaly.quoteId,
      transactionId: anomaly.transactionId,
      accountId: anomaly.accountId,
      username: anomaly.username,
      createdAt: anomaly.createdAt.toISOString(),
      amounts: {
        bs: anomaly.amountBob,
        usdt: anomaly.amountUsdt,
        fxRate: anomaly.fxRate,
      },
    },
    detection: {
      source: "ai-isolation-forest" as const,
      score: anomaly.score,
      isAnomaly: anomaly.isAnomaly,
      detectedAt: anomaly.detectedAt.toISOString(),
    },
    review: {
      status: anomaly.status,
      dismissedAt: toIso(anomaly.dismissedAt),
      dismissedBy: anomaly.dismissedBy ?? null,
      dismissReason: anomaly.dismissReason ?? null,
    },
  }
}

export type AnomalyDto = ReturnType<typeof mapAnomaly>
