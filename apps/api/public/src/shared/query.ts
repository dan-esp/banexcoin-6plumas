import { badRequest } from "./http-error"

export type Pagination = {
  limit: number
  offset: number
}

export function parsePositiveInt(value: string | undefined, name: string) {
  if (!value) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`${name} must be a positive integer`)
  }

  return parsed
}

export function parsePagination(query: {
  limit?: string
  offset?: string
}): Pagination {
  const limit = query.limit ? parsePositiveInt(query.limit, "limit") : 50
  const offset = query.offset ? Number(query.offset) : 0

  if (!Number.isInteger(offset) || offset < 0) {
    throw badRequest("offset must be a non-negative integer")
  }

  return {
    limit: Math.min(limit ?? 50, 200),
    offset,
  }
}

export function requireId(value: string, name: string) {
  if (!value || value.trim().length === 0) {
    throw badRequest(`${name} is required`)
  }
  return value.trim()
}
