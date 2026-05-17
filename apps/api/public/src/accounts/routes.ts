import { Hono } from "hono"
import { prisma } from "../db/client"
import { PublicRepository } from "../repositories/public.repository"
import { parsePositiveInt } from "../shared/query"
import { AccountService } from "./service"

const service = new AccountService(new PublicRepository(prisma))
export const accountRoutes = new Hono()

accountRoutes.get("/:account_number", async (c) => {
  const accountNumber = parsePositiveInt(
    c.req.param("account_number"),
    "account_number",
  )

  return c.json(await service.getAccount(accountNumber))
})

accountRoutes.get("/:account_number/months", async (c) => {
  const accountNumber = parsePositiveInt(
    c.req.param("account_number"),
    "account_number",
  )

  return c.json(await service.listAccountMonths(accountNumber))
})
