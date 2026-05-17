import type { PrismaClient } from "@prisma/client"
import { notFound } from "../shared/http-error"
import type { Pagination } from "../shared/query"
import { mapAnomaly } from "./mappers"

export class AnomalyService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: {
    batchId?: string
    status?: string
    pagination: Pagination
  }) {
    const where: Record<string, unknown> = {}
    if (params.batchId) where.batchId = params.batchId
    if (params.status) where.status = params.status

    const [items, total] = await Promise.all([
      this.prisma.anomaly.findMany({
        where,
        orderBy: [{ score: "asc" }, { detectedAt: "desc" }],
        skip: params.pagination.offset,
        take: params.pagination.limit,
      }),
      this.prisma.anomaly.count({ where }),
    ])

    return {
      data: items.map(mapAnomaly),
      pagination: params.pagination,
      total,
    }
  }

  async getOne(anomalyId: string) {
    const found = await this.prisma.anomaly.findUnique({ where: { anomalyId } })
    if (!found) throw notFound("anomaly not found")
    return { data: mapAnomaly(found) }
  }

  async dismiss(anomalyId: string, input: { reason?: string; userId: string }) {
    const existing = await this.prisma.anomaly.findUnique({
      where: { anomalyId },
    })
    if (!existing) throw notFound("anomaly not found")

    const updated = await this.prisma.anomaly.update({
      where: { anomalyId },
      data: {
        status: "dismissed",
        dismissedAt: new Date(),
        dismissedBy: input.userId,
        dismissReason: input.reason,
      },
    })

    return { data: mapAnomaly(updated) }
  }
}
