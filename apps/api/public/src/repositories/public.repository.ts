import type { Prisma, PrismaClient } from "@prisma/client"
import type { Pagination } from "../shared/query"

export class PublicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listBatches(pagination: Pagination) {
    return this.prisma.batch.findMany({
      where: { batchId: { not: null } },
      orderBy: [{ savedAt: "desc" }, { createdAt: "desc" }],
      skip: pagination.offset,
      take: pagination.limit,
    })
  }

  findBatchByBatchId(batchId: string | null | undefined) {
    if (!batchId) return Promise.resolve(null)
    return this.prisma.batch.findUnique({ where: { batchId } })
  }

  findLatestBatch() {
    return this.prisma.batch.findFirst({
      where: { batchId: { not: null } },
      orderBy: [{ savedAt: "desc" }, { createdAt: "desc" }],
    })
  }

  findCashbackResultByBatchId(batchId: string | null | undefined) {
    if (!batchId) return Promise.resolve(null)
    return this.prisma.cashbackResult.findUnique({ where: { batchId } })
  }

  listBatchTransactions(batchId: string | null | undefined, pagination: Pagination) {
    if (!batchId) return Promise.resolve([])
    return this.prisma.qrTransaction.findMany({
      where: { batchId },
      orderBy: { createdAt: "desc" },
      skip: pagination.offset,
      take: pagination.limit,
    })
  }

  listTransactionsByAccount(accountId: number, pagination: Pagination) {
    return this.prisma.qrTransaction.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      skip: pagination.offset,
      take: pagination.limit,
    })
  }

  listTransactionsByPeriod(
    year: number,
    month: number,
    pagination: Pagination,
  ) {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))

    return this.prisma.qrTransaction.findMany({
      where: { createdAt: { gte: start, lt: end } satisfies Prisma.DateTimeFilter },
      orderBy: { createdAt: "desc" },
      skip: pagination.offset,
      take: pagination.limit,
    })
  }
}
