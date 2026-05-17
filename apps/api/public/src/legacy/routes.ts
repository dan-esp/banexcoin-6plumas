import { Hono } from "hono"
import { prisma } from "../db/client"
import { PublicRepository } from "../repositories/public.repository"
import { parsePagination, parsePositiveInt, requireId } from "../shared/query"
import { AccountService } from "../accounts/service"
import { mapTransaction } from "../batches/mappers"
import { BatchService } from "../batches/service"

const repository = new PublicRepository(prisma)
const accountService = new AccountService(repository)
const batchService = new BatchService(repository)
export const legacyRoutes = new Hono()

legacyRoutes.get("/users", async (c) => {
  return c.json({ data: [] })
})

legacyRoutes.get("/users/:account_number", async (c) => {
  const accountNumber = parsePositiveInt(
    c.req.param("account_number"),
    "account_number",
  )
  if (accountNumber === undefined) {
    return c.json({ error: { code: "bad_request", message: "account_number required" } }, 400)
  }
  try {
    return c.json(await accountService.getAccount(accountNumber))
  } catch {
    return c.json({ error: { code: "not_found", message: "account not found" } }, 404)
  }
})

legacyRoutes.get("/transactions", async (c) => {
  const accountNumber = parsePositiveInt(c.req.query("account_number"), "account_number")
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })

  const transactions = accountNumber !== undefined
    ? await repository.listTransactionsByAccount(accountNumber, pagination)
    : await prisma.qrTransaction.findMany({
        orderBy: { createdAt: "desc" },
        skip: pagination.offset,
        take: pagination.limit,
      })

  return c.json({ data: transactions.map(mapTransaction), pagination })
})

legacyRoutes.get("/monthly-aggregations", async (c) => {
  const accountNumber = parsePositiveInt(c.req.query("account_number"), "account_number")
  if (accountNumber === undefined) {
    return c.json({ data: [] })
  }
  try {
    const result = await accountService.listAccountMonths(accountNumber)
    return c.json({ data: result.results })
  } catch {
    return c.json({ data: [] })
  }
})

legacyRoutes.get("/cashback-runs", async (c) => {
  const pagination = parsePagination({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  })
  return c.json(await batchService.listBatches(pagination))
})

legacyRoutes.get("/cashback-runs/:id/disbursements", async (c) => {
  const id = requireId(c.req.param("id"), "id")
  return c.json(await batchService.listDisbursements(id))
})
