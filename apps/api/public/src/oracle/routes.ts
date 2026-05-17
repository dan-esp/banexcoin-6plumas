import { Hono } from "hono"
import { prisma } from "../db/client"
import { OracleService } from "../oracle/service"
import { PublicRepository } from "../repositories/public.repository"
import { requireObjectId } from "../shared/query"

const service = new OracleService(new PublicRepository(prisma))
export const oracleRoutes = new Hono()

oracleRoutes.get("/current", async (c) => {
  return c.json(await service.getCurrentContext())
})

oracleRoutes.get("/batches/:id", async (c) => {
  const id = requireObjectId(c.req.param("id"), "id")
  return c.json(await service.getBatchContext(id))
})
