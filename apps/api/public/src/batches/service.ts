import { PublicRepository } from "../repositories/public.repository"
import { notFound } from "../shared/http-error"
import type { Pagination } from "../shared/query"
import {
  mapBatch,
  mapDisbursement,
  mapResult,
  mapTransaction,
  type RawBanexLineRecord,
  type RawUserResultRecord,
} from "./mappers"

export class BatchService {
  constructor(private readonly repository: PublicRepository) {}

  async listBatches(pagination: Pagination) {
    const batches = await this.repository.listBatches(pagination)
    const enriched = await Promise.all(
      batches.map(async (batch) => {
        const result = await this.repository.findCashbackResultByBatchId(batch.batchId)
        return mapBatch(batch, result)
      }),
    )
    return { data: enriched, pagination }
  }

  async getBatch(batchId: string) {
    const batch = await this.repository.findBatchByBatchId(batchId)
    if (!batch) throw notFound("batch not found")

    const result = await this.repository.findCashbackResultByBatchId(batchId)
    return { data: mapBatch(batch, result) }
  }

  async listTransactions(batchId: string, pagination: Pagination) {
    const batch = await this.repository.findBatchByBatchId(batchId)
    if (!batch) throw notFound("batch not found")

    const transactions = await this.repository.listBatchTransactions(batchId, pagination)
    return { data: transactions.map(mapTransaction), pagination }
  }

  async listResults(batchId: string) {
    const batch = await this.repository.findBatchByBatchId(batchId)
    if (!batch) throw notFound("batch not found")

    const result = await this.repository.findCashbackResultByBatchId(batchId)
    if (!result) return { data: [] }

    const mapped = mapBatch(batch, result)
    const context = {
      year: mapped.period.year,
      month: mapped.period.month,
      payoutOracleRate: mapped.payoutOracle.rate,
      calculatedAt: result.calculatedAt,
    }

    const raw = (result.results ?? []) as RawUserResultRecord[]
    return { data: raw.map((r) => mapResult(r, context)) }
  }

  async listDisbursements(batchId: string) {
    const batch = await this.repository.findBatchByBatchId(batchId)
    if (!batch) throw notFound("batch not found")

    const result = await this.repository.findCashbackResultByBatchId(batchId)
    if (!result) return { data: [] }

    const lines = (result.banexTransferLines ?? []) as RawBanexLineRecord[]
    const userResults = (result.results ?? []) as RawUserResultRecord[]
    const tierByAccount = new Map<number, string>()
    for (const r of userResults) {
      if (r.accountId !== undefined) tierByAccount.set(r.accountId, r.tierName ?? "")
    }

    return {
      data: lines.map((line) =>
        mapDisbursement(line, {
          batchId,
          status: batch.exportedAt ? "exported" : "pending",
          tier: line.accountId !== undefined ? tierByAccount.get(line.accountId) ?? "" : "",
          createdAt: result.calculatedAt ?? batch.createdAt ?? batch.savedAt ?? null,
        }),
      ),
    }
  }
}
