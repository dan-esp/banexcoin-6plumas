import type { PrismaClient } from "@prisma/client"
import type { Pagination } from "../shared/query"

export class PublicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listBatches(pagination: Pagination) {
    return this.prisma.cashbackRun.findMany({
      orderBy: { created_at: "desc" },
      skip: pagination.offset,
      take: pagination.limit,
    })
  }

  findBatchById(id: string) {
    return this.prisma.cashbackRun.findUnique({ where: { id } })
  }

  listBatchTransactions(cashbackRunId: string, pagination: Pagination) {
    return this.prisma.transaction.findMany({
      where: { cashback_run_id: cashbackRunId },
      orderBy: { fecha_creacion: "desc" },
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

    return this.prisma.transaction.findMany({
      where: {
        fecha_creacion: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { fecha_creacion: "desc" },
      skip: pagination.offset,
      take: pagination.limit,
    })
  }

  listBatchResults(cashbackRunId: string, year: number, month: number) {
    return this.prisma.monthlyAggregation.findMany({
      where: {
        OR: [{ cashback_run_id: cashbackRunId }, { year, month }],
      },
      orderBy: [{ cashback_usdt: "desc" }, { alias: "asc" }],
    })
  }

  listBatchDisbursements(cashbackRunId: string) {
    return this.prisma.disbursement.findMany({
      where: { cashback_run_id: cashbackRunId },
      orderBy: { alias: "asc" },
    })
  }

  findAccount(accountNumber: number) {
    return this.prisma.user.findUnique({
      where: { account_number: accountNumber },
    })
  }

  listAccountMonths(accountNumber: number) {
    return this.prisma.monthlyAggregation.findMany({
      where: { account_number: accountNumber },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })
  }
}
