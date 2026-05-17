import { Hono } from "hono"
import { prisma } from "../db/client"
import { PublicRepository } from "../repositories/public.repository"
import { parsePagination, parsePositiveInt, requireObjectId } from "../shared/query"
import { mapAccount } from "../accounts/mappers"
import { mapBatch, mapDisbursement, mapResult, mapTransaction } from "../batches/mappers"

const repository = new PublicRepository(prisma)
export const legacyRoutes = new Hono()

legacyRoutes.get("/users", async (c) => {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
  })
  return c.json({ data: users.map(mapAccount) })
})

legacyRoutes.get("/users/:account_number", async (c) => {
  const accountNumber = parsePositiveInt(
    c.req.param("account_number"),
    "account_number",
  )
  const user = await repository.findAccount(accountNumber)

  if (!user) {
    return c.json({ error: { code: "not_found", message: "account not found" } }, 404)
  }

  return c.json({ data: mapAccount(user) })
})

legacyRoutes.get("/transactions", async (c) => {
  const accountNumber = parsePositiveInt(c.req.query("account_number"), "account_number")
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })
  const transactions = await prisma.transaction.findMany({
    where: accountNumber ? { account_number: accountNumber } : undefined,
    orderBy: { fecha_creacion: "desc" },
    skip: pagination.offset,
    take: pagination.limit,
  })

  return c.json({ data: transactions.map(mapTransaction), pagination })
})

legacyRoutes.get("/monthly-aggregations", async (c) => {
  const accountNumber = parsePositiveInt(c.req.query("account_number"), "account_number")
  const aggregations = await prisma.monthlyAggregation.findMany({
    where: accountNumber ? { account_number: accountNumber } : undefined,
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })

  return c.json({ data: aggregations.map(mapResult) })
})

legacyRoutes.get("/cashback-runs", async (c) => {
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })
  const batches = await repository.listBatches(pagination)

  return c.json({ data: batches.map(mapBatch), pagination })
})

legacyRoutes.get("/cashback-runs/:id/disbursements", async (c) => {
  const id = requireObjectId(c.req.param("id"), "id")
  const disbursements = await repository.listBatchDisbursements(id)

  return c.json({ data: disbursements.map(mapDisbursement) })
})
