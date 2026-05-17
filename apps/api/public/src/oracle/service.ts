import { PublicRepository } from "../repositories/public.repository"
import { notFound } from "../shared/http-error"

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function mapOracleContext(batch: {
  id: string
  year: number
  month: number
  payout_oracle_rate: number | null
  payout_oracle_source: string | null
  payout_oracle_fetched_at: Date | null
  payout_oracle_mode: string | null
  payout_oracle_status: string | null
  payout_oracle_reason: string | null
  updated_at: Date | null
}) {
  return {
    batchId: batch.id,
    period: {
      year: batch.year,
      month: batch.month,
      label: `${batch.year}-${String(batch.month).padStart(2, "0")}`,
    },
    rate: batch.payout_oracle_rate ?? null,
    source: batch.payout_oracle_source ?? null,
    fetchedAt: toIso(batch.payout_oracle_fetched_at),
    mode: batch.payout_oracle_mode ?? null,
    status: batch.payout_oracle_status ?? "missing_rate",
    reason: batch.payout_oracle_reason ?? null,
    updatedAt: toIso(batch.updated_at),
  }
}

export class OracleService {
  constructor(private readonly repository: PublicRepository) {}

  async getCurrentContext() {
    const batch = await this.repository.findLatestBatch()

    if (!batch) {
      return {
        data: {
          batchId: null,
          period: null,
          rate: null,
          source: null,
          fetchedAt: null,
          mode: null,
          status: "missing_rate",
          reason: "No existe un lote persistido todavía.",
          updatedAt: null,
        },
      }
    }

    return { data: mapOracleContext(batch) }
  }

  async getBatchContext(id: string) {
    const batch = await this.repository.findBatchById(id)
    if (!batch) throw notFound("batch not found")

    return { data: mapOracleContext(batch) }
  }
}
