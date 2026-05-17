import { Hono } from "hono"
import { getAuth } from "../auth/clerk"
import { prisma } from "../db/client"
import { badRequest } from "../shared/http-error"
import { parsePagination } from "../shared/query"
import { AnomalyService } from "./service"

const service = new AnomalyService(prisma)
export const anomalyRoutes = new Hono()

anomalyRoutes.get("/", async (c) => {
  const batchId = c.req.query("batchId")
  const status = c.req.query("status")
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })

  return c.json(await service.list({ batchId, status, pagination }))
})

anomalyRoutes.get("/:anomalyId", async (c) => {
  return c.json(await service.getOne(c.req.param("anomalyId")))
})

anomalyRoutes.patch("/:anomalyId/dismiss", async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) throw badRequest("missing user context")

  let body: { reason?: string } = {}
  try {
    body = await c.req.json<{ reason?: string }>()
  } catch {
    body = {}
  }

  if (body.reason !== undefined && typeof body.reason !== "string") {
    throw badRequest("reason must be a string")
  }
  if (body.reason && body.reason.length > 500) {
    throw badRequest("reason exceeds 500 characters")
  }

  return c.json(
    await service.dismiss(c.req.param("anomalyId"), {
      reason: body.reason,
      userId: auth.userId,
    }),
  )
})
