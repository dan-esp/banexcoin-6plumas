import { PublicRepository } from "../repositories/public.repository"
import { notFound } from "../shared/http-error"
import type { Pagination } from "../shared/query"
import {
  mapBatch,
  mapDisbursement,
  mapResult,
  mapTransaction,
} from "./mappers"

export class BatchService {
  constructor(private readonly repository: PublicRepository) {}

  async listBatches(pagination: Pagination) {
    const batches = await this.repository.listBatches(pagination)
    return { data: batches.map(mapBatch), pagination }
  }

  async getBatch(id: string) {
    const batch = await this.repository.findBatchById(id)
    if (!batch) throw notFound("batch not found")

    return { data: mapBatch(batch) }
  }

  async listTransactions(id: string, pagination: Pagination) {
    const batch = await this.repository.findBatchById(id)
    if (!batch) throw notFound("batch not found")

    const transactions = await this.repository.listBatchTransactions(id, pagination)
    const data = transactions.length
      ? transactions
      : await this.repository.listTransactionsByPeriod(batch.year, batch.month, pagination)

    return { data: data.map(mapTransaction), pagination }
  }

  async listResults(id: string) {
    const batch = await this.repository.findBatchById(id)
    if (!batch) throw notFound("batch not found")

    const results = await this.repository.listBatchResults(id, batch.year, batch.month)
    return { data: results.map(mapResult) }
  }

  async listDisbursements(id: string) {
    const batch = await this.repository.findBatchById(id)
    if (!batch) throw notFound("batch not found")

    const disbursements = await this.repository.listBatchDisbursements(id)
    return { data: disbursements.map(mapDisbursement) }
  }
}
