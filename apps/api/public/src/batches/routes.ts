import { Hono } from "hono"
import { prisma } from "../db/client"
import { PublicRepository } from "../repositories/public.repository"
import { parsePagination, requireId } from "../shared/query"
import { BatchService } from "./service"

const service = new BatchService(new PublicRepository(prisma))
export const batchRoutes = new Hono()

batchRoutes.get("/", async (c) => {
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })

  return c.json(await service.listBatches(pagination))
})

batchRoutes.get("/:id", async (c) => {
  const id = requireId(c.req.param("id"), "id")
  return c.json(await service.getBatch(id))
})

batchRoutes.get("/:id/transactions", async (c) => {
  const id = requireId(c.req.param("id"), "id")
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })

  return c.json(await service.listTransactions(id, pagination))
})

batchRoutes.get("/:id/results", async (c) => {
  const id = requireId(c.req.param("id"), "id")
  return c.json(await service.listResults(id))
})

batchRoutes.get("/:id/disbursements", async (c) => {
  const id = requireId(c.req.param("id"), "id")
  return c.json(await service.listDisbursements(id))
})
