import { mapResult } from "../batches/mappers"
import { PublicRepository } from "../repositories/public.repository"
import { notFound } from "../shared/http-error"
import { mapAccount, mapAccountMonth } from "./mappers"

export class AccountService {
  constructor(private readonly repository: PublicRepository) {}

  async getAccount(accountNumber: number) {
    const account = await this.repository.findAccount(accountNumber)
    if (!account) throw notFound("account not found")

    return { data: mapAccount(account) }
  }

  async listAccountMonths(accountNumber: number) {
    const account = await this.repository.findAccount(accountNumber)
    if (!account) throw notFound("account not found")

    const months = await this.repository.listAccountMonths(accountNumber)
    return {
      data: months.map(mapAccountMonth),
      results: months.map(mapResult),
    }
  }
}
